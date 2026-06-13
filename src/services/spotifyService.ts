import { NativeModules } from 'react-native';
import { remote as SpotifyRemote } from 'react-native-spotify-remote';
import { SpotifyTokens, saveTokens, clearTokens } from './secureTokenStore';
import { NowPlaying } from './nowPlaying';
import { getGenre } from '../data/genres';
import { CLIENT_ID, REDIRECT_URI } from '../config/spotify';
import { log, warn } from '../utils/logger';

// Bridge between the app and Spotify, using Spotify's native App Remote SDK
// (react-native-spotify-remote) for playback.
//
// Authorization and playback are STRICTLY separated, and BOTH go through the
// App Remote connection (never the legacy auth-lib WebView, which can't handle
// modern Spotify login pages / Google-SSO accounts):
//  • Authorization (UI) happens ONCE in Settings via `connectWithAuthView`
//    (showAuthView=true) — the Spotify APP renders the consent natively and
//    registers the on-device App Remote grant. This is the only place a dialog
//    may appear.
//  • Playback at alarm time is COMPLETELY SILENT via `connectWithoutAuth`
//    (showAuthView=false). Permitted only because the user already granted the
//    App Remote scope on-device during the Settings step.
//
// Requires Spotify Premium, the Spotify app installed + logged in, and a prior
// Settings authorization. Any failure returns null so the ring screen falls back
// to the bundled tone.

// The native module that owns connectWithoutAuth / connectWithAuthView (not
// wrapped by the JS `remote` singleton). Android-only; undefined on iOS.
const RNSpotifyRemoteAppRemote = NativeModules.RNSpotifyRemoteAppRemote as
  | {
      connectWithoutAuth(
        token: string,
        clientId: string,
        redirectUri: string,
      ): Promise<void>;
      connectWithAuthView(clientId: string, redirectUri: string): Promise<void>;
    }
  | undefined;

// A sentinel persisted only so the UI knows Spotify is "connected" (App Remote
// authorization returns no token — it lives inside the Spotify app).
const CONNECTED_MARKER: SpotifyTokens = {
  accessToken: 'app-remote-connected',
  refreshToken: '',
  accessTokenExpirationDate: new Date(
    Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
  ).toISOString(),
};

// Authorize with Spotify via the App Remote auth view (Settings-only — the
// single user-facing consent). The Spotify app renders the consent natively and
// registers the on-device grant so alarm-time silent connects are allowed. This
// avoids the legacy auth-lib WebView entirely (which breaks on Google SSO).
export async function connectSpotify(): Promise<SpotifyTokens> {
  log('spotify', 'connectSpotify → connectWithAuthView (Settings consent)');
  if (!RNSpotifyRemoteAppRemote?.connectWithAuthView) {
    const err = new Error('Spotify App Remote not available on this platform');
    warn('spotify', 'connectSpotify unavailable (not linked / iOS)');
    throw err;
  }
  try {
    await RNSpotifyRemoteAppRemote.connectWithAuthView(CLIENT_ID, REDIRECT_URI);
    await saveTokens(CONNECTED_MARKER); // "connected" flag for the UI
    log('spotify', 'connectSpotify ok (App Remote authorized + connected)');
    return CONNECTED_MARKER;
  } catch (e) {
    warn('spotify', 'connectSpotify FAILED', (e as Error)?.message, e);
    throw e;
  }
}

export async function disconnectSpotify(): Promise<void> {
  log('spotify', 'disconnectSpotify');
  try {
    await SpotifyRemote.disconnect();
  } catch (e) {
    warn('spotify', 'remote.disconnect (ignored)', (e as Error)?.message);
  }
  await clearTokens();
}

// First chosen genre that has a mapped playlist URI (fallback: chill).
// App Remote plays the full `spotify:playlist:<id>` URI directly.
function playlistUriForGenres(genreIds: string[]): string | null {
  return (
    genreIds.map(id => getGenre(id)?.spotifyPlaylist).find(Boolean) ??
    getGenre('chill')?.spotifyPlaylist ??
    null
  );
}

// SILENT playback for the alarm trigger — never shows UI. Connects to the
// installed Spotify app via connectWithoutAuth (showAuthView=false) and plays a
// shuffled track from the genre's playlist. Returns null on any failure (not
// authorized/Premium, app missing, link error) so the caller falls back to the
// bundled tone.
export async function playRandomTrackFromGenres(
  genreIds: string[],
): Promise<NowPlaying | null> {
  log('spotify', 'playRandomTrackFromGenres start', { genreIds });
  try {
    const playlistUri = playlistUriForGenres(genreIds);
    log('spotify', 'playlistUri', playlistUri);
    if (!playlistUri) {
      warn('spotify', 'no playlist mapped for genres', genreIds);
      return null;
    }

    if (!RNSpotifyRemoteAppRemote?.connectWithoutAuth) {
      warn('spotify', 'native connectWithoutAuth unavailable (not linked / iOS)');
      return null;
    }

    // Silent connect — connectWithoutAuth ignores the token (the Spotify app
    // supplies the session), so we don't need a fresh access token here.
    const connected = await SpotifyRemote.isConnectedAsync();
    log('spotify', 'isConnectedAsync', connected);
    if (!connected) {
      log('spotify', 'connectWithoutAuth (silent)…');
      await RNSpotifyRemoteAppRemote.connectWithoutAuth(
        '',
        CLIENT_ID,
        REDIRECT_URI,
      );
      log('spotify', 'connected');
    }

    // Play the playlist FIRST so the alarm always rings, then best-effort
    // enable shuffle. setShuffling has its OWN try/catch: some contexts reject
    // it with ACTION_NOT_ALLOWED_IN_CONTEXT, and that must never abort playback.
    // (Calling it after playUri also gives it a valid context, so it usually
    // succeeds now instead of being rejected for having no context.)
    await SpotifyRemote.playUri(playlistUri);
    log('spotify', 'playUri ok', playlistUri);
    try {
      await SpotifyRemote.setShuffling(true);
      log('spotify', 'setShuffling ok');
    } catch (e) {
      warn(
        'spotify',
        'setShuffling rejected — continuing unshuffled',
        (e as Error)?.message,
      );
    }

    // Read what's now playing for the UI. Best-effort: even if it isn't ready
    // we still return a (possibly empty) NowPlaying so we DON'T fall back to the
    // tone — Spotify is playing at this point.
    let nowPlaying: NowPlaying = {
      title: '',
      artist: '',
      album: '',
      imageUrl: null,
    };
    try {
      const state = await SpotifyRemote.getPlayerState();
      const track = state?.track;
      if (track) {
        nowPlaying = {
          title: track.name ?? '',
          artist: track.artist?.name ?? '',
          album: track.album?.name ?? '',
          imageUrl: null, // App Remote Track carries no image URL
        };
      }
      log('spotify', 'playerState', {
        title: nowPlaying.title,
        artist: nowPlaying.artist,
        isPaused: state?.isPaused,
      });
    } catch (e) {
      warn(
        'spotify',
        'getPlayerState failed (keeping empty)',
        (e as Error)?.message,
      );
    }
    log('spotify', 'returning nowPlaying', nowPlaying);
    return nowPlaying;
  } catch (e) {
    const err = e as { message?: string; code?: string };
    warn(
      'spotify',
      'playRandomTrackFromGenres FAILED',
      err?.message,
      err?.code,
      e,
    );
    return null;
  }
}

// Pause + disconnect the remote when the alarm is dismissed.
export async function stopSpotify(): Promise<void> {
  log('spotify', 'stopSpotify');
  try {
    if (await SpotifyRemote.isConnectedAsync()) {
      await SpotifyRemote.pause();
      await SpotifyRemote.disconnect();
      log('spotify', 'stopSpotify ok (paused + disconnected)');
    } else {
      log('spotify', 'stopSpotify: not connected, nothing to do');
    }
  } catch (e) {
    warn('spotify', 'stopSpotify failed (ignored)', (e as Error)?.message);
  }
}
