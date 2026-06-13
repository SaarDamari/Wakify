/**
 * Wakify — alarm app.
 *
 * @format
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  BackHandler,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';
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
import { ExitConfirmModal } from './src/components/ExitConfirmModal';
import {
  dismissAlarm,
  ensureAlarmChannel,
  requestAlarmPermissions,
  rescheduleAfterFire,
  scheduleSnooze,
  showSnoozePending,
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

const SNOOZE_MINUTES = 9;

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
  const { settings, hydrated, theme, markPermissionPrimed } = useSettings();
  const { alarms } = useAlarms();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | undefined>(undefined);
  const [ringing, setRinging] = useState<Alarm | null>(null);
  const [primerVisible, setPrimerVisible] = useState(false);
  const [snoozeBanner, setSnoozeBanner] = useState<string | null>(null);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);

  const onRing = useCallback((alarm: Alarm) => setRinging(alarm), []);
  const rearm = useForegroundAlarm(alarms, onRing);

  // Latest "is something layered on top?" flag, read by the back handler below
  // without needing to re-subscribe on every state change.
  const overlayOpenRef = useRef(false);
  overlayOpenRef.current =
    settingsVisible ||
    editVisible ||
    primerVisible ||
    exitConfirmVisible ||
    !!ringing;

  // Android: confirm (with an app-themed dialog) before the back button exits
  // the app, since closing it fully can stop the alarm from playing its Spotify
  // song. When an overlay is open, let it handle back (close itself) as usual.
  useEffect(() => {
    const onBack = () => {
      if (overlayOpenRef.current) {
        return false;
      }
      setExitConfirmVisible(true);
      return true; // prevent the default exit until the user chooses
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  // Ensure the delivery channel exists. We do NOT request notification
  // permission here — that happens exactly once, when the user taps "Add Alarm"
  // (see openAdd → primer → allowPrimer), so we never prompt on launch.
  useEffect(() => {
    ensureAlarmChannel();
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

  // "Allow" → actually request OS notification permission, then continue.
  const allowPrimer = async () => {
    await requestAlarmPermissions();
    markPermissionPrimed();
    setPrimerVisible(false);
    openAddModal();
  };

  // "Not now" → remember we primed and continue without requesting.
  const dismissPrimer = () => {
    markPermissionPrimed();
    setPrimerVisible(false);
    openAddModal();
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
    if (alarm) {
      dismissAlarm(alarm.id);
      const fireAt = new Date(Date.now() + SNOOZE_MINUTES * 60_000);
      const label = formatTime(
        fireAt.getHours(),
        fireAt.getMinutes(),
        settings.timeFormat,
      );
      scheduleSnooze(alarm, SNOOZE_MINUTES);
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
      <ExitConfirmModal
        visible={exitConfirmVisible}
        onStay={() => setExitConfirmVisible(false)}
        onLeave={() => {
          setExitConfirmVisible(false);
          BackHandler.exitApp();
        }}
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
