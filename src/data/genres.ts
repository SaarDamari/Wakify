import { t } from '../i18n';
import { TranslationKey } from '../i18n/en';

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
}

export const GENRES: Genre[] = [
  {
    id: 'rock',
    name: 'Rock',
    colors: ['#FFB199', '#FF5E62'],
    spotifyPlaylist: 'spotify:playlist:6b2dBnxolvwV2L1L4thWRm',
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
    spotifyPlaylist: 'spotify:playlist:37i9dQZF1DWYoYGBbGKurt',
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
    spotifyPlaylist: 'spotify:playlist:37i9dQZF1DXbITWG1ZJKYt',
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
    spotifyPlaylist: 'spotify:playlist:3tRhisNDv5YZXPQltBbJNc',
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
    spotifyPlaylist: 'spotify:playlist:6mtYuOxzl58vSGnEDtZ9uB',
    songs: [
      { title: 'Heartbeat', artist: 'Lola Grey', album: 'Bright' },
      { title: 'Neon Nights', artist: 'Aria Sky', album: 'City Lights' },
      { title: 'Better Days', artist: 'June Park', album: 'Sunny Side' },
      { title: 'On Repeat', artist: 'Cassie Lane', album: 'Loop' },
      { title: 'Daylight', artist: 'The Mara', album: 'Open Air' },
    ],
  },
  {
    id: 'israeli',
    name: 'Israeli Mainstream',
    colors: ['#7FB2F0', '#2E5FB0'],
    spotifyPlaylist: 'spotify:playlist:6cW573eRStqqxIy654FcRi',
    songs: [
      { title: 'Boker Tov', artist: 'Ramat Aviv', album: 'Yam' },
      { title: 'Or Rishon', artist: 'Hofim', album: 'Kayitz' },
      { title: 'Derech Aruka', artist: 'Tikva', album: 'Shvil' },
      { title: 'Bli Sof', artist: 'Galim', album: 'Choref' },
    ],
  },
  {
    id: 'mideast',
    name: 'Middle Eastern',
    colors: ['#F6D365', '#C97B2E'],
    spotifyPlaylist: 'spotify:playlist:1oZgvIgDGkYIIO8tGdJsub',
    songs: [
      { title: 'Sahara Dawn', artist: 'Layali', album: 'Qamar' },
      { title: 'Golden Oud', artist: 'Najma', album: 'Reeh' },
      { title: 'Desert Bloom', artist: 'Shams', album: 'Bahr' },
      { title: 'Night Bazaar', artist: 'Karim', album: 'Souk' },
    ],
  },
  {
    id: 'black',
    name: 'Black Music',
    colors: ['#8E7CC3', '#2D2D44'],
    spotifyPlaylist: 'spotify:playlist:7It8E6z1a0Tj1tUM2iSFke',
    songs: [
      { title: 'Heavy Crown', artist: 'Marlo', album: 'Throne' },
      { title: 'Slow Burn', artist: 'Vee', album: 'Smoke' },
      { title: 'Top Down', artist: 'Kaye', album: 'Avenue' },
      { title: 'No Ceiling', artist: 'Dré', album: 'Skyline' },
    ],
  },
  {
    id: 'rnb',
    name: 'R&B',
    colors: ['#D16BA5', '#86377B'],
    spotifyPlaylist: 'spotify:playlist:2T3BSpqN34Z4sppHDNWoeE',
    songs: [
      { title: 'Velvet Hours', artist: 'Sienna', album: 'After Dark' },
      { title: 'Closer Still', artist: 'Noa Rey', album: 'Mood' },
      { title: 'Slow Tide', artist: 'Amara', album: 'Glow' },
      { title: 'Midnight Call', artist: 'Lex', album: 'Smooth' },
    ],
  },
  {
    id: 'mainstream',
    name: 'Mainstream',
    colors: ['#5EC9C9', '#2E8BC0'],
    spotifyPlaylist: 'spotify:playlist:4gVlCxDQFkFMIgLytSS3Wg',
    songs: [
      { title: 'Right Now', artist: 'Halo', album: 'Peak' },
      { title: 'On Top', artist: 'Nova', album: 'Charts' },
      { title: 'Loud', artist: 'Cassie Lane', album: 'Prime' },
      { title: 'Bright Lights', artist: 'The Mara', album: 'Open Air' },
    ],
  },
  {
    id: 'reggaeton',
    name: 'Reggaeton',
    colors: ['#FF9A44', '#FF3D6E'],
    spotifyPlaylist: 'spotify:playlist:3Ewy6yUXPG0ne36aZELO6t',
    songs: [
      { title: 'Calor', artist: 'Rio Mar', album: 'Fuego' },
      { title: 'Baila Más', artist: 'Selva', album: 'Ritmo' },
      { title: 'Noche Loca', artist: 'Diego Sol', album: 'Verano' },
      { title: 'Perreo', artist: 'La Ola', album: 'Fiesta' },
    ],
  },
];

export function getGenre(id: string): Genre | undefined {
  return GENRES.find(g => g.id === id);
}

// Localized display name for a genre (e.g. "Rock" / "רוק"). Keyed off the id.
export function genreLabel(genre: Genre): string {
  return t(`genre_${genre.id}` as TranslationKey);
}

export function genreNames(ids: string[]): string {
  const names = ids
    .map(id => {
      const g = getGenre(id);
      return g ? genreLabel(g) : null;
    })
    .filter(Boolean);
  return names.length ? names.join(', ') : t('not_set');
}

// Per-alarm genres if set, else the global default.
export function resolveGenres(
  alarm: { genres?: string[] },
  defaultGenres: string[],
): string[] {
  return alarm.genres ?? defaultGenres;
}

// Uniformly pick one genre id among the valid ids (each chosen genre equally
// likely), or null if none resolve. Used to choose a single genre that drives
// both the displayed label and what actually plays.
export function pickRandomGenreId(ids: string[]): string | null {
  const valid = ids.filter(id => getGenre(id));
  if (valid.length === 0) {
    return null;
  }
  return valid[Math.floor(Math.random() * valid.length)];
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
