'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';
import { t as translate } from '@/lib/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  locale: string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLocale,
  setLanguage: () => {},
  t: () => '',
  locale: defaultLocale,
});

export function LanguageProvider({
  children,
  locale: initialLocale,
}: {
  children: ReactNode;
  locale?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const validLocale =
    initialLocale && locales.includes(initialLocale as Locale)
      ? initialLocale
      : defaultLocale;

  const [language, setLanguageState] = useState<string>(validLocale);

  useEffect(() => {
    if (initialLocale && locales.includes(initialLocale as Locale)) {
      setLanguageState(initialLocale);
    }
  }, [initialLocale]);

  const setLanguage = (newLocale: string) => {
    if (!locales.includes(newLocale as Locale)) {
      console.warn(`Invalid locale: ${newLocale}`);
      return;
    }

    setLanguageState(newLocale);

    // Strip any existing locale prefix
    let pathWithoutLocale = pathname || '/';
    for (const loc of locales) {
      if (pathWithoutLocale === `/${loc}` || pathWithoutLocale.startsWith(`/${loc}/`)) {
        pathWithoutLocale = pathWithoutLocale.replace(`/${loc}`, '') || '/';
        break;
      }
    }

    // Build new path — default locale has NO prefix
    const newPath =
      newLocale === defaultLocale
        ? pathWithoutLocale
        : `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;

    router.push(newPath);
  };

  const t = (key: string): string => {
    const parts = key.split('.');
    if (parts.length === 2) {
      const [namespace, actualKey] = parts;
      return translate(language, actualKey, namespace);
    }
    return translate(language, key, 'common');
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, locale: language }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}