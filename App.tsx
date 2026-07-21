/**
 * Wakify — alarm app.
 *
 * @format
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppProvider';
import { useSettings } from './src/context/SettingsContext';
import { useAlarms } from './src/context/AlarmsContext';
import { useForegroundAlarm } from './src/hooks/useForegroundAlarm';
import { AlarmsListScreen } from './src/screens/AlarmsListScreen';
import { SettingsModal } from './src/screens/SettingsModal';
import { AlarmEditModal } from './src/screens/AlarmEditModal';
import { ConnectScreen } from './src/screens/ConnectScreen';
import { AlarmRingScreen } from './src/screens/AlarmRingScreen';
import notifee, { EventType } from '@notifee/react-native';
import { PermissionPrimerModal } from './src/components/PermissionPrimerModal';
import { AlarmReliabilityModal } from './src/components/AlarmReliabilityModal';
import { SpotifySessionExpiredModal } from './src/components/SpotifySessionExpiredModal';
import { disconnectSpotify } from './src/services/spotifyService';
import { onSpotifySessionExpired } from './src/services/spotifyAuthEvents';
import {
  getReliabilityStatus,
  isReliabilityComplete,
} from './src/services/alarmReliability';
import {
  dismissAlarm,
  ensureAlarmChannel,
  requestAlarmPermissions,
  rescheduleAfterFire,
  scheduleSnooze,
  showSnoozePending,
  startRingForegroundService,
  syncScheduledAlarms,
} from './src/services/notifications';
import {
  alarmFromNotification,
  nudgeCountFromNotification,
  scheduleNextNudge,
} from './src/services/alarmEvents';
import { clearPendingRing, takePendingRing } from './src/services/pendingRing';
import { formatTime } from './src/utils/time';
import { Alarm } from './src/types';

const SNOOZE_DEFAULT = 5;

function App() {
  const scheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const { settings, hydrated, theme, markPermissionPrimed, disconnectMusic } =
    useSettings();
  const { alarms } = useAlarms();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | undefined>(undefined);
  const [ringing, setRinging] = useState<Alarm | null>(null);
  const [primerVisible, setPrimerVisible] = useState(false);
  const [reliabilityVisible, setReliabilityVisible] = useState(false);
  const [reliabilityOk, setReliabilityOk] = useState(true);
  const [snoozeBanner, setSnoozeBanner] = useState<string | null>(null);
  const [spotifyExpiredVisible, setSpotifyExpiredVisible] = useState(false);

  const onRing = useCallback((alarm: Alarm) => setRinging(alarm), []);
  const rearm = useForegroundAlarm(alarms, onRing);

  // True while the reliability checklist is shown as part of the Add-Alarm flow,
  // so closing it continues into the editor (vs. just dismissing from a banner).
  const reliabilityFromAddRef = useRef(false);

  // Ensure the delivery channel exists. We do NOT request notification
  // permission here — that happens exactly once, when the user taps "Add Alarm"
  // (see openAdd → primer → allowPrimer), so we never prompt on launch.
  useEffect(() => {
    ensureAlarmChannel();
  }, []);

  // When the Spotify refresh token dies (invalid_grant), the auth service has
  // already cleared the token; here we flip the app to disconnected and prompt
  // the user to log in again. Alarms keep ringing via the ringtone fallback.
  useEffect(
    () =>
      onSpotifySessionExpired(() => {
        disconnectMusic();
        void disconnectSpotify();
        setSpotifyExpiredVisible(true);
      }),
    [disconnectMusic],
  );

  // Track whether the alarm-reliability grants (full-screen intent + overlay) are
  // in place, so the home screen can surface a banner. Re-check when returning
  // from a system settings screen.
  useEffect(() => {
    const check = () =>
      getReliabilityStatus().then(s => setReliabilityOk(isReliabilityComplete(s)));
    check();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        check();
      }
    });
    return () => sub.remove();
  }, []);

  // Keep OS-scheduled alarms in sync with the alarm list (fires when closed).
  useEffect(() => {
    syncScheduledAlarms(alarms);
  }, [alarms]);

  // If the app was launched by tapping an alarm notification, open the ring.
  useEffect(() => {
    notifee.getInitialNotification().then(initial => {
      const alarm = alarmFromNotification(initial?.notification);
      if (alarm) {
        setRinging(alarm);
      }
    });
  }, []);

  // When a bg/killed alarm fires, the background handler stores a "pending ring".
  // Pick it up whenever the app is foregrounded (by the full-screen intent or a
  // tap) so the ring screen opens and Spotify/tone playback starts — on cold
  // start (mount) and on every return to the foreground (AppState → active).
  useEffect(() => {
    const consume = async () => {
      const alarm = await takePendingRing();
      if (alarm) {
        setRinging(alarm);
      }
    };
    consume();
    // On a cold start the headless background handler may write the pending ring
    // a beat after we mount — re-check shortly after to avoid missing it.
    const retry = setTimeout(consume, 1200);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        consume();
      }
    });
    return () => {
      clearTimeout(retry);
      sub.remove();
    };
  }, []);

  // While a ring is showing in the foreground, keep the media foreground service
  // running (covers the in-app timer, snooze/nudge re-rings and pending-ring).
  useEffect(() => {
    if (ringing) {
      startRingForegroundService();
    }
  }, [ringing]);

  // Foreground notifee events: reschedule repeats and open the ring on tap.
  // (Fresh in-app ringing while open is driven by useForegroundAlarm; a snooze
  // re-ring must reopen the ring itself since the hook doesn't track snoozes.)
  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      try {
        const alarm = alarmFromNotification(detail.notification);
        if (!alarm) {
          return;
        }
        const kind = detail.notification?.data?.kind;
        console.log(`[alarm] foreground event type=${type} kind=${kind}`);
        if (type === EventType.PRESS) {
          setRinging(alarm);
        } else if (type === EventType.DELIVERED) {
          if (kind === 'snooze') {
            setSnoozeBanner(null);
            setRinging(alarm);
          } else if (kind === 'nudge') {
            setRinging(alarm);
          } else {
            rescheduleAfterFire(alarm);
          }
          // Keep an ignored nudging alarm re-alerting until it's stopped.
          scheduleNextNudge(
            alarm,
            kind,
            nudgeCountFromNotification(detail.notification),
          );
        }
      } catch (e) {
        console.warn('[alarm] foreground event handler failed', e);
      }
    });
  }, []);

  // Avoid flashing the onboarding gate before persisted settings load.
  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  if (!settings.onboarded) {
    return <ConnectScreen />;
  }

  const openAddModal = () => {
    setEditingAlarm(undefined);
    setEditVisible(true);
  };

  // Show the permission explainer once, before the first alarm is created.
  const openAdd = () => {
    if (!settings.permissionPrimed) {
      setPrimerVisible(true);
      return;
    }
    openAddModal();
  };

  // After the notification primer, show the reliability checklist once if the
  // full-screen-intent / overlay grants are still missing, then open the editor.
  const continueAfterPrimer = async () => {
    setPrimerVisible(false);
    const status = await getReliabilityStatus();
    if (!isReliabilityComplete(status)) {
      setReliabilityOk(false);
      reliabilityFromAddRef.current = true;
      setReliabilityVisible(true);
      return;
    }
    openAddModal();
  };

  // Open the checklist from the home banner (not part of the Add flow).
  const openReliability = () => {
    reliabilityFromAddRef.current = false;
    setReliabilityVisible(true);
  };

  // On close: refresh the banner state and, if this was the Add flow, continue
  // into the alarm editor regardless of whether every grant was given.
  const closeReliability = () => {
    setReliabilityVisible(false);
    getReliabilityStatus().then(s => setReliabilityOk(isReliabilityComplete(s)));
    if (reliabilityFromAddRef.current) {
      reliabilityFromAddRef.current = false;
      openAddModal();
    }
  };

  // "Allow" → actually request OS notification permission, then continue.
  const allowPrimer = async () => {
    await requestAlarmPermissions();
    markPermissionPrimed();
    await continueAfterPrimer();
  };

  // "Not now" → remember we primed and continue without requesting.
  const dismissPrimer = () => {
    markPermissionPrimed();
    continueAfterPrimer();
  };

  const openEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setEditVisible(true);
  };

  // Preview is triggered from inside the edit modal; close it first so the
  // full-screen ring isn't stacked under a native Modal.
  const previewAlarm = (alarm: Alarm) => {
    setEditVisible(false);
    setTimeout(() => setRinging(alarm), 250);
  };

  const stopRing = () => {
    const alarm = ringing;
    setRinging(null);
    setSnoozeBanner(null);
    rearm();
    clearPendingRing();
    notifee.stopForegroundService(); // end the media FGS started at fire time
    if (alarm) {
      dismissAlarm(alarm.id);
    }
  };

  // Snooze dismisses the ring and re-triggers the same alarm via an OS-level
  // trigger, so it survives the app being backgrounded or killed. Also posts a
  // "snooze pending" notification + in-app banner showing when it will ring.
  const snoozeRing = () => {
    const alarm = ringing;
    setRinging(null);
    rearm();
    clearPendingRing();
    notifee.stopForegroundService(); // end the media FGS until the snooze re-ring
    if (alarm) {
      dismissAlarm(alarm.id);
      const minutes = alarm.snoozeInterval ?? SNOOZE_DEFAULT;
      const fireAt = new Date(Date.now() + minutes * 60_000);
      const label = formatTime(
        fireAt.getHours(),
        fireAt.getMinutes(),
        settings.timeFormat,
      );
      scheduleSnooze(alarm, minutes);
      showSnoozePending(alarm, label);
      setSnoozeBanner(label);
    }
  };

  return (
    <>
      <AlarmsListScreen
        onOpenSettings={() => setSettingsVisible(true)}
        onAddAlarm={openAdd}
        onEditAlarm={openEdit}
        snoozeBanner={snoozeBanner}
        showReliabilityWarning={!reliabilityOk}
        onFixReliability={openReliability}
      />
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
      <AlarmEditModal
        visible={editVisible}
        alarm={editingAlarm}
        onClose={() => setEditVisible(false)}
        onPreview={previewAlarm}
      />
      <PermissionPrimerModal
        visible={primerVisible}
        onAllow={allowPrimer}
        onDismiss={dismissPrimer}
      />
      <AlarmReliabilityModal
        visible={reliabilityVisible}
        onClose={closeReliability}
      />
      <SpotifySessionExpiredModal
        visible={spotifyExpiredVisible}
        onReconnect={() => {
          setSpotifyExpiredVisible(false);
          setSettingsVisible(true);
        }}
        onDismiss={() => setSpotifyExpiredVisible(false)}
      />
      {ringing && (
        <AlarmRingScreen
          alarm={ringing}
          onStop={stopRing}
          onSnooze={snoozeRing}
        />
      )}
    </>
  );
}

export default App;
