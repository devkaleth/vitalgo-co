/**
 * Pricing Page Component
 * Displays free plan and discount code functionality
 */
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Check, Shield, Globe, Infinity, Tag, Building2, Dumbbell, Store } from 'lucide-react';

interface PricingPageProps {
  'data-testid'?: string;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  'data-testid': testId
}) => {
  const t = useTranslations('pricing');
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'es';

  const [discountCode, setDiscountCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleApplyCode = () => {
    // Simulate code validation
    const validCodes = ['WINDSTAR2024', 'ALMART2024', 'GYMX2024'];
    if (validCodes.includes(discountCode.toUpperCase())) {
      setCodeStatus('valid');
    } else if (discountCode) {
      setCodeStatus('invalid');
    }
  };

  const features = [
    'qr',
    'unlimited',
    'medications',
    'allergies',
    'illnesses',
    'surgeries',
    'profile',
    'support'
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white" data-testid={testId}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Free Plan Card */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-vitalgo-green p-8 relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-vitalgo-green text-white px-6 py-2 rounded-bl-xl font-semibold">
              Popular
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('free.title')}
              </h2>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-bold text-vitalgo-green">{t('free.price')}</span>
                <span className="text-gray-600 text-lg">{t('free.priceDetail')}</span>
              </div>
              <p className="text-gray-600">
                {t('free.description')}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="bg-vitalgo-green/10 p-1 rounded-full flex-shrink-0 mt-0.5">
                    <Check className="w-5 h-5 text-vitalgo-green" />
                  </div>
                  <span className="text-gray-700">{t(`free.features.${feature}`)}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => router.push(`/${locale}/signup/paciente`)}
              className="w-full bg-vitalgo-green text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-vitalgo-green/90 transition-colors"
            >
              {t('free.cta')}
            </button>
          </div>
        </div>

        {/* Discount Code Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-500/10 p-4 rounded-full">
                  <Tag className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('discount.title')}
              </h3>
              <p className="text-gray-600">
                {t('discount.subtitle')}
              </p>
            </div>

            {/* Code Input */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setCodeStatus('idle');
                  }}
                  placeholder={t('discount.placeholder')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
                <button
                  onClick={handleApplyCode}
                  disabled={!discountCode}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {t('discount.apply')}
                </button>
              </div>

              {/* Code Status */}
              {codeStatus === 'valid' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">{t('discount.applied')}</span>
                </div>
              )}
              {codeStatus === 'invalid' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <span className="font-medium">{t('discount.invalid')}</span>
                </div>
              )}
            </div>

            {/* Partner Companies */}
            <div>
              <h4 className="text-center font-semibold text-gray-900 mb-4">
                {t('discount.partners')}
              </h4>
              <p className="text-center text-gray-600 mb-6">
                {t('discount.partnersDescription')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">{t('discount.companies.windstar')}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Store className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900">{t('discount.companies.almart')}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Dumbbell className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-900">{t('discount.companies.gymx')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('benefits.title')}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-vitalgo-green/10 p-4 rounded-full">
                  <Shield className="w-10 h-10 text-vitalgo-green" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-xl">
                {t('benefits.security.title')}
              </h4>
              <p className="text-gray-600">
                {t('benefits.security.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-500/10 p-4 rounded-full">
                  <Globe className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-xl">
                {t('benefits.access.title')}
              </h4>
              <p className="text-gray-600">
                {t('benefits.access.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-500/10 p-4 rounded-full">
                  <Infinity className="w-10 h-10 text-purple-500" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-xl">
                {t('benefits.free.title')}
              </h4>
              <p className="text-gray-600">
                {t('benefits.free.description')}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('faq.title')}
          </h3>
          <div className="space-y-6">
            {['q1', 'q2', 'q3'].map((q) => (
              <div key={q} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                  {t(`faq.${q}.question`)}
                </h4>
                <p className="text-gray-600">
                  {t(`faq.${q}.answer`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-vitalgo-green to-green-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            {t('cta.title')}
          </h3>
          <p className="text-xl mb-8 text-green-50">
            {t('cta.description')}
          </p>
          <button
            onClick={() => router.push(`/${locale}/signup/paciente`)}
            className="bg-white text-vitalgo-green py-4 px-8 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            {t('cta.button')}
          </button>
        </div>
      </div>
    </div>
  );
};
