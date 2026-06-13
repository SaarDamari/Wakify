import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NextAlarmResult } from '../utils/nextAlarm';
import { formatTime } from '../utils/time';
import { useSettings, useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { Icon } from './Icon';

interface NextAlarmBannerProps {
  result: NextAlarmResult | null;
}

export function NextAlarmBanner({ result }: NextAlarmBannerProps) {
  const theme = useTheme();
  const { settings } = useSettings();

  if (!result) {
    return null;
  }

  const time = formatTime(
    result.alarm.hour,
    result.alarm.minute,
    settings.timeFormat,
  );

  return (
    <LinearGradient
      colors={[theme.bannerFrom, theme.bannerTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}>
      <Text style={styles.kicker}>NEXT ALARM</Text>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.subRow}>
        <Icon name="bell" size={16} color={palette.white} />
        <Text style={styles.label}>
          {result.label}
          {result.alarm.label ? ` · ${result.alarm.label}` : ''}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadow('raised'),
  },
  kicker: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: font.caption,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  time: {
    color: palette.white,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  label: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: font.body,
    fontWeight: '600',
  },
});
