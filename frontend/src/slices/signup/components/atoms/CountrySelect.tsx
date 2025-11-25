'use client';
/**
 * CountrySelect component for selecting country of origin
 */
import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Country } from '../../data/countries';
import { ChevronDown, Search } from 'lucide-react';
import { CountryFlag } from '../../../../shared/components/atoms/CountryFlag';

interface CountrySelectProps {
  value: string; // Country code (e.g., "CO")
  onChange: (country: Country) => void;
  countries: Country[]; // Countries list passed as prop
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  isLoading?: boolean;
  'data-testid'?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  countries,
  placeholder,
  label,
  error,
  required = false,
  isLoading = false,
  'data-testid': testId
}) => {
  const t = useTranslations('signup');
  const tCommon = useTranslations('common');

  const displayPlaceholder = placeholder || tCommon('selectOption');
  const displayLabel = label || t('originCountry');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedCountry = countries.find(c => c.code === value);

  // Update filtered countries when countries prop or search term changes
  useEffect(() => {
    const filtered = countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchTerm, countries]);

  // Handle click outside to close dropdown
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCountrySelect = (country: Country) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (!newIsOpen) {
      setSearchTerm('');
    } else {
      // Calculate if there's enough space below for the dropdown
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 300; // Approximate height of dropdown (search + max-h-48)
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // If not enough space below but enough above, open upward
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    }
  };

  return (
    <div className="space-y-2" data-testid={testId}>
      {/* Label */}
      {displayLabel && (
        <label className="block text-sm font-medium text-gray-700">
          {displayLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Dropdown container */}
      <div className="relative" ref={dropdownRef}>
        {/* Select button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          disabled={isLoading}
          className={`
            relative w-full bg-white border rounded-lg px-3 py-3 text-left cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          data-testid={`${testId}-button`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isLoading ? (
                <span className="text-gray-500">{t('messages.loadingCountries')}</span>
              ) : selectedCountry ? (
                <>
                  <CountryFlag countryCode={selectedCountry.code} size="lg" />
                  <span className="text-gray-900">{selectedCountry.name}</span>
                </>
              ) : (
                <span className="text-gray-500">{displayPlaceholder}</span>
              )}
            </div>
            <ChevronDown
              className={`size-5 text-gray-400 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            className={`
              absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden
              ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
            `}
          >
            {/* Search input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('messages.searchCountry')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid={`${testId}-search`}
                />
              </div>
            </div>

            {/* Countries list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-3
                      ${value === country.code ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}
                    `}
                    data-testid={`${testId}-option-${country.code}`}
                  >
                    <CountryFlag countryCode={country.code} size="md" />
                    <span>{country.name}</span>
                    {value === country.code && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-center">
                  {t('messages.noCountriesFound')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600" data-testid={`${testId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};