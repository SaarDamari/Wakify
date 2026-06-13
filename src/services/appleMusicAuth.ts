import * as Keychain from 'react-native-keychain';
import { DEVELOPER_TOKEN } from '../config/appleMusic';

const SERVICE = '@wakify/apple-music-token';

// Apple Music authorizes through the native MusicKit framework, not a web/OAuth
// flow. This module is a STUB: the native bridge (a third-party library or a
// custom Swift module — decided later) is not wired yet. The function shapes
// mirror spotifyAuth so the UI can treat both providers uniformly.

// Future: request MusicKit authorization with DEVELOPER_TOKEN and persist the
// returned Music User Token. Throws until the native module is implemented.
export async function authorize(): Promise<string> {
  console.log('[appleMusicAuth] authorize (stub)', {
    hasDeveloperToken: Boolean(DEVELOPER_TOKEN),
  });
  throw new Error('Apple Music MusicKit native module not implemented yet');
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getUserToken()) != null;
}

export async function getUserToken(): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: SERVICE });
    return creds ? creds.password : null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch {
    // best-effort
  }
}
