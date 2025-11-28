/**
 * MedicalInfoEditModal molecule component
 * Modal for editing medical patient information (RF002 Medical Information)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { PersonalPatientInfo, PersonalPatientUpdate } from '../../types/personalInfo';
import { Country } from '../../../signup/data/countries';
import { splitPhoneInternational, combinePhoneInternational } from '../../utils/phoneUtils';
import { useCountries } from '@/hooks/useCountries';
import type { Country as APICountry } from '@/services/countriesService';
import { isOtherValueRequired } from '../../data/medicalData';
import { MedicalInfoFormContent } from './MedicalInfoFormContent';

interface MedicalInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PersonalPatientInfo | null;
  onSubmit: (data: PersonalPatientUpdate) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
  inline?: boolean; // New prop for inline rendering without overlay
  showButtons?: boolean; // Show form buttons (default: true)
  'data-testid'?: string;
}

interface MedicalFormData {
  eps?: string;
  eps_other?: string;
  health_service?: string;  // For non-Colombia residents
  occupation?: string;
  additional_insurance?: string;
  complementary_plan?: string;
  complementary_plan_other?: string;
  blood_type?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  // Primary emergency phone
  emergency_contact_phone?: string;
  emergency_contact_country_code?: string;
  emergency_contact_dial_code?: string;
  emergency_contact_phone_number?: string;
  // Alternative emergency phone
  emergency_contact_phone_alt?: string;
  emergency_contact_country_code_alt?: string;
  emergency_contact_dial_code_alt?: string;
  emergency_contact_phone_number_alt?: string;
}

export const MedicalInfoEditModal: React.FC<MedicalInfoEditModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isLoading = false,
  inline = false,
  showButtons = true,
  'data-testid': testId = 'medical-info-edit-modal'
}) => {
  const t = useTranslations('profile.forms');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [formData, setFormData] = useState<MedicalFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load countries from API
  const { countries: apiCountries, isLoading: countriesLoading, error: countriesError } = useCountries();

  // Convert API countries to format expected by PhoneInputGroup
  // Include i18n support for country names
  const convertedCountries: Country[] = apiCountries.map((country: APICountry) => ({
    code: country.code,
    name: locale === 'en' && country.name_en ? country.name_en : country.name,
    dialCode: country.phone_code,
    flag: country.flag_emoji || '',
  }));

  // Helper function to get country by code
  const getCountryByCode = (code: string): Country | undefined => {
    return convertedCountries.find(c => c.code === code);
  };

  // Phone field states for separated input
  const [emergencyPhoneCountryCode, setEmergencyPhoneCountryCode] = useState<string>('CO');
  const [emergencyPhoneNumber, setEmergencyPhoneNumber] = useState<string>('');
  const [emergencyPhoneAltCountryCode, setEmergencyPhoneAltCountryCode] = useState<string>('CO');
  const [emergencyPhoneAltNumber, setEmergencyPhoneAltNumber] = useState<string>('');

  // Check if user was born in Colombia (for EPS vs Additional Insurance logic)
  const bornInColombia = initialData?.birth_country === 'CO' ||
                         initialData?.birth_country === 'Colombia' ||
                         initialData?.birth_country === 'COLOMBIA';

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      console.log('🔍 MedicalInfoEditModal initializing with data:', initialData);

      // Parse primary emergency phone
      // FIX: If country_code is null, try to detect from phone number
      let emergencyCountryCode = initialData.emergency_contact_country_code || '';
      let emergencyPhone = initialData.emergency_contact_phone_number || '';

      // Determine the phone source for parsing
      const primaryPhoneSource = emergencyPhone || initialData.emergency_contact_phone || '';

      if (!emergencyCountryCode && primaryPhoneSource) {
        // No country code stored, try to detect from phone number
        const phoneData = splitPhoneInternational(primaryPhoneSource, '', false);
        emergencyCountryCode = phoneData.countryCode;
        emergencyPhone = phoneData.phoneNumber;
        console.log('🔍 Detected country from phone:', { source: primaryPhoneSource, detected: phoneData });
      } else if (!emergencyPhone && initialData.emergency_contact_phone) {
        // Have country code but no separated phone, parse from legacy field
        const phoneData = splitPhoneInternational(
          initialData.emergency_contact_phone,
          emergencyCountryCode,
          true
        );
        emergencyPhone = phoneData.phoneNumber;
      }

      // Default to CO only if no country was detected
      if (!emergencyCountryCode) {
        emergencyCountryCode = 'CO';
      }

      // Parse alternative emergency phone (same logic)
      let emergencyAltCountryCode = initialData.emergency_contact_country_code_alt || '';
      let emergencyAltPhone = initialData.emergency_contact_phone_number_alt || '';

      const altPhoneSource = emergencyAltPhone || initialData.emergency_contact_phone_alt || '';

      if (!emergencyAltCountryCode && altPhoneSource) {
        // No country code stored, try to detect from phone number
        const phoneData = splitPhoneInternational(altPhoneSource, '', false);
        emergencyAltCountryCode = phoneData.countryCode;
        emergencyAltPhone = phoneData.phoneNumber;
        console.log('🔍 Detected alt country from phone:', { source: altPhoneSource, detected: phoneData });
      } else if (!emergencyAltPhone && initialData.emergency_contact_phone_alt) {
        // Have country code but no separated phone, parse from legacy field
        const phoneData = splitPhoneInternational(
          initialData.emergency_contact_phone_alt,
          emergencyAltCountryCode,
          true
        );
        emergencyAltPhone = phoneData.phoneNumber;
      }

      // Default to CO only if no country was detected
      if (!emergencyAltCountryCode) {
        emergencyAltCountryCode = 'CO';
      }

      setFormData({
        eps: initialData.eps || '',
        eps_other: initialData.eps_other || '',
        health_service: initialData.additional_insurance || '',
        occupation: initialData.occupation || '',
        additional_insurance: initialData.additional_insurance || '',
        complementary_plan: initialData.complementary_plan || '',
        complementary_plan_other: initialData.complementary_plan_other || '',
        blood_type: initialData.blood_type || '',
        emergency_contact_name: initialData.emergency_contact_name || '',
        emergency_contact_relationship: initialData.emergency_contact_relationship || '',
        emergency_contact_phone: initialData.emergency_contact_phone || '',
        emergency_contact_phone_alt: initialData.emergency_contact_phone_alt || ''
      });

      setEmergencyPhoneCountryCode(emergencyCountryCode);
      setEmergencyPhoneNumber(emergencyPhone);
      setEmergencyPhoneAltCountryCode(emergencyAltCountryCode);
      setEmergencyPhoneAltNumber(emergencyAltPhone);

      setErrors({});
      console.log('✅ MedicalInfoEditModal initialized with emergency phones:', {
        primary: { country: emergencyCountryCode, phone: emergencyPhone },
        alt: { country: emergencyAltCountryCode, phone: emergencyAltPhone }
      });
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

  const handleFieldChange = (field: keyof MedicalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Primary emergency phone handlers
  const handleEmergencyCountryChange = (country: Country) => {
    setEmergencyPhoneCountryCode(country.code);
    const newPhoneInternational = combinePhoneInternational(country.code, emergencyPhoneNumber);
    setFormData(prev => ({
      ...prev,
      emergency_contact_phone: newPhoneInternational,
      emergency_contact_country_code: country.code,
      emergency_contact_dial_code: country.dialCode,
      emergency_contact_phone_number: emergencyPhoneNumber
    }));
    if (errors.emergency_contact_phone) {
      setErrors(prev => ({ ...prev, emergency_contact_phone: '' }));
    }
  };

  const handleEmergencyPhoneChange = (newPhoneNumber: string) => {
    setEmergencyPhoneNumber(newPhoneNumber);
    const newPhoneInternational = combinePhoneInternational(emergencyPhoneCountryCode, newPhoneNumber);
    const country = getCountryByCode(emergencyPhoneCountryCode);
    setFormData(prev => ({
      ...prev,
      emergency_contact_phone: newPhoneInternational,
      emergency_contact_phone_number: newPhoneNumber,
      emergency_contact_dial_code: country?.dialCode
    }));
    if (errors.emergency_contact_phone) {
      setErrors(prev => ({ ...prev, emergency_contact_phone: '' }));
    }
  };

  // Alternative emergency phone handlers
  const handleEmergencyAltCountryChange = (country: Country) => {
    setEmergencyPhoneAltCountryCode(country.code);
    const newPhoneInternational = combinePhoneInternational(country.code, emergencyPhoneAltNumber);
    setFormData(prev => ({
      ...prev,
      emergency_contact_phone_alt: newPhoneInternational,
      emergency_contact_country_code_alt: country.code,
      emergency_contact_dial_code_alt: country.dialCode,
      emergency_contact_phone_number_alt: emergencyPhoneAltNumber
    }));
    if (errors.emergency_contact_phone_alt) {
      setErrors(prev => ({ ...prev, emergency_contact_phone_alt: '' }));
    }
  };

  const handleEmergencyPhoneAltChange = (newPhoneNumber: string) => {
    setEmergencyPhoneAltNumber(newPhoneNumber);
    const newPhoneInternational = combinePhoneInternational(emergencyPhoneAltCountryCode, newPhoneNumber);
    const country = getCountryByCode(emergencyPhoneAltCountryCode);
    setFormData(prev => ({
      ...prev,
      emergency_contact_phone_alt: newPhoneInternational,
      emergency_contact_phone_number_alt: newPhoneNumber,
      emergency_contact_dial_code_alt: country?.dialCode
    }));
    if (errors.emergency_contact_phone_alt) {
      setErrors(prev => ({ ...prev, emergency_contact_phone_alt: '' }));
    }
  };

  // Debug log
  console.log('🌎 MedicalInfoEditModal - birth_country:', initialData?.birth_country);
  console.log('🇨🇴 MedicalInfoEditModal - bornInColombia:', bornInColombia);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation - EPS only required for those born in Colombia
    if (bornInColombia && !formData.eps) {
      newErrors.eps = t('validation.epsRequired');
    }

    if (formData.eps === 'OTRO' && !formData.eps_other) {
      newErrors.eps_other = t('validation.epsOtherSpecify');
    }

    if (!formData.occupation) {
      newErrors.occupation = t('validation.occupationRequired');
    }

    if (!formData.blood_type) {
      newErrors.blood_type = t('validation.bloodTypeRequired');
    }

    if (!formData.emergency_contact_name) {
      newErrors.emergency_contact_name = t('validation.emergencyNameRequired');
    }

    if (!formData.emergency_contact_relationship) {
      newErrors.emergency_contact_relationship = t('validation.emergencyRelationshipRequired');
    }

    if (!formData.emergency_contact_phone) {
      newErrors.emergency_contact_phone = t('validation.emergencyPhoneRequired');
    } else if (formData.emergency_contact_phone.trim().replace(/[^0-9]/g, '').length < 10) {
      newErrors.emergency_contact_phone = t('validation.phoneInvalid');
    }

    // Optional phone validation
    if (formData.emergency_contact_phone_alt && formData.emergency_contact_phone_alt.trim().replace(/[^0-9]/g, '').length < 10) {
      newErrors.emergency_contact_phone_alt = t('validation.phoneInvalid');
    }

    if (formData.complementary_plan === 'OTRO' && !formData.complementary_plan_other) {
      newErrors.complementary_plan_other = t('validation.complementaryPlanSpecify');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // If user wasn't born in Colombia, save health_service to additional_insurance field
      const dataToSubmit = { ...formData };
      if (!bornInColombia && formData.health_service) {
        dataToSubmit.additional_insurance = formData.health_service;
      }

      const result = await onSubmit(dataToSubmit);
      if (result.success) {
        onClose();
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('Error submitting medical info:', error);
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
                {t('modals.editMedicalInfo')}
              </h3>
            </div>
            <p className="text-sm text-vitalgo-dark-light">
              {t('sectionDescriptions.completeMedicalInfo')}
            </p>
          </div>

          {/* Content */}
          <form id="onboarding-medical-form" onSubmit={handleSubmit} className="px-6 pb-4">
            <MedicalInfoFormContent
              formData={formData}
              errors={errors}
              residesInColombia={bornInColombia}
              isFormLoading={isFormLoading}
              convertedCountries={convertedCountries}
              emergencyPhoneCountryCode={emergencyPhoneCountryCode}
              emergencyPhoneNumber={emergencyPhoneNumber}
              emergencyPhoneAltCountryCode={emergencyPhoneAltCountryCode}
              emergencyPhoneAltNumber={emergencyPhoneAltNumber}
              handleFieldChange={handleFieldChange}
              handleEmergencyCountryChange={handleEmergencyCountryChange}
              handleEmergencyPhoneChange={handleEmergencyPhoneChange}
              handleEmergencyAltCountryChange={handleEmergencyAltCountryChange}
              handleEmergencyPhoneAltChange={handleEmergencyPhoneAltChange}
              testId={`${testId}-inline`}
            />

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

  // Default modal rendering (with overlay) - same structure as inline, just wrapped with overlay
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
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
          data-testid="modal-content"
        >
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-xl font-semibold text-vitalgo-dark"
                id="modal-title"
                data-testid="modal-title"
              >
                {t('modals.editMedicalInfo')}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
                data-testid={`${testId}-close-button`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-vitalgo-dark-light">
              {t('sectionDescriptions.completeMedicalInfo')}
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <MedicalInfoFormContent
              formData={formData}
              errors={errors}
              residesInColombia={bornInColombia}
              isFormLoading={isFormLoading}
              convertedCountries={convertedCountries}
              emergencyPhoneCountryCode={emergencyPhoneCountryCode}
              emergencyPhoneNumber={emergencyPhoneNumber}
              emergencyPhoneAltCountryCode={emergencyPhoneAltCountryCode}
              emergencyPhoneAltNumber={emergencyPhoneAltNumber}
              handleFieldChange={handleFieldChange}
              handleEmergencyCountryChange={handleEmergencyCountryChange}
              handleEmergencyPhoneChange={handleEmergencyPhoneChange}
              handleEmergencyAltCountryChange={handleEmergencyAltCountryChange}
              handleEmergencyPhoneAltChange={handleEmergencyPhoneAltChange}
              testId={testId}
            />
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-vitalgo-green"
              data-testid={`${testId}-cancel-button`}
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isFormLoading}
              className="inline-flex justify-center rounded-md bg-vitalgo-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </div>
  );
};