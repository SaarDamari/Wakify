import { NativeModules, Platform } from 'react-native';

// Bridge to the native WakifyAlarm module (Android only). Each check defaults to
// "granted/true" when the module or the underlying API is absent (iOS, or
// Android < 14 where the permission is auto-granted) so the UI never nags about
// something that doesn't apply on the current OS.
const Native = NativeModules.WakifyAlarm as
  | {
      canUseFullScreenIntent(): Promise<boolean>;
      openFullScreenIntentSettings(): void;
      canDrawOverlays(): Promise<boolean>;
      openOverlaySettings(): void;
      isIgnoringBatteryOptimizations(): Promise<boolean>;
      openBatteryOptimizationSettings(): void;
      launchAlarmActivity(): void;
    }
  | undefined;

const isAndroid = Platform.OS === 'android';

export interface AlarmReliabilityStatus {
  fullScreenIntent: boolean;
  overlay: boolean;
  batteryOptimized: boolean; // true = exempt from battery optimization (good)
}

async function safe(p?: Promise<boolean>, fallback = true): Promise<boolean> {
  try {
    return p ? await p : fallback;
  } catch {
    return fallback;
  }
}

export async function getReliabilityStatus(): Promise<AlarmReliabilityStatus> {
  if (!isAndroid || !Native) {
    return { fullScreenIntent: true, overlay: true, batteryOptimized: true };
  }
  const [fullScreenIntent, overlay, batteryOptimized] = await Promise.all([
    safe(Native.canUseFullScreenIntent?.(), true),
    safe(Native.canDrawOverlays?.(), false),
    safe(Native.isIgnoringBatteryOptimizations?.(), false),
  ]);
  return { fullScreenIntent, overlay, batteryOptimized };
}

// Full-screen intent + overlay are required for a locked-device alarm to take
// over the screen; battery exemption is strongly recommended (not required).
export function isReliabilityComplete(s: AlarmReliabilityStatus): boolean {
  return s.fullScreenIntent && s.overlay;
}

export function openFullScreenIntentSettings(): void {
  Native?.openFullScreenIntentSettings?.();
}

export function openOverlaySettings(): void {
  Native?.openOverlaySettings?.();
}

export function openBatteryOptimizationSettings(): void {
  Native?.openBatteryOptimizationSettings?.();
}
