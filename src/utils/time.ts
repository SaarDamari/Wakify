import { DayIndex, TimeFormat } from '../types';

// Labels in display order (Monday-first), matching DayIndex 0..6.
export const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
export const DAY_NAMES_SHORT = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

export const ALL_DAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// Convert a stored 24h hour to a 12h hour (1-12) plus meridiem.
export function to12h(hour24: number): { hour12: number; isPm: boolean } {
  const isPm = hour24 >= 12;
  let hour12 = hour24 % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }
  return { hour12, isPm };
}

// Convert a 12h hour (1-12) + meridiem back to a stored 24h hour.
export function to24h(hour12: number, isPm: boolean): number {
  const base = hour12 % 12; // 12 -> 0
  return isPm ? base + 12 : base;
}

// Format a stored time for display, e.g. "6:30 AM" or "18:30".
export function formatTime(
  hour24: number,
  minute: number,
  format: TimeFormat,
): string {
  if (format === '24h') {
    return `${pad2(hour24)}:${pad2(minute)}`;
  }
  const { hour12, isPm } = to12h(hour24);
  return `${hour12}:${pad2(minute)} ${isPm ? 'PM' : 'AM'}`;
}

// JS Date.getDay() is 0=Sun..6=Sat; convert to our Monday-first DayIndex.
export function jsDayToDayIndex(jsDay: number): DayIndex {
  return ((jsDay + 6) % 7) as DayIndex;
}

export function dayIndexToJsDay(day: DayIndex): number {
  return (day + 1) % 7;
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "2026-06-09" -> "Mon, Jun 9"
export function formatOneOffDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = WEEKDAYS_SHORT[new Date(y, m - 1, d).getDay()];
  return `${weekday}, ${MONTHS_SHORT[m - 1]} ${d}`;
}
