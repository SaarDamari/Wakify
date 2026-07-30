import type { AuthConfiguration } from 'react-native-app-auth';

// Set this to YOUR OWN Spotify app's Client ID from the Developer Dashboard
// (https://developer.spotify.com/dashboard) before building — see the README.
// Each person running Wakify must use their own Spotify app: the client ID ties
// the app to one dashboard, and while that app is in Development Mode only the
// Spotify accounts you add under "User Management" can log in.
//
// The client ID is NOT a secret for a native PKCE app (it ships inside the APK).
// NEVER put a client SECRET here: PKCE means no secret is needed, and anything
// committed here is public.
export const CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';

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
