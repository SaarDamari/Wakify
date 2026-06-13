import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing } from '../theme/metrics';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            android_ripple={{ color: palette.ripple }}
            style={[
              styles.segment,
              {
                backgroundColor: selected ? theme.dayActive : theme.card,
                borderColor: selected ? theme.dayActive : theme.cardBorder,
              },
            ]}>
            <Text
              style={[
                styles.label,
                { color: selected ? palette.white : theme.subtext },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontSize: font.label,
    fontWeight: '700',
  },
});
