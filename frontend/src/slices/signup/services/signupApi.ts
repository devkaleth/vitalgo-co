/**
 * API service for signup operations
 * Note: Uses direct fetch for public endpoints (no authentication required)
 */
import { DocumentType, PatientRegistrationForm, ValidationResult, RegistrationResponse } from '../types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/signup`;

// Error class for consistent error handling
class SignupApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'SignupApiError';
  }
}

// Handle API response with consistent error handling
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
    throw new SignupApiError(response.status, errorMessage);
  }
  return response.json();
};

export class SignupApiService {
  static async getDocumentTypes(): Promise<DocumentType[]> {
    try {
      console.log('📝 SignupAPI: Fetching document types');

      const response = await fetch(`${API_BASE_URL}/document-types`);
      const data = await handleResponse<DocumentType[]>(response);

      console.log('✅ SignupAPI: Document types fetched successfully');
      return data;
    } catch (error) {
      console.error('❌ Error fetching document types:', error);
      if (error instanceof SignupApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch document types');
    }
  }

  static async validateDocument(documentNumber: string, documentType: string): Promise<ValidationResult> {
    try {
      console.log('🔍 SignupAPI: Validating document:', documentType, documentNumber);

      const response = await fetch(
        `${API_BASE_URL}/validate-document?document_number=${encodeURIComponent(documentNumber)}&document_type=${encodeURIComponent(documentType)}`,
        { method: 'POST' }
      );

      const data = await handleResponse<ValidationResult>(response);

      console.log('✅ SignupAPI: Document validation completed');
      return data;
    } catch (error) {
      console.error('❌ Error validating document:', error);
      if (error instanceof SignupApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to validate document');
    }
  }

  static async validateEmail(email: string): Promise<ValidationResult> {
    try {
      console.log('🔍 SignupAPI: Validating email:', email);

      const response = await fetch(
        `${API_BASE_URL}/validate-email?email=${encodeURIComponent(email)}`,
        { method: 'POST' }
      );

      const data = await handleResponse<ValidationResult>(response);

      console.log('✅ SignupAPI: Email validation completed');
      return data;
    } catch (error) {
      console.error('❌ Error validating email:', error);
      if (error instanceof SignupApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to validate email');
    }
  }

  static async registerPatient(formData: PatientRegistrationForm): Promise<RegistrationResponse> {
    try {
      console.log('📝 SignupAPI: Registering patient:', formData.email);

      const requestData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        document_type: formData.documentType,
        document_number: formData.documentNumber,
        phone_international: formData.phoneInternational,
        birth_date: formData.birthDate,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        accept_terms: formData.acceptTerms,
        accept_privacy: formData.acceptPrivacy,
        ...(formData.planId && { plan_id: formData.planId }), // Include plan_id if provided
      };

      const response = await fetch(`${API_BASE_URL}/patient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ SignupAPI: Registration failed:', data);
        return {
          success: false,
          message: data.detail?.message || 'Error en el registro',
          errors: data.detail?.errors || {}
        };
      }

      console.log('✅ SignupAPI: Patient registration successful');
      return data;
    } catch (error) {
      console.error('❌ Error registering patient:', error);
      return {
        success: false,
        message: 'Error en el registro',
        errors: {}
      };
    }
  }
}