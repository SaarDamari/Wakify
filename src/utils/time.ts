import { DayIndex, TimeFormat } from '../types';
import { isRTL } from '../i18n';

// Labels indexed by DayIndex (Monday-first: 0=Mon … 6=Sun). Hebrew uses the
// standard single-letter weekday abbreviations (Mon=ב … Sat=ש, Sun=א).
const DAY_LABELS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_LABELS_HE = ['ב', 'ג', 'ד', 'ה', 'ו', 'ש', 'א'];
export const DAY_LABELS = isRTL ? DAY_LABELS_HE : DAY_LABELS_EN;
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

// Display order for the weekday circles. Hebrew is Sunday-first (Sun, Mon … Sat,
// as DayIndex values), so under forced RTL it reads right-to-left as א ב ג ד ה ו ש.
export const DAY_ORDER: DayIndex[] = isRTL ? [6, 0, 1, 2, 3, 4, 5] : ALL_DAYS;

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
  // AM/PM only in English; Hebrew is always 24h.
  if (format === '24h' || isRTL) {
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
