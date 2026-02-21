import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import type { Locale } from 'date-fns';

import { enUS } from 'date-fns/locale/en-US';
import { zhCN } from 'date-fns/locale/zh-CN';
import { es } from 'date-fns/locale/es';
import { hi } from 'date-fns/locale/hi';
import { arSA } from 'date-fns/locale/ar-SA';
import { ptBR } from 'date-fns/locale/pt-BR';
import { fr } from 'date-fns/locale/fr';
import { ja } from 'date-fns/locale/ja';
import { ko } from 'date-fns/locale/ko';
import { de } from 'date-fns/locale/de';
import { ru } from 'date-fns/locale/ru';
import { id } from 'date-fns/locale/id';
import { tr } from 'date-fns/locale/tr';
import { it } from 'date-fns/locale/it';
import { vi } from 'date-fns/locale/vi';
import { th } from 'date-fns/locale/th';
import { bn } from 'date-fns/locale/bn';
import { pl } from 'date-fns/locale/pl';
import { nl } from 'date-fns/locale/nl';
import { zhTW } from 'date-fns/locale/zh-TW';

const LOCALE_MAP: Record<string, Locale> = {
  en: enUS,
  'zh-Hans': zhCN,
  es,
  hi,
  ar: arSA,
  'pt-BR': ptBR,
  fr,
  ja,
  ko,
  de,
  ru,
  id,
  tr,
  it,
  vi,
  th,
  bn,
  pl,
  nl,
  'zh-Hant': zhTW,
};

export function useDateLocale(): Locale {
  const { i18n } = useTranslation();
  return useMemo(() => LOCALE_MAP[i18n.language] ?? enUS, [i18n.language]);
}
