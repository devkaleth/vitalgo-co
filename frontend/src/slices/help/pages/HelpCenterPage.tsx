'use client';

import { useTranslations } from 'next-intl';
import { PublicNavbar, PublicFooter } from '@/shared/components/organisms';
import { Mail, Phone, MessageCircle, Clock } from 'lucide-react';

export default function HelpCenterPage() {
  const t = useTranslations('help');
  const tCommon = useTranslations('common');

  const supportOptions = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: t('support.email.title'),
      description: t('support.email.description'),
      contact: t('support.email.contact'),
      action: t('support.email.action'),
      disabled: false
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: t('support.phone.title'),
      description: t('support.phone.description'),
      contact: t('support.phone.contact'),
      action: t('support.phone.action'),
      disabled: false
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: t('support.chat.title'),
      description: t('support.chat.description'),
      contact: t('support.chat.contact'),
      action: t('support.chat.action'),
      disabled: true
    }
  ];

  const helpCategories = [
    {
      title: t('categories.gettingStarted.title'),
      items: [
        t('categories.gettingStarted.items.createAccount'),
        t('categories.gettingStarted.items.completeProfile'),
        t('categories.gettingStarted.items.setupQR'),
        t('categories.gettingStarted.items.verifyIdentity')
      ]
    },
    {
      title: t('categories.dataManagement.title'),
      items: [
        t('categories.dataManagement.items.updateMedical'),
        t('categories.dataManagement.items.addMedications'),
        t('categories.dataManagement.items.uploadDocuments'),
        t('categories.dataManagement.items.shareInfo')
      ]
    },
    {
      title: t('categories.emergencies.title'),
      items: [
        t('categories.emergencies.items.useQR'),
        t('categories.emergencies.items.emergencyContact'),
        t('categories.emergencies.items.quickAccess'),
        t('categories.emergencies.items.protocols')
      ]
    },
    {
      title: t('categories.privacySecurity.title'),
      items: [
        t('categories.privacySecurity.items.howProtect'),
        t('categories.privacySecurity.items.controlAccess'),
        t('categories.privacySecurity.items.reportIssues'),
        t('categories.privacySecurity.items.privacyPolicies')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('subtitle')}
            </p>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center"
                data-testid={`help-support-option-${index}`}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-vitalgo-green/10 rounded-full text-vitalgo-green">
                    {option.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {option.description}
                </p>
                <p className="text-sm font-medium text-gray-900 mb-4">
                  {option.contact}
                </p>
                <button
                  className="w-full bg-vitalgo-green text-white px-4 py-2 rounded-lg font-medium hover:bg-vitalgo-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={option.disabled}
                  data-testid={`help-support-action-${index}`}
                >
                  {option.action}
                </button>
              </div>
            ))}
          </div>

          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {helpCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                data-testid={`help-category-${index}`}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {category.title}
                </h3>
                <ul className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start"
                      data-testid={`help-category-${index}-item-${itemIndex}`}
                    >
                      <div className="w-2 h-2 bg-vitalgo-green rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Operating Hours */}
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('hours.title')}
            </h3>
            <p className="text-gray-600 mb-2">
              {t('hours.weekdays')}
            </p>
            <p className="text-gray-600 mb-4">
              {t('hours.saturdays')}
            </p>
            <p className="text-sm text-gray-500">
              {t('hours.emergencyNote')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {t('quickLinks.title')}
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/preguntas-frecuentes"
                className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                data-testid="help-faq-link"
              >
                {t('quickLinks.faq')}
              </a>
              <a
                href="/legal/privacy"
                className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                data-testid="help-privacy-link"
              >
                {t('quickLinks.privacy')}
              </a>
              <a
                href="/legal/terms"
                className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                data-testid="help-terms-link"
              >
                {t('quickLinks.terms')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
