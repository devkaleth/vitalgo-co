/**
 * Manage Plan Modal Component
 * Shows current subscription plan and available plans with cancel option
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X, Check, Crown } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  // English translations
  display_name_en: string | null;
  description_en: string | null;
  features_en: string[] | null;
}

interface UserSubscription {
  id: number;
  plan_id: number;
  plan_name: string;
  plan_display_name: string;
  status: string;
  start_date: string;
  end_date: string | null;
}

interface ManagePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelPlan: () => void;
  currentSubscription: UserSubscription | null;
  'data-testid'?: string;
}

export const ManagePlanModal: React.FC<ManagePlanModalProps> = ({
  isOpen,
  onClose,
  onCancelPlan,
  currentSubscription,
  'data-testid': testId,
}) => {
  const t = useTranslations('profile.managePlanModal');
  const locale = useLocale();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper functions for localized plan data
  const getLocalizedPlanName = (plan: SubscriptionPlan) =>
    locale === 'en' && plan.display_name_en ? plan.display_name_en : plan.display_name;

  const getLocalizedDescription = (plan: SubscriptionPlan) =>
    locale === 'en' && plan.description_en ? plan.description_en : plan.description;

  const getLocalizedFeatures = (plan: SubscriptionPlan) =>
    locale === 'en' && plan.features_en ? plan.features_en : plan.features;

  const getLocalizedDuration = (durationDays: number | null) => {
    if (durationDays === null) return t('lifetime');
    return t('duration.days', { days: durationDays });
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`);
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

  if (!isOpen) return null;

  const currentPlan = plans.find(p => p.id === currentSubscription?.plan_id);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      data-testid={testId}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="close-modal-button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Current Plan Section */}
          {currentPlan && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-vitalgo-green" />
                {t('currentPlan')}
              </h3>
              <div className="bg-vitalgo-dark rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-2xl font-bold mb-1">{getLocalizedPlanName(currentPlan)}</h4>
                    <p className="text-vitalgo-dark-lightest text-sm">{getLocalizedDescription(currentPlan)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-vitalgo-green">
                      ${currentPlan.price.toLocaleString()}
                    </div>
                    <div className="text-vitalgo-dark-lightest text-sm">
                      {currentPlan.currency} / {getLocalizedDuration(currentPlan.duration_days)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getLocalizedFeatures(currentPlan).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Available Plans Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('availablePlans')}
            </h3>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                {t('loading')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const isCurrent = plan.id === currentSubscription?.plan_id;
                  return (
                    <div
                      key={plan.id}
                      className={`border rounded-xl p-5 transition-all ${
                        isCurrent
                          ? 'border-vitalgo-green bg-green-50'
                          : 'border-gray-200 hover:border-vitalgo-green hover:shadow-md'
                      }`}
                    >
                      <div className="mb-3">
                        <h4 className="text-lg font-bold text-gray-900">{getLocalizedPlanName(plan)}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{getLocalizedDescription(plan)}</p>
                      </div>
                      <div className="mb-3">
                        <div className="text-2xl font-bold text-gray-900">
                          ${plan.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {plan.currency} / {getLocalizedDuration(plan.duration_days)}
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-vitalgo-green text-white text-sm font-medium rounded-full">
                          <Check className="w-3 h-3" />
                          {t('active')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cancel Plan Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-800">
                {t('cancelWarning')}
              </p>
            </div>
            <button
              onClick={onCancelPlan}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
              data-testid="cancel-plan-button"
            >
              {t('cancelButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
