import {
  authorize as appAuthAuthorize,
  refresh as appAuthRefresh,
} from 'react-native-app-auth';
import { spotifyAuthConfig } from '../config/spotify';
import {
  SpotifyTokens,
  clearTokens,
  loadTokens,
  saveTokens,
} from './secureTokenStore';
import { emitSpotifySessionExpired } from './spotifyAuthEvents';
import { log, warn } from '../utils/logger';

// Web API OAuth tokens (for the premium library browser) live in their OWN
// keychain service, separate from the App Remote "connected" marker, so the
// sentinel marker can never be mistaken for a real access token.
const WEBAPI_SERVICE = '@wakify/spotify-webapi';

// Refresh slightly before expiry to avoid using a token that dies in flight.
const EXPIRY_SKEW_MS = 60 * 1000;

// A refresh token that is permanently dead (revoked, or Spotify's 6-month
// expiry) rejects with invalid_grant. Distinguish it from transient/network
// errors so we only sign the user out for a real, unrecoverable failure.
function isInvalidGrant(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  const blob = `${err?.code ?? ''} ${err?.message ?? ''}`.toLowerCase();
  return blob.includes('invalid_grant');
}

export async function authorize(): Promise<SpotifyTokens> {
  log('auth', 'authorize: opening Spotify login…');
  const result = await appAuthAuthorize(spotifyAuthConfig);
  const tokens: SpotifyTokens = {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    accessTokenExpirationDate: result.accessTokenExpirationDate,
  };
  await saveTokens(tokens, WEBAPI_SERVICE);
  log('auth', 'authorize ok, tokens saved', {
    hasToken: !!tokens.accessToken,
    expires: tokens.accessTokenExpirationDate,
  });
  return tokens;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await loadTokens(WEBAPI_SERVICE)) != null;
}

// Returns a usable access token, refreshing it first when expired. null if the
// user has never authorized.
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await loadTokens(WEBAPI_SERVICE);
  log('auth', 'getValidAccessToken: tokens loaded?', !!tokens);
  if (!tokens) {
    return null;
  }

  const expiresAt = new Date(tokens.accessTokenExpirationDate).getTime();
  const expired = expiresAt - EXPIRY_SKEW_MS <= Date.now();
  log('auth', 'token expired?', expired, tokens.accessTokenExpirationDate);
  if (!expired) {
    return tokens.accessToken;
  }

  try {
    log('auth', 'refreshing token…');
    const refreshed = await appAuthRefresh(spotifyAuthConfig, {
      refreshToken: tokens.refreshToken,
    });
    // Spotify may omit a new refresh token on refresh; keep the existing one.
    const next: SpotifyTokens = {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
      accessTokenExpirationDate: refreshed.accessTokenExpirationDate,
    };
    await saveTokens(next, WEBAPI_SERVICE);
    log('auth', 'refresh ok');
    return next.accessToken;
  } catch (e) {
    warn('auth', 'token refresh FAILED', (e as Error)?.message, e);
    if (isInvalidGrant(e)) {
      // Dead refresh token: discard it so we stop retrying forever, and signal
      // the app to disconnect + prompt the user to log in again.
      await clearTokens(WEBAPI_SERVICE);
      emitSpotifySessionExpired();
    }
    return null;
  }
}

// Return a valid Web API access token, launching the one-time browser consent
// (app-auth) if the user hasn't authorized the Web API yet. null if the user
// declines or auth fails. Used by the premium library browser.
export async function ensureWebApiToken(): Promise<string | null> {
  const existing = await getValidAccessToken();
  if (existing) {
    return existing;
  }
  try {
    const tokens = await authorize();
    return tokens.accessToken;
  } catch (e) {
    warn('auth', 'ensureWebApiToken: authorize failed/declined', (e as Error)?.message);
    return null;
  }
}

// Drop the Web API token (e.g. after a hard 401) so the next call re-authorizes.
export async function clearWebApiToken(): Promise<void> {
  await clearTokens(WEBAPI_SERVICE);
}

export async function logout(): Promise<void> {
  await clearTokens(WEBAPI_SERVICE);
}
