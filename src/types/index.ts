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
  genres?: string[]; // per-alarm genre override; undefined = use global default
  playlistId?: string; // premium: specific playlist (unused in free tier)
  songUri?: string; // premium: specific song (unused in free tier)
}

export type TimeFormat = '12h' | '24h';
export type ThemeName = 'coral' | 'blue';
export type MusicProvider = 'apple' | 'spotify';

export interface Settings {
  timeFormat: TimeFormat;
  theme: ThemeName;
  musicProvider: MusicProvider | null;
  onboarded: boolean;
  defaultGenres: string[]; // global wake-up genres
  permissionPrimed: boolean; // shown the pre-permission explainer once
  alarmVolume: number; // 0–1 alarm loudness applied to the media stream
}
