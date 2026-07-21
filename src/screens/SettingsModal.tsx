import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { AlarmReliabilityModal } from '../components/AlarmReliabilityModal';
import { RingtonePickerModal } from '../components/RingtonePickerModal';
import { playRingtone, stopRingtone } from '../services/ringtones';
import { useSheetTransition } from '../hooks/useSheetTransition';
import { Icon } from '../components/Icon';
import { genreNames } from '../data/genres';
import { log } from '../utils/logger';
import { t, isRTL } from '../i18n';
import { TranslationKey } from '../i18n/en';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { name: ThemeName; labelKey: TranslationKey }[] = [
  { name: 'coral', labelKey: 'theme_coral' },
  { name: 'blue', labelKey: 'theme_blue' },
  { name: 'purple', labelKey: 'theme_purple' },
  { name: 'green', labelKey: 'theme_green' },
  { name: 'sunset', labelKey: 'theme_sunset' },
  { name: 'pink', labelKey: 'theme_pink' },
  { name: 'teal', labelKey: 'theme_teal' },
];

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
  const [reliabilityVisible, setReliabilityVisible] = useState(false);
  const [ringtoneVisible, setRingtoneVisible] = useState(false);

  const defaultGenresText = settings.defaultGenres.length
    ? genreNames(settings.defaultGenres)
    : t('not_set');

  // Preview the fallback ringtone at the chosen level so the user can judge the
  // volume, then auto-stop. Stops when the sheet closes/unmounts.
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleVolumeChange = (v: number) => {
    setAlarmVolume(v);
    playRingtone(settings.fallbackRingtoneUri, v);
    if (previewTimer.current) {
      clearTimeout(previewTimer.current);
    }
    previewTimer.current = setTimeout(() => stopRingtone(), 2500);
  };

  useEffect(() => {
    if (!visible) {
      stopRingtone();
    }
    return () => stopRingtone();
  }, [visible]);

  const handleConnect = async (provider: MusicProvider) => {
    if (connecting) {
      return;
    }
    setConnecting(provider);
    try {
      // Real OAuth — opens the Spotify login page. Persist only on success.
      const err = await spotify.connect();
      log('settings', 'spotify.connect() →', err ? err.message : 'ok');
      if (!err) {
        connectMusic('spotify');
        log('settings', "connectMusic('spotify') persisted");
      } else {
        Alert.alert(
          t('spotify_connect_failed_title'),
          err.message || t('spotify_connect_failed_body'),
        );
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

  const { mounted, backdropStyle, sheetStyle } = useSheetTransition(visible);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}>
          <View style={[styles.grabber, { backgroundColor: theme.cardBorder }]} />

          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('settings_title')}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              android_ripple={{ color: palette.ripple, borderless: true }}>
              <Icon name="close" size={24} color={theme.subtext} />
            </Pressable>
          </View>

          {!isRTL && (
            <>
              <View style={styles.sectionHeader}>
                <Icon name="clock" size={18} color={theme.subtext} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {t('time_format')}
                </Text>
              </View>
              <SegmentedControl
                options={[
                  { label: t('time_12h'), value: '12h' },
                  { label: t('time_24h'), value: '24h' },
                ]}
                value={settings.timeFormat}
                onChange={setTimeFormat}
              />
            </>
          )}

          <View style={[styles.sectionHeader, styles.sectionSpacing]}>
            <Icon name="palette" size={18} color={theme.subtext} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('color_theme')}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themeRow}>
            {THEME_OPTIONS.map(option => {
              const selected = settings.theme === option.name;
              // Accent/banner fields are scheme-independent.
              const optTheme = getTheme(option.name, 'light');
              return (
                <Pressable
                  key={option.name}
                  onPress={() => setTheme(option.name)}
                  accessibilityLabel={t(option.labelKey)}
                  android_ripple={{ color: palette.ripple, borderless: true }}
                  style={[
                    styles.themeSwatchWrapper,
                    selected && { borderColor: optTheme.accent },
                  ]}>
                  <LinearGradient
                    colors={[optTheme.bannerFrom, optTheme.bannerTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themeSwatch}>
                    {selected && (
                      <Icon name="check" size={16} color={palette.white} />
                    )}
                  </LinearGradient>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.sectionHeader, styles.sectionSpacing]}>
            <Icon name="bell" size={18} color={theme.subtext} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('alarm_volume')}
            </Text>
          </View>
          <VolumeSlider
            value={settings.alarmVolume}
            onChange={handleVolumeChange}
          />

          <View style={[styles.sectionHeader, styles.sectionSpacing]}>
            <Icon name="bell" size={18} color={theme.subtext} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('fallback_ringtone')}
            </Text>
          </View>
          <Pressable
            onPress={() => setRingtoneVisible(true)}
            android_ripple={{ color: palette.ripple }}
            style={[
              styles.playlistRow,
              { borderColor: theme.cardBorder, backgroundColor: theme.card },
            ]}>
            <Text style={[styles.connectedText, styles.rowLabel, { color: theme.subtext }]}>
              {t('fallback_ringtone_sub')}
            </Text>
            <View style={styles.playlistValue}>
              <Text
                numberOfLines={1}
                style={[styles.connectedText, styles.rowValueText, { color: theme.text }]}>
                {settings.fallbackRingtoneTitle ?? t('default_alarm_sound')}
              </Text>
              <Icon name="chevronRight" size={18} color={theme.subtext} />
            </View>
          </Pressable>

          <View style={[styles.sectionHeader, styles.sectionSpacing]}>
            <Icon name="shield" size={18} color={theme.subtext} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('alarm_reliability')}
            </Text>
          </View>
          <Pressable
            onPress={() => setReliabilityVisible(true)}
            android_ripple={{ color: palette.ripple }}
            style={[
              styles.playlistRow,
              { borderColor: theme.cardBorder, backgroundColor: theme.card },
            ]}>
            <Text style={[styles.connectedText, styles.rowLabel, { color: theme.subtext }]}>
              {t('alarm_reliability_sub')}
            </Text>
            <Icon name="chevronRight" size={18} color={theme.subtext} />
          </Pressable>

          <View style={[styles.sectionHeader, styles.sectionSpacing]}>
            <Icon name="music" size={18} color={theme.subtext} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('music')}
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
                  {t('connected_to', { provider: 'Spotify' })}
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
                    {t('disconnect')}
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
                <Text style={[styles.connectedText, styles.rowLabel, { color: theme.subtext }]}>
                  {t('wake_up_genres')}
                </Text>
                <View style={styles.playlistValue}>
                  <Text
                    numberOfLines={1}
                    style={[styles.connectedText, styles.rowValueText, { color: theme.text }]}>
                    {defaultGenresText}
                  </Text>
                  <Icon name="chevronRight" size={18} color={theme.subtext} />
                </View>
              </Pressable>
            </View>
          ) : (
            <View style={styles.musicButtons}>
              <MusicProviderButton
                provider="spotify"
                compact
                connecting={connecting === 'spotify'}
                onPress={() => handleConnect('spotify')}
              />
            </View>
          )}
        </Animated.View>
        <GenrePicker
          visible={genreVisible}
          value={settings.defaultGenres}
          onChange={genres => setDefaultGenres(genres ?? [])}
          onClose={() => setGenreVisible(false)}
        />
        <AlarmReliabilityModal
          visible={reliabilityVisible}
          onClose={() => setReliabilityVisible(false)}
        />
        <RingtonePickerModal
          visible={ringtoneVisible}
          onClose={() => setRingtoneVisible(false)}
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
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
  themeSwatchWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  // The descriptive left label; shrinks (rather than colliding with the value)
  // when both texts are long — notably in Hebrew.
  rowLabel: {
    flexShrink: 1,
  },
  playlistValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: spacing.xs,
  },
  // The current value; truncates with an ellipsis instead of wrapping/overlapping.
  rowValueText: {
    flexShrink: 1,
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
