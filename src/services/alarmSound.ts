import { Platform } from 'react-native';
import Sound from 'react-native-sound';
import { VolumeManager } from 'react-native-volume-manager';

// Android loads res/raw by basename (no extension); iOS by bundled filename.
const FILE = Platform.OS === 'android' ? 'alarm' : 'alarm.wav';

let current: Sound | null = null;
let categorySet = false;
// Device media volume captured before we force it to max, so we can restore it.
let savedVolume: number | null = null;

// Set the device media volume while ringing to the user's chosen level (0–1,
// default max) so the alarm is heard. Setting the stream volume scales BOTH the
// bundled tone and Spotify. We save the prior volume first to restore it after.
export async function raiseAlarmVolume(level: number = 1): Promise<void> {
  const target = Math.max(0, Math.min(1, level));
  try {
    if (savedVolume == null) {
      const { volume } = await VolumeManager.getVolume();
      savedVolume = volume;
    }
    await VolumeManager.setVolume(target, { showUI: false });
  } catch (e) {
    console.warn('[alarmSound] raiseAlarmVolume failed', e);
  }
}

// Put the volume back to whatever it was before the alarm rang.
export async function restoreAlarmVolume(): Promise<void> {
  if (savedVolume == null) {
    return;
  }
  const previous = savedVolume;
  savedVolume = null;
  try {
    await VolumeManager.setVolume(previous, { showUI: false });
  } catch (e) {
    console.warn('[alarmSound] restoreAlarmVolume failed', e);
  }
}

// Lazy + guarded: if react-native-sound isn't linked, never crash the app —
// just log and no-op. (Set the category on first play, not at import time.)
function ensureCategory(): void {
  if (categorySet) {
    return;
  }
  try {
    // Play through the iOS silent switch — an alarm must be heard.
    Sound.setCategory('Playback');
    categorySet = true;
  } catch (e) {
    console.warn('[alarmSound] setCategory failed', e);
  }
}

// Loop the bundled alarm tone. Free/random tier + fallback when a provider
// can't play. Fully guarded so a missing native module degrades gracefully.
export function playAlarmSound(): void {
  try {
    stopAlarmSound();
    ensureCategory();
    current = new Sound(FILE, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.warn('[alarmSound] failed to load', error);
        return;
      }
      try {
        current?.setVolume(1.0);
        current?.setNumberOfLoops(-1);
        current?.play(success => {
          if (!success) {
            console.warn('[alarmSound] playback finished with an error');
          }
        });
      } catch (e) {
        console.warn('[alarmSound] play threw', e);
      }
    });
  } catch (e) {
    console.warn('[alarmSound] playAlarmSound threw', e);
  }
}

export function stopAlarmSound(): void {
  try {
    if (current) {
      current.stop();
      current.release();
      current = null;
    }
  } catch (e) {
    console.warn('[alarmSound] stop threw', e);
  }
}
