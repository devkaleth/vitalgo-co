'use client';
/**
 * Country Code Select with flag emojis
 * Dropdown component for selecting country with visual flag display
 * Shared component for use across multiple slices
 */
import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { countries as defaultCountries, Country, searchCountries, getDefaultCountry } from '../../../slices/signup/data/countries';

interface CountryCodeSelectProps {
  id: string;
  name: string;
  value: string; // country code (e.g., "CO", "US")
  onChange: (country: Country) => void;
  onBlur?: () => void;
  'data-testid'?: string;
  disabled?: boolean;
  error?: string;
  countries?: Country[]; // Optional: provide custom countries list (e.g., from API)
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  'data-testid': testId,
  disabled = false,
  error,
  countries: customCountries
}) => {
  const t = useTranslations('phone.countryCode');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use custom countries if provided, otherwise use default
  const countries = customCountries || defaultCountries;

  const selectedCountry = countries.find(c => c.code === value) || getDefaultCountry();

  // Search in the countries list (custom or default)
  const filteredCountries = searchTerm
    ? countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dialCode.includes(searchTerm) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : countries;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleSelect = (country: Country) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm('');
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && !isOpen) {
      handleToggle();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {t('label')}
        <span className="text-red-500 ml-1">*</span>
      </label>

      {/* Main trigger button with flag */}
      <button
        type="button"
        id={id}
        data-testid={testId}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
          transition-colors flex items-center justify-between bg-white text-left
          ${disabled
            ? 'bg-gray-100 cursor-not-allowed text-gray-500'
            : 'hover:border-gray-400 cursor-pointer'
          }
          ${error
            ? 'border-red-300 focus:ring-red-500'
            : isOpen
              ? 'border-blue-500 ring-2 ring-blue-500'
              : 'border-gray-300 focus:ring-blue-500'
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('selectedCountry', { country: selectedCountry.name })}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Flag emoji */}
          <span
            className="text-2xl flex-shrink-0"
            role="img"
            aria-label={t('flagOf', { country: selectedCountry.name })}
          >
            {selectedCountry.flag}
          </span>

          {/* Country info */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 text-sm">
                {selectedCountry.dialCode}
              </span>
              <span className="text-sm text-gray-600 truncate">
                {selectedCountry.name}
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600" data-testid={`${testId}-error`}>
          {error}
        </p>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label={t('searchLabel')}
            />
          </div>

          {/* Countries list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              <ul role="listbox" className="divide-y divide-gray-100">
                {filteredCountries.map((country) => (
                  <li
                    key={country.code}
                    role="option"
                    aria-selected={country.code === selectedCountry.code}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(country)}
                      className={`
                        w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50
                        transition-colors text-left focus:outline-none focus:bg-gray-50
                        ${country.code === selectedCountry.code
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-900'
                        }
                      `}
                      aria-label={t('selectCountry', { country: country.name, dialCode: country.dialCode })}
                    >
                      {/* Flag emoji */}
                      <span
                        className="text-xl flex-shrink-0"
                        role="img"
                        aria-label={t('flagOf', { country: country.name })}
                      >
                        {country.flag}
                      </span>

                      {/* Country info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">
                            {country.name}
                          </span>
                          <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                            {country.dialCode}
                          </span>
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {country.code === selectedCountry.code && (
                        <svg
                          className="w-4 h-4 text-blue-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                <span>{t('noResults')}</span>
                {searchTerm && (
                  <p className="mt-1">
                    {t('noResultsFor', { searchTerm })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};