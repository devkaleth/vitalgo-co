/**
 * BasicInformationTab Organism Component
 * Displays and manages basic patient information (from signup)
 */
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { TabContentProps } from '../../types';
import { useBasicPatientInfo } from '../../hooks/useBasicPatientInfo';
import { usePersonalPatientInfo } from '../../hooks/usePersonalPatientInfo';
import { BasicInfoEditModal } from '../molecules/BasicInfoEditModal';
import { getCountryByCode } from '../../../signup/data/countries';
import { formatCountryWithFlag } from '../../utils/personalInfoUtils';

export function BasicInformationTab({ 'data-testid': testId }: TabContentProps) {
  const t = useTranslations('profile.basic');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { basicInfo, loading, error, updateBasicInfo, refetch } = useBasicPatientInfo();
  const { personalInfo, loading: personalLoading } = usePersonalPatientInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = async (data: any) => {
    const result = await updateBasicInfo(data);
    if (result.success) {
      setIsModalOpen(false);
    }
    return result;
  };

  const formatDate = (dateString: string) => {
    // Handle date parsing to avoid timezone issues
    // If the date string doesn't include a time (T), append T00:00:00 to interpret as local time
    const date = dateString.includes('T')
      ? new Date(dateString)
      : new Date(dateString + 'T00:00:00');

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Bogota'
    });
  };

  const getDocumentTypeLabel = (code: string) => {
    const types: Record<string, string> = {
      'CC': t('documentTypes.cc'),
      'TI': t('documentTypes.ti'),
      'CE': t('documentTypes.ce'),
      'PAS': t('documentTypes.passport')
    };
    return types[code] || code;
  };

  const getCountryDisplay = (countryCode: string) => {
    // Country mapping with flag emojis
    const countries: Record<string, { name: string; flag: string }> = {
      'CO': { name: t('countries.colombia'), flag: '🇨🇴' },
      'US': { name: t('countries.usa'), flag: '🇺🇸' },
      'CA': { name: t('countries.canada'), flag: '🇨🇦' },
      'MX': { name: t('countries.mexico'), flag: '🇲🇽' },
      'AR': { name: t('countries.argentina'), flag: '🇦🇷' },
      'BR': { name: t('countries.brazil'), flag: '🇧🇷' },
      'CL': { name: t('countries.chile'), flag: '🇨🇱' },
      'PE': { name: t('countries.peru'), flag: '🇵🇪' },
      'EC': { name: t('countries.ecuador'), flag: '🇪🇨' },
      'VE': { name: t('countries.venezuela'), flag: '🇻🇪' },
      'UY': { name: t('countries.uruguay'), flag: '🇺🇾' },
      'PY': { name: t('countries.paraguay'), flag: '🇵🇾' },
      'BO': { name: t('countries.bolivia'), flag: '🇧🇴' },
      'CR': { name: t('countries.costaRica'), flag: '🇨🇷' },
      'PA': { name: t('countries.panama'), flag: '🇵🇦' },
      'GT': { name: t('countries.guatemala'), flag: '🇬🇹' },
      'HN': { name: t('countries.honduras'), flag: '🇭🇳' },
      'SV': { name: t('countries.elSalvador'), flag: '🇸🇻' },
      'NI': { name: t('countries.nicaragua'), flag: '🇳🇮' },
      'CU': { name: t('countries.cuba'), flag: '🇨🇺' },
      'DO': { name: t('countries.dominicanRepublic'), flag: '🇩🇴' },
      'ES': { name: t('countries.spain'), flag: '🇪🇸' }
    };
    const country = countries[countryCode] || { name: countryCode, flag: '🏳️' };
    return `${country.flag} ${country.name}`;
  };

  // Get birth country from personalInfo, fallback to origin_country
  const getBirthCountryDisplay = () => {
    if (personalInfo?.birth_country) {
      // Map country code to name if needed
      const countryMap: Record<string, string> = {
        'CO': 'Colombia',
        'US': 'Estados Unidos',
        'AR': 'Argentina',
        'MX': 'México',
        'BR': 'Brasil',
        'CL': 'Chile',
        'PE': 'Perú',
        'EC': 'Ecuador',
        'VE': 'Venezuela',
        'UY': 'Uruguay',
        'PY': 'Paraguay',
        'BO': 'Bolivia',
        'CA': 'Canadá',
        'ES': 'España',
        'FR': 'Francia',
        'IT': 'Italia',
        'DE': 'Alemania',
        'GB': 'Reino Unido'
      };
      const countryName = countryMap[personalInfo.birth_country] || personalInfo.birth_country;
      return formatCountryWithFlag(countryName);
    }
    // Fallback to origin_country from basic info
    return getCountryDisplay(basicInfo?.originCountry || 'CO');
  };

  if (loading || personalLoading) {
    return (
      <div className="bg-white rounded-b-xl border border-gray-200 p-6 mt-0 min-h-[400px]" data-testid={testId}>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('title')}
            </h3>
            <p className="text-gray-600">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vitalgo-green"></div>
            <span className="ml-3 text-gray-600">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-b-xl border border-gray-200 p-6 mt-0 min-h-[400px]" data-testid={testId}>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('title')}
            </h3>
            <p className="text-gray-600">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 text-sm font-medium text-white bg-vitalgo-green rounded-lg hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green transition-colors duration-150"
              >
                {tCommon('retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!basicInfo) {
    return (
      <div className="bg-white rounded-b-xl border border-gray-200 p-6 mt-0 min-h-[400px]" data-testid={testId}>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('title')}
            </h3>
            <p className="text-gray-600">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('notFound')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-b-xl border border-gray-200 p-6 mt-0 min-h-[400px]" data-testid={testId}>
        {/* Header with Edit Button */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold text-vitalgo-dark mb-2">
              {t('personalProfile')}
            </h3>
            <p className="text-vitalgo-dark-light">
              {t('contactInfo')}
            </p>
          </div>
          <button
            onClick={handleEditClick}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-vitalgo-green rounded-lg hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green transition-colors duration-150 shadow-sm"
            data-testid={`${testId}-edit-button`}
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {tCommon('edit')}
          </button>
        </div>

        {/* CV-Style Profile Card */}
        <div className="bg-gradient-to-br from-vitalgo-green/5 to-blue-50 rounded-xl border border-vitalgo-green/10 p-6 shadow-sm">
          {/* Profile Header - Name and Avatar */}
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-vitalgo-green rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {basicInfo.firstName?.[0]?.toUpperCase()}{basicInfo.lastName?.[0]?.toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-vitalgo-dark">
                {basicInfo.firstName} {basicInfo.lastName}
              </h2>
              <p className="text-lg text-vitalgo-dark-light mt-1">
                {t('patientLabel')}
              </p>
              <div className="flex items-center mt-2 text-sm text-vitalgo-dark-lighter">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {basicInfo.email}
              </div>
            </div>
          </div>

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-vitalgo-dark ml-2">{t('sections.personalInfo')}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-vitalgo-dark-lighter">{t('fields.birthDate')}</span>
                  <span className="text-sm font-medium text-vitalgo-dark">{formatDate(basicInfo.birthDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-vitalgo-dark-lighter">{t('fields.originCountry')}</span>
                  <span className="text-sm font-medium text-vitalgo-dark">{getBirthCountryDisplay()}</span>
                </div>
              </div>
            </div>

            {/* Identity Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-vitalgo-dark ml-2">{t('sections.identification')}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-vitalgo-dark-lighter">{t('fields.documentType')}</span>
                  <span className="text-sm font-medium text-vitalgo-dark">{basicInfo.documentType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-vitalgo-dark-lighter">{t('fields.documentNumber')}</span>
                  <span className="text-sm font-medium text-vitalgo-dark">{basicInfo.documentNumber}</span>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-vitalgo-dark ml-2">{t('sections.contact')}</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-vitalgo-dark-lighter block">{t('fields.phone')}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {basicInfo.countryCode && (
                      <span
                        className="text-lg flex-shrink-0"
                        role="img"
                        aria-label={`Bandera de ${getCountryByCode(basicInfo.countryCode)?.name || 'país'}`}
                      >
                        {getCountryByCode(basicInfo.countryCode)?.flag || '🏳️'}
                      </span>
                    )}
                    <span className="text-sm font-medium text-vitalgo-dark font-mono">
                      {basicInfo.phoneInternational}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-vitalgo-dark-lighter">{t('verifiedProfile')}</span>
            </div>
            <div className="text-xs text-vitalgo-dark-lighter">
              {t('lastUpdate', { date: t('today') })}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-vitalgo-dark-lighter">
            {t('keepUpdated')}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <BasicInfoEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={basicInfo}
        onSubmit={handleModalSubmit}
        data-testid={`${testId}-edit-modal`}
      />
    </>
  );
}