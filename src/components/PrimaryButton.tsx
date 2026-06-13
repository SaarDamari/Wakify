import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing } from '../theme/metrics';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outline';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'filled',
  style,
  disabled = false,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const filled = variant === 'filled';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{
        color: filled ? 'rgba(255,255,255,0.22)' : palette.ripple,
      }}
      style={({ pressed }) => [
        styles.button,
        filled
          ? { backgroundColor: theme.accent }
          : { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder },
        pressed && { opacity: 0.85 },
        disabled && styles.disabled,
        style,
      ]}>
      <Text
        style={[
          styles.text,
          { color: filled ? palette.white : theme.text },
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontSize: font.label,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
});
