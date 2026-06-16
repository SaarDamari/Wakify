// Shared "now playing" track metadata returned by Spotify so the ring screen can
// display what's actually playing. `imageUrl` is null when no album art is supplied.
export interface NowPlaying {
  title: string;
  artist: string;
  album: string;
  imageUrl: string | null;
}
