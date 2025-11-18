'use client';
/**
 * Personal Info Section molecule component
 */
import React from 'react';
import { useTranslations } from 'next-intl';
import { TextInput } from '../atoms/TextInput';
import { DocumentTypeSelect } from '../atoms/DocumentTypeSelect';
import { DateInput } from '../atoms/DateInput';
import { PhoneInputGroup } from '../../../../shared/components/molecules/PhoneInputGroup';
import { CountrySelect } from '../atoms/CountrySelect';
import { DocumentType, FieldValidationState } from '../../types';
import { Country } from '../../data/countries';

interface PersonalInfoSectionProps {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  originCountry: string;
  // New phone fields
  countryCode: string;
  phoneNumber: string;
  onInputChange: (field: string, value: string) => void;
  onFieldBlur: (field: string) => void;
  onCountryChange: (country: Country) => void;
  onOriginCountryChange: (country: Country) => void;
  documentTypes: DocumentType[];
  countries: Country[]; // Add countries prop
  isLoadingCountries?: boolean; // Add loading state
  validationStates: {
    firstName?: FieldValidationState;
    lastName?: FieldValidationState;
    documentNumber?: FieldValidationState;
    phone?: FieldValidationState;
  };
  errors: {
    documentType?: string;
    birthDate?: string;
    phone?: string;
    originCountry?: string;
  };
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  firstName,
  lastName,
  documentType,
  documentNumber,
  birthDate,
  originCountry,
  countryCode,
  phoneNumber,
  onInputChange,
  onFieldBlur,
  onCountryChange,
  onOriginCountryChange,
  documentTypes,
  countries,
  isLoadingCountries = false,
  validationStates,
  errors
}) => {
  const t = useTranslations('signup.personalInfo');

  return (
    <div className="space-y-6" data-testid="personal-info-section">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">{t('title')}</h3>
        <p className="text-sm text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput
          id="firstName"
          name="firstName"
          label={t('fields.firstName.label')}
          placeholder={t('fields.firstName.placeholder')}
          value={firstName}
          onChange={(e) => onInputChange('firstName', e.target.value)}
          onBlur={() => onFieldBlur('firstName')}
          validation={validationStates.firstName}
          required
          maxLength={50}
          autocomplete="given-name"
          data-testid="firstName-input"
        />

        <TextInput
          id="lastName"
          name="lastName"
          label={t('fields.lastName.label')}
          placeholder={t('fields.lastName.placeholder')}
          value={lastName}
          onChange={(e) => onInputChange('lastName', e.target.value)}
          onBlur={() => onFieldBlur('lastName')}
          validation={validationStates.lastName}
          required
          maxLength={50}
          autocomplete="family-name"
          data-testid="lastName-input"
        />

        <div className="md:col-span-2">
          <CountrySelect
            value={originCountry}
            onChange={onOriginCountryChange}
            countries={countries}
            isLoading={isLoadingCountries}
            label={t('fields.birthCountry.label')}
            placeholder={t('fields.birthCountry.placeholder')}
            error={errors.originCountry}
            required
            data-testid="birthCountry-select"
          />
        </div>

        <DocumentTypeSelect
          id="documentType"
          name="documentType"
          label={t('fields.documentType')}
          value={documentType}
          onChange={(e) => onInputChange('documentType', e.target.value)}
          onBlur={() => onFieldBlur('documentType')}
          documentTypes={documentTypes}
          required
          data-testid="documentType-select"
        />

        <TextInput
          id="documentNumber"
          name="documentNumber"
          label={t('fields.documentNumber.label')}
          placeholder={t('fields.documentNumber.placeholder')}
          value={documentNumber}
          onChange={(e) => onInputChange('documentNumber', e.target.value)}
          onBlur={() => onFieldBlur('documentNumber')}
          validation={validationStates.documentNumber}
          required
          maxLength={20}
          autocomplete="off"
          data-testid="documentNumber-input"
        />

        <div className="md:col-span-2">
          <PhoneInputGroup
            countryCode={countryCode}
            phoneNumber={phoneNumber}
            onCountryChange={onCountryChange}
            onPhoneChange={(value) => onInputChange('phoneNumber', value)}
            onPhoneBlur={() => onFieldBlur('phone')}
            validation={validationStates.phone}
            error={errors.phone}
            data-testid="phone-input-group"
          />
        </div>

        <div className="md:col-span-2">
          <DateInput
            id="birthDate"
            name="birthDate"
            label={t('fields.birthDate')}
            value={birthDate}
            onChange={(e) => onInputChange('birthDate', e.target.value)}
            onBlur={() => onFieldBlur('birthDate')}
            error={errors.birthDate}
            required
            autocomplete="bday"
            data-testid="birthDate-input"
          />
        </div>
      </div>

      {errors.documentType && (
        <p className="text-sm text-red-600" data-testid="documentType-error">
          {errors.documentType}
        </p>
      )}
    </div>
  );
};