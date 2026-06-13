import { Vibration } from 'react-native';
import { VibratePattern } from '../types';

// RN vibration patterns are [initialWait, vibrate, sleep, vibrate, sleep, ...] in ms.
// On Android the durations are honored; on iOS the values act as delays between
// (fixed-length) buzzes. Each pattern is looped until cancelled.
const PATTERNS: Record<VibratePattern, number[]> = {
  gentle: [0, 350, 1400],
  medium: [0, 600, 900],
  strong: [0, 1100, 500],
  default: [0, 600, 900],
  heartbeat: [0, 200, 150, 200, 1100],
  pulse: [0, 300, 300],
};

export function startVibration(pattern: VibratePattern): void {
  Vibration.vibrate(PATTERNS[pattern] ?? PATTERNS.default, true);
}

export function stopVibration(): void {
  Vibration.cancel();
}
