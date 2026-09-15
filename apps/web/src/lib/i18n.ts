export const locales = ['sv', 'en', 'ar', 'fr'] as const;
export const defaultLocale = 'sv' as const;

export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  sv: 'Svenska',
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
};

export const localeFlags: Record<Locale, string> = {
  sv: '🇸🇪',
  ar: '🇸🇦',
  en: '🇬🇧',
  fr: '🇫🇷',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  sv: 'ltr',
  ar: 'rtl',
  en: 'ltr',
  fr: 'ltr',
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}