import React, { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { Icon, IconName } from './Icon';
import {
  AlarmReliabilityStatus,
  getReliabilityStatus,
  openBatteryOptimizationSettings,
  openFullScreenIntentSettings,
  openOverlaySettings,
} from '../services/alarmReliability';
import { t } from '../i18n';
import { TranslationKey } from '../i18n/en';

interface AlarmReliabilityModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Row {
  key: keyof AlarmReliabilityStatus;
  icon: IconName;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  open: () => void;
  required: boolean;
}

const ROWS: Row[] = [
  {
    key: 'fullScreenIntent',
    icon: 'bell',
    titleKey: 'fsi_title',
    bodyKey: 'fsi_body',
    open: openFullScreenIntentSettings,
    required: true,
  },
  {
    key: 'overlay',
    icon: 'phone',
    titleKey: 'overlay_title',
    bodyKey: 'overlay_body',
    open: openOverlaySettings,
    required: true,
  },
  {
    key: 'batteryOptimized',
    icon: 'trendingUp',
    titleKey: 'battery_title',
    bodyKey: 'battery_body',
    open: openBatteryOptimizationSettings,
    required: false,
  },
];

export function AlarmReliabilityModal({
  visible,
  onClose,
}: AlarmReliabilityModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<AlarmReliabilityStatus>({
    fullScreenIntent: true,
    overlay: true,
    batteryOptimized: true,
  });

  const refresh = useCallback(() => {
    getReliabilityStatus().then(setStatus);
  }, []);

  // Refresh on open, and whenever we return from a system settings screen.
  useEffect(() => {
    if (!visible) {
      return;
    }
    refresh();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => sub.remove();
  }, [visible, refresh]);

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

          <LinearGradient
            colors={[theme.bannerFrom, theme.bannerTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.badge, shadow('raised')]}>
            <Icon name="shield" size={32} color={palette.white} />
          </LinearGradient>

          <Text style={[styles.title, { color: theme.text }]}>
            {t('reliable_alarms_title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {t('reliable_alarms_subtitle')}
          </Text>

          <View style={styles.rows}>
            {ROWS.map(row => {
              const granted = status[row.key];
              return (
                <View
                  key={row.key}
                  style={[
                    styles.row,
                    { borderColor: theme.cardBorder, backgroundColor: theme.card },
                  ]}>
                  <View
                    style={[styles.rowIcon, { backgroundColor: theme.background }]}>
                    <Icon name={row.icon} size={20} color={theme.accent} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: theme.text }]}>
                      {t(row.titleKey)}
                    </Text>
                    <Text style={[styles.rowBody, { color: theme.subtext }]}>
                      {t(row.bodyKey)}
                    </Text>
                  </View>
                  {granted ? (
                    <View style={[styles.granted, { backgroundColor: theme.accent }]}>
                      <Icon name="check" size={16} color={palette.white} />
                    </View>
                  ) : (
                    <Pressable
                      onPress={row.open}
                      android_ripple={{ color: palette.ripple }}
                      style={({ pressed }) => [
                        styles.grant,
                        { borderColor: theme.accent },
                        pressed && { opacity: 0.7 },
                      ]}>
                      <Text style={[styles.grantText, { color: theme.accent }]}>
                        {t('grant')}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>

          <Pressable
            onPress={onClose}
            android_ripple={{ color: palette.ripple }}
            style={({ pressed }) => [
              styles.done,
              { backgroundColor: theme.accent },
              pressed && { opacity: 0.9 },
            ]}>
            <Text style={styles.doneText}>{t('done')}</Text>
          </Pressable>
        </View>
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
    alignItems: 'center',
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.h2,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: font.label,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  rows: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: font.label,
    fontWeight: '700',
  },
  rowBody: {
    fontSize: font.caption,
    fontWeight: '500',
    lineHeight: 17,
  },
  grant: {
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  grantText: {
    fontSize: font.body,
    fontWeight: '700',
  },
  granted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: {
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneText: {
    color: palette.white,
    fontSize: font.label,
    fontWeight: '800',
  },
});
