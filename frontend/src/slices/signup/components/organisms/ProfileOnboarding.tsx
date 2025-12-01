'use client';
/**
 * ProfileOnboarding organism component
 * Sequential modals for completing patient profile after registration
 */
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BasicInfoEditModal } from '../../../profile/components/molecules/BasicInfoEditModal';
import { PersonalInfoEditModal } from '../../../profile/components/molecules/PersonalInfoEditModal';
import { MedicalInfoEditModal } from '../../../profile/components/molecules/MedicalInfoEditModal';
import { useBasicPatientInfo } from '../../../profile/hooks/useBasicPatientInfo';
import { usePersonalPatientInfo } from '../../../profile/hooks/usePersonalPatientInfo';

interface ProfileOnboardingProps {
  onComplete: () => void;
  'data-testid'?: string;
}

type OnboardingStep = 'basic' | 'personal' | 'medical' | 'completed';

export const ProfileOnboarding: React.FC<ProfileOnboardingProps> = ({
  onComplete,
  'data-testid': testId = 'profile-onboarding'
}) => {
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');

  // Skip basic info step since it was already completed during registration
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hooks para cargar y actualizar datos
  const { basicInfo, loading: basicLoading, updateBasicInfo } = useBasicPatientInfo();
  const { personalInfo, loading: personalLoading, updatePersonalInfo } = usePersonalPatientInfo();

  // Clear error when step changes
  const clearError = () => setErrorMessage(null);

  const handleBasicInfoSubmit = async (data: any) => {
    clearError();
    setIsSubmitting(true);
    const result = await updateBasicInfo(data);
    setIsSubmitting(false);

    if (result.success) {
      setCurrentStep('personal');
    } else {
      setErrorMessage(result.error || t('errors.updateFailed'));
    }
    return result;
  };

  const handlePersonalInfoSubmit = async (data: any) => {
    clearError();
    setIsSubmitting(true);
    const result = await updatePersonalInfo(data);
    setIsSubmitting(false);

    if (result.success) {
      setCurrentStep('medical');
    } else {
      setErrorMessage(result.error || t('errors.updateFailed'));
    }
    return result;
  };

  const handleMedicalInfoSubmit = async (data: any) => {
    clearError();
    setIsSubmitting(true);
    const result = await updatePersonalInfo(data);
    setIsSubmitting(false);

    if (result.success) {
      setCurrentStep('completed');
      // Pequeño delay para mostrar mensaje de éxito antes de redirigir
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setErrorMessage(result.error || t('errors.updateFailed'));
    }
    return result;
  };

  const handleSkipStep = () => {
    if (currentStep === 'personal') {
      setCurrentStep('medical');
    } else if (currentStep === 'medical') {
      setCurrentStep('completed');
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleBackStep = () => {
    // Only allow going back from medical to personal
    // Cannot go back from personal since basic info was completed during registration
    if (currentStep === 'medical') {
      setCurrentStep('personal');
    }
  };

  if (basicLoading || personalLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid={testId}>
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vitalgo-green mb-4"></div>
            <p className="text-gray-600">{tCommon('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'completed') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid={`${testId}-completed`}>
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-vitalgo-green-lightest rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-vitalgo-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('completedTitle')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('completedMessage')}
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vitalgo-green mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid={testId}>
      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200" data-testid="onboarding-error">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Header con progreso */}
      <div className="border-b border-gray-200 pb-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('title')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Progress bar - Only 2 steps: Personal & Medical */}
        <div className="flex items-center space-x-2">
          <div className={`flex-1 h-2 rounded-full ${currentStep === 'personal' || currentStep === 'medical' ? 'bg-vitalgo-green' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-2 rounded-full ${currentStep === 'medical' ? 'bg-vitalgo-green' : 'bg-gray-200'}`}></div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={currentStep === 'personal' ? 'text-vitalgo-green font-medium' : ''}>
            {t('step2')}
          </span>
          <span className={currentStep === 'medical' ? 'text-vitalgo-green font-medium' : ''}>
            {t('step3')}
          </span>
        </div>
      </div>

      {/* Modales inline (sin overlay) - Con su propio botón de submit */}
      {currentStep === 'basic' && (
        <BasicInfoEditModal
          isOpen={true}
          onClose={handleSkipStep}
          initialData={basicInfo}
          onSubmit={handleBasicInfoSubmit}
          isLoading={isSubmitting}
          inline={true}
          showButtons={false}
          data-testid="onboarding-basic-modal"
        />
      )}

      {currentStep === 'personal' && (
        <PersonalInfoEditModal
          isOpen={true}
          onClose={handleSkipStep}
          initialData={personalInfo}
          onSubmit={handlePersonalInfoSubmit}
          isLoading={isSubmitting}
          inline={true}
          showButtons={false}
          data-testid="onboarding-personal-modal"
        />
      )}

      {currentStep === 'medical' && (
        <MedicalInfoEditModal
          isOpen={true}
          onClose={handleSkipStep}
          initialData={personalInfo}
          onSubmit={handleMedicalInfoSubmit}
          isLoading={isSubmitting}
          inline={true}
          showButtons={false}
          data-testid="onboarding-medical-modal"
        />
      )}

      {/* Botones de navegación - Submit del formulario interno */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        {/* Botón Atrás - Only show on medical step */}
        {currentStep === 'medical' && (
          <button
            onClick={handleBackStep}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vitalgo-green disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="onboarding-back-button"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('back')}
          </button>
        )}

        {/* Espaciador si no hay botón atrás */}
        {currentStep === 'personal' && <div></div>}

        {/* Botón Siguiente/Saltar */}
        <div className="flex gap-3">
          <button
            onClick={handleSkipStep}
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vitalgo-green disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="onboarding-skip-button"
          >
            {t('skip')}
          </button>
          <button
            type="submit"
            form={`onboarding-${currentStep}-form`}
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-vitalgo-green border border-transparent rounded-md hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vitalgo-green disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="onboarding-save-button"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('saving')}
              </>
            ) : (
              <>
                {currentStep === 'medical' ? t('saveAndFinish') : t('saveAndContinue')}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
