/**
 * Utility functions for formatting and processing personal information data
 */
import { PersonalPatientInfo } from '../types/personalInfo';

/**
 * Display translations interface for profile values
 */
export interface DisplayTranslations {
  notSpecified: string;
  notSpecifiedFemale: string;
  biologicalSex: Record<string, string>;
  gender: Record<string, string>;
}

/**
 * Missing fields translations interface
 */
export interface MissingFieldsTranslations {
  biologicalSex: string;
  gender: string;
  birthCountry: string;
  residenceAddress: string;
  birthDepartment: string;
  birthCity: string;
  residenceDepartment: string;
  residenceCity: string;
}

/**
 * Default Spanish translations for backwards compatibility
 */
const defaultDisplayTranslations: DisplayTranslations = {
  notSpecified: 'No especificado',
  notSpecifiedFemale: 'No especificada',
  biologicalSex: {
    'M': 'Masculino',
    'F': 'Femenino',
    'I': 'Intersexual'
  },
  gender: {
    'MASCULINO': 'Masculino',
    'FEMENINO': 'Femenino',
    'NO_BINARIO': 'No binario',
    'OTRO': 'Otro',
    'PREFIERO_NO_DECIR': 'Prefiero no decir'
  }
};

const defaultMissingFieldsTranslations: MissingFieldsTranslations = {
  biologicalSex: 'Sexo biológico',
  gender: 'Género',
  birthCountry: 'País de nacimiento',
  residenceAddress: 'Dirección de residencia',
  birthDepartment: 'Departamento de nacimiento',
  birthCity: 'Ciudad de nacimiento',
  residenceDepartment: 'Departamento de residencia',
  residenceCity: 'Ciudad de residencia'
};

/**
 * Format biological sex for display
 */
export const formatBiologicalSex = (sex?: string, translations?: DisplayTranslations): string => {
  const t = translations || defaultDisplayTranslations;
  if (!sex) return t.notSpecified;

  return t.biologicalSex[sex] || sex;
};

/**
 * Format gender for display
 */
export const formatGender = (gender?: string, translations?: DisplayTranslations): string => {
  const t = translations || defaultDisplayTranslations;
  if (!gender) return t.notSpecified;

  return t.gender[gender] || gender;
};

/**
 * Format country with flag emoji
 */
export const formatCountryWithFlag = (country?: string, notSpecified: string = 'No especificado'): string => {
  if (!country) return notSpecified;

  const countryFlags: Record<string, string> = {
    'Colombia': '🇨🇴',
    'Venezuela': '🇻🇪',
    'Ecuador': '🇪🇨',
    'Perú': '🇵🇪',
    'Brasil': '🇧🇷',
    'Argentina': '🇦🇷',
    'Chile': '🇨🇱',
    'Uruguay': '🇺🇾',
    'Paraguay': '🇵🇾',
    'Bolivia': '🇧🇴',
    'Estados Unidos': '🇺🇸',
    'México': '🇲🇽',
    'España': '🇪🇸',
    'Francia': '🇫🇷',
    'Italia': '🇮🇹',
    'Reino Unido': '🇬🇧',
    'Alemania': '🇩🇪',
    'Canadá': '🇨🇦'
  };

  const flag = countryFlags[country] || '🏳️';
  return `${flag} ${country}`;
};

/**
 * Format birth location (country + department + city if Colombia)
 */
export const formatBirthLocation = (info: PersonalPatientInfo, notSpecified: string = 'No especificado'): string => {
  if (!info.birth_country) return notSpecified;

  // Check if birth country is Colombia (either code 'CO' or full name 'Colombia')
  const isColombia = info.birth_country === 'CO' || info.birth_country === 'Colombia';

  // Map country code to name if it's a code
  const countryMap: Record<string, string> = {
    'CO': 'Colombia',
    'AR': 'Argentina',
    'MX': 'México',
    'US': 'Estados Unidos',
    'BR': 'Brasil',
    'CL': 'Chile',
    'PE': 'Perú',
    'EC': 'Ecuador',
    'VE': 'Venezuela',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'BO': 'Bolivia',
    'CA': 'Canadá',
    'ES': 'España',
    'FR': 'Francia',
    'IT': 'Italia',
    'DE': 'Alemania',
    'GB': 'Reino Unido'
  };

  const countryName = countryMap[info.birth_country] || info.birth_country;

  // For Colombia with department and city, show full location
  if (isColombia && info.birth_department && info.birth_city) {
    return `${formatCountryWithFlag(countryName)} - ${info.birth_department}, ${info.birth_city}`;
  }

  return formatCountryWithFlag(countryName);
};

/**
 * Format residence location
 */
export const formatResidenceLocation = (info: PersonalPatientInfo, notSpecified: string = 'No especificado'): string => {
  // If residence country is not specified, return "Not specified"
  if (!info.residence_country) return notSpecified;

  // For Colombia, show department and city if available
  if (info.residence_country === 'CO' || info.residence_country === 'Colombia') {
    if (info.residence_department && info.residence_city) {
      return `${formatCountryWithFlag('Colombia')} - ${info.residence_department}, ${info.residence_city}`;
    }
    // If Colombian residence but missing department/city, show just Colombia
    return formatCountryWithFlag('Colombia');
  }

  // For other countries, map country code to name and show with flag
  const countryMap: Record<string, string> = {
    'AR': 'Argentina',
    'MX': 'México',
    'US': 'Estados Unidos',
    'BR': 'Brasil',
    'CL': 'Chile',
    'PE': 'Perú',
    'EC': 'Ecuador',
    'VE': 'Venezuela',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'BO': 'Bolivia',
    'CA': 'Canadá',
    'ES': 'España',
    'FR': 'Francia',
    'IT': 'Italia',
    'DE': 'Alemania',
    'GB': 'Reino Unido'
  };

  const countryName = countryMap[info.residence_country] || info.residence_country;
  return formatCountryWithFlag(countryName);
};

/**
 * Format residence address for display
 */
export const formatResidenceAddress = (address?: string, notSpecified: string = 'No especificada'): string => {
  if (!address) return notSpecified;

  // Truncate long addresses for card display
  if (address.length > 50) {
    return `${address.substring(0, 47)}...`;
  }

  return address;
};

/**
 * Calculate personal information completion percentage
 */
export const getPersonalInfoCompleteness = (info: PersonalPatientInfo): number => {
  const requiredFields = [
    'biological_sex',
    'gender',
    'birth_country',
    'residence_address'
  ];

  // Add birth department and city as required if birth country is Colombia
  const fieldsToCheck = [...requiredFields];
  if (info.birth_country === 'Colombia') {
    fieldsToCheck.push('birth_department', 'birth_city');
  }

  // Add residence department and city as required only if residence country is Colombia
  if (info.residence_country === 'CO' || info.residence_country === 'Colombia') {
    fieldsToCheck.push('residence_department', 'residence_city');
  }

  const completedFields = fieldsToCheck.filter(field => {
    const value = info[field as keyof PersonalPatientInfo];
    return value && value.trim().length > 0;
  });

  return Math.round((completedFields.length / fieldsToCheck.length) * 100);
};

/**
 * Check if personal information is complete
 */
export const isPersonalInfoComplete = (info: PersonalPatientInfo): boolean => {
  return getPersonalInfoCompleteness(info) === 100;
};

/**
 * Get missing required fields
 */
export const getMissingPersonalInfoFields = (info: PersonalPatientInfo, translations?: MissingFieldsTranslations): string[] => {
  const t = translations || defaultMissingFieldsTranslations;
  const missing: string[] = [];

  if (!info.biological_sex) missing.push(t.biologicalSex);
  if (!info.gender) missing.push(t.gender);
  if (!info.birth_country) missing.push(t.birthCountry);
  if (!info.residence_address) missing.push(t.residenceAddress);

  // Add birth location fields if Colombia is selected
  if (info.birth_country === 'Colombia') {
    if (!info.birth_department) missing.push(t.birthDepartment);
    if (!info.birth_city) missing.push(t.birthCity);
  }

  // Add residence location fields only if Colombia is selected
  if (info.residence_country === 'CO' || info.residence_country === 'Colombia') {
    if (!info.residence_department) missing.push(t.residenceDepartment);
    if (!info.residence_city) missing.push(t.residenceCity);
  }

  return missing;
};

/**
 * Format demographic data for display cards
 */
export const formatDemographicData = (info: PersonalPatientInfo, translations?: DisplayTranslations) => {
  const t = translations || defaultDisplayTranslations;
  return {
    biologicalSex: formatBiologicalSex(info.biological_sex, translations),
    gender: formatGender(info.gender, translations),
    birthLocation: formatBirthLocation(info, t.notSpecified)
  };
};

/**
 * Format residence data for display cards
 */
export const formatResidenceData = (info: PersonalPatientInfo, translations?: DisplayTranslations) => {
  const t = translations || defaultDisplayTranslations;
  return {
    address: formatResidenceAddress(info.residence_address, t.notSpecifiedFemale),
    location: formatResidenceLocation(info, t.notSpecified),
    fullAddress: info.residence_address || t.notSpecifiedFemale
  };
};