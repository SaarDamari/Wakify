# Background Alarm Firing — Research & Recommendation

Status: **research only — not implemented.** This documents the recommended
approach for making a Wakify alarm "fire" reliably when the app is backgrounded
or fully closed. The current `useForegroundAlarm` hook only works while the app
is open (`setTimeout` dies with the JS runtime).

## Why "just run JS in the background" does not work

Neither iOS nor Android lets a React Native app keep arbitrary JS running to
wake the user at an exact time. iOS suspends the JS runtime shortly after
backgrounding; Android kills it under Doze / memory pressure. An alarm must be
handed to the OS ahead of time as a **scheduled local notification with an exact
trigger**, so the OS — not our JS — wakes the device.

> Note: `expo-task-manager` / `expo-background-task` are **not applicable** — this
> is a bare React Native project, not Expo.

## Recommended primary approach: `@notifee/react-native`

Schedule a **trigger notification** for each enabled alarm. Notifee maps to the
correct exact-time OS primitive on each platform:

- **Android:** `AlarmManager` with `setExactAndAllowWhileIdle` (via
  `AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE`), surviving Doze. Use a
  **full-screen intent** so the alarm UI launches over the lock screen, and a
  dedicated high-importance channel with a looping custom sound. Requires the
  `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` permission on Android 12+.
- **iOS:** `UNCalendarNotificationTrigger`. To ring over silent/DND, request the
  **Critical Alerts** entitlement (needs Apple approval) or at minimum use
  **Time-Sensitive** interruption level. iOS will not run our JS to start audio
  before the user taps, so the alert sound itself must carry the alarm tone.

This is the single most important piece and should be built first.

## Secondary (Android only): keep logic alive once fired

If, after the alarm fires and the user opens the app, we need a guaranteed-alive
task (e.g. to keep Spotify playback/logic running while the user wakes up),
`react-native-background-actions` runs an Android **foreground service** with a
persistent notification. On **iOS this is effectively unavailable** for long
running work — rely on the notification + `playSong` triggered when the app
becomes active.

## Comparison

| Library                         | Exact-time wake (app killed) | iOS | Android | Fit for Wakify |
| ------------------------------- | ---------------------------- | --- | ------- | -------------- |
| `@notifee/react-native`         | Yes (OS-scheduled)           | ✅  | ✅      | **Primary**    |
| `react-native-background-actions` | No (keep-alive only)       | ⚠️ limited | ✅ | Secondary (Android) |
| `expo-task-manager`             | N/A                          | —   | —       | Not usable (bare RN) |

## Recommended next steps (when we implement)

1. Add `@notifee/react-native`; create a high-importance alarm channel (Android)
   and request notification + exact-alarm permissions.
2. On alarm create/update/toggle, (re)schedule a Notifee trigger; cancel it on
   delete/disable. Reschedule repeating alarms on fire and on app boot.
3. Handle the notification press / full-screen intent to open `AlarmRingScreen`
   and call `spotifyService.playSong(...)`.
4. (Optional, Android) add `react-native-background-actions` only if playback
   needs a guaranteed foreground service.
5. For ringing over silent mode, pursue iOS Critical Alerts entitlement.
