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

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  size = 'md',
  className = ''
}) => {
  // Guard against empty/undefined country codes
  if (!countryCode) {
    return null;
  }

  // Size class mapping for flag-icons
  // sm: default (1em), md: fi-lg (1.33em), lg: fi-xl (2em)
  const sizeClass = size === 'lg' ? 'fi-xl' : size === 'sm' ? '' : 'fi-lg';

  return (
    <span
      className={`fi fi-${countryCode.toLowerCase()} ${sizeClass} ${className}`.trim()}
      role="img"
      aria-label={`Flag of ${countryCode.toUpperCase()}`}
    />
  );
};
