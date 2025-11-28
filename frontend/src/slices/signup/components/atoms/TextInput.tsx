/**
 * Text Input atom component with validation states
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FieldValidationState } from '../../types';

interface TextInputProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  validation?: FieldValidationState;
  required?: boolean;
  maxLength?: number;
  type?: 'text' | 'email' | 'tel';
  autocomplete?: string;
  'data-testid'?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  validation,
  required = false,
  maxLength,
  type = 'text',
  autocomplete,
  'data-testid': testId
}) => {
  const t = useTranslations('validation');

  const getInputClasses = () => {
    let classes = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors";

    if (validation?.isValidating) {
      classes += " border-blue-300 focus:ring-blue-500";
    } else if (validation?.isValid === true) {
      classes += " border-vitalgo-green focus:ring-vitalgo-green/20";
    } else if (validation?.isValid === false) {
      classes += " border-red-300 focus:ring-red-500";
    } else {
      classes += " border-gray-300 focus:ring-blue-500";
    }

    return classes;
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          autoComplete={autocomplete}
          className={getInputClasses()}
          data-testid={testId}
          required={required}
        />

        {/* Validation spinner */}
        {validation?.isValidating && (
          <div className="absolute right-3 top-3.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Success checkmark */}
        {validation?.isValid === true && (
          <div className="absolute right-3 top-3.5">
            <svg className="h-4 w-4 text-vitalgo-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Error X */}
        {validation?.isValid === false && (
          <div className="absolute right-3 top-3.5">
            <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Error message */}
      {validation?.error && (
        <p className="text-sm text-red-600" data-testid={`${testId}-error`}>
          {validation.error}
        </p>
      )}

      {/* Success message */}
      {validation?.isValid === true && !validation.error && (
        <p className="text-sm text-vitalgo-green">
          ✓ {t('valid')}
        </p>
      )}
    </div>
  );
};