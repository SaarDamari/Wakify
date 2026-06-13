import { NowPlaying } from './nowPlaying';
import { authorize, getUserToken, logout } from './appleMusicAuth';
import { getGenre } from '../data/genres';
import { log, warn } from '../utils/logger';

// Bridge to Apple Music. Mirrors spotifyService so the ring screen can treat
// both providers uniformly. Playback requires a native MusicKit module + a
// MusicKit Developer Token, which are NOT wired yet — so playAppleMusic returns
// null and the ring screen falls back to the bundled tone. When the native
// module lands, only the marked TODO inside playAppleMusic needs filling in.

export async function connectAppleMusic(): Promise<string> {
  return authorize(); // throws until the native MusicKit module exists
}

export async function disconnectAppleMusic(): Promise<void> {
  return logout();
}

// First chosen genre that has a mapped Apple Music playlist (fallback: chill).
function playlistForGenres(genreIds: string[]): string | null {
  return (
    genreIds.map(id => getGenre(id)?.appleMusicPlaylist).find(Boolean) ??
    getGenre('chill')?.appleMusicPlaylist ??
    null
  );
}

// Play a track from the genre's Apple Music playlist, returning its metadata so
// the ring screen can show it. Returns null on any failure (not authorized, no
// native module) so the caller falls back to the bundled tone.
export async function playAppleMusic(
  genreIds: string[],
): Promise<NowPlaying | null> {
  log('applemusic', 'playAppleMusic start', { genreIds });
  try {
    const token = await getUserToken();
    if (!token) {
      warn('applemusic', 'not authorized — no Music User Token');
      return null;
    }
    const playlist = playlistForGenres(genreIds);
    log('applemusic', 'playlist', playlist);
    if (!playlist) {
      warn('applemusic', 'no Apple Music playlist mapped for genres', genreIds);
      return null;
    }

    // TODO(apple-music): call the native MusicKit module to play `playlist`
    // (shuffled) and return the real NowPlaying. Until that module exists we
    // return null so the alarm uses the bundled tone.
    warn('applemusic', 'native MusicKit playback not implemented → tone fallback');
    return null;
  } catch (e) {
    warn('applemusic', 'playAppleMusic FAILED', (e as Error)?.message, e);
    return null;
  }
}

// Stop Apple Music playback when the alarm is dismissed. No-op until the native
// MusicKit module exists.
export async function stopAppleMusic(): Promise<void> {
  // TODO(apple-music): native MusicKit stop/pause.
}
