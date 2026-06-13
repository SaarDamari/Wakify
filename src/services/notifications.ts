import { Platform } from 'react-native';
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Alarm } from '../types';
import { nextFireDate } from '../utils/nextAlarm';

// High-importance, SILENT channel used for firing alarms (the ring screen owns
// all audio — Spotify or the bundled tone — so the OS notification sound never
// overlaps it), with a strong vibration pattern for an immediate physical cue.
// IMPORTANT: a HIGH-importance channel with NO sound falls back to the DEFAULT
// system sound, so to be truly silent we point it at a 2s silent clip
// (res/raw/silent.mp3). NOTE: Android channel settings are immutable after
// creation — bump this id (…-vN) whenever the sound/vibration changes.
export const ALARM_CHANNEL_ID = 'wakify-alarms-v4';

// Quiet channel for the "snooze pending" status notification (no sound/vibration).
export const SNOOZE_INFO_CHANNEL_ID = 'wakify-snooze-info';

// Vibration pattern (ms): pairs of [vibrate, sleep], looped by the OS. notifee
// requires an EVEN count of POSITIVE values (no leading 0).
const ALARM_VIBRATION_PATTERN = [700, 600, 700, 600];

// Create (idempotent) the Android channel alarms are delivered on. No-op on iOS.
// Never rejects — a channel-config error must not be able to abort scheduling.
export async function ensureAlarmChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    await notifee.createChannel({
      id: ALARM_CHANNEL_ID,
      name: 'Alarms',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      // Silent clip (NOT omitted — omitting makes a HIGH channel use the default
      // system sound). The ring screen plays the real audio (Spotify or tone),
      // so the OS chime can never overlap it during Spotify's connect/load.
      sound: 'silent', // res/raw/silent.mp3
      vibration: true,
      vibrationPattern: ALARM_VIBRATION_PATTERN,
      bypassDnd: true,
    });
  } catch (e) {
    console.warn('[notifications] ensureAlarmChannel failed', e);
  }
}

// Ask the OS for notification permission and ensure the alarm channel exists.
// Returns true when alarms can be delivered.
export async function requestAlarmPermissions(): Promise<boolean> {
  const settings = await notifee.requestPermission({
    sound: true,
    alert: true,
    badge: true,
  });
  await ensureAlarmChannel();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

// Whether the user has already granted notification permission.
export async function hasAlarmPermissions(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

// Occurrences pre-scheduled per repeating alarm. A window (rather than a single
// fire) keeps repeats working while the app is killed — on iOS no JS runs to
// reschedule on fire, so we queue ahead and top up whenever the app is opened.
const REPEAT_WINDOW = 7;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export type AlarmKind = 'alarm' | 'snooze' | 'nudge';

// Safety cap so an ignored, nudging alarm doesn't re-alert forever.
const MAX_NUDGES = 12;

// The notification config for a firing alarm. The full alarm is stored in `data`
// so background handlers can reschedule repeats and the UI can open the ring.
// `notifId` lets a repeating alarm own several queued occurrences; `kind` lets
// the foreground handler tell a snooze re-ring apart from a fresh alarm.
function buildAlarmNotification(
  alarm: Alarm,
  notifId: string,
  kind: AlarmKind,
  nudgeCount = 0,
) {
  return {
    id: notifId,
    title: alarm.label?.trim() || 'Alarm',
    body: `${pad2(alarm.hour)}:${pad2(alarm.minute)} · Wake up!`,
    data: {
      alarmId: alarm.id,
      alarm: JSON.stringify(alarm),
      kind,
      nudgeCount: String(nudgeCount),
    },
    android: {
      channelId: ALARM_CHANNEL_ID,
      category: AndroidCategory.ALARM,
      importance: AndroidImportance.HIGH,
      // Silent clip (see channel) so the ring screen owns audio — no overlap.
      sound: 'silent', // res/raw/silent.mp3
      vibrationPattern: ALARM_VIBRATION_PATTERN,
      // Show full-screen even on the lock screen, and route taps into the app.
      // launchActivity 'default' points the intent at the launcher (MainActivity).
      fullScreenAction: { id: 'default', launchActivity: 'default' },
      pressAction: { id: 'default', launchActivity: 'default' },
      autoCancel: false,
    },
    ios: {
      sound: 'alarm.wav', // bundled in the iOS app target
      critical: false,
      interruptionLevel: 'timeSensitive' as const,
    },
  };
}

async function createTrigger(
  alarm: Alarm,
  notifId: string,
  date: Date,
  kind: AlarmKind = 'alarm',
  nudgeCount = 0,
): Promise<boolean> {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    alarmManager: { allowWhileIdle: true }, // exact even in Doze (Android)
  };
  try {
    await notifee.createTriggerNotification(
      buildAlarmNotification(alarm, notifId, kind, nudgeCount),
      trigger,
    );
    console.log(
      `[notifications] scheduled ${kind} "${notifId}" for ${date.toISOString()}`,
    );
    return true;
  } catch (e) {
    // Never let one bad payload abort scheduling of the others.
    console.warn(`[notifications] failed to schedule "${notifId}"`, e);
    return false;
  }
}

// Schedule an alarm: a single fire for one-offs, a rolling window for repeats.
export async function scheduleAlarm(
  alarm: Alarm,
  from: Date = new Date(),
): Promise<void> {
  if (!alarm.enabled) {
    return;
  }
  // One-off / no-repeat: a single occurrence.
  if (alarm.days.length === 0) {
    const date = nextFireDate(alarm, from);
    if (date) {
      await createTrigger(alarm, alarm.id, date);
    }
    return;
  }
  // Repeating: pre-schedule the next REPEAT_WINDOW occurrences.
  let cursor = from;
  for (let i = 0; i < REPEAT_WINDOW; i++) {
    const date = nextFireDate(alarm, cursor);
    if (!date) {
      break;
    }
    await createTrigger(alarm, `${alarm.id}#${i}`, date);
    cursor = new Date(date.getTime() + 60_000);
  }
}

// Cancel every scheduled alarm and re-schedule the next fire for each enabled
// one. Call whenever the alarm list changes.
export async function syncScheduledAlarms(alarms: Alarm[]): Promise<void> {
  try {
    await ensureAlarmChannel();
    await notifee.cancelTriggerNotifications();
    await Promise.all(alarms.map(alarm => scheduleAlarm(alarm)));
    const pending = await notifee.getTriggerNotificationIds();
    const enabled = alarms.filter(a => a.enabled).length;
    const granted = await hasAlarmPermissions();
    console.log(
      `[notifications] synced — ${enabled} enabled alarm(s), ${pending.length} trigger(s) pending, permission=${granted}`,
    );
  } catch (e) {
    console.warn('[notifications] syncScheduledAlarms failed', e);
  }
}

// After a repeating alarm fires, top its window back up. One-offs don't repeat.
export async function rescheduleAfterFire(alarm: Alarm): Promise<void> {
  if (alarm.days.length === 0) {
    return;
  }
  // Start one minute past the just-fired slot so we land on the next match.
  await scheduleAlarm(alarm, new Date(Date.now() + 60_000));
}

function snoozeId(alarmId: string): string {
  return `${alarmId}#snooze`;
}

function snoozeInfoId(alarmId: string): string {
  return `${alarmId}#snooze-info`;
}

function nudgeId(alarmId: string): string {
  return `${alarmId}#nudge`;
}

// Schedule the next nudge: an ignored alarm re-alerts every nudgeInterval minutes
// until Stop. `count` chains across fires and is capped by MAX_NUDGES.
export async function scheduleNudge(alarm: Alarm, count = 1): Promise<void> {
  if (!alarm.nudgingEnabled || count > MAX_NUDGES) {
    return;
  }
  await ensureAlarmChannel();
  const minutes = alarm.nudgeInterval ?? 5;
  const date = new Date(Date.now() + minutes * 60_000);
  await createTrigger(alarm, nudgeId(alarm.id), date, 'nudge', count);
}

// Schedule a one-shot re-ring `minutes` from now. Survives backgrounding/kill
// because it's an OS-level trigger, not a JS timer. Returns the fire Date so the
// caller can show a "snooze pending" indicator.
export async function scheduleSnooze(
  alarm: Alarm,
  minutes: number,
): Promise<Date> {
  await ensureAlarmChannel();
  const date = new Date(Date.now() + minutes * 60_000);
  await createTrigger(alarm, snoozeId(alarm.id), date, 'snooze');
  return date;
}

// Post a persistent, quiet "snooze pending" status notification.
export async function showSnoozePending(
  alarm: Alarm,
  timeLabel: string,
): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: SNOOZE_INFO_CHANNEL_ID,
        name: 'Snooze status',
        importance: AndroidImportance.LOW,
      });
    }
    await notifee.displayNotification({
      id: snoozeInfoId(alarm.id),
      title: alarm.label?.trim() || 'Alarm',
      body: `Snoozed — rings at ${timeLabel}`,
      android: {
        channelId: SNOOZE_INFO_CHANNEL_ID,
        importance: AndroidImportance.LOW,
        ongoing: true,
        autoCancel: false,
        pressAction: { id: 'default', launchActivity: 'default' },
      },
      ios: { interruptionLevel: 'passive' as const },
    });
  } catch (e) {
    console.warn('[notifications] showSnoozePending failed', e);
  }
}

// Stop a ringing alarm: clear the visible notification, the pending snooze
// trigger, and the snooze-status notification.
export async function dismissAlarm(alarmId: string): Promise<void> {
  await Promise.all([
    notifee.cancelDisplayedNotification(alarmId),
    notifee.cancelTriggerNotification(snoozeId(alarmId)),
    notifee.cancelDisplayedNotification(snoozeId(alarmId)),
    notifee.cancelDisplayedNotification(snoozeInfoId(alarmId)),
    notifee.cancelTriggerNotification(nudgeId(alarmId)),
    notifee.cancelDisplayedNotification(nudgeId(alarmId)),
  ]);
}
