export interface Song {
  title: string;
  artist: string;
  album: string;
}

export interface Genre {
  id: string;
  name: string;
  colors: [string, string]; // gradient pair used as album-art backdrop
  songs: Song[];
  // Real public Spotify playlist played on a Spotify-connected alarm (the local
  // `songs` are display-only placeholders). Swappable for any playlist URI.
  spotifyPlaylist?: string;
  // Apple Music catalog playlist id (`pl.…`) played on an Apple-Music-connected
  // alarm. TODO(apple-music): populate per genre once the native MusicKit module
  // is in place; until then Apple Music alarms fall back to the bundled tone.
  appleMusicPlaylist?: string;
}

export const GENRES: Genre[] = [
  {
    id: 'rock',
    name: 'Rock',
    colors: ['#FFB199', '#FF5E62'],
    spotifyPlaylist: 'spotify:playlist:37i9dQZF1DXcF6B6QPhFDv', // Rock This
    songs: [
      { title: 'Ignition', artist: 'Iron Pines', album: 'Redline' },
      { title: 'Breakwall', artist: 'The Verge', album: 'Coastline' },
      { title: 'Full Throttle', artist: 'Redshift', album: 'Overdrive' },
      { title: 'Hammerline', artist: 'Static Coast', album: 'Voltage' },
      { title: 'Northbound', artist: 'Grey Harbor', album: 'Mile Zero' },
    ],
  },
  {
    id: 'chill',
    name: 'Chill',
    colors: ['#A1C4FD', '#C2E9FB'],
    spotifyPlaylist: 'spotify:playlist:37i9dQZF1DX4WYpdgoIcn6', // Chill Hits
    songs: [
      { title: 'Sunrise Drive', artist: 'Coastal Avenue', album: 'Slow Light' },
      { title: 'Golden Hour', artist: 'The Soft Hours', album: 'Daybreak' },
      { title: 'Warm Static', artist: 'Pale Blue', album: 'Drift' },
      { title: 'Easy Like Sunday', artist: 'Brookfield', album: 'Morning Set' },
      { title: 'Light Through Curtains', artist: 'Liane', album: 'Quiet Rooms' },
    ],
  },
  {
    id: 'jazz',
    name: 'Jazz',
    colors: ['#F7CE68', '#FBAB7E'],
    spotifyPlaylist: 'spotify:playlist:37i9dQZF1DX0SM0LYsmbMT', // Jazz Vibes
    songs: [
      { title: 'Blue Note Morning', artist: 'The Hal Trio', album: 'After Hours' },
      { title: 'Espresso Swing', artist: 'Marcus Reed', album: 'Midtown' },
      { title: 'Soft Shoe', artist: 'Della Quartet', album: 'Late Set' },
      { title: 'Midtown Stroll', artist: 'Cy Foster', album: 'Uptown Lights' },
      { title: 'Velvet Room', artist: 'The Blue Room', album: 'Nightcap' },
    ],
  },
  {
    id: 'electronic',
    name: 'Electronic',
    colors: ['#C58BF2', '#7C4DFF'],
    spotifyPlaylist: 'spotify:playlist:37i9dQZF1DX4dyzvuaRJ0n', // mint
    songs: [
      { title: 'Neon Tide', artist: 'Vela', album: 'Pulsewave' },
      { title: 'Run It Back', artist: 'DJ Pulse', album: 'Afterglow' },
      { title: 'Gravity', artist: 'The Wknd Club', album: 'Orbit' },
      { title: 'Supernova', artist: 'Aria Sky', album: 'Starfield' },
      { title: 'No Brakes', artist: 'Maddox', album: 'Velocity' },
    ],
  },
  {
    id: 'pop',
    name: 'Pop',
    colors: ['#FF9A9E', '#FAD0C4'],
    spotifyPlaylist: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M', // Today's Top Hits
    songs: [
      { title: 'Heartbeat', artist: 'Lola Grey', album: 'Bright' },
      { title: 'Neon Nights', artist: 'Aria Sky', album: 'City Lights' },
      { title: 'Better Days', artist: 'June Park', album: 'Sunny Side' },
      { title: 'On Repeat', artist: 'Cassie Lane', album: 'Loop' },
      { title: 'Daylight', artist: 'The Mara', album: 'Open Air' },
    ],
  },
  {
    id: 'lofi',
    name: 'Lo-Fi',
    colors: ['#8FD3F4', '#5BB7E0'],
    spotifyPlaylist: 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn', // lofi beats
    songs: [
      { title: 'Rainy Window', artist: 'jun.', album: 'Tape Loops' },
      { title: 'Cassette Dreams', artist: 'mellow.wav', album: 'Dust' },
      { title: 'Late Train', artist: 'oats', album: 'Nightline' },
      { title: 'Velvet Loop', artist: 'haze', album: 'Soft Focus' },
      { title: 'Cozy Static', artist: 'bloom', album: 'Hearth' },
    ],
  },
];

export function getGenre(id: string): Genre | undefined {
  return GENRES.find(g => g.id === id);
}

export function genreNames(ids: string[]): string {
  const names = ids.map(id => getGenre(id)?.name).filter(Boolean);
  return names.length ? names.join(', ') : 'None';
}

// Per-alarm genres if set, else the global default.
export function resolveGenres(
  alarm: { genres?: string[] },
  defaultGenres: string[],
): string[] {
  return alarm.genres ?? defaultGenres;
}

// Random song across the pool of all songs in the given genres.
export function pickRandomSongFromGenres(
  ids: string[],
): { song: Song; genre: Genre } | null {
  const pool: { song: Song; genre: Genre }[] = [];
  for (const id of ids) {
    const genre = getGenre(id);
    if (genre) {
      genre.songs.forEach(song => pool.push({ song, genre }));
    }
  }
  if (pool.length === 0) {
    return null;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
