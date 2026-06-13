import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { MusicProvider, Settings, ThemeName, TimeFormat } from '../types';
import {
  DEFAULT_SETTINGS,
  getSettings,
  setSettings as persistSettings,
} from '../utils/storage';
import { ColorScheme, Theme, getTheme } from '../theme/themes';

interface SettingsContextValue {
  settings: Settings;
  theme: Theme;
  hydrated: boolean;
  setTimeFormat: (format: TimeFormat) => void;
  setTheme: (theme: ThemeName) => void;
  connectMusic: (provider: MusicProvider) => void;
  disconnectMusic: () => void;
  completeOnboarding: () => void;
  finishOnboarding: (genres: string[]) => void;
  setDefaultGenres: (genres: string[]) => void;
  markPermissionPrimed: () => void;
  setAlarmVolume: (volume: number) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  // Dark mode strictly follows the OS appearance (reactive). Anything that
  // isn't explicitly dark renders as light.
  const scheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    getSettings().then(loaded => {
      setSettings(loaded);
      setHydrated(true);
    });
  }, []);

  const update = useCallback((next: Settings) => {
    setSettings(next);
    persistSettings(next);
  }, []);

  const setTimeFormat = useCallback(
    (timeFormat: TimeFormat) => update({ ...settings, timeFormat }),
    [settings, update],
  );

  const setTheme = useCallback(
    (theme: ThemeName) => update({ ...settings, theme }),
    [settings, update],
  );

  // Connect sets the provider but does NOT finish onboarding — the user then
  // picks a wake-up playlist before reaching the app.
  const connectMusic = useCallback(
    (musicProvider: MusicProvider) => update({ ...settings, musicProvider }),
    [settings, update],
  );

  const disconnectMusic = useCallback(
    () => update({ ...settings, musicProvider: null }),
    [settings, update],
  );

  const completeOnboarding = useCallback(
    () => update({ ...settings, onboarded: true }),
    [settings, update],
  );

  // Finish onboarding after the genre step (single update to avoid clobber).
  const finishOnboarding = useCallback(
    (genres: string[]) =>
      update({ ...settings, defaultGenres: genres, onboarded: true }),
    [settings, update],
  );

  const setDefaultGenres = useCallback(
    (defaultGenres: string[]) => update({ ...settings, defaultGenres }),
    [settings, update],
  );

  const markPermissionPrimed = useCallback(
    () => update({ ...settings, permissionPrimed: true }),
    [settings, update],
  );

  const setAlarmVolume = useCallback(
    (alarmVolume: number) =>
      update({ ...settings, alarmVolume: Math.max(0, Math.min(1, alarmVolume)) }),
    [settings, update],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      theme: getTheme(settings.theme, scheme),
      hydrated,
      setTimeFormat,
      setTheme,
      connectMusic,
      disconnectMusic,
      completeOnboarding,
      finishOnboarding,
      setDefaultGenres,
      markPermissionPrimed,
      setAlarmVolume,
    }),
    [
      settings,
      scheme,
      hydrated,
      setTimeFormat,
      setTheme,
      connectMusic,
      disconnectMusic,
      completeOnboarding,
      finishOnboarding,
      setDefaultGenres,
      markPermissionPrimed,
      setAlarmVolume,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

export function useTheme(): Theme {
  return useSettings().theme;
}
