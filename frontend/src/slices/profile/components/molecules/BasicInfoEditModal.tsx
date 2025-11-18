/**
 * BasicInfoEditModal molecule component
 * Modal for editing basic patient information following VitalGo patterns
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BasicPatientInfo, BasicPatientUpdate } from '../../types';
import { PhoneInputGroup } from '../../../../shared/components/molecules/PhoneInputGroup';
import { Country, getCountryByCode, countries as staticCountries } from '../../../signup/data/countries';
import { splitPhoneInternational, combinePhoneInternational } from '../../utils/phoneUtils';
import { useCountries } from '@/hooks/useCountries';
import type { Country as APICountry } from '@/services/countriesService';
import { SignupApiService } from '../../../signup/services/signupApi';
import type { DocumentType } from '../../../signup/types';
import { CountrySelect } from '../../../signup/components/atoms/CountrySelect';

interface BasicInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: BasicPatientInfo | null;
  onSubmit: (data: BasicPatientUpdate) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
  inline?: boolean; // New prop for inline rendering without overlay
  showButtons?: boolean; // Show form buttons (default: true)
  'data-testid'?: string;
}

export const BasicInfoEditModal: React.FC<BasicInfoEditModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isLoading = false,
  inline = false,
  showButtons = true,
  'data-testid': testId = 'basic-info-edit-modal'
}) => {
  const t = useTranslations('profile.forms');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState<BasicPatientUpdate>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load countries from API
  const { countries: apiCountries, isLoading: countriesLoading, error: countriesError } = useCountries();

  // Convert API countries to format expected by PhoneInputGroup and CountrySelect
  // Use static countries as fallback if API hasn't loaded yet
  const convertedCountries: Country[] = apiCountries.length > 0
    ? apiCountries.map((country: APICountry) => ({
        code: country.code,
        name: country.name,
        dialCode: country.phone_code,
        flag: country.flag_emoji || '',
      }))
    : staticCountries;

  // Document types state
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [documentTypesLoading, setDocumentTypesLoading] = useState(true);

  // Phone field states for separated input
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>('CO');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // Load document types on mount - filtered to DNI and PA only
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        setDocumentTypesLoading(true);
        const types = await SignupApiService.getDocumentTypes();

        // Filter to only show DNI and Pasaporte (universal document types)
        const filteredTypes = types.filter(type => ['DNI', 'PA'].includes(type.code));
        setDocumentTypes(filteredTypes);
      } catch (error) {
        console.error('Error loading document types:', error);
        // Fallback to empty array on error
        setDocumentTypes([]);
      } finally {
        setDocumentTypesLoading(false);
      }
    };

    loadDocumentTypes();
  }, []);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      console.log('🔍 Modal initializing with data:', {
        phoneInternational: initialData.phoneInternational,
        countryCode: initialData.countryCode,
        dialCode: initialData.dialCode,
        phoneNumber: initialData.phoneNumber
      });

      // STRATEGY 1: Use database fields directly if available (PREFERRED)
      let countryCode = initialData.countryCode;
      let phoneNumber = initialData.phoneNumber;

      // STRATEGY 2: Fallback to parsing only if database fields are missing
      if (!phoneNumber && initialData.phoneInternational) {
        console.log('⚠️ Database phone_number missing, parsing phone_international');
        const phoneData = splitPhoneInternational(
          initialData.phoneInternational,
          initialData.countryCode,
          true  // Trust the database country_code!
        );
        countryCode = phoneData.countryCode;
        phoneNumber = phoneData.phoneNumber;
      }

      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        documentType: initialData.documentType,
        documentNumber: initialData.documentNumber,
        phoneInternational: initialData.phoneInternational,
        birthDate: initialData.birthDate,
        email: initialData.email,
        birthCountry: initialData.birthCountry || '',
        residenceCountry: initialData.residenceCountry || '',
      });

      setPhoneCountryCode(countryCode);
      setPhoneNumber(phoneNumber || '');
      setErrors({});

      console.log('✅ Modal initialized with:', { countryCode, phoneNumber });
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

  const handleInputChange = (field: keyof BasicPatientUpdate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Phone input handlers - now updates all phone fields consistently
  const handleCountryChange = (country: Country) => {
    setPhoneCountryCode(country.code);
    // Update all phone-related fields for consistency
    const newPhoneInternational = combinePhoneInternational(country.code, phoneNumber);
    setFormData(prev => ({
      ...prev,
      phoneInternational: newPhoneInternational,
      countryCode: country.code,
      dialCode: country.dialCode,     // Update database field
      phoneNumber: phoneNumber        // Keep current phone number
    }));
    // Clear phone errors
    if (errors.phoneInternational) {
      setErrors(prev => ({ ...prev, phoneInternational: '' }));
    }
    console.log('📞 Country changed:', { country: country.code, dialCode: country.dialCode });
  };

  const handlePhoneChange = (newPhoneNumber: string) => {
    setPhoneNumber(newPhoneNumber);
    // Update all phone-related fields for consistency
    const newPhoneInternational = combinePhoneInternational(phoneCountryCode, newPhoneNumber);
    const country = getCountryByCode(phoneCountryCode);
    setFormData(prev => ({
      ...prev,
      phoneInternational: newPhoneInternational,
      phoneNumber: newPhoneNumber,    // Update database field
      dialCode: country?.dialCode     // Ensure dial code is consistent
    }));
    // Clear phone errors
    if (errors.phoneInternational) {
      setErrors(prev => ({ ...prev, phoneInternational: '' }));
    }
    console.log('📞 Phone changed:', { phoneNumber: newPhoneNumber, phoneInternational: newPhoneInternational });
  };

  // Country selection handlers
  const handleBirthCountryChange = (country: Country) => {
    setFormData(prev => ({ ...prev, birthCountry: country.code }));
    if (errors.birthCountry) {
      setErrors(prev => ({ ...prev, birthCountry: '' }));
    }
  };

  const handleResidenceCountryChange = (country: Country) => {
    setFormData(prev => ({ ...prev, residenceCountry: country.code }));
    if (errors.residenceCountry) {
      setErrors(prev => ({ ...prev, residenceCountry: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = t('validation.firstNameRequired');
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = t('validation.lastNameRequired');
    }

    if (!formData.documentType?.trim()) {
      newErrors.documentType = t('validation.documentTypeRequired');
    }

    if (!formData.documentNumber?.trim()) {
      newErrors.documentNumber = t('validation.documentNumberRequired');
    } else if (!/^[0-9]+$/.test(formData.documentNumber.trim())) {
      newErrors.documentNumber = t('validation.documentNumberInvalid');
    }

    if (!formData.phoneInternational?.trim()) {
      newErrors.phoneInternational = t('validation.phoneRequired');
    } else if (formData.phoneInternational.trim().replace(/[^0-9]/g, '').length < 10) {
      newErrors.phoneInternational = t('validation.phoneInvalid');
    }

    if (!formData.birthDate) {
      newErrors.birthDate = t('validation.birthDateRequired');
    }

    if (!formData.email?.trim()) {
      newErrors.email = t('validation.phoneRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const result = await onSubmit(formData);

      if (result.success) {
        onClose();
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: t('messages.errorUpdate') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  // VitalGo brand-compliant field classes
  const fieldClasses = (fieldName: string) => `
    w-full px-3 py-2 border rounded-md text-base
    focus:outline-none focus:ring-2 transition-colors duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
    ${errors[fieldName]
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-vitalgo-dark-lighter focus:ring-vitalgo-green focus:border-vitalgo-green'
    }
  `;

  const labelClasses = "block text-sm font-medium text-vitalgo-dark mb-1";
  const errorClasses = "mt-1 text-sm text-red-600 font-medium";
  const requiredClasses = "text-red-500";

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
                {t('modals.editBasicInfo')}
              </h3>
            </div>
            <p className="text-sm text-vitalgo-dark-light">
              {t('messages.updateBasicInfo')}
            </p>
          </div>

          {/* Content */}
          <form id="onboarding-basic-form" onSubmit={handleSubmit} className="px-6 pb-4">
            <div className="space-y-4">
              {/* Name Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className={labelClasses}>
                    {t('labels.firstName')} <span className={requiredClasses}>*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={fieldClasses('firstName')}
                    placeholder={t('placeholders.firstName')}
                    disabled={isFormLoading}
                    data-testid={`${testId}-first-name`}
                    style={{ fontSize: '16px' }}
                    autoComplete="given-name"
                  />
                  {errors.firstName && (
                    <p className={errorClasses} data-testid={`${testId}-first-name-error`}>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className={labelClasses}>
                    {t('labels.lastName')} <span className={requiredClasses}>*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={fieldClasses('lastName')}
                    placeholder={t('placeholders.lastName')}
                    disabled={isFormLoading}
                    data-testid={`${testId}-last-name`}
                    style={{ fontSize: '16px' }}
                    autoComplete="family-name"
                  />
                  {errors.lastName && (
                    <p className={errorClasses} data-testid={`${testId}-last-name-error`}>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Document Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Type */}
                <div>
                  <label htmlFor="documentType" className={labelClasses}>
                    {t('labels.documentType')} <span className={requiredClasses}>*</span>
                  </label>
                  <select
                    id="documentType"
                    value={formData.documentType || ''}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                    className={fieldClasses('documentType')}
                    disabled={isFormLoading}
                    data-testid={`${testId}-document-type`}
                    disabled={isFormLoading || documentTypesLoading}
                  >
                    <option value="">{t('placeholders.selectDocumentType')}</option>
                    {documentTypes.map((docType) => (
                      <option key={docType.id} value={docType.code}>
                        {docType.code} - {docType.name}
                      </option>
                    ))}
                  </select>
                  {errors.documentType && (
                    <p className={errorClasses} data-testid={`${testId}-document-type-error`}>
                      {errors.documentType}
                    </p>
                  )}
                </div>

                {/* Document Number */}
                <div>
                  <label htmlFor="documentNumber" className={labelClasses}>
                    {t('labels.documentNumber')} <span className={requiredClasses}>*</span>
                  </label>
                  <input
                    type="text"
                    id="documentNumber"
                    value={formData.documentNumber || ''}
                    onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                    className={fieldClasses('documentNumber')}
                    placeholder={t('placeholders.documentNumber')}
                    disabled={isFormLoading}
                    data-testid={`${testId}-document-number`}
                    style={{ fontSize: '16px' }}
                    autoComplete="off"
                  />
                  {errors.documentNumber && (
                    <p className={errorClasses} data-testid={`${testId}-document-number-error`}>
                      {errors.documentNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Fields - Phone Input Group */}
              <div>
                <PhoneInputGroup
                  countryCode={phoneCountryCode}
                  phoneNumber={phoneNumber}
                  onCountryChange={handleCountryChange}
                  onPhoneChange={handlePhoneChange}
                  error={errors.phoneInternational}
                  disabled={isFormLoading}
                  data-testid={`${testId}-phone-group`}
                  countries={convertedCountries.length > 0 ? convertedCountries : undefined}
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email <span className={requiredClasses}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={fieldClasses('email')}
                  placeholder={t('placeholders.phone')}
                  disabled={isFormLoading}
                  data-testid={`${testId}-email`}
                  style={{ fontSize: '16px' }}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className={errorClasses} data-testid={`${testId}-email-error`}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="birthDate" className={labelClasses}>
                  {t('labels.birthDate')} <span className={requiredClasses}>*</span>
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={formData.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={fieldClasses('birthDate')}
                  disabled={isFormLoading}
                  data-testid={`${testId}-birth-date`}
                  style={{ fontSize: '16px' }}
                />
                {errors.birthDate && (
                  <p className={errorClasses} data-testid={`${testId}-birth-date-error`}>
                    {errors.birthDate}
                  </p>
                )}
              </div>

              {/* Country Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Birth Country */}
                <div>
                  <CountrySelect
                    value={formData.birthCountry || ''}
                    onChange={handleBirthCountryChange}
                    countries={convertedCountries}
                    label="País de Nacimiento"
                    placeholder="Selecciona país de nacimiento"
                    isLoading={countriesLoading}
                    data-testid={`${testId}-birth-country`}
                  />
                </div>

                {/* Residence Country */}
                <div>
                  <CountrySelect
                    value={formData.residenceCountry || ''}
                    onChange={handleResidenceCountryChange}
                    countries={convertedCountries}
                    label="País de Residencia"
                    placeholder="Selecciona país de residencia"
                    isLoading={countriesLoading}
                    data-testid={`${testId}-residence-country`}
                  />
                </div>
              </div>

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

      {/* Modal container - Scrollable wrapper */}
      <div className="flex min-h-full items-start justify-center p-4 text-center sm:p-8 overflow-y-auto">
        <div
          className="relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-0 sm:w-full sm:max-w-2xl"
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
                {t('modals.editBasicInfo')}
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
              {t('messages.updateBasicInfo')}
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 pb-4">
            <div className="space-y-4">
              {/* Name Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className={labelClasses}>
                    {t('labels.firstName')} <span className={requiredClasses}>*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={fieldClasses('firstName')}
                    placeholder={t('placeholders.firstName')}
                    disabled={isFormLoading}
                    data-testid={`${testId}-first-name`}
                    style={{ fontSize: '16px' }}
                    autoComplete="given-name"
                  />
                  {errors.firstName && (
                    <p className={errorClasses} data-testid={`${testId}-first-name-error`}>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className={labelClasses}>
                    {t('labels.lastName')} <span className={requiredClasses}>*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={fieldClasses('lastName')}
                    placeholder={t('placeholders.lastName')}
                    disabled={isFormLoading}
                    data-testid={`${testId}-last-name`}
                    style={{ fontSize: '16px' }}
                    autoComplete="family-name"
                  />
                  {errors.lastName && (
                    <p className={errorClasses} data-testid={`${testId}-last-name-error`}>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Document Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Type */}
                <div>
                  <label htmlFor="documentType" className={labelClasses}>
                    {t('labels.documentType')} <span className={requiredClasses}>*</span>
                  </label>
                  <select
                    id="documentType"
                    value={formData.documentType || ''}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                    className={fieldClasses('documentType')}
                    disabled={isFormLoading}
                    data-testid={`${testId}-document-type`}
                    disabled={isFormLoading || documentTypesLoading}
                  >
                    <option value="">{t('placeholders.selectDocumentType')}</option>
                    {documentTypes.map((docType) => (
                      <option key={docType.id} value={docType.code}>
                        {docType.code} - {docType.name}
                      </option>
                    ))}
                  </select>
                  {errors.documentType && (
                    <p className={errorClasses} data-testid={`${testId}-document-type-error`}>
                      {errors.documentType}
                    </p>
                  )}
                </div>

                {/* Document Number */}
                <div>
                  <label htmlFor="documentNumber" className={labelClasses}>
                    {t('labels.documentNumber')} <span className={requiredClasses}>*</span>
                  </label>
                  <input
                    type="text"
                    id="documentNumber"
                    value={formData.documentNumber || ''}
                    onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                    className={fieldClasses('documentNumber')}
                    placeholder={t('placeholders.documentNumber')}
                    disabled={isFormLoading}
                    data-testid={`${testId}-document-number`}
                    style={{ fontSize: '16px' }}
                    autoComplete="off"
                  />
                  {errors.documentNumber && (
                    <p className={errorClasses} data-testid={`${testId}-document-number-error`}>
                      {errors.documentNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Fields - Phone Input Group */}
              <div>
                <PhoneInputGroup
                  countryCode={phoneCountryCode}
                  phoneNumber={phoneNumber}
                  onCountryChange={handleCountryChange}
                  onPhoneChange={handlePhoneChange}
                  error={errors.phoneInternational}
                  disabled={isFormLoading}
                  data-testid={`${testId}-phone-group`}
                  countries={convertedCountries.length > 0 ? convertedCountries : undefined}
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email <span className={requiredClasses}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={fieldClasses('email')}
                  placeholder={t('placeholders.phone')}
                  disabled={isFormLoading}
                  data-testid={`${testId}-email`}
                  style={{ fontSize: '16px' }}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className={errorClasses} data-testid={`${testId}-email-error`}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="birthDate" className={labelClasses}>
                  {t('labels.birthDate')} <span className={requiredClasses}>*</span>
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={formData.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={fieldClasses('birthDate')}
                  disabled={isFormLoading}
                  data-testid={`${testId}-birth-date`}
                  style={{ fontSize: '16px' }}
                />
                {errors.birthDate && (
                  <p className={errorClasses} data-testid={`${testId}-birth-date-error`}>
                    {errors.birthDate}
                  </p>
                )}
              </div>

              {/* Country Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Birth Country */}
                <div>
                  <CountrySelect
                    value={formData.birthCountry || ''}
                    onChange={handleBirthCountryChange}
                    countries={convertedCountries}
                    label="País de Nacimiento"
                    placeholder="Selecciona país de nacimiento"
                    isLoading={countriesLoading}
                    data-testid={`${testId}-birth-country`}
                  />
                </div>

                {/* Residence Country */}
                <div>
                  <CountrySelect
                    value={formData.residenceCountry || ''}
                    onChange={handleResidenceCountryChange}
                    countries={convertedCountries}
                    label="País de Residencia"
                    placeholder="Selecciona país de residencia"
                    isLoading={countriesLoading}
                    data-testid={`${testId}-residence-country`}
                  />
                </div>
              </div>

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
          </form>

          {/* Footer - Only shown if showButtons is true */}
          {showButtons && (
            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
              <button
                type="submit"
                onClick={handleSubmit}
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
          )}
        </div>
      </div>
    </div>
  );
};