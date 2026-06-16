// English strings — the source of truth for the translation key set.
// he.ts must provide every one of these keys (enforced by its Record type).
export const en = {
  // Common
  cancel: 'Cancel',
  done: 'Done',
  maybe_later: 'Maybe later',

  // Alarms list
  alarms_title: 'Alarms',
  no_alarms_title: 'No alarms set.',
  no_alarms_subtitle: 'Add one to wake up in style.',
  snooze_pending: 'Snooze pending · rings at {time}',
  reliability_warn_title: 'Alarms may not wake you',
  reliability_warn_body: 'Tap to allow Wakify to ring over the lock screen.',
  next_alarm: 'NEXT ALARM',
  next_today: 'Today',
  next_tomorrow: 'Tomorrow',
  wday_sun: 'Sun',
  wday_mon: 'Mon',
  wday_tue: 'Tue',
  wday_wed: 'Wed',
  wday_thu: 'Thu',
  wday_fri: 'Fri',
  wday_sat: 'Sat',

  // Settings
  settings_title: 'Settings',
  time_format: 'Time Format',
  time_12h: '12-Hour (AM/PM)',
  time_24h: '24-Hour',
  color_theme: 'Color Theme',
  theme_coral: 'Coral',
  theme_blue: 'Blue',
  theme_purple: 'Purple',
  theme_green: 'Green',
  theme_sunset: 'Sunset',
  theme_pink: 'Pink',
  theme_teal: 'Teal',
  alarm_volume: 'Alarm Volume',
  fallback_ringtone: 'Fallback Ringtone',
  fallback_ringtone_sub: "When music can't play",
  default_alarm_sound: 'Default alarm sound',
  alarm_reliability: 'Alarm Reliability',
  alarm_reliability_sub: 'Lock-screen & background permissions',
  music: 'Music',
  connected_to: 'Connected to {provider}',
  disconnect: 'Disconnect',
  wake_up_genres: 'Wake-up Genres',
  not_set: 'Not set',

  // Alarm editor
  edit_alarm: 'Edit Alarm',
  new_alarm: 'New Alarm',
  alarm_label_placeholder: 'Alarm label...',
  preview: 'Preview',
  wake_up_playlist: 'Wake-up Playlist',
  spotify_playlist: 'Spotify playlist',
  pro: 'PRO',
  connect_music_hint:
    'Connect a music account in Settings to choose wake-up genres.',
  default_genres: 'Default ({genres})',
  vibrate: 'Vibrate',
  vibrate_default: 'Default',
  vibrate_gentle: 'Gentle',
  vibrate_medium: 'Medium',
  vibrate_strong: 'Strong',
  nudging: 'Nudging',
  snooze: 'Snooze',
  minutes_short: '{minutes} min',
  save_alarm: 'Save Alarm',

  // Onboarding / connect
  welcome_title: 'Welcome to Wakify',
  welcome_subtitle:
    'Wake up to your favorite music. Connect an account to get started.',
  pick_genres_title: 'Pick your favorite genres',
  pick_genres_subtitle:
    'A random song from these genres will play when your alarm rings.',
  continue: 'Continue',
  skip_for_now: 'Skip for now',

  // Genre names
  genre_rock: 'Rock',
  genre_chill: 'Chill',
  genre_jazz: 'Jazz',
  genre_electronic: 'Electronic',
  genre_pop: 'Pop',
  genre_israeli: 'Israeli Mainstream',
  genre_mideast: 'Middle Eastern',
  genre_black: 'Black Music',
  genre_rnb: 'R&B',
  genre_mainstream: 'Mainstream',
  genre_reggaeton: 'Reggaeton',

  // Genre picker
  use_default_genres: 'Use default genres',
  follow_app_setting: 'Follow the app-wide setting',
  songs_count: '{count} songs',
  genre_subtitle: 'Curated Spotify mix',
  at_least_one_genre: 'At least one genre is required',

  // Ring screen
  snooze_minutes: 'Snooze {minutes} min',
  stop: 'Stop',
  now_playing: 'Now Playing',
  default_sound_title: 'Default alarm sound',
  default_sound_subtitle: 'Pick wake-up genres to play songs',

  // Paywall
  premium_title: 'Wakify Premium',
  premium_subtitle: 'Unlock the full wake-up experience.',
  benefit_playlists: 'Wake up to your own Spotify playlists',
  benefit_pick_any: 'Pick any playlist for any alarm',
  benefit_unlimited: 'Unlimited alarms',
  benefit_no_ads: 'No ads, ever',
  upgrade_now: 'Upgrade Now',

  // Spotify playlist picker
  your_playlists: 'Your Playlists',
  use_genres_instead: 'Use wake-up genres instead',
  no_playlists: "No playlists found. Make sure you're signed in to Spotify.",
  playlist_tracks: '{count} tracks',

  // Ringtone picker
  ringtone_picker_subtitle:
    "Played when your music can't play. Tap to preview.",
  no_ringtones: 'No system ringtones available on this device.',

  // Alarm reliability
  reliable_alarms_title: 'Reliable alarms',
  reliable_alarms_subtitle:
    'To wake you even when the phone is locked or asleep, grant these:',
  fsi_title: 'Display full-screen alarms',
  fsi_body: 'Lets the alarm turn on the screen and show over the lock screen.',
  overlay_title: 'Display over other apps',
  overlay_body: 'Lets Wakify force itself to the front when the alarm rings.',
  battery_title: 'Ignore battery optimization',
  battery_body:
    'Stops the system from delaying or killing the alarm in the background.',
  grant: 'Grant',

  // Permission primer
  primer_title: 'Wake up on time',
  primer_body:
    'To wake you up with great music, we need your permission to send notifications and sound alarms.',
  allow: 'Allow',
  not_now: 'Not now',

  // Exit confirm
  exit_title: 'Are you sure you want to leave?',
  exit_body:
    'Keep Wakify open in the background so your alarm can play its Spotify song. If you fully close the app, the alarm may not play your music.',
  stay: 'Stay',
  leave_anyway: 'Leave anyway',

  // Music provider button
  connect_spotify: 'Connect Spotify',
  connecting: 'Connecting…',
} as const;

export type TranslationKey = keyof typeof en;
