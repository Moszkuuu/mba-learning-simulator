import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../content/types';
import { en, type TKey } from './en';
import { th } from './th';

const LANG_KEY = 'mba-lab:lang';
const DICTS: Record<Lang, Record<TKey, string>> = { en, th };

function loadLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'en' || v === 'th') return v;
  } catch { /* ignore */ }
  return 'en';
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  /** Locale-aware date-time (Gregorian calendar for both languages). */
  dateTime: (iso: string) => string;
  date: (iso: string) => string;
}

const Ctx = createContext<I18n | null>(null);

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  return vars ? template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : template;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);
  // The language preference is stored separately from learning progress, so switching never touches progress.
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const value = useMemo<I18n>(() => {
    const locale = lang === 'th' ? 'th-TH-u-ca-gregory' : 'en-US';
    return {
      lang, setLang,
      t: (key, vars) => interpolate(DICTS[lang][key] ?? DICTS.en[key], vars),
      dateTime: (iso) => new Date(iso).toLocaleString(locale),
      date: (iso) => new Date(iso).toLocaleDateString(locale),
    };
  }, [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const c = useContext(Ctx);
  if (!c) throw new Error('useI18n must be used inside I18nProvider');
  return c;
}
