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
import { log, warn } from '../utils/logger';

// Refresh slightly before expiry to avoid using a token that dies in flight.
const EXPIRY_SKEW_MS = 60 * 1000;

export async function authorize(): Promise<SpotifyTokens> {
  log('auth', 'authorize: opening Spotify login…');
  const result = await appAuthAuthorize(spotifyAuthConfig);
  const tokens: SpotifyTokens = {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    accessTokenExpirationDate: result.accessTokenExpirationDate,
  };
  await saveTokens(tokens);
  log('auth', 'authorize ok, tokens saved', {
    hasToken: !!tokens.accessToken,
    expires: tokens.accessTokenExpirationDate,
  });
  return tokens;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await loadTokens()) != null;
}

// Returns a usable access token, refreshing it first when expired. null if the
// user has never authorized.
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await loadTokens();
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
    await saveTokens(next);
    log('auth', 'refresh ok');
    return next.accessToken;
  } catch (e) {
    warn('auth', 'token refresh FAILED', (e as Error)?.message, e);
    return null;
  }
}

export async function logout(): Promise<void> {
  await clearTokens();
}
