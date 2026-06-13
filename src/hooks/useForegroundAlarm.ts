import { useCallback, useEffect, useState } from 'react';
import { Alarm } from '../types';
import { computeNextAlarm } from '../utils/nextAlarm';

const MAX_TIMEOUT = 2 ** 31 - 1;

// Foreground-only scheduler: while the app is open, fires onRing(alarm) when the
// soonest enabled alarm's time arrives. Returns a rearm() to re-schedule after a
// ring is dismissed/snoozed. No background/OS alarms.
export function useForegroundAlarm(
  alarms: Alarm[],
  onRing: (alarm: Alarm) => void,
): () => void {
  const [rearm, setRearm] = useState(0);

  useEffect(() => {
    const next = computeNextAlarm(alarms, new Date());
    if (!next) {
      return;
    }
    const delay = Math.min(
      Math.max(next.date.getTime() - Date.now(), 0),
      MAX_TIMEOUT,
    );
    const id = setTimeout(() => onRing(next.alarm), delay);
    return () => clearTimeout(id);
  }, [alarms, rearm, onRing]);

  return useCallback(() => setRearm(c => c + 1), []);
}
