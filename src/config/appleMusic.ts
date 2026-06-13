// Apple Music (MusicKit) configuration. Unlike Spotify, Apple Music does not use
// an OAuth web flow: a Developer Token (an ES256 JWT signed with a MusicKit
// private key from the Apple Developer portal) is exchanged on-device for a
// Music User Token through the native MusicKit framework.
export const DEVELOPER_TOKEN = 'YOUR_APPLE_MUSIC_DEVELOPER_TOKEN';

// Default storefront used for catalog lookups until the user's is resolved.
export const APPLE_MUSIC_STOREFRONT = 'us';
