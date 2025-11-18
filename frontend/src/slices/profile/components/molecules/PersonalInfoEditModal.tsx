/**
 * PersonalInfoEditModal molecule component
 * Modal for editing personal patient information following VitalGo patterns
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PersonalPatientInfo, PersonalPatientUpdate } from '../../types/personalInfo';
import { DemographicInfoSection } from './DemographicInfoSection';
import { ResidenceInfoSection } from './ResidenceInfoSection';

interface PersonalInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PersonalPatientInfo | null;
  onSubmit: (data: PersonalPatientUpdate) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
  inline?: boolean; // New prop for inline rendering without overlay
  showButtons?: boolean; // Show form buttons (default: true)
  'data-testid'?: string;
}

export const PersonalInfoEditModal: React.FC<PersonalInfoEditModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isLoading = false,
  inline = false,
  showButtons = true,
  'data-testid': testId = 'personal-info-edit-modal'
}) => {
  const t = useTranslations('profile.forms');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState<PersonalPatientUpdate>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      console.log('🔍 PersonalInfoEditModal initializing with data:', initialData);

      setFormData({
        biological_sex: initialData.biological_sex || '',
        gender: initialData.gender || '',
        gender_other: initialData.gender_other || '',
        birth_country: initialData.birth_country || '',
        birth_country_other: initialData.birth_country_other || '',
        birth_department: initialData.birth_department || '',
        birth_city: initialData.birth_city || '',
        residence_address: initialData.residence_address || '',
        residence_country: initialData.residence_country || '',
        residence_country_other: initialData.residence_country_other || '',
        residence_department: initialData.residence_department || '',
        residence_city: initialData.residence_city || '',
        organ_donor_preference: initialData.organ_donor_preference || '',
        authorized_decision_maker: initialData.authorized_decision_maker || '',
        height: initialData.height || undefined,
        weight: initialData.weight || undefined
      });

      setErrors({});
      console.log('✅ PersonalInfoEditModal initialized');
    }
  }, [isOpen, initialData]);

  // Close modal on ESC key (only for non-inline modals)
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen && !inline) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      if (!inline) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose, inline]);

  const handleFieldChange = (field: keyof PersonalPatientUpdate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    console.log('🔍 Validating form data:', formData);

    // Required fields validation
    if (!formData.biological_sex?.trim()) {
      console.log('❌ Validation error: biological_sex is missing');
      newErrors.biological_sex = t('validation.biologicalSexRequired');
    }

    if (!formData.gender?.trim()) {
      console.log('❌ Validation error: gender is missing');
      newErrors.gender = t('validation.genderRequired');
    }

    // Validate "otro" gender field if selected
    if (formData.gender === 'OTRO' && !formData.gender_other?.trim()) {
      console.log('❌ Validation error: gender_other is missing when OTRO selected');
      newErrors.gender_other = t('validation.specifyGender');
    }

    // NOTE: Birth location fields (birth_country, birth_department, birth_city) are not validated here
    // because they are collected during registration and not shown in this form

    // Residence information validation
    if (!formData.residence_address?.trim()) {
      console.log('❌ Validation error: residence_address is missing');
      newErrors.residence_address = t('validation.residenceAddressRequired');
    }

    if (!formData.residence_country?.trim()) {
      console.log('❌ Validation error: residence_country is missing');
      newErrors.residence_country = t('validation.residenceCountryRequired');
    }

    // Validate "otro" residence country field if selected
    if (formData.residence_country === 'OTHER' && !formData.residence_country_other?.trim()) {
      console.log('❌ Validation error: residence_country_other is missing when OTHER selected');
      newErrors.residence_country_other = t('validation.specifyResidenceCountry');
    }

    // Only validate Colombian residence fields if residence country is Colombia
    if (formData.residence_country === 'CO') {
      console.log('🇨🇴 Validating Colombian residence fields...');
      if (!formData.residence_department?.trim()) {
        console.log('❌ Validation error: residence_department is missing for CO');
        newErrors.residence_department = t('validation.residenceDepartmentRequired');
      }

      if (!formData.residence_city?.trim()) {
        console.log('❌ Validation error: residence_city is missing for CO');
        newErrors.residence_city = t('validation.residenceCityRequired');
      }
    }

    console.log('📋 Validation errors:', newErrors);
    console.log('✅ Validation result:', Object.keys(newErrors).length === 0 ? 'PASSED' : 'FAILED');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 PersonalInfoEditModal: handleSubmit called');

    if (!validateForm()) {
      console.log('❌ PersonalInfoEditModal: Validation failed');
      return;
    }

    console.log('✅ PersonalInfoEditModal: Validation passed, submitting...', formData);

    try {
      setIsSubmitting(true);
      const result = await onSubmit(formData);
      console.log('📦 PersonalInfoEditModal: onSubmit result:', result);

      if (result.success) {
        console.log('✅ PersonalInfoEditModal: Submission successful, inline mode:', inline);
        // Only close modal if not in inline mode
        if (!inline) {
          onClose();
        } else {
          console.log('ℹ️ PersonalInfoEditModal: Inline mode - not closing modal, parent should handle tab change');
        }
      } else {
        console.log('❌ PersonalInfoEditModal: Submission failed:', result.message);
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.log('❌ PersonalInfoEditModal: Exception during submission:', error);
      setErrors({ general: t('messages.errorUpdate') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  if (!isOpen) return null;

  // Inline rendering (no overlay, no fixed positioning)
  if (inline) {
    return (
      <div data-testid={testId} className="w-full">
        <div className="bg-white rounded-lg border border-gray-200" data-testid="modal-content">
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-xl font-semibold text-vitalgo-dark"
                id="modal-title"
                data-testid="modal-title"
              >
                {t('modals.editPersonalInfo')}
              </h3>
            </div>
            <p className="text-sm text-vitalgo-dark-light">
              {t('messages.updatePersonalInfo')}
            </p>
          </div>

          {/* Content */}
          <form id="onboarding-personal-form" onSubmit={handleSubmit} className="px-6 pb-4">
            <div className="space-y-6">
              {/* Demographic Information Section */}
              <DemographicInfoSection
                data={formData}
                onChange={handleFieldChange}
                errors={errors}
              />

              {/* Residence Information Section */}
              <ResidenceInfoSection
                data={formData}
                onChange={handleFieldChange}
                errors={errors}
              />

              {/* General Error */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="ml-3 text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Only shown if showButtons is true */}
            {showButtons && (
              <div className="bg-gray-50 px-6 py-4 mt-6 rounded-b-lg">
                <button
                  type="submit"
                  disabled={isFormLoading}
                  className="inline-flex w-full justify-center rounded-md bg-vitalgo-green px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid={`${testId}-submit-button`}
                >
                  {isFormLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('buttons.saving')}
                    </div>
                  ) : (
                    t('buttons.save')
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Default modal rendering (with overlay)
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      data-testid={testId}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
        data-testid="modal-overlay"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl"
          data-testid="modal-content"
        >
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-xl font-semibold text-vitalgo-dark"
                id="modal-title"
                data-testid="modal-title"
              >
                {t('modals.editPersonalInfo')}
              </h3>
              <button
                type="button"
                className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-vitalgo-green"
                onClick={onClose}
                data-testid="modal-close-button"
              >
                <span className="sr-only">{tCommon('close')}</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-vitalgo-dark-light">
              {t('messages.updatePersonalInfo')}
            </p>
          </div>

          {/* Content */}
          <form id="personal-info-edit-form" onSubmit={handleSubmit} className="px-6 pb-4">
            <div className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="ml-3 text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Demographic Information Section */}
              <DemographicInfoSection
                data={formData}
                onChange={handleFieldChange}
                errors={errors}
              />

              {/* Residence Information Section */}
              <ResidenceInfoSection
                data={formData}
                onChange={handleFieldChange}
                errors={errors}
              />
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="submit"
              form="personal-info-edit-form"
              disabled={isFormLoading}
              className="inline-flex w-full justify-center rounded-md bg-vitalgo-green px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid={`${testId}-submit-button`}
            >
              {isFormLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('buttons.saving')}
                </div>
              ) : (
                t('buttons.save')
              )}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50"
              onClick={onClose}
              disabled={isFormLoading}
              data-testid={`${testId}-cancel-button`}
            >
              {t('buttons.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};