/**
 * Date Input atom component for birth date with i18n support
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LocalizedDatePicker } from '@/shared/components/atoms/LocalizedDatePicker';

interface DateInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  autocomplete?: string;
  'data-testid'?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  required = false,
  error,
  'data-testid': testId
}) => {
  const t = useTranslations('signup');

  // Calculate max date (18 years ago) and min date (120 years ago)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

  // Convert string value to Date for the picker
  const selectedDate = value ? new Date(value) : null;

  // Handle date change from picker - convert back to string for form
  const handleDateChange = (date: Date | null) => {
    const dateString = date ? date.toISOString().split('T')[0] : '';
    // Create a synthetic event to maintain compatibility with form handling
    const syntheticEvent = {
      target: {
        name,
        value: dateString,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Handle blur
  const handleBlur = () => {
    if (onBlur) {
      const syntheticEvent = {
        target: { name, value },
      } as React.FocusEvent<HTMLInputElement>;
      onBlur(syntheticEvent);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <LocalizedDatePicker
        id={id}
        name={name}
        selected={selectedDate}
        onChange={handleDateChange}
        onBlur={handleBlur}
        minDate={minDate}
        maxDate={maxDate}
        error={!!error}
        data-testid={testId}
      />

      {error && (
        <p className="text-sm text-red-600" data-testid={`${testId}-error`}>
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500">
        {t('ageRequirement')}
      </p>
    </div>
  );
};
