/**
 * Emergency Language Selector Component
 * Allows paramedics to switch the display language for emergency medical data
 */
'use client';

import React from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', native: 'Español', flag: 'es' },
  { code: 'en', name: 'English', native: 'English', flag: 'gb' }
];

interface EmergencyLanguageSelectorProps {
  'data-testid'?: string;
}

export const EmergencyLanguageSelector: React.FC<EmergencyLanguageSelectorProps> = ({
  'data-testid': testId = 'emergency-language-selector'
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params?.locale as string || 'es';

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    // Replace the locale in the pathname
    const segments = pathname.split('/');
    segments[1] = newLocale; // Replace locale segment
    const newPath = segments.join('/');

    router.push(newPath);
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === currentLocale) || LANGUAGES[0];

  return (
    <div
      className="flex items-center gap-2"
      data-testid={testId}
    >
      <Globe className="w-5 h-5 text-gray-600" />
      <div className="flex gap-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all
              ${currentLocale === lang.code
                ? 'bg-vitalgo-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={lang.name}
            data-testid={`${testId}-${lang.code}`}
          >
            <span className={`fi fi-${lang.flag} mr-1.5`} />
            {lang.native}
          </button>
        ))}
      </div>
    </div>
  );
};
