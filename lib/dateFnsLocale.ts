import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';

const LOCALE_LOADERS: Record<string, () => Promise<Locale>> = {
  'zh-Hans': () => import('date-fns/locale/zh-CN').then((m) => m.zhCN),
  es: () => import('date-fns/locale/es').then((m) => m.es),
  hi: () => import('date-fns/locale/hi').then((m) => m.hi),
  ar: () => import('date-fns/locale/ar-SA').then((m) => m.arSA),
  'pt-BR': () => import('date-fns/locale/pt-BR').then((m) => m.ptBR),
  fr: () => import('date-fns/locale/fr').then((m) => m.fr),
  ja: () => import('date-fns/locale/ja').then((m) => m.ja),
  ko: () => import('date-fns/locale/ko').then((m) => m.ko),
  de: () => import('date-fns/locale/de').then((m) => m.de),
  ru: () => import('date-fns/locale/ru').then((m) => m.ru),
  id: () => import('date-fns/locale/id').then((m) => m.id),
  tr: () => import('date-fns/locale/tr').then((m) => m.tr),
  it: () => import('date-fns/locale/it').then((m) => m.it),
  vi: () => import('date-fns/locale/vi').then((m) => m.vi),
  th: () => import('date-fns/locale/th').then((m) => m.th),
  bn: () => import('date-fns/locale/bn').then((m) => m.bn),
  pl: () => import('date-fns/locale/pl').then((m) => m.pl),
  nl: () => import('date-fns/locale/nl').then((m) => m.nl),
  'zh-Hant': () => import('date-fns/locale/zh-TW').then((m) => m.zhTW),
};

const cache = new Map<string, Locale>();

export function useDateLocale(): Locale {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [locale, setLocale] = useState<Locale>(cache.get(lang) ?? enUS);

  useEffect(() => {
    if (lang === 'en' || !LOCALE_LOADERS[lang]) return;
    if (cache.has(lang)) {
      setLocale(cache.get(lang)!);
      return;
    }
    LOCALE_LOADERS[lang]().then((l) => {
      cache.set(lang, l);
      setLocale(l);
    });
  }, [lang]);

  return locale;
}
