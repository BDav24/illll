import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from '../locales/en.json';

const resources = { en: { translation: en } };

// Lazy-load other languages
const LOCALE_IMPORTS: Record<string, () => Promise<any>> = {
  'zh-Hans': () => import('../locales/zh-Hans.json'),
  es: () => import('../locales/es.json'),
  hi: () => import('../locales/hi.json'),
  ar: () => import('../locales/ar.json'),
  'pt-BR': () => import('../locales/pt-BR.json'),
  fr: () => import('../locales/fr.json'),
  ja: () => import('../locales/ja.json'),
  ko: () => import('../locales/ko.json'),
  de: () => import('../locales/de.json'),
  ru: () => import('../locales/ru.json'),
  id: () => import('../locales/id.json'),
  tr: () => import('../locales/tr.json'),
  it: () => import('../locales/it.json'),
  vi: () => import('../locales/vi.json'),
  th: () => import('../locales/th.json'),
  bn: () => import('../locales/bn.json'),
  pl: () => import('../locales/pl.json'),
  nl: () => import('../locales/nl.json'),
  'zh-Hant': () => import('../locales/zh-Hant.json'),
};

export const SUPPORTED_LOCALES = [
  { code: 'en', englishName: 'English', nativeName: 'English' },
  { code: 'zh-Hans', englishName: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'es', englishName: 'Spanish', nativeName: 'Español' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', englishName: 'Arabic', nativeName: 'العربية' },
  { code: 'pt-BR', englishName: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'fr', englishName: 'French', nativeName: 'Français' },
  { code: 'ja', englishName: 'Japanese', nativeName: '日本語' },
  { code: 'ko', englishName: 'Korean', nativeName: '한국어' },
  { code: 'de', englishName: 'German', nativeName: 'Deutsch' },
  { code: 'ru', englishName: 'Russian', nativeName: 'Русский' },
  { code: 'id', englishName: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'tr', englishName: 'Turkish', nativeName: 'Türkçe' },
  { code: 'it', englishName: 'Italian', nativeName: 'Italiano' },
  { code: 'vi', englishName: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', englishName: 'Thai', nativeName: 'ไทย' },
  { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pl', englishName: 'Polish', nativeName: 'Polski' },
  { code: 'nl', englishName: 'Dutch', nativeName: 'Nederlands' },
  { code: 'zh-Hant', englishName: 'Chinese (Traditional)', nativeName: '繁體中文' },
] as const;

function getDeviceLocale(): string {
  const locales = getLocales();
  if (!locales.length) return 'en';
  const tag = locales[0].languageTag; // e.g. 'en-US', 'zh-Hans-CN'
  // Try exact match first, then language part
  if (LOCALE_IMPORTS[tag] || tag === 'en') return tag;
  const lang = tag.split('-')[0];
  const match = SUPPORTED_LOCALES.find(l => l.code === lang || l.code.startsWith(lang));
  return match?.code ?? 'en';
}

export async function loadLanguage(code: string) {
  if (code === 'en' || i18n.hasResourceBundle(code, 'translation')) {
    await i18n.changeLanguage(code);
    return;
  }
  const loader = LOCALE_IMPORTS[code];
  if (loader) {
    const mod = await loader();
    i18n.addResourceBundle(code, 'translation', mod.default ?? mod);
    await i18n.changeLanguage(code);
  }
}

// Determine initial language: prefer stored user preference, fall back to device locale
function getInitialLocale(): string {
  try {
    const { storage } = require('../store/mmkv');
    const raw = storage.getString('illll-store');
    if (raw) {
      const parsed = JSON.parse(raw);
      const stored = parsed?.settings?.language;
      if (stored) return stored;
    }
  } catch {
    // storage not ready or corrupted — fall back
  }
  return getDeviceLocale();
}

const initialLocale = getInitialLocale();

i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Load non-English locale async
if (initialLocale !== 'en') {
  loadLanguage(initialLocale);
}

export default i18n;
