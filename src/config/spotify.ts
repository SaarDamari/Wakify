import type { AuthConfiguration } from 'react-native-app-auth';

// Spotify OAuth credentials. Replace placeholders with values from the
// Spotify Developer Dashboard (https://developer.spotify.com/dashboard).
export const CLIENT_ID = '54435db798c84a1caad3dc3a68e0553f';

// Unused under the PKCE flow below. Native apps must not ship a client secret;
// keep this here only for a future server-side token exchange.
export const CLIENT_SECRET = 'bb13909290274439afceb855f733c4e0';

export const REDIRECT_URI = 'wakify://callback';

export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'streaming',
  'app-remote-control',
  'user-modify-playback-state',
  // Library browsing for the premium song/playlist picker (Web API).
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
];

export const spotifyAuthConfig: AuthConfiguration = {
  clientId: CLIENT_ID,
  redirectUrl: REDIRECT_URI,
  scopes: SPOTIFY_SCOPES,
  usePKCE: true,
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};
