import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DAY_MS, NextAlarmResult, formatCountdown } from '../utils/nextAlarm';
import { formatTime } from '../utils/time';
import { useSettings, useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { Icon } from './Icon';
import { t } from '../i18n';

interface NextAlarmBannerProps {
  result: NextAlarmResult | null;
}

export function NextAlarmBanner({ result }: NextAlarmBannerProps) {
  const theme = useTheme();
  const { settings } = useSettings();

  // Tick every second so the countdown flips exactly on the minute (and the
  // final "<1 min" window is live) instead of lagging up to half a minute.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);

  if (!result) {
    return null;
  }

  const time = formatTime(
    result.alarm.hour,
    result.alarm.minute,
    settings.timeFormat,
  );

  const comment = result.alarm.label?.trim();

  // Within the next 24h, show a live countdown; otherwise the day label.
  const msUntil = result.date.getTime() - now;
  const primary =
    msUntil > 0 && msUntil < DAY_MS ? formatCountdown(msUntil) : result.label;

  return (
    <LinearGradient
      colors={[theme.bannerFrom, theme.bannerTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}>
      <Text style={styles.kicker}>{t('next_alarm')}</Text>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.subRow}>
        <Icon name="bell" size={16} color={palette.white} />
        <Text style={styles.label}>
          {primary}
          {comment ? ` · ${comment}` : ''}
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
