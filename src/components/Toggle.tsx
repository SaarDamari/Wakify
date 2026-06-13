import React from 'react';
import { Platform, Switch } from 'react-native';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled }: ToggleProps) {
  const theme = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: theme.trackOff, true: theme.accent }}
      thumbColor={palette.white}
      ios_backgroundColor={theme.trackOff}
      style={
        Platform.OS === 'ios'
          ? { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }
          : undefined
      }
    />
  );
}
