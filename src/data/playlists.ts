export interface Song {
  title: string;
  artist: string;
}

export interface Playlist {
  id: string;
  name: string;
  subtitle: string;
  colors: [string, string]; // gradient pair for the cover art
  songs: Song[];
}

// Mock curated catalog — stands in for real Spotify/Apple playlists.
export const PLAYLISTS: Playlist[] = [
  {
    id: 'morning-chill',
    name: 'Morning Chill',
    subtitle: 'Easy, mellow wake-ups',
    colors: ['#F6A89A', '#E76F61'],
    songs: [
      { title: 'Sunrise Drive', artist: 'Coastal Avenue' },
      { title: 'Slow Coffee', artist: 'Maren Vale' },
      { title: 'Golden Hour', artist: 'The Soft Hours' },
      { title: 'Light Through Curtains', artist: 'Liane' },
      { title: 'Easy Like Sunday', artist: 'Brookfield' },
      { title: 'Warm Static', artist: 'Pale Blue' },
    ],
  },
  {
    id: 'focus-flow',
    name: 'Focus Flow',
    subtitle: 'Calm, steady momentum',
    colors: ['#8FD3F4', '#5BB7E0'],
    songs: [
      { title: 'Clear Water', artist: 'Atlas Mind' },
      { title: 'Steady State', artist: 'Nova Linn' },
      { title: 'Deep Work', artist: 'Mono Lake' },
      { title: 'Quiet Engine', artist: 'Field Notes' },
      { title: 'Paper Planes', artist: 'Seven Hills' },
    ],
  },
  {
    id: 'top-hits',
    name: 'Top Hits',
    subtitle: "Today's biggest songs",
    colors: ['#C58BF2', '#7C4DFF'],
    songs: [
      { title: 'Neon Nights', artist: 'Aria Sky' },
      { title: 'Run It Back', artist: 'DJ Pulse' },
      { title: 'Heartbeat', artist: 'Lola Grey' },
      { title: 'Gravity', artist: 'The Wknd Club' },
      { title: 'No Brakes', artist: 'Maddox' },
      { title: 'Supernova', artist: 'Vela' },
    ],
  },
  {
    id: 'rock-energy',
    name: 'Rock Energy',
    subtitle: 'Loud, fast, awake',
    colors: ['#FFB199', '#FF5E62'],
    songs: [
      { title: 'Ignition', artist: 'Iron Pines' },
      { title: 'Breakwall', artist: 'The Verge' },
      { title: 'Full Throttle', artist: 'Redshift' },
      { title: 'Hammerline', artist: 'Static Coast' },
      { title: 'Overdrive', artist: 'Northbound' },
    ],
  },
  {
    id: 'lofi-beats',
    name: 'Lo-Fi Beats',
    subtitle: 'Soft beats to ease in',
    colors: ['#A1C4FD', '#C2E9FB'],
    songs: [
      { title: 'Rainy Window', artist: 'jun.' },
      { title: 'Cassette Dreams', artist: 'mellow.wav' },
      { title: 'Late Train', artist: 'oats' },
      { title: 'Velvet Loop', artist: 'haze' },
      { title: 'Cozy Static', artist: 'bloom' },
    ],
  },
  {
    id: 'jazz-cafe',
    name: 'Jazz Café',
    subtitle: 'Smooth morning jazz',
    colors: ['#F7CE68', '#FBAB7E'],
    songs: [
      { title: 'Blue Note Morning', artist: 'The Hal Trio' },
      { title: 'Espresso Swing', artist: 'Marcus Reed' },
      { title: 'Soft Shoe', artist: 'Della Quartet' },
      { title: 'Midtown Stroll', artist: 'Cy Foster' },
      { title: 'After Hours', artist: 'The Blue Room' },
    ],
  },
];

export function getPlaylist(id?: string | null): Playlist | undefined {
  if (!id) {
    return undefined;
  }
  return PLAYLISTS.find(p => p.id === id);
}
