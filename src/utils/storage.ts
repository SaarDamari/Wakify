import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, Settings } from '../types';

const KEYS = {
  alarms: '@wakify/alarms',
  settings: '@wakify/settings',
  premium: '@wakify/premium',
};

export const DEFAULT_SETTINGS: Settings = {
  timeFormat: '12h',
  theme: 'green',
  musicProvider: null,
  onboarded: false,
  defaultGenres: ['chill', 'pop'],
  permissionPrimed: false,
  // Slider starts at 0; a floor (effectiveVolume) keeps it audible even at 0.
  alarmVolume: 0,
  fallbackRingtoneUri: null, // null => OS default alarm sound
  fallbackRingtoneTitle: null,
};

export async function getAlarms(): Promise<Alarm[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.alarms);
    if (raw == null) {
      return null;
    }
    return JSON.parse(raw) as Alarm[];
  } catch {
    return null;
  }
}

export async function setAlarms(alarms: Alarm[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.alarms, JSON.stringify(alarms));
  } catch {
    // best-effort persistence
  }
}

export async function getSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    if (raw == null) {
      return DEFAULT_SETTINGS;
    }
    const merged = {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<Settings>),
    };
    // Spotify is the only provider now; coerce any stale value (e.g. 'apple'
    // from an older install) to null so the UI/playback stay valid.
    if (merged.musicProvider !== 'spotify') {
      merged.musicProvider = null;
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
  } catch {
    // best-effort persistence
  }
}

// Wakify Premium entitlement. Mocked locally for now; swap for a RevenueCat
// entitlement check later. Defaults to false (free tier).
export async function getPremium(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.premium)) === 'true';
  } catch {
    return false;
  }
}

export async function setPremiumStored(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.premium, value ? 'true' : 'false');
  } catch {
    // best-effort persistence
  }
}
