import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types';

// A "pending ring" is written by the background event handler the moment an
// alarm/snooze/nudge is DELIVERED while the app is backgrounded or killed. When
// the full-screen intent (or a tap) then brings the app to the foreground, the
// React tree reads it and opens the ring screen — which is what actually starts
// Spotify/tone playback. Without this, a bg/killed alarm would foreground the
// app but never show the ring or play music.
const KEY = '@wakify/pending-ring';

// Ignore anything older than this so re-opening the app much later doesn't
// resurrect a long-past alarm.
const FRESH_MS = 2 * 60 * 1000;

export async function setPendingRing(alarm: Alarm): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ alarm, ts: Date.now() }),
    );
  } catch {
    // best-effort
  }
}

// Read and consume the pending ring (removes it). Returns the alarm only if one
// was set recently enough to still be relevant.
export async function takePendingRing(): Promise<Alarm | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      return null;
    }
    await AsyncStorage.removeItem(KEY);
    const { alarm, ts } = JSON.parse(raw) as { alarm: Alarm; ts: number };
    if (Date.now() - ts > FRESH_MS) {
      return null;
    }
    return alarm;
  } catch {
    return null;
  }
}

export async function clearPendingRing(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // best-effort
  }
}
