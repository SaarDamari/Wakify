// Tiny tagged logger so every diagnostic line shares a greppable prefix.
// Filter in Metro, `npx react-native log-android`, or `adb logcat` with: Wakify
//
// Diagnostics are OFF by default to keep the console clean. Flip ENABLED to true
// (or gate on __DEV__) to surface the [Wakify] trace when debugging playback/auth.
// NOTE: never pass raw tokens here — log booleans/lengths only.
const ENABLED = __DEV__;
const TAG = '[Wakify]';

export const log = (scope: string, ...args: unknown[]): void => {
  if (ENABLED) {
    console.log(`${TAG}[${scope}]`, ...args);
  }
};

export const warn = (scope: string, ...args: unknown[]): void => {
  if (ENABLED) {
    console.warn(`${TAG}[${scope}]`, ...args);
  }
};
