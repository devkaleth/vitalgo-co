/**
 * TypeScript types for signup slice
 */

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  name_en: string | null;
  description: string;
}

export interface PatientRegistrationForm {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phoneInternational: string;
  birthDate: string;
  originCountry: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  planId?: number; // Optional selected subscription plan
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string;
  is_verified: boolean;
  profile_completed: boolean;
  mandatory_fields_completed: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  user_id?: string;
  patient_id?: string;
  qr_code?: string;

  // Auto-login tokens
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;

  // User information for frontend
  user?: UserResponse;

  // Navigation
  redirect_url?: string;

  // Error handling
  errors?: Record<string, string[]>;
}

export interface FieldValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
  feedback?: string;
}