import { ensureWebApiToken, clearWebApiToken } from './spotifyAuth';
import { log, warn } from '../utils/logger';
import { t } from '../i18n';

// Spotify Web API client for the premium playlist picker. Distinct from the App
// Remote SDK (which only plays) — this reads the user's own playlists using the
// OAuth token from spotifyAuth (ensureWebApiToken).

const BASE = 'https://api.spotify.com/v1';

export interface SpotifyItem {
  uri: string; // spotify:playlist:… (played directly by App Remote)
  name: string;
  subtitle: string;
  imageUrl: string | null;
}

interface SpotifyImage {
  url: string;
}
interface SpotifyPlaylistObj {
  uri: string;
  name: string;
  images?: SpotifyImage[];
  owner?: { display_name?: string };
  tracks?: { total?: number };
}

function firstImage(images?: SpotifyImage[]): string | null {
  return images && images.length ? images[images.length - 1].url : null;
}

function mapPlaylist(p: SpotifyPlaylistObj): SpotifyItem {
  const count = p.tracks?.total;
  return {
    uri: p.uri,
    name: p.name,
    subtitle:
      typeof count === 'number'
        ? t('playlist_tracks', { count })
        : 'Playlist',
    imageUrl: firstImage(p.images),
  };
}

// GET helper with one transparent re-auth on 401 (expired/revoked token).
async function apiGet(path: string, retry = true): Promise<any | null> {
  const token = await ensureWebApiToken();
  if (!token) {
    warn('spotifyapi', 'no web api token (declined / unavailable)');
    return null;
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 && retry) {
      log('spotifyapi', '401 → clearing token and retrying once');
      await clearWebApiToken();
      return apiGet(path, false);
    }
    if (!res.ok) {
      warn('spotifyapi', 'request failed', path, res.status);
      return null;
    }
    return await res.json();
  } catch (e) {
    warn('spotifyapi', 'request threw', path, (e as Error)?.message);
    return null;
  }
}

// The signed-in user's own/followed playlists.
export async function getMyPlaylists(): Promise<SpotifyItem[]> {
  const data = await apiGet('/me/playlists?limit=50');
  if (!data) {
    return [];
  }
  return (data.items ?? []).filter(Boolean).map(mapPlaylist);
}
