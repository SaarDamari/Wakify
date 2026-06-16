import { I18nManager } from 'react-native';
import { en, TranslationKey } from './en';
import { he } from './he';

export type Language = 'en' | 'he';

// Detect the OS language once at startup. Hermes ships Intl, so prefer it;
// fall back to the native I18nManager locale, then English.
function detectLanguage(): Language {
  try {
    const fromIntl =
      typeof Intl !== 'undefined' && Intl.DateTimeFormat
        ? Intl.DateTimeFormat().resolvedOptions().locale
        : '';
    const fromNative = I18nManager.getConstants?.().localeIdentifier ?? '';
    const locale = String(fromIntl || fromNative || 'en').toLowerCase();
    // Hebrew is 'he' (modern) or 'iw' (legacy ISO code).
    if (locale.startsWith('he') || locale.startsWith('iw')) {
      return 'he';
    }
  } catch {
    // fall through to English
  }
  return 'en';
}

export const language: Language = detectLanguage();
export const isRTL: boolean = language === 'he';

const dict: Record<TranslationKey, string> = language === 'he' ? he : en;

// Translate a key, replacing {var} placeholders. Language is fixed at launch, so
// this is safe to call directly in render (no context/re-render needed).
export function t(
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  let str: string = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const name of Object.keys(vars)) {
      str = str.replace(new RegExp(`\\{${name}\\}`, 'g'), String(vars[name]));
    }
  }
  return str;
}

// Apply layout direction for the detected language. Must run before the React
// tree mounts (called from index.js). NOTE: a change to forced-RTL only takes
// full effect after the next app relaunch — RN sets layout direction natively
// at startup.
export function initI18n(): void {
  try {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  } catch {
    // best-effort
  }
}
