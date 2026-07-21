import { NativeModules } from 'react-native';
import notifee, { EventType, Notification } from '@notifee/react-native';
import { Alarm } from '../types';
import {
  rescheduleAfterFire,
  scheduleNudge,
  startRingForegroundService,
} from './notifications';
import { setPendingRing } from './pendingRing';

// Recover the Alarm we stashed in the notification payload when scheduling.
export function alarmFromNotification(
  notification?: Notification | null,
): Alarm | null {
  const raw = notification?.data?.alarm;
  if (typeof raw !== 'string') {
    return null;
  }
  try {
    return JSON.parse(raw) as Alarm;
  } catch {
    return null;
  }
}

// How many nudges deep this notification is (0 for a fresh alarm/snooze).
export function nudgeCountFromNotification(
  notification?: Notification | null,
): number {
  return Number(notification?.data?.nudgeCount) || 0;
}

// When a nudging alarm fires and isn't dismissed, queue the next nudge.
// `kind === 'nudge'` continues the chain; anything else starts it.
export function scheduleNextNudge(
  alarm: Alarm,
  kind: unknown,
  prevCount: number,
): void {
  if (!alarm.nudgingEnabled) {
    return;
  }
  scheduleNudge(alarm, kind === 'nudge' ? prevCount + 1 : 1);
}

// Registered in index.js so it runs even when the app is backgrounded/killed:
// when a repeating alarm is delivered, queue its next occurrence.
export function registerAlarmBackgroundHandler(): void {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    try {
      if (type === EventType.DELIVERED) {
        const alarm = alarmFromNotification(detail.notification);
        if (alarm) {
          // Remember this fire so the React tree opens the ring screen (and
          // starts Spotify/tone) once the app foregrounds — works whether the
          // app was backgrounded or killed.
          await setPendingRing(alarm);
          // Force the screen on + bring the ring activity to the front. This is
          // the belt-and-suspenders path for when Android 14 has demoted the
          // full-screen intent to a banner (needs the "display over other apps"
          // grant). Guarded — a missing module/permission must never throw here.
          try {
            NativeModules.WakifyAlarm?.launchAlarmActivity?.();
          } catch (e) {
            console.warn('[alarm] launchAlarmActivity failed', e);
          }
          // Keep audio + process alive on a quiet service notification (the alert
          // itself auto-hides). Allowed from the background here: the app holds
          // SYSTEM_ALERT_WINDOW + exact-alarm and just launched the ring activity.
          await startRingForegroundService();
          await rescheduleAfterFire(alarm);
          scheduleNextNudge(
            alarm,
            detail.notification?.data?.kind,
            nudgeCountFromNotification(detail.notification),
          );
        }
      }
    } catch (e) {
      console.warn('[alarm] background event handler failed', e);
    }
  });
}
