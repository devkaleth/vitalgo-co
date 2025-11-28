'use client';

import React from 'react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTranslations } from 'next-intl';
import { Locale } from '@/i18n/request';
import { Globe } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';

export function LanguageSelector() {
  const { locale, setLocale, isChanging } = useLanguage();
  const t = useTranslations('language');

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale !== locale && !isChanging) {
      await setLocale(newLocale);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value as Locale)}
        disabled={isChanging}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t('selector')}
      >
        <option value="es">🇪🇸 {t('spanish')}</option>
        <option value="en">🇺🇸 {t('english')}</option>
      </select>
      {isChanging && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile or tight spaces
const LANGUAGES = [
  { code: 'es' as Locale, native: 'Español', flag: 'es' },
  { code: 'en' as Locale, native: 'English', flag: 'gb' }
];

export function LanguageSelectorCompact() {
  const { locale, setLocale, isChanging } = useLanguage();

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale !== locale && !isChanging) {
      await setLocale(newLocale);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-5 h-5 text-gray-500" />
      <div className="flex gap-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isChanging}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all
              ${locale === lang.code
                ? 'bg-vitalgo-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={lang.native}
            aria-current={locale === lang.code ? 'true' : 'false'}
          >
            <span className={`fi fi-${lang.flag} sm:mr-1.5`} />
            <span className="hidden sm:inline">{lang.native}</span>
          </button>
        ))}
      </div>
      {isChanging && (
        <div className="ml-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vitalgo-green"></div>
        </div>
      )}
    </div>
  );
}
