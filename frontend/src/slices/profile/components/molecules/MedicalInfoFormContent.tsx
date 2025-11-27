/**
 * MedicalInfoFormContent Component
 * Reusable form content for medical information
 * Used in both inline and modal versions of MedicalInfoEditModal
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SelectField } from '../atoms/SelectField';
import { TextAreaField } from '../atoms/TextAreaField';
import { RadioButtonField } from '../atoms/RadioButtonField';
import { PhoneInputGroup } from '../../../../shared/components/molecules/PhoneInputGroup';
import { CountryFlag } from '../../../../shared/components/atoms/CountryFlag';
import { Country } from '../../../signup/data/countries';
import {
  epsOptions,
  bloodTypeOptions,
  complementaryPlanOptions,
  emergencyContactRelationshipOptions,
  isOtherValueRequired
} from '../../data/medicalData';

interface MedicalFormData {
  eps?: string;
  eps_other?: string;
  health_service?: string;
  occupation?: string;
  additional_insurance?: string;
  complementary_plan?: string;
  complementary_plan_other?: string;
  blood_type?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_country_code?: string;
  emergency_contact_dial_code?: string;
  emergency_contact_phone_number?: string;
  emergency_contact_phone_alt?: string;
  emergency_contact_country_code_alt?: string;
  emergency_contact_dial_code_alt?: string;
  emergency_contact_phone_number_alt?: string;
}

interface MedicalInfoFormContentProps {
  formData: MedicalFormData;
  errors: Record<string, string>;
  residesInColombia: boolean;
  isFormLoading: boolean;
  convertedCountries: Country[];
  emergencyPhoneCountryCode: string;
  emergencyPhoneNumber: string;
  emergencyPhoneAltCountryCode: string;
  emergencyPhoneAltNumber: string;
  handleFieldChange: (field: keyof MedicalFormData, value: string) => void;
  handleEmergencyCountryChange: (country: Country) => void;
  handleEmergencyPhoneChange: (phoneNumber: string) => void;
  handleEmergencyAltCountryChange: (country: Country) => void;
  handleEmergencyPhoneAltChange: (phoneNumber: string) => void;
  testId?: string;
}

export function MedicalInfoFormContent({
  formData,
  errors,
  residesInColombia,
  isFormLoading,
  convertedCountries,
  emergencyPhoneCountryCode,
  emergencyPhoneNumber,
  emergencyPhoneAltCountryCode,
  emergencyPhoneAltNumber,
  handleFieldChange,
  handleEmergencyCountryChange,
  handleEmergencyPhoneChange,
  handleEmergencyAltCountryChange,
  handleEmergencyPhoneAltChange,
  testId = 'medical-info-form'
}: MedicalInfoFormContentProps) {
  const t = useTranslations('profile.forms');
  const tPhone = useTranslations('phone.group');

  return (
    <div className="space-y-6">
      {/* Section 1: Seguridad Social y Ocupación */}
      <div className="border-b border-gray-200 pb-6">
        <h4 className="text-lg font-medium text-vitalgo-dark mb-4 flex items-center">
          <div className="w-6 h-6 bg-vitalgo-green/10 rounded-full flex items-center justify-center mr-3">
            <svg className="h-4 w-4 text-vitalgo-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          {t('sectionTitles.socialSecurityOccupation')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {residesInColombia ? (
            <>
              <SelectField
                label={t('labels.eps')}
                value={formData.eps || ''}
                onChange={(value) => handleFieldChange('eps', value)}
                options={epsOptions}
                placeholder={t('placeholders.selectEps')}
                required
                error={errors.eps}
              />
              {isOtherValueRequired(formData.eps || '') && (
                <div className="md:col-span-2">
                  <TextAreaField
                    label={t('labels.epsOther')}
                    value={formData.eps_other || ''}
                    onChange={(value) => handleFieldChange('eps_other', value)}
                    placeholder={t('placeholders.epsOther')}
                    required
                    error={errors.eps_other}
                    rows={2}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="md:col-span-2">
              <TextAreaField
                label={t('labels.healthService')}
                value={formData.health_service || ''}
                onChange={(value) => handleFieldChange('health_service', value)}
                placeholder={t('placeholders.healthService')}
                error={errors.health_service}
                rows={2}
              />
            </div>
          )}
          <div className="md:col-span-2">
            <TextAreaField
              label={t('labels.occupation')}
              value={formData.occupation || ''}
              onChange={(value) => handleFieldChange('occupation', value)}
              placeholder={t('placeholders.occupation')}
              required
              error={errors.occupation}
              rows={2}
            />
          </div>
          {!residesInColombia && (
            <div className="md:col-span-2">
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-blue-800" dangerouslySetInnerHTML={{ __html: t.raw('infoBoxes.additionalInsurance') }} />
                </div>
              </div>
              <TextAreaField
                label={t('labels.additionalInsurance')}
                value={formData.additional_insurance || ''}
                onChange={(value) => handleFieldChange('additional_insurance', value)}
                placeholder={t('placeholders.additionalInsurance')}
                error={errors.additional_insurance}
                rows={2}
              />
            </div>
          )}
          {residesInColombia && (
            <>
              <SelectField
                label={t('labels.complementaryPlan')}
                value={formData.complementary_plan || ''}
                onChange={(value) => handleFieldChange('complementary_plan', value)}
                options={complementaryPlanOptions}
                placeholder={t('placeholders.complementaryPlan')}
                error={errors.complementary_plan}
              />
              {isOtherValueRequired(formData.complementary_plan || '') && (
                <TextAreaField
                  label={t('labels.complementaryPlanOther')}
                  value={formData.complementary_plan_other || ''}
                  onChange={(value) => handleFieldChange('complementary_plan_other', value)}
                  placeholder={t('placeholders.complementaryPlanOther')}
                  required
                  error={errors.complementary_plan_other}
                  rows={2}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Section 2: Información Médica */}
      <div className="border-b border-gray-200 pb-6">
        <h4 className="text-lg font-medium text-vitalgo-dark mb-4 flex items-center">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          {t('sectionTitles.medicalInfo')}
        </h4>
        <div>
          <RadioButtonField
            label={t('labels.bloodType')}
            name="blood_type"
            value={formData.blood_type || ''}
            onChange={(value) => handleFieldChange('blood_type', value)}
            options={bloodTypeOptions}
            required
            error={errors.blood_type}
          />
        </div>
      </div>

      {/* Section 3: Contacto de Emergencia */}
      <div>
        <h4 className="text-lg font-medium text-vitalgo-dark mb-4 flex items-center">
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          {t('sectionTitles.emergencyContact')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <TextAreaField
              label={t('labels.emergencyName')}
              value={formData.emergency_contact_name || ''}
              onChange={(value) => handleFieldChange('emergency_contact_name', value)}
              placeholder={t('placeholders.emergencyName')}
              required
              error={errors.emergency_contact_name}
              rows={2}
            />
          </div>
          <div className="md:col-span-2">
            <SelectField
              label={t('labels.emergencyRelationship')}
              value={formData.emergency_contact_relationship || ''}
              onChange={(value) => handleFieldChange('emergency_contact_relationship', value)}
              options={emergencyContactRelationshipOptions}
              placeholder={t('placeholders.emergencyRelationship')}
              required
              error={errors.emergency_contact_relationship}
            />
          </div>
          <div className="md:col-span-2">
            <PhoneInputGroup
              countryCode={emergencyPhoneCountryCode}
              phoneNumber={emergencyPhoneNumber}
              onCountryChange={handleEmergencyCountryChange}
              onPhoneChange={handleEmergencyPhoneChange}
              error={errors.emergency_contact_phone}
              disabled={isFormLoading}
              data-testid={`${testId}-emergency-phone-group`}
              countries={convertedCountries.length > 0 ? convertedCountries : undefined}
            />
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {t('labels.emergencyPhoneAlt')}
                </h4>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-vitalgo-dark mb-1">
                    {t('labels.dialCode')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={emergencyPhoneAltCountryCode}
                    onChange={(e) => {
                      const country = convertedCountries.find(c => c.code === e.target.value);
                      if (country) handleEmergencyAltCountryChange(country);
                    }}
                    disabled={isFormLoading}
                    className="w-full px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2 transition-colors duration-150 border-vitalgo-dark-lighter focus:ring-vitalgo-green focus:border-vitalgo-green"
                  >
                    {convertedCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.dialCode} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-vitalgo-dark mb-1">
                    {t('labels.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhoneAltNumber}
                    onChange={(e) => handleEmergencyPhoneAltChange(e.target.value)}
                    disabled={isFormLoading}
                    placeholder="3001234567"
                    className="w-full px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2 transition-colors duration-150 border-vitalgo-dark-lighter focus:ring-vitalgo-green focus:border-vitalgo-green"
                    style={{ fontSize: '16px' }}
                  />
                  {errors.emergency_contact_phone_alt && (
                    <p className="mt-1 text-sm text-red-600 font-medium">
                      {errors.emergency_contact_phone_alt}
                    </p>
                  )}
                </div>
              </div>
              {emergencyPhoneAltNumber && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {tPhone('fullNumber')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <CountryFlag countryCode={emergencyPhoneAltCountryCode} size="md" className="flex-shrink-0" />
                      <span className="font-mono text-sm text-gray-900 flex items-center">
                        <span className="text-blue-600 font-medium">
                          {convertedCountries.find(c => c.code === emergencyPhoneAltCountryCode)?.dialCode || ''}
                        </span>
                        <span className="ml-1">
                          {emergencyPhoneAltNumber.replace(/\D/g, '')}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
  );
}
