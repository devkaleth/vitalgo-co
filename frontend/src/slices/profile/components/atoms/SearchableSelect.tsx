/**
 * SearchableSelect Atom Component
 * Searchable dropdown with support for "Otro" option, based on CountrySelect pattern
 */
import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Search } from 'lucide-react';
import { CountryFlag } from '../../../../shared/components/atoms/CountryFlag';

interface SelectOption {
  value: string;
  label: string;
  flag?: string;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  onOtherChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  hasOtherOption?: boolean;
  otherValue?: string;
  useCountryFlag?: boolean; // Use CSS-based CountryFlag instead of emoji
  'data-testid'?: string;
}

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  onOtherChange,
  placeholder,
  error,
  required = false,
  hasOtherOption = false,
  otherValue = '',
  useCountryFlag = false,
  'data-testid': testId
}: SearchableSelectProps) {
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const isOtherSelected = value === 'OTHER';

  // Filter options based on search term
  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className="w-full" data-testid={testId}>
      <label className="block text-sm font-medium text-vitalgo-dark mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative" ref={dropdownRef}>
        {/* Main Select Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`
            w-full px-3 py-2 text-left bg-white border rounded-lg focus:ring-2 focus:ring-vitalgo-green focus:border-vitalgo-green transition-colors duration-150
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${isOpen ? 'border-vitalgo-green ring-2 ring-vitalgo-green' : ''}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-describedby={error ? `${label}-error` : undefined}
        >
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${selectedOption || isOtherSelected ? 'text-vitalgo-dark' : 'text-gray-500'}`}>
              {selectedOption && (
                useCountryFlag ? (
                  <span className="mr-2"><CountryFlag countryCode={selectedOption.value} size="md" /></span>
                ) : (
                  selectedOption.flag && <span className="mr-2">{selectedOption.flag}</span>
                )
              )}
              <span>{selectedOption?.label || (isOtherSelected ? t('other') : (placeholder || t('selectOption')))}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-vitalgo-green focus:border-vitalgo-green"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150
                    ${value === option.value ? 'bg-vitalgo-green/10 text-vitalgo-green' : 'text-gray-900'}
                  `}
                >
                  <div className="flex items-center">
                    {useCountryFlag ? (
                      <span className="mr-2"><CountryFlag countryCode={option.value} size="md" /></span>
                    ) : (
                      option.flag && <span className="mr-2">{option.flag}</span>
                    )}
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}

              {/* "Otro" Option */}
              {hasOtherOption && (
                <button
                  type="button"
                  onClick={() => handleSelect('OTHER')}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150 border-t border-gray-200
                    ${value === 'OTHER' ? 'bg-vitalgo-green/10 text-vitalgo-green' : 'text-gray-900'}
                  `}
                >
                  <div className="flex items-center">
                    <span className="mr-2">🌍</span>
                    <span>{t('other')}</span>
                  </div>
                </button>
              )}

              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t('noResults')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* "Otro" Text Field */}
      {hasOtherOption && isOtherSelected && onOtherChange && (
        <div className="mt-3">
          <input
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder={t('specify')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalgo-green focus:border-vitalgo-green text-sm"
            aria-label={`${t('specify')} ${label.toLowerCase()}`}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p
          id={`${label}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}