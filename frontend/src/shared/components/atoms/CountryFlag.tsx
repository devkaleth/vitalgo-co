/**
 * CountryFlag component using flag-icons CSS library
 * Provides cross-platform flag display (works on Windows, macOS, Linux)
 */
import React from 'react';

interface CountryFlagProps {
  countryCode: string;  // ISO 3166-1 alpha-2 code (e.g., "CO", "US")
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Map non-standard codes to flag-icons codes
const FLAG_CODE_MAP: Record<string, string> = {
  'XS': 'gb-sct',  // Scotland
  'XW': 'gb-wls',  // Wales
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  size = 'md',
  className = ''
}) => {
  // Guard against empty/undefined country codes
  if (!countryCode) {
    return null;
  }

  // Map special codes or use lowercase standard code
  const flagCode = FLAG_CODE_MAP[countryCode.toUpperCase()] || countryCode.toLowerCase();

  // Size class mapping for flag-icons
  // sm: default (1em), md: fi-lg (1.33em), lg: fi-xl (2em)
  const sizeClass = size === 'lg' ? 'fi-xl' : size === 'sm' ? '' : 'fi-lg';

  return (
    <span
      className={`fi fi-${flagCode} ${sizeClass} ${className}`.trim()}
      role="img"
      aria-label={`Flag of ${countryCode.toUpperCase()}`}
    />
  );
};
