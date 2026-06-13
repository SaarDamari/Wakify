import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayIndex } from '../types';
import { ALL_DAYS, DAY_LABELS } from '../utils/time';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';

interface DayCirclesProps {
  days: DayIndex[];
  mode?: 'display' | 'select';
  onToggle?: (day: DayIndex) => void;
  disabled?: boolean; // grayed display for disabled alarms
  size?: number;
  // 'spread' = evenly justified across full width; 'group' = packed left.
  layout?: 'spread' | 'group';
}

export function DayCircles({
  days,
  mode = 'display',
  onToggle,
  disabled = false,
  size = 30,
  layout = 'spread',
}: DayCirclesProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, layout === 'group' && styles.rowGroup]}>
      {ALL_DAYS.map(day => {
        const active = days.includes(day);
        const dimensions = { width: size, height: size, borderRadius: size / 2 };

        let backgroundColor = theme.card;
        let borderColor = theme.cardBorder;
        let textColor = theme.subtext;

        if (active) {
          if (disabled) {
            backgroundColor = theme.disabled;
            borderColor = theme.disabled;
            textColor = palette.white;
          } else {
            backgroundColor = theme.dayActive;
            borderColor = theme.dayActive;
            textColor = palette.white;
          }
        }

        const circle = (
          <View
            style={[
              styles.circle,
              dimensions,
              { backgroundColor, borderColor },
            ]}>
            <Text
              style={[
                styles.label,
                { color: textColor, fontSize: Math.round(size * 0.42) },
              ]}>
              {DAY_LABELS[day]}
            </Text>
          </View>
        );

        if (mode === 'select') {
          return (
            <Pressable
              key={day}
              onPress={() => onToggle?.(day)}
              style={({ pressed }) => pressed && { opacity: 0.6 }}>
              {circle}
            </Pressable>
          );
        }
        return <View key={day}>{circle}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowGroup: {
    justifyContent: 'flex-start',
    gap: 6,
  },
  circle: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
});
