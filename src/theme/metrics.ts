import { Platform, ViewStyle } from 'react-native';

// Spacing scale (compact).
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

// Corner radii.
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
};

// Type scale.
export const font = {
  caption: 11,
  body: 14,
  label: 15,
  title: 17,
  h2: 24,
  h1: 28,
  time: 30,
};

type ShadowLevel = 'card' | 'raised' | 'fab';

// Hybrid elevation: iOS soft shadow + matching Android elevation, by level.
export function shadow(level: ShadowLevel): ViewStyle {
  const config = {
    card: { opacity: 0.05, radius: 8, offsetY: 3, elevation: 2 },
    raised: { opacity: 0.1, radius: 14, offsetY: 6, elevation: 6 },
    fab: { opacity: 0.18, radius: 12, offsetY: 6, elevation: 8 },
  }[level];

  if (Platform.OS === 'android') {
    return { elevation: config.elevation };
  }
  return {
    shadowColor: '#000',
    shadowOpacity: config.opacity,
    shadowRadius: config.radius,
    shadowOffset: { width: 0, height: config.offsetY },
  };
}
