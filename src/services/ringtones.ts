import { NativeModules, Platform } from 'react-native';

// Bridge to the native WakifyAlarm module for system ringtones (Android only).
// The fallback alarm sound is a content:// ringtone URI, which react-native-sound
// can't reliably play — so enumeration + playback live in native MediaPlayer.
const Native = NativeModules.WakifyAlarm as
  | {
      getRingtones(): Promise<Ringtone[]>;
      playRingtone(uri: string, volume: number): void;
      stopRingtone(): void;
    }
  | undefined;

export interface Ringtone {
  title: string;
  uri: string; // '' => OS default alarm sound
}

// Whether the native ringtone path is available (Android with the module linked).
export function isRingtoneNativeAvailable(): boolean {
  return Platform.OS === 'android' && !!Native?.playRingtone;
}

// List the device's alarm/ringtone sounds (with a leading "Default alarm sound").
// Returns [] when native isn't available (iOS / module missing).
export async function listRingtones(): Promise<Ringtone[]> {
  if (!Native?.getRingtones) {
    return [];
  }
  try {
    return await Native.getRingtones();
  } catch {
    return [];
  }
}

// Loop a ringtone at the given volume (0–1). Empty uri => OS default alarm.
export function playRingtone(uri: string | null, volume: number): void {
  try {
    Native?.playRingtone?.(uri ?? '', Math.max(0, Math.min(1, volume)));
  } catch {
    // best-effort
  }
}

export function stopRingtone(): void {
  try {
    Native?.stopRingtone?.();
  } catch {
    // best-effort
  }
}
