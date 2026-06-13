import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicProvider, ThemeName } from '../types';
import { getTheme } from '../theme/themes';
import { palette } from '../theme/palette';
import { font, radius, spacing } from '../theme/metrics';
import { useSettings, useTheme } from '../context/SettingsContext';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { SegmentedControl } from '../components/SegmentedControl';
import { VolumeSlider } from '../components/VolumeSlider';
import { MusicProviderButton } from '../components/MusicProviderButton';
import { GenrePicker } from '../components/GenrePicker';
import { Icon } from '../components/Icon';
import { genreNames } from '../data/genres';
import { log } from '../utils/logger';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { name: ThemeName; label: string }[] = [
  { name: 'coral', label: 'Coral' },
  { name: 'blue', label: 'Blue' },
];

const PROVIDER_NAMES: Record<MusicProvider, string> = {
  apple: 'Apple Music',
  spotify: 'Spotify',
};

// Apple Music has no native auth yet (Phase 7); keep a brief simulated delay.
const MOCK_CONNECT_MS = 1200;

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    settings,
    setTimeFormat,
    setTheme,
    connectMusic,
    disconnectMusic,
    setDefaultGenres,
    setAlarmVolume,
  } = useSettings();
  const spotify = useSpotifyAuth();
  const [connecting, setConnecting] = useState<MusicProvider | null>(null);
  const [genreVisible, setGenreVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const defaultGenresText = settings.defaultGenres.length
    ? genreNames(settings.defaultGenres)
    : 'Not set';

  const handleConnect = async (provider: MusicProvider) => {
    if (connecting) {
      return;
    }
    setConnecting(provider);
    try {
      if (provider === 'spotify') {
        // Real OAuth — opens the Spotify login page. Persist only on success.
        const ok = await spotify.connect();
        log('settings', 'spotify.connect() →', ok);
        if (ok) {
          connectMusic('spotify');
          log('settings', "connectMusic('spotify') persisted");
        }
      } else {
        await new Promise<void>(resolve => {
          timer.current = setTimeout(resolve, MOCK_CONNECT_MS);
        });
        connectMusic('apple');
      }
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = () => {
    if (settings.musicProvider === 'spotify') {
      spotify.disconnect();
    }
    disconnectMusic();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}>
          <View style={[styles.grabber, { backgroundColor: theme.cardBorder }]} />

          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              android_ripple={{ color: palette.ripple, borderless: true }}>
              <Icon name="close" size={24} color={theme.subtext} />
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <Icon name="clock" size={18} color={theme.subtext} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Time Format
            </Text>
          </View>
          <SegmentedControl
            options={[
              { label: '12-Hour (AM/PM)', value: '12h' },
              { label: '24-Hour', value: '24h' },
            ]}
            value={settings.timeFormat}
            onChange={setTimeFormat}
          />

          <View style={[styles.sectionHeader, styles.sectionSpacing]}>
            <Icon name="palette" size={18} color={theme.subtext} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Color Theme
            </Text>
          </View>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(option => {
              const selected = settings.theme === option.name;
              // Accent/banner fields are scheme-independent; the swatch is a
              // fixed colorful preview.
              const optTheme = getTheme(option.name, 'light');
              return (
                <Pressable
                  key={option.name}
                  onPress={() => setTheme(option.name)}
                  android_ripple={{ color: palette.ripple }}
                  style={[
                    styles.themeCardWrapper,
                    selected && {
                      borderColor: optTheme.accent,
                      borderWidth: 3,
                    },
                  ]}>
                  <LinearGradient
                    colors={[optTheme.bannerFrom, optTheme.bannerTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themeCard}>
                    <View style={styles.themeInner}>
                      <Text style={styles.themeLabel}>{option.label}</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.sectionHeader, styles.sectionSpacing]}>
            <Icon name="bell" size={18} color={theme.subtext} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Alarm Volume
            </Text>
          </View>
          <VolumeSlider
            value={settings.alarmVolume}
            onChange={setAlarmVolume}
          />

          <View style={[styles.sectionHeader, styles.sectionSpacing]}>
            <Icon name="music" size={18} color={theme.subtext} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Music
            </Text>
          </View>
          {settings.musicProvider ? (
            <View style={styles.musicButtons}>
              <View
                style={[
                  styles.connectedRow,
                  { borderColor: theme.cardBorder, backgroundColor: theme.card },
                ]}>
                <Text style={[styles.connectedText, { color: theme.text }]}>
                  Connected to {PROVIDER_NAMES[settings.musicProvider]}
                </Text>
                <Pressable
                  onPress={handleDisconnect}
                  android_ripple={{ color: palette.ripple }}
                  style={({ pressed }) => [
                    styles.disconnect,
                    { borderColor: theme.cardBorder, backgroundColor: theme.card },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Text style={[styles.disconnectText, { color: theme.text }]}>
                    Disconnect
                  </Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => setGenreVisible(true)}
                android_ripple={{ color: palette.ripple }}
                style={[
                  styles.playlistRow,
                  { borderColor: theme.cardBorder, backgroundColor: theme.card },
                ]}>
                <Text style={[styles.connectedText, { color: theme.subtext }]}>
                  Wake-up Genres
                </Text>
                <View style={styles.playlistValue}>
                  <Text style={[styles.connectedText, { color: theme.text }]}>
                    {defaultGenresText}
                  </Text>
                  <Icon name="chevronRight" size={18} color={theme.subtext} />
                </View>
              </Pressable>
            </View>
          ) : (
            <View style={styles.musicButtons}>
              <MusicProviderButton
                provider="apple"
                compact
                connecting={connecting === 'apple'}
                onPress={() => handleConnect('apple')}
              />
              <MusicProviderButton
                provider="spotify"
                compact
                connecting={connecting === 'spotify'}
                onPress={() => handleConnect('spotify')}
              />
            </View>
          )}
        </View>
        <GenrePicker
          visible={genreVisible}
          value={settings.defaultGenres}
          onChange={genres => setDefaultGenres(genres ?? [])}
          onClose={() => setGenreVisible(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: font.h2,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionSpacing: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: font.title,
    fontWeight: '700',
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  themeCardWrapper: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  themeCard: {
    borderRadius: radius.lg,
    height: 48,
    padding: spacing.xs,
  },
  themeInner: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: {
    color: palette.white,
    fontSize: font.label,
    fontWeight: '700',
  },
  musicButtons: {
    gap: spacing.sm,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  connectedText: {
    fontSize: font.label,
    fontWeight: '600',
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  playlistValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  disconnect: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  disconnectText: {
    fontSize: font.body,
    fontWeight: '600',
  },
});
