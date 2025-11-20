/**
 * Pricing Page Component
 * Displays free plan and discount code functionality
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Check, Shield, Globe, Infinity, Tag, Building2, Dumbbell, Store } from 'lucide-react';

interface SubscriptionPlan {
  id: number;
  name: string;
  display_name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number | null;
  is_active: boolean;
  is_popular: boolean;
  features: string[];
  max_records: number | null;
}

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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatingCode, setValidatingCode] = useState(false);
  const [discountMessage, setDiscountMessage] = useState('');

  useEffect(() => {
    // Fetch plans from API
    const fetchPlans = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/subscriptions/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleApplyCode = async () => {
    if (!discountCode.trim()) return;

    setValidatingCode(true);
    setCodeStatus('idle');
    setDiscountMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/subscriptions/validate-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: discountCode.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setCodeStatus('valid');
        setDiscountMessage(data.message);
        // Optionally save the discount code to localStorage
        localStorage.setItem('discountCode', discountCode.toUpperCase());
      } else {
        setCodeStatus('invalid');
        setDiscountMessage(data.message || 'Código de descuento no válido');
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setCodeStatus('invalid');
      setDiscountMessage('Error al validar el código');
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSelectPlan = (planId: number) => {
    // Save selected plan to localStorage
    localStorage.setItem('selectedPlanId', planId.toString());
    // Redirect to signup
    router.push(`/${locale}/signup/paciente`);
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

  // Get the free plan
  const freePlan = plans.find(p => p.name === 'free');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando planes...</div>
      </div>
    );
  }

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
        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden flex flex-col ${
                plan.is_popular ? 'border-2 border-vitalgo-green' : 'border border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute top-0 right-0 bg-vitalgo-green text-white px-6 py-2 rounded-bl-xl font-semibold">
                  Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {plan.display_name}
                </h2>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className={`text-5xl font-bold ${plan.is_popular ? 'text-vitalgo-green' : 'text-gray-900'}`}>
                    {plan.price === 0 ? 'Gratis' : `$${plan.price}`}
                  </span>
                  <span className="text-gray-600 text-lg">
                    {plan.duration_days ? `/${plan.duration_days} días` : '/Para siempre'}
                  </span>
                </div>
                {plan.price === 0 && (
                  <div className="mb-3">
                    <span className="inline-block bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full">
                      ⚡ Por tiempo limitado
                    </span>
                  </div>
                )}
                <p className="text-gray-600">
                  {plan.description}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8 flex-grow">
                {plan.features && plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`${plan.is_popular ? 'bg-vitalgo-green/10' : 'bg-blue-500/10'} p-1 rounded-full flex-shrink-0 mt-0.5`}>
                      <Check className={`w-5 h-5 ${plan.is_popular ? 'text-vitalgo-green' : 'text-blue-600'}`} />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button - Always at bottom */}
              <div className="mt-auto">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    plan.is_popular
                      ? 'bg-vitalgo-green text-white hover:bg-vitalgo-green/90'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Iniciar Plan
                </button>
              </div>
            </div>
          ))}
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
                  disabled={!discountCode || validatingCode}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {validatingCode ? 'Validando...' : t('discount.apply')}
                </button>
              </div>

              {/* Code Status */}
              {codeStatus === 'valid' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">{discountMessage || t('discount.applied')}</span>
                </div>
              )}
              {codeStatus === 'invalid' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <span className="font-medium">{discountMessage || t('discount.invalid')}</span>
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
            onClick={() => freePlan && handleSelectPlan(freePlan.id)}
            disabled={!freePlan}
            className="bg-white text-vitalgo-green py-4 px-8 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {t('cta.button')}
          </button>
        </div>
      </div>
    </div>
  );
};
