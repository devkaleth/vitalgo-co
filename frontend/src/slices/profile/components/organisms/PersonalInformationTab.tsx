/**
 * PersonalInformationTab Organism Component
 * Displays and manages personal patient information (demographic & residence)
 */
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TabContentProps } from '../../types';
import { usePersonalPatientInfo } from '../../hooks/usePersonalPatientInfo';
import { useBasicPatientInfo } from '../../hooks/useBasicPatientInfo';
import { PersonalInfoEditModal } from '../molecules/PersonalInfoEditModal';
import {
  formatDemographicData,
  formatResidenceData,
  isPersonalInfoComplete,
  getMissingPersonalInfoFields,
  formatCountryWithFlag
} from '../../utils/personalInfoUtils';

export function PersonalInformationTab({ 'data-testid': testId }: TabContentProps) {
  const t = useTranslations('profile.personal');
  const { personalInfo, loading, error, updatePersonalInfo, refetch } = usePersonalPatientInfo();
  const { basicInfo, loading: basicLoading } = useBasicPatientInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = async (data: any) => {
    const result = await updatePersonalInfo(data);
    if (result.success) {
      setIsModalOpen(false);
      // Emit event to notify other components about the profile update
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      console.log('🔔 PersonalInformationTab: Profile updated event dispatched');
    }
    return result;
  };

  if (loading) {
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
                {t('retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!personalInfo) {
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

  const demographicData = formatDemographicData(personalInfo);
  const residenceData = formatResidenceData(personalInfo);
  const isComplete = isPersonalInfoComplete(personalInfo);
  const missingFields = getMissingPersonalInfoFields(personalInfo);

  return (
    <>
      <div className="bg-white rounded-b-xl border border-gray-200 p-6 mt-0 min-h-[400px]" data-testid={testId}>
        {/* Header with Edit Button */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold text-vitalgo-dark mb-2">
              {t('title')}
            </h3>
            <p className="text-vitalgo-dark-light">
              {t('description')}
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
            {t('edit')}
          </button>
        </div>

        {/* Personal Information Cards */}
        <div className="bg-gradient-to-br from-vitalgo-green/5 to-blue-50 rounded-xl border border-vitalgo-green/10 p-6 shadow-sm">
          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Demographic Information Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-vitalgo-dark ml-2">{t('demographic.title')}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-vitalgo-dark-lighter">{t('demographic.biologicalSex')}</span>
                  <span className="text-sm font-medium text-vitalgo-dark">{demographicData.biologicalSex}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-vitalgo-dark-lighter">{t('demographic.gender')}</span>
                  <span className="text-sm font-medium text-vitalgo-dark">{demographicData.gender}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-vitalgo-dark-lighter">{t('demographic.birthLocation')}</span>
                  <span className="text-sm font-medium text-vitalgo-dark">{demographicData.birthLocation}</span>
                </div>
              </div>
            </div>

            {/* Residence Information Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-vitalgo-dark ml-2">{t('residence.title')}</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-vitalgo-dark-lighter block">{t('residence.address')}</span>
                  <span className="text-sm font-medium text-vitalgo-dark">{residenceData.address}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-vitalgo-dark-lighter">{t('residence.location')}</span>
                  <span className="text-sm font-medium text-vitalgo-dark">{residenceData.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Missing Fields Warning */}
          {!isComplete && missingFields.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">{t('missingFields.message')}</p>
                  <p className="text-sm text-yellow-700 mt-1">{missingFields.join(', ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-vitalgo-dark-lighter">
                {isComplete ? t('status.complete') : t('status.incomplete')}
              </span>
            </div>
            <div className="text-xs text-vitalgo-dark-lighter">
              {t('lastUpdated')}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-vitalgo-dark-lighter">
            {t('completionHint')}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <PersonalInfoEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={personalInfo}
        onSubmit={handleModalSubmit}
        data-testid={`${testId}-edit-modal`}
      />
    </>
  );
}