'use client';
/**
 * Phone Input Group - Molecule component
 * Combines CountryCodeSelect and PhoneNumberInput for complete phone entry
 * Shared component for use across multiple slices
 */
import React from 'react';
import { useTranslations } from 'next-intl';
import { CountryCodeSelect } from '../atoms/CountryCodeSelect';
import { PhoneNumberInput } from '../atoms/PhoneNumberInput';
import { CountryFlag } from '../atoms/CountryFlag';
import { Country, getCountryByCode } from '../../../slices/signup/data/countries';
import { FieldValidationState } from '../../../slices/signup/types';

interface PhoneInputGroupProps {
  countryCode: string;
  phoneNumber: string;
  onCountryChange: (country: Country) => void;
  onPhoneChange: (phoneNumber: string) => void;
  onPhoneBlur?: () => void;
  validation?: FieldValidationState;
  error?: string;
  disabled?: boolean;
  'data-testid'?: string;
  countries?: Country[]; // Optional: provide custom countries list (e.g., from API)
}

export const PhoneInputGroup: React.FC<PhoneInputGroupProps> = ({
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  onPhoneBlur,
  validation,
  error,
  disabled = false,
  'data-testid': testId = 'phone-input-group',
  countries
}) => {
  const t = useTranslations('phone.group');
  const tCountry = useTranslations('phone.countryCode');

  return (
    <div className="space-y-4" data-testid={testId}>
      {/* Section header */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-900">
          {t('title')}
        </h4>
        <p className="text-xs text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      {/* Grid layout for country and phone inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Country code selector */}
        <div className="lg:col-span-1">
          <CountryCodeSelect
            id="countryCode"
            name="countryCode"
            value={countryCode}
            onChange={onCountryChange}
            disabled={disabled}
            data-testid="country-select"
            countries={countries}
          />
        </div>

        {/* Phone number input */}
        <div className="lg:col-span-1">
          <PhoneNumberInput
            id="phoneNumber"
            name="phoneNumber"
            value={phoneNumber}
            onChange={onPhoneChange}
            onBlur={onPhoneBlur}
            countryCode={countryCode}
            validation={validation}
            error={error}
            disabled={disabled}
            data-testid="phone-input"
          />
        </div>
      </div>

      {/* Combined phone display preview */}
      {phoneNumber && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg" data-testid="phone-preview">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {t('fullNumber')}
            </span>
            <div className="flex items-center space-x-2">
              {/* Country flag */}
              {countryCode && (
                <CountryFlag countryCode={countryCode} size="md" className="flex-shrink-0" />
              )}

              {/* Dial code and phone number */}
              <span className="font-mono text-sm text-gray-900 flex items-center">
                {countryCode && (
                  <span className="text-blue-600 font-medium">
                    {getCountryByCode(countryCode)?.dialCode || ''}
                  </span>
                )}
                {phoneNumber && (
                  <span className="ml-1">
                    {phoneNumber.replace(/\D/g, '')}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global validation status for the phone group */}
      {validation && !validation.isValidating && (
        <div className="flex items-start space-x-2 text-sm" data-testid="phone-validation-status">
          {validation.isValid === true ? (
            <>
              <svg className="w-4 h-4 text-vitalgo-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-vitalgo-green">
                {t('validAndAvailable')}
              </span>
            </>
          ) : validation.isValid === false && (validation.error || error) ? (
            <>
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-700">
                {validation.error || error}
              </span>
            </>
          ) : null}
        </div>
      )}

      {/* Loading state */}
      {validation?.isValidating && (
        <div className="flex items-center space-x-2 text-sm text-gray-600" data-testid="phone-validation-loading">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          <span>{t('validating')}</span>
        </div>
      )}
    </div>
  );
};