import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Alarm } from '../types';
import { formatOneOffDate, formatTime } from '../utils/time';
import { useSettings, useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { DayCircles } from './DayCircles';
import { Toggle } from './Toggle';

interface AlarmCardProps {
  alarm: Alarm;
  onPress: () => void;
  onToggle: (value: boolean) => void;
}

export function AlarmCard({ alarm, onPress, onToggle }: AlarmCardProps) {
  const theme = useTheme();
  const { settings } = useSettings();
  const enabled = alarm.enabled;

  const time = formatTime(alarm.hour, alarm.minute, settings.timeFormat);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: palette.ripple }}
      style={[
        styles.card,
        { borderColor: theme.cardBorder, backgroundColor: theme.card },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleColumn}>
          <Text
            style={[
              styles.time,
              { color: enabled ? theme.text : theme.disabled },
            ]}>
            {time}
          </Text>
          {!!alarm.label && (
            <Text
              style={[
                styles.label,
                { color: enabled ? theme.subtext : theme.disabled },
              ]}>
              {alarm.label}
            </Text>
          )}
        </View>

        <Toggle value={enabled} onValueChange={onToggle} />
      </View>

      <View style={styles.days}>
        {alarm.oneOffDate ? (
          <Text
            style={[
              styles.dateText,
              { color: enabled ? theme.text : theme.disabled },
            ]}>
            {formatOneOffDate(alarm.oneOffDate)}
          </Text>
        ) : (
          <DayCircles
            days={alarm.days}
            mode="display"
            layout="group"
            disabled={!enabled}
            size={24}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadow('card'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleColumn: {
    flex: 1,
  },
  time: {
    fontSize: font.time,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: font.body,
    fontWeight: '500',
    marginTop: 2,
  },
  days: {
    marginTop: spacing.sm,
  },
  dateText: {
    fontSize: font.label,
    fontWeight: '600',
  },
});
