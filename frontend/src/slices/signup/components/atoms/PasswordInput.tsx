'use client';
/**
 * Password Input atom component with strength indicator
 */
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  showStrengthIndicator?: boolean;
  autocomplete?: string;
  'data-testid'?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  showStrengthIndicator = false,
  autocomplete,
  'data-testid': testId
}) => {
  const t = useTranslations('password');
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score < 3) return { level: 'weak', color: 'bg-red-500', text: t('strength.weak') };
    if (score < 4) return { level: 'medium', color: 'bg-yellow-500', text: t('strength.medium') };
    return { level: 'strong', color: 'bg-vitalgo-green', text: t('strength.strong') };
  };

  const strength = getPasswordStrength(value);

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
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autocomplete}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          data-testid={testId}
          required={required}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          data-testid={`${testId}-toggle`}
        >
          {showPassword ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Password strength indicator */}
      {showStrengthIndicator && value && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${(Object.values({
                  length: value.length >= 8,
                  uppercase: /[A-Z]/.test(value),
                  lowercase: /[a-z]/.test(value),
                  number: /\d/.test(value),
                  special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value)
                }).filter(Boolean).length / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{strength.text}</span>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <p>{t('requirements.title')}</p>
            <ul className="space-y-0.5 ml-2">
              <li className={value.length >= 8 ? 'text-vitalgo-green' : 'text-red-500'}>
                • {t('requirements.minLength')}
              </li>
              <li className={/[A-Z]/.test(value) ? 'text-vitalgo-green' : 'text-red-500'}>
                • {t('requirements.uppercase')}
              </li>
              <li className={/[a-z]/.test(value) ? 'text-vitalgo-green' : 'text-red-500'}>
                • {t('requirements.lowercase')}
              </li>
              <li className={/\d/.test(value) ? 'text-vitalgo-green' : 'text-red-500'}>
                • {t('requirements.number')}
              </li>
              <li className={/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value) ? 'text-vitalgo-green' : 'text-red-500'}>
                • {t('requirements.special')}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};