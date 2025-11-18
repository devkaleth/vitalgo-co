/**
 * Profile Types
 * Type definitions for profile slice components
 */

// Tab identifiers
export type ProfileTab = 'basic' | 'personal' | 'medical' | 'gynecological';

// Tab configuration
export interface TabConfig {
  id: ProfileTab;
  label: string;
  testId: string;
}

// Basic information interfaces (from signup) - Aligned with database schema
export interface BasicPatientInfo {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phoneInternational: string;
  birthDate: string;
  originCountry: string;
  birthCountry?: string;       // From database: birth_country field
  residenceCountry?: string;   // From database: residence_country field
  countryCode: string;
  dialCode?: string;      // From database: dial_code field
  phoneNumber?: string;   // From database: phone_number field
  email: string;
}

// Basic information update interface
export interface BasicPatientUpdate {
  firstName?: string;
  lastName?: string;
  documentType?: string;
  documentNumber?: string;
  phoneInternational?: string;
  birthDate?: string;
  originCountry?: string;
  birthCountry?: string;       // From database: birth_country field
  residenceCountry?: string;   // From database: residence_country field
  countryCode?: string;
  dialCode?: string;      // From database: dial_code field
  phoneNumber?: string;   // From database: phone_number field
  email?: string;
}

// Hook result interfaces
export interface UseBasicPatientInfoResult {
  basicInfo: BasicPatientInfo | null;
  loading: boolean;
  error: string | null;
  updateBasicInfo: (data: BasicPatientUpdate) => Promise<{ success: boolean; message: string }>;
  refetch: () => Promise<void>;
}

// Tab component props
export interface TabContentProps {
  'data-testid'?: string;
}

// Tab navigation props
export interface TabNavigationProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  biologicalSex?: string | null;
  'data-testid'?: string;
}

// Re-export types from other modules
export * from './personalInfo';
export * from './gynecologicalInfo';