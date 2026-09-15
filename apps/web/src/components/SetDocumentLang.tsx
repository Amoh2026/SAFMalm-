'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';

export default function SetDocumentLang() {
  const { locale } = useLanguage();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  return null;
}