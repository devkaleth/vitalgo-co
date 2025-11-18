'use client';
/**
 * Phone Number Input with automatic formatting based on country
 * Formats phone numbers according to country-specific patterns
 * Shared component for use across multiple slices
 */
import React from 'react';
import { getCountryByCode } from '../../../slices/signup/data/countries';
import { FieldValidationState } from '../../../slices/signup/types';

interface PhoneNumberInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  countryCode: string;
  validation?: FieldValidationState;
  'data-testid'?: string;
  disabled?: boolean;
  error?: string;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  countryCode,
  validation,
  'data-testid': testId,
  disabled = false,
  error
}) => {
  const country = getCountryByCode(countryCode);

  // Validate phone number length
  const validatePhoneLength = (phoneValue: string): string | null => {
    if (!phoneValue) return null;

    const digits = phoneValue.replace(/\D/g, '');

    if (!digits) return null;

    if (country?.maxLength) {
      if (digits.length < country.maxLength) {
        return `El número debe tener ${country.maxLength} dígitos (tiene ${digits.length})`;
      }
      if (digits.length > country.maxLength) {
        return `El número excede los ${country.maxLength} dígitos permitidos`;
      }
    }

    return null;
  };

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');

    // Apply country-specific formatting
    if (country?.phoneFormat) {
      let formatted = '';
      let digitIndex = 0;

      for (let i = 0; i < country.phoneFormat.length && digitIndex < digits.length; i++) {
        const formatChar = country.phoneFormat[i];
        if (formatChar === '#') {
          formatted += digits[digitIndex];
          digitIndex++;
        } else {
          formatted += formatChar;
        }
      }

      return formatted;
    }

    return digits;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');

    // Respect max length if defined
    if (country?.maxLength && digits.length > country.maxLength) {
      return;
    }

    const formatted = formatPhoneNumber(input);
    onChange(formatted);
  };

  const getPlaceholder = (): string => {
    if (country?.phoneFormat) {
      return country.phoneFormat.replace(/#/g, '0');
    }
    return 'Número de teléfono';
  };

  const getValidationIcon = () => {
    if (validation?.isValidating) {
      return (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
        </div>
      );
    }

    // Show success only if length is also valid
    if (validation?.isValid === true && !lengthError) {
      return (
        <div className="absolute right-3 top-3">
          <svg className="w-4 h-4 text-vitalgo-green" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    // Show error if validation failed or length is invalid
    if (validation?.isValid === false || lengthError) {
      return (
        <div className="absolute right-3 top-3">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    return null;
  };

  const hasValidationIcon = validation && (validation.isValidating || validation.isValid !== null);
  const lengthError = validatePhoneLength(value);
  const finalError = error || validation?.error || lengthError;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        Número de teléfono
        <span className="text-red-500 ml-1">*</span>
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={getPlaceholder()}
          disabled={disabled}
          data-testid={testId}
          className={`
            w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors
            ${hasValidationIcon ? 'pr-10' : ''}
            ${finalError
              ? 'border-red-300 focus:ring-red-500'
              : validation?.isValid === true
                ? 'border-vitalgo-green focus:ring-vitalgo-green/20'
                : 'border-gray-300 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
          `}
          maxLength={country?.phoneFormat?.length || undefined}
          autoComplete="tel"
          aria-describedby={
            finalError ? `${testId}-error` :
            country?.phoneFormat ? `${testId}-format` :
            undefined
          }
          aria-invalid={!!finalError}
        />

        {getValidationIcon()}
      </div>

      {/* Error message */}
      {finalError && (
        <p
          id={`${testId}-error`}
          className="text-sm text-red-600"
          data-testid={`${testId}-error`}
          role="alert"
        >
          {finalError}
        </p>
      )}

      {/* Format hint */}
      {country?.phoneFormat && !finalError && (
        <p
          id={`${testId}-format`}
          className="text-xs text-gray-500"
          data-testid={`${testId}-format-hint`}
        >
          Formato: {country.phoneFormat.replace(/#/g, '0')}
          {country.maxLength && (
            <span className="ml-2">
              ({value.replace(/\D/g, '').length}/{country.maxLength} dígitos)
            </span>
          )}
        </p>
      )}

      {/* Validation success message */}
      {validation?.isValid === true && !finalError && !lengthError && (
        <p className="text-sm text-vitalgo-green" data-testid={`${testId}-success`}>
          ✓ Número válido
        </p>
      )}
    </div>
  );
};