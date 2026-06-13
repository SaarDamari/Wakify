import { Alarm } from '../types';
import { jsDayToDayIndex } from './time';

export interface NextAlarmResult {
  alarm: Alarm;
  date: Date;
  label: string; // "Today" | "Tomorrow" | "Mon" ...
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Earliest future firing Date for a single alarm, or null if none upcoming.
export function nextFireDate(alarm: Alarm, now: Date): Date | null {
  // Repeating alarm: scan today..+7 for the soonest matching weekday/time.
  if (alarm.days.length > 0) {
    for (let offset = 0; offset <= 7; offset++) {
      const day = new Date(now.getTime() + offset * DAY_MS);
      const dayIndex = jsDayToDayIndex(day.getDay());
      if (!alarm.days.includes(dayIndex)) {
        continue;
      }
      const candidate = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        alarm.hour,
        alarm.minute,
        0,
        0,
      );
      if (candidate.getTime() > now.getTime()) {
        return candidate;
      }
    }
    return null;
  }

  // One-off with an explicit date.
  if (alarm.oneOffDate) {
    const [y, m, d] = alarm.oneOffDate.split('-').map(Number);
    const candidate = new Date(y, m - 1, d, alarm.hour, alarm.minute, 0, 0);
    return candidate.getTime() > now.getTime() ? candidate : null;
  }

  // No repeat / no date: next occurrence today or tomorrow.
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    alarm.hour,
    alarm.minute,
    0,
    0,
  );
  return today.getTime() > now.getTime()
    ? today
    : new Date(today.getTime() + DAY_MS);
}

function relativeLabel(date: Date, now: Date): string {
  const dayDiff = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS,
  );
  if (dayDiff === 0) {
    return 'Today';
  }
  if (dayDiff === 1) {
    return 'Tomorrow';
  }
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return names[date.getDay()];
}

export function computeNextAlarm(
  alarms: Alarm[],
  now: Date,
): NextAlarmResult | null {
  let best: NextAlarmResult | null = null;
  for (const alarm of alarms) {
    if (!alarm.enabled) {
      continue;
    }
    const date = nextFireDate(alarm, now);
    if (!date) {
      continue;
    }
    if (!best || date.getTime() < best.date.getTime()) {
      best = { alarm, date, label: relativeLabel(date, now) };
    }
  }
  return best;
}
