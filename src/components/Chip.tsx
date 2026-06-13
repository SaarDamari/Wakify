import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing } from '../theme/metrics';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: palette.ripple }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.card,
          borderColor: selected ? theme.accent : theme.cardBorder,
        },
      ]}>
      <Text
        style={[
          styles.label,
          { color: selected ? palette.white : theme.text },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  label: {
    fontSize: font.body,
    fontWeight: '600',
  },
});
