"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const LOCALE_KEY = "vinted-analyzer-locale";

export type Locale = "it" | "en" | "es" | "fr";

type Translations = Record<string, unknown>;

const localeModules: Record<Locale, () => Promise<{ default: Translations }>> = {
  it: () => import("@/locales/it.json").then((m) => ({ default: m as unknown as Translations })),
  en: () => import("@/locales/en.json").then((m) => ({ default: m as unknown as Translations })),
  es: () => import("@/locales/es.json").then((m) => ({ default: m as unknown as Translations })),
  fr: () => import("@/locales/fr.json").then((m) => ({ default: m as unknown as Translations })),
};

const VALID_LOCALES = new Set<Locale>(["it", "en", "es", "fr"]);

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "it";
  const stored = localStorage.getItem(LOCALE_KEY) as Locale | null;
  return stored && VALID_LOCALES.has(stored) ? stored : "it";
}

function getNested(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("it");
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setLocaleState(getStoredLocale());
  }, []);

  useEffect(() => {
    setIsLoading(true);
    localeModules[locale]()
      .then((m) => {
        setTranslations(m.default);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = getNested(translations, key) ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return value;
    },
    [translations]
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}
