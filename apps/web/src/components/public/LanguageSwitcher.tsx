'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { languages } from '@/lib/translations';
import 'flag-icons/css/flag-icons.min.css';

interface Language {
  code: string;
  flag: string;
  nativeName: string;
}

export default function LanguageSwitcher() {
  const { language: currentLangCode, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lang = languages.find((l: Language) => l.code === currentLangCode) || languages[0];
    setCurrentLang(lang);
  }, [currentLangCode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (lang: Language) => {
    setLanguage(lang.code);
    setCurrentLang(lang);
    setIsOpen(false);
  };

  const getLanguageCode = (langCode: string) => {
    return langCode.toUpperCase();
  };

  // Map language codes to flag-icon country codes
  const getFlagClass = (langCode: string) => {
    const flagMap: Record<string, string> = {
      sv: 'se',  // Sweden
      en: 'gb',  // United Kingdom
      fr: 'fr',  // France
      ar: 'dz',  // Algeria
    };
    return `fi fi-${flagMap[langCode] || langCode}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button - shows FLAG + language code */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-blue-800 transition-colors duration-200 text-white text-sm font-semibold"
        aria-label="Select language"
      >
        <span className={`${getFlagClass(currentLang.code)} text-xl rounded-sm`}></span>
        <span>{getLanguageCode(currentLang.code)}</span>
      </button>

      {/* Dropdown - SHOWS ALL FLAGS horizontally */}
      {isOpen && (
        <div className="absolute right-0 mt-2 p-2 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-10 z-50 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            {languages.map((lang: Language) => {
              const isActive = lang.code === currentLang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => switchLanguage(lang)}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-yellow-500'
                      : ''
                  }`}
                  title={lang.nativeName}
                >
                  <span className={`${getFlagClass(lang.code)} text-3xl rounded-sm`}></span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}