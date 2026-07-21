// 0 = Monday ... 6 = Sunday — matches the M T W T F S S order shown in the UI.
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type VibratePattern =
  | 'default'
  | 'gentle'
  | 'medium'
  | 'strong'
  | 'heartbeat'
  | 'pulse';

export interface Alarm {
  id: string;
  hour: number; // 0-23, always stored 24h; 12/24h is a display concern only
  minute: number; // 0-59
  label: string;
  days: DayIndex[]; // empty = one-off / no repeat
  oneOffDate?: string; // optional ISO date (YYYY-MM-DD) for a non-repeating alarm
  enabled: boolean;
  vibrateEnabled: boolean;
  vibratePattern: VibratePattern;
  nudgingEnabled: boolean;
  nudgeInterval: number; // minutes between nudges (5/10/15/30)
  snoozeInterval?: number; // minutes a snooze waits before re-ringing (5/10/15/30)
  genres?: string[]; // per-alarm genre override; undefined = use global default
  // Premium: a specific Spotify track/playlist URI to play (overrides genres).
  // Honored only for premium users; `spotifyUriName` is the cached display label.
  spotifyUri?: string;
  spotifyUriName?: string;
}

export type TimeFormat = '12h' | '24h';
export type ThemeName =
  | 'coral'
  | 'blue'
  | 'purple'
  | 'green'
  | 'sunset'
  | 'pink'
  | 'teal';
export type MusicProvider = 'spotify';

export interface Settings {
  timeFormat: TimeFormat;
  theme: ThemeName;
  musicProvider: MusicProvider | null;
  onboarded: boolean;
  defaultGenres: string[]; // global wake-up genres
  permissionPrimed: boolean; // shown the pre-permission explainer once
  alarmVolume: number; // 0–1 alarm loudness applied to the media stream
  // Fallback ringtone played by the ring screen when Spotify can't play.
  // uri is the source of truth; null/'' => OS default alarm. title cached for UI.
  fallbackRingtoneUri: string | null;
  fallbackRingtoneTitle: string | null;
}
