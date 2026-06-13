// Shared "now playing" track metadata returned by any music provider
// (Spotify, Apple Music) so the ring screen can display what's actually playing
// uniformly. `imageUrl` is null when the provider doesn't supply album art.
export interface NowPlaying {
  title: string;
  artist: string;
  album: string;
  imageUrl: string | null;
}
