import { TranslationKey } from './en';

// Hebrew strings. Typed as Record<TranslationKey, string> so a missing key is a
// compile error (keeps he in sync with en).
export const he: Record<TranslationKey, string> = {
  // Common
  cancel: 'ביטול',
  done: 'סיום',
  maybe_later: 'אולי מאוחר יותר',

  // Alarms list
  alarms_title: 'שעונים מעוררים',
  no_alarms_title: 'אין שעונים מעוררים.',
  no_alarms_subtitle: 'הוסיפו אחד כדי להתעורר בסטייל.',
  snooze_pending: 'נודניק פעיל · מצלצל ב-{time}',
  reliability_warn_title: 'ייתכן שההתראות לא יעירו אתכם',
  reliability_warn_body: 'הקישו כדי לאפשר ל-Wakify לצלצל מעל מסך הנעילה.',
  next_alarm: 'הצלצול הבא',
  next_today: 'היום',
  next_tomorrow: 'מחר',
  wday_sun: 'יום א׳',
  wday_mon: 'יום ב׳',
  wday_tue: 'יום ג׳',
  wday_wed: 'יום ד׳',
  wday_thu: 'יום ה׳',
  wday_fri: 'יום ו׳',
  wday_sat: 'שבת',

  // Settings
  settings_title: 'הגדרות',
  time_format: 'פורמט שעה',
  time_12h: '12 שעות (AM/PM)',
  time_24h: '24 שעות',
  color_theme: 'ערכת צבעים',
  theme_coral: 'אלמוג',
  theme_blue: 'כחול',
  theme_purple: 'סגול',
  theme_green: 'ירוק',
  theme_sunset: 'שקיעה',
  theme_pink: 'ורוד',
  theme_teal: 'טורקיז',
  alarm_volume: 'עוצמת ההתראה',
  fallback_ringtone: 'צלצול ברירת מחדל',
  fallback_ringtone_sub: 'כשאי אפשר לנגן מוזיקה',
  default_alarm_sound: 'ברירת מחדל',
  alarm_reliability: 'אמינות ההתראה',
  alarm_reliability_sub: 'הרשאות מסך נעילה ורקע',
  music: 'מוזיקה',
  connected_to: 'מחובר ל-{provider}',
  disconnect: 'התנתקות',
  wake_up_genres: "ז'אנרים להשכמה",
  not_set: 'לא הוגדר',

  // Alarm editor
  edit_alarm: 'עריכת שעון מעורר',
  new_alarm: 'שעון מעורר חדש',
  alarm_label_placeholder: 'שם התראה',
  preview: 'תצוגה מקדימה',
  wake_up_playlist: 'פלייליסט להשכמה',
  spotify_playlist: 'פלייליסט Spotify',
  pro: 'PRO',
  connect_music_hint:
    "חברו חשבון מוזיקה בהגדרות כדי לבחור ז'אנרים להשכמה.",
  default_genres: 'ברירת מחדל ({genres})',
  vibrate: 'רטט',
  vibrate_default: 'ברירת מחדל',
  vibrate_gentle: 'עדין',
  vibrate_medium: 'בינוני',
  vibrate_strong: 'חזק',
  nudging: 'תזכורות חוזרות',
  snooze: 'נודניק',
  minutes_short: '{minutes} דק׳',
  save_alarm: 'שמירת שעון מעורר',

  // Onboarding / connect
  welcome_title: 'ברוכים הבאים ל-Wakify',
  welcome_subtitle:
    'התעוררו למוזיקה האהובה עליכם. חברו חשבון כדי להתחיל.',
  pick_genres_title: "בחרו את הז'אנרים האהובים עליכם",
  pick_genres_subtitle:
    "שיר אקראי מהז'אנרים האלה ינוגן כשההתראה תצלצל.",
  continue: 'המשך',
  skip_for_now: 'דלגו בינתיים',

  // Genre names
  genre_rock: 'רוק',
  genre_chill: 'צ׳יל',
  genre_jazz: 'ג׳אז',
  genre_electronic: 'אלקטרוני',
  genre_pop: 'פופ',
  genre_israeli: 'ישראלי',
  genre_mideast: 'מזרחי',
  genre_black: 'בלאק',
  genre_rnb: 'R&B',
  genre_mainstream: 'מיינסטרים',
  genre_reggaeton: 'רגאטון',

  // Genre picker
  use_default_genres: "השתמשו בז'אנרים ברירת מחדל",
  follow_app_setting: 'לפי הגדרת האפליקציה',
  songs_count: '{count} שירים',
  genre_subtitle: 'מיקס ספוטיפיי נבחר',
  at_least_one_genre: "נדרש לפחות ז'אנר אחד",

  // Ring screen
  snooze_minutes: 'נודניק {minutes} דק׳',
  stop: 'עצירה',
  now_playing: 'מתנגן כעת',
  default_sound_title: 'צליל התראה ברירת מחדל',
  default_sound_subtitle: "בחרו ז'אנרים להשכמה כדי לנגן שירים",

  // Paywall
  premium_title: 'Wakify Premium',
  premium_subtitle: 'פתחו את חוויית ההשכמה המלאה.',
  benefit_playlists: 'התעוררו לפלייליסטים שלכם מ-Spotify',
  benefit_pick_any: 'בחרו כל פלייליסט לכל התראה',
  benefit_unlimited: 'התראות ללא הגבלה',
  benefit_no_ads: 'בלי פרסומות, אף פעם',
  upgrade_now: 'שדרגו עכשיו',

  // Spotify playlist picker
  your_playlists: 'הפלייליסטים שלכם',
  use_genres_instead: "השתמשו בז'אנרים להשכמה במקום",
  no_playlists: 'לא נמצאו פלייליסטים. ודאו שאתם מחוברים ל-Spotify.',
  playlist_tracks: '{count} שירים',

  // Ringtone picker
  ringtone_picker_subtitle:
    'מתנגן כשאי אפשר לנגן את המוזיקה שלכם. הקישו לתצוגה מקדימה.',
  no_ringtones: 'אין צלצולי מערכת זמינים במכשיר זה.',

  // Alarm reliability
  reliable_alarms_title: 'התראות אמינות',
  reliable_alarms_subtitle:
    'כדי להעיר אתכם גם כשהטלפון נעול או ישן, אשרו את ההרשאות הבאות:',
  fsi_title: 'הצגת התראות במסך מלא',
  fsi_body: 'מאפשר להתראה להדליק את המסך ולהופיע מעל מסך הנעילה.',
  overlay_title: 'הצגה מעל אפליקציות אחרות',
  overlay_body: 'מאפשר ל-Wakify לעלות לחזית כשההתראה מצלצלת.',
  battery_title: 'התעלמות מאופטימיזציית סוללה',
  battery_body: 'מונע מהמערכת לעכב או לסגור את ההתראה ברקע.',
  grant: 'אישור',

  // Permission primer
  primer_title: 'להתעורר בזמן',
  primer_body:
    'כדי להעיר אתכם עם מוזיקה נהדרת, נדרשת הרשאה לשליחת התראות והשמעת צלילים.',
  allow: 'אישור',
  not_now: 'לא עכשיו',

  // Exit confirm
  exit_title: 'בטוחים שתרצו לצאת?',
  exit_body:
    'השאירו את Wakify פתוח ברקע כדי שההתראה תוכל לנגן את שיר ה-Spotify שלה. אם תסגרו את האפליקציה לגמרי, ייתכן שההתראה לא תנגן מוזיקה.',
  stay: 'הישארו',
  leave_anyway: 'צאו בכל זאת',

  // Music provider button
  connect_spotify: 'התחברות ל-Spotify',
  connecting: 'מתחבר…',
};
