import * as Keychain from 'react-native-keychain';
import { log, warn } from '../utils/logger';

// Default service holds the App Remote "connected" marker; the Web API OAuth
// tokens live in a separate service so the sentinel marker can never masquerade
// as a real access token. Callers pass the service explicitly where it matters.
const DEFAULT_SERVICE = '@wakify/spotify-tokens';

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  // ISO-8601 string, as returned by react-native-app-auth.
  accessTokenExpirationDate: string;
}

export async function saveTokens(
  tokens: SpotifyTokens,
  service: string = DEFAULT_SERVICE,
): Promise<void> {
  try {
    await Keychain.setGenericPassword('spotify', JSON.stringify(tokens), {
      service,
    });
    log('tokens', 'saveTokens ok');
  } catch (e) {
    warn('tokens', 'saveTokens FAILED', (e as Error)?.message, e);
  }
}

export async function loadTokens(
  service: string = DEFAULT_SERVICE,
): Promise<SpotifyTokens | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service });
    log('tokens', 'loadTokens: found?', !!creds);
    if (!creds) {
      return null;
    }
    return JSON.parse(creds.password) as SpotifyTokens;
  } catch (e) {
    warn('tokens', 'loadTokens FAILED', (e as Error)?.message, e);
    return null;
  }
}

export async function clearTokens(
  service: string = DEFAULT_SERVICE,
): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service });
  } catch {
    // best-effort
  }
}
