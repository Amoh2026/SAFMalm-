'use client';

import { useLanguage } from '@/providers/LanguageProvider';
import { translations } from '@/lib/translations';

export function useTranslations() {
  const { t } = useLanguage();
  return t;
}

export function getTranslations(locale: string) {
  return (key: string): string => {
    const keys = key.split('.');
    let value = translations[locale as keyof typeof translations];
    
    if (!value) {
      value = translations.sv;
    }
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
}