'use client';

import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es, enUS } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/datepicker.css';

// Register locales
registerLocale('es', es);
registerLocale('en', enUS);

interface LocalizedDatePickerProps {
  id?: string;
  name?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  onBlur?: () => void;
  minDate?: Date;
  maxDate?: Date;
  placeholderText?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  'data-testid'?: string;
}

export function LocalizedDatePicker({
  id,
  name,
  selected,
  onChange,
  onBlur,
  minDate,
  maxDate,
  placeholderText,
  className = '',
  error = false,
  disabled = false,
  'data-testid': testId,
}: LocalizedDatePickerProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'es';

  // Format based on locale
  const dateFormat = locale === 'es' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';

  // Placeholder based on locale
  const defaultPlaceholder = locale === 'es' ? 'dd/mm/aaaa' : 'mm/dd/yyyy';

  return (
    <DatePicker
      id={id}
      name={name}
      selected={selected}
      onChange={onChange}
      onBlur={onBlur}
      locale={locale}
      dateFormat={dateFormat}
      placeholderText={placeholderText || defaultPlaceholder}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      yearDropdownItemNumber={100}
      scrollableYearDropdown
      autoComplete="off"
      className={`
        w-full px-4 py-3 border rounded-lg
        focus:outline-none focus:ring-2 transition-colors
        ${error
          ? 'border-red-300 focus:ring-red-500'
          : 'border-gray-300 focus:ring-vitalgo-green focus:border-vitalgo-green'
        }
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        ${className}
      `}
      calendarClassName="vitalgo-datepicker"
      data-testid={testId}
    />
  );
}
