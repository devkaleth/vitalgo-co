/**
 * Document types helper
 * Determines which document types to show based on selected country
 */

// European Union countries (use DNI)
const EU_COUNTRIES = [
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
];

// Non-EU European countries (also use DNI or national ID)
const OTHER_EUROPEAN_COUNTRIES = [
  'AL', // Albania
  'AD', // Andorra
  'AM', // Armenia
  'BY', // Belarus
  'BA', // Bosnia and Herzegovina
  'GE', // Georgia
  'IS', // Iceland
  'XK', // Kosovo
  'LI', // Liechtenstein
  'MD', // Moldova
  'MC', // Monaco
  'ME', // Montenegro
  'MK', // North Macedonia
  'NO', // Norway
  'RU', // Russia
  'SM', // San Marino
  'RS', // Serbia
  'CH', // Switzerland
  'TR', // Turkey
  'UA', // Ukraine
  'GB', // United Kingdom
  'VA', // Vatican City
  'AZ', // Azerbaijan (transcontinental)
  'KZ', // Kazakhstan (transcontinental)
];

// All European countries (EU + non-EU)
const ALL_EUROPEAN_COUNTRIES = [
  ...EU_COUNTRIES,
  ...OTHER_EUROPEAN_COUNTRIES
];

// Other countries that use DNI (Latin America)
const LATIN_AMERICAN_DNI_COUNTRIES = [
  'AR', // Argentina
  'BO', // Bolivia
  'CL', // Chile
  'EC', // Ecuador
  'PY', // Paraguay
  'PE', // Peru
  'UY', // Uruguay
  'VE', // Venezuela
  'MX', // Mexico
];

// All countries that use DNI
const DNI_COUNTRIES = [
  ...ALL_EUROPEAN_COUNTRIES,
  ...LATIN_AMERICAN_DNI_COUNTRIES
];

/**
 * Get allowed document types for a given country
 * @param countryCode - ISO 2-letter country code
 * @returns Array of document type codes
 */
export function getAllowedDocumentTypes(countryCode: string): string[] {
  if (!countryCode) {
    // Default: DNI and Passport
    return ['DNI', 'PA'];
  }

  // Colombia: CC (Cédula de Ciudadanía) + Passport
  if (countryCode === 'CO') {
    return ['CC', 'PA'];
  }

  // Countries that use DNI: DNI + Passport
  if (DNI_COUNTRIES.includes(countryCode.toUpperCase())) {
    return ['DNI', 'PA'];
  }

  // All other countries: DNI + Passport (default)
  return ['DNI', 'PA'];
}

/**
 * Check if a country uses DNI
 */
export function usesDNI(countryCode: string): boolean {
  return DNI_COUNTRIES.includes(countryCode.toUpperCase());
}

/**
 * Check if a country is in Europe (EU or non-EU)
 */
export function isEuropeanCountry(countryCode: string): boolean {
  return ALL_EUROPEAN_COUNTRIES.includes(countryCode.toUpperCase());
}

/**
 * Check if a country is in the European Union
 */
export function isEUCountry(countryCode: string): boolean {
  return EU_COUNTRIES.includes(countryCode.toUpperCase());
}
