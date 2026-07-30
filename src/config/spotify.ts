import type { AuthConfiguration } from 'react-native-app-auth';

// Spotify OAuth config for the Developer Dashboard app
// (https://developer.spotify.com/dashboard).
// The client ID is not a secret for a native PKCE app — it ships inside the
// distributed app by design. NEVER put the client SECRET here: native apps use
// PKCE precisely so no secret is needed, and anything committed here is public.
export const CLIENT_ID = '54435db798c84a1caad3dc3a68e0553f';

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
