'use client';

import { useTranslations } from 'next-intl';
import { PublicNavbar, PublicFooter } from '@/shared/components/organisms';

export default function FAQPage() {
  const t = useTranslations('faq');

  const faqKeys = ['whatIs', 'howRegister', 'isSafe', 'howQR', 'anyCenter', 'cost'] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            {faqKeys.map((key, index) => (
              <div
                key={key}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                data-testid={`faq-item-${index}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t(`questions.${key}.question`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`questions.${key}.answer`)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-vitalgo-green/10 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('notFound.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('notFound.subtitle')}
              </p>
              <a
                href="/centro-de-ayuda"
                className="inline-block bg-vitalgo-green text-white px-6 py-3 rounded-lg font-medium hover:bg-vitalgo-green/90 transition-colors"
                data-testid="faq-help-center-link"
              >
                {t('notFound.action')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
