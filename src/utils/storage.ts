import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, Settings } from '../types';

const KEYS = {
  alarms: '@wakify/alarms',
  settings: '@wakify/settings',
};

export const DEFAULT_SETTINGS: Settings = {
  timeFormat: '12h',
  theme: 'coral',
  musicProvider: null,
  onboarded: false,
  defaultGenres: ['chill', 'pop'],
  permissionPrimed: false,
  alarmVolume: 1, // max by default so alarms reliably wake the user
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
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
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
