/**
 * Utility functions for formatting and processing personal information data
 */
import { PersonalPatientInfo } from '../types/personalInfo';

/**
 * Format biological sex for display
 */
export const formatBiologicalSex = (sex?: string): string => {
  if (!sex) return 'No especificado';

  const sexMap: Record<string, string> = {
    'M': 'Masculino',
    'F': 'Femenino',
    'I': 'Intersexual'
  };

  return sexMap[sex] || sex;
};

/**
 * Format gender for display
 */
export const formatGender = (gender?: string): string => {
  if (!gender) return 'No especificado';

  const genderMap: Record<string, string> = {
    'MASCULINO': 'Masculino',
    'FEMENINO': 'Femenino',
    'NO_BINARIO': 'No binario',
    'OTRO': 'Otro',
    'PREFIERO_NO_DECIR': 'Prefiero no decir'
  };

  return genderMap[gender] || gender;
};

/**
 * Format country with flag emoji
 */
export const formatCountryWithFlag = (country?: string): string => {
  if (!country) return 'No especificado';

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
export const formatBirthLocation = (info: PersonalPatientInfo): string => {
  if (!info.birth_country) return 'No especificado';

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
export const formatResidenceLocation = (info: PersonalPatientInfo): string => {
  // If residence country is not specified, return "No especificado"
  if (!info.residence_country) return 'No especificado';

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
export const formatResidenceAddress = (address?: string): string => {
  if (!address) return 'No especificada';

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
export const getMissingPersonalInfoFields = (info: PersonalPatientInfo): string[] => {
  const missing: string[] = [];

  if (!info.biological_sex) missing.push('Sexo biológico');
  if (!info.gender) missing.push('Género');
  if (!info.birth_country) missing.push('País de nacimiento');
  if (!info.residence_address) missing.push('Dirección de residencia');

  // Add birth location fields if Colombia is selected
  if (info.birth_country === 'Colombia') {
    if (!info.birth_department) missing.push('Departamento de nacimiento');
    if (!info.birth_city) missing.push('Ciudad de nacimiento');
  }

  // Add residence location fields only if Colombia is selected
  if (info.residence_country === 'CO' || info.residence_country === 'Colombia') {
    if (!info.residence_department) missing.push('Departamento de residencia');
    if (!info.residence_city) missing.push('Ciudad de residencia');
  }

  return missing;
};

/**
 * Format demographic data for display cards
 */
export const formatDemographicData = (info: PersonalPatientInfo) => {
  return {
    biologicalSex: formatBiologicalSex(info.biological_sex),
    gender: formatGender(info.gender),
    birthLocation: formatBirthLocation(info)
  };
};

/**
 * Format residence data for display cards
 */
export const formatResidenceData = (info: PersonalPatientInfo) => {
  return {
    address: formatResidenceAddress(info.residence_address),
    location: formatResidenceLocation(info),
    fullAddress: info.residence_address || 'No especificada'
  };
};