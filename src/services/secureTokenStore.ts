import * as Keychain from 'react-native-keychain';
import { log, warn } from '../utils/logger';

const SERVICE = '@wakify/spotify-tokens';

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  // ISO-8601 string, as returned by react-native-app-auth.
  accessTokenExpirationDate: string;
}

export async function saveTokens(tokens: SpotifyTokens): Promise<void> {
  try {
    await Keychain.setGenericPassword('spotify', JSON.stringify(tokens), {
      service: SERVICE,
    });
    log('tokens', 'saveTokens ok');
  } catch (e) {
    warn('tokens', 'saveTokens FAILED', (e as Error)?.message, e);
  }
}

export async function loadTokens(): Promise<SpotifyTokens | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: SERVICE });
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

export async function clearTokens(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch {
    // best-effort
  }
}
