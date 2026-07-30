# Wakify

**Wakify** is a music alarm clock — it wakes you to your favorite music instead of a generic beep. Set an alarm and it rings by playing a real Spotify track: a song from a curated genre mix, or one of your own Spotify playlists. If music can't play, it falls back to a system ringtone so you always wake up.

Built with bare **React Native** (New Architecture / Fabric) for **Android and iOS**.

## Features

- 🎵 **Wake up to Spotify** — plays a real track at alarm time via Spotify's App Remote SDK (requires the Spotify app + Premium).
- 🎧 **Genre mix or your own playlist** — pick a curated wake-up genre, or (premium) any of your own Spotify playlists. The two are an either/or per alarm.
- ⏰ **Reliable background alarms** — full-screen, over-the-lock-screen alarms via Notifee, exact even in Doze; survive the app being closed or the phone asleep.
- 😴 **Snooze & nudging** — snooze re-rings at the OS level; an ignored alarm keeps nudging until you stop it.
- 📳 **Vibration control** — Gentle / Medium / Strong, or fully off (truly silent, notification included).
- ⏳ **Live next-alarm countdown** — the home banner counts down the minutes to your next alarm.
- 🌗 **Light/Dark** following the OS, with several accent color themes.
- 🌍 **English & Hebrew** (full RTL support).
- 🔔 **Ringtone fallback** — if Spotify can't play (no Premium, session expired, offline), a system ringtone rings instead.

## Requirements to use it

Wakify plays music through Spotify's **App Remote SDK**, so the person using the app needs the **Spotify app installed + logged in** and a **Spotify Premium** account. While the Spotify project is in Development Mode, their account must also be **added to the dashboard** (see [Section 3](#3-make-it-work-for-a-specific-person-the-important-part)).

## License

Released under the [MIT License](LICENSE) — © 2026 Saar Damari.

---

# Build & Spotify Setup Guide

This guide covers two things:

1. **Building the Android APK** and installing it on a phone.
2. **Setting up the Spotify Developer Dashboard** so "Connect Spotify" actually works for a specific person (e.g. handing the app to someone else).

---

## 1. Build the APK (Android)

### Prerequisites
- **Node.js** 18+
- **JDK 17**
- **Android SDK** (via Android Studio is easiest)
- The project targets `compileSdk`/`targetSdk` **36**, `minSdk` **24**.

### Build a shareable APK
From the repo root:

```bash
npm install
cd android
./gradlew assembleRelease
```

The APK is written to:

```
android/app/build/outputs/apk/release/app-release.apk
```

This APK is **self-contained** — the JavaScript is bundled in, so it runs without Metro or a computer attached.

> **Signing note:** the release build is signed with the project's `android/app/debug.keystore`. That's fine for sideloading the APK to a phone, but it is **not** suitable for publishing to the Google Play Store (you'd generate your own upload keystore for that).

### Install it on a phone
1. Transfer `app-release.apk` to the phone (USB, Google Drive, email, WhatsApp, etc.).
2. Open it with the Files app / browser. Android will ask to allow **"Install unknown apps"** for that app — enable it.
3. Tap **Install**.

### Developer alternative (not for sharing)
To run on a plugged-in phone/emulator during development (requires Metro running):

```bash
npx react-native run-android
```

---

## 2. Spotify Developer Dashboard setup (done once, by the developer)

Spotify Connect only works if the Spotify **Developer Dashboard** app is configured to match this project. Do this once at <https://developer.spotify.com/dashboard> (log in with any Spotify account — this is the *developer* account, not the end user's).

### Values that must match this project

| Field | Value |
|---|---|
| **Redirect URI** | `wakify://callback` |
| **Android package name** | `com.wakify.app` |
| **Android SHA-1** | fingerprint of `android/app/debug.keystore` (see below) |
| **APIs to enable** | Web API **and** Android |
| **Client ID** | must equal `CLIENT_ID` in `src/config/spotify.ts` |

The current app is already wired to Client ID `54435db798c84a1caad3dc3a68e0553f`. The requested scopes live in `SPOTIFY_SCOPES` in `src/config/spotify.ts` (streaming, app-remote-control, playlist-read, etc.) — you don't enter these in the dashboard; the app requests them at login.

### Steps
1. **Create app** (or open the existing one) → **Settings** → **Edit**.
2. **Redirect URIs:** add `wakify://callback` → **Add** → **Save**.
3. **Which API/SDKs are you using:** check **Web API** and **Android**.
4. **Android Packages:** add
   - Package name: `com.wakify.app`
   - SHA-1 fingerprint: *(see next step)*
5. **Save.**

> If you create a **brand-new** dashboard app, copy its **Client ID** into `src/config/spotify.ts` (`CLIENT_ID`) and rebuild the APK. Otherwise keep the existing Client ID.

### Getting the SHA-1 fingerprint
Because the release build is signed with `debug.keystore`, the debug and release SHA-1 are the same. Use either command:

```bash
# Option A — from the project (lists SHA1 per variant)
cd android && ./gradlew signingReport
```

```bash
# Option B — directly from the keystore
keytool -list -v \
  -keystore android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android -keypass android
```

Copy the value on the **`SHA1:`** line (format `AB:CD:EF:...`) into the dashboard's Android SHA-1 field.

---

## 3. Make it work for a specific person (the important part)

A Spotify Developer app starts in **Development Mode**, which only allows a small number (~25) of **explicitly listed** Spotify accounts to log in. **Anyone not on the list will fail to connect — the login hangs and times out.** This is the most common reason "Connect Spotify" doesn't work on someone else's phone.

### Add the person in the dashboard
1. Dashboard → your app → **Settings** (or **User Management**).
2. Under **User Management**, add the person's:
   - **Spotify display name**
   - **Spotify account email**
3. Save. They can now authorize the app.

> To remove the 25-user limit entirely, request **Extended Quota Mode** (production) from Spotify — this requires a review by Spotify and is only needed for a public release.

### On the person's phone
Make sure they have:
- ✅ The **Spotify app** installed and **logged in**
- ✅ A **Spotify Premium** subscription (App Remote playback requires Premium)
- ✅ Their account **added in User Management** (step above)

Then in Wakify: **Settings → Connect Spotify → approve**. Playback for alarms will use their Spotify.

---

## 4. Troubleshooting "Connect Spotify" failures

The app shows an alert with the real reason. Common causes:

| Symptom | Cause | Fix |
|---|---|---|
| Connect spins ~30s then "timed out" | Account not in **User Management** (Dev Mode), or Spotify app not installed / logged out | Add the account in the dashboard; install + log into Spotify |
| Connects but no music plays | Account is **not Premium** | App Remote requires Spotify Premium |
| "not available" / immediate failure | App Remote not linked (iOS) or Spotify app missing | Use Android; install the Spotify app |
| Auth never returns | **SHA-1 / package name / redirect URI** mismatch in the dashboard | Re-check the values in [Section 2](#2-spotify-developer-dashboard-setup-done-once-by-the-developer) |

If a person's Spotify session later expires, the app signs them out and prompts them to reconnect — alarms fall back to the built-in ringtone in the meantime, so they still wake up.
