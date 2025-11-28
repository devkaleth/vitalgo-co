/**
 * Personal Profile API service
 * Handles CRUD operations for personal patient information using unified apiClient
 */
import { PersonalPatientInfo, PersonalPatientUpdate } from '../types/personalInfo';
import { apiClient } from '../../../shared/services/apiClient';

class PersonalProfileAPIService {
  /**
   * Get personal patient information from profile endpoint
   */
  async getPersonalPatientInfo(): Promise<PersonalPatientInfo> {
    try {
      console.log('📊 Fetching personal patient info...');

      const response = await apiClient.get<any>('/profile/extended');
      const data = response.data;

      // Transform snake_case to camelCase - extract personal info fields including medical data
      const personalInfo: PersonalPatientInfo = {
        biological_sex: data.biological_sex,
        gender: data.gender,
        gender_other: data.gender_other,
        birth_country: data.birth_country,
        birth_country_other: data.birth_country_other,
        birth_department: data.birth_department,
        birth_city: data.birth_city,
        residence_address: data.residence_address,
        residence_country: data.residence_country,
        residence_country_other: data.residence_country_other,
        residence_department: data.residence_department,
        residence_city: data.residence_city,
        // Medical information fields
        eps: data.eps,
        eps_other: data.eps_other,
        occupation: data.occupation,
        additional_insurance: data.additional_insurance,
        complementary_plan: data.complementary_plan,
        complementary_plan_other: data.complementary_plan_other,
        blood_type: data.blood_type,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_relationship: data.emergency_contact_relationship,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_phone_alt: data.emergency_contact_phone_alt,
        // Gynecological information fields
        is_pregnant: data.is_pregnant,
        pregnancy_weeks: data.pregnancy_weeks,
        last_menstruation_date: data.last_menstruation_date,
        pregnancies_count: data.pregnancies_count,
        births_count: data.births_count,
        cesareans_count: data.cesareans_count,
        abortions_count: data.abortions_count,
        contraceptive_method: data.contraceptive_method,
        // Donor Preference (Voluntad de la Persona)
        organ_donor_preference: data.organ_donor_preference,
        authorized_decision_maker: data.authorized_decision_maker,
        // Physical Measurements
        height: data.height,
        weight: data.weight,
      };

      console.log('✅ Personal patient info loaded successfully:', personalInfo);
      return personalInfo;
    } catch (error) {
      console.error('❌ Error fetching personal patient info:', error);
      // Re-throw as standard Error for consistent error handling
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).status === 'number') {
        throw new Error((error as any).message);
      }
      throw error;
    }
  }

  /**
   * Update personal patient information
   */
  async updatePersonalPatientInfo(data: PersonalPatientUpdate): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📝 Updating personal patient info:', data);

      // Helper function to convert empty strings to null for date fields
      const sanitizeDate = (value: string | null | undefined): string | null => {
        if (!value || value.trim() === '') return null;
        return value;
      };

      // Data is already in snake_case format from our types - include medical fields
      const apiRequest = {
        biological_sex: data.biological_sex,
        gender: data.gender,
        gender_other: data.gender_other,
        birth_country: data.birth_country,
        birth_country_other: data.birth_country_other,
        birth_department: data.birth_department,
        birth_city: data.birth_city,
        residence_address: data.residence_address,
        residence_country: data.residence_country,
        residence_country_other: data.residence_country_other,
        residence_department: data.residence_department,
        residence_city: data.residence_city,
        // Medical information fields
        eps: data.eps,
        eps_other: data.eps_other,
        occupation: data.occupation,
        additional_insurance: data.additional_insurance,
        complementary_plan: data.complementary_plan,
        complementary_plan_other: data.complementary_plan_other,
        blood_type: data.blood_type,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_relationship: data.emergency_contact_relationship,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_phone_alt: data.emergency_contact_phone_alt,
        // Gynecological information fields - sanitize date fields to convert empty strings to null
        is_pregnant: data.is_pregnant,
        pregnancy_weeks: data.pregnancy_weeks,
        last_menstruation_date: sanitizeDate(data.last_menstruation_date),
        pregnancies_count: data.pregnancies_count,
        births_count: data.births_count,
        cesareans_count: data.cesareans_count,
        abortions_count: data.abortions_count,
        contraceptive_method: data.contraceptive_method,
        // Donor Preference (Voluntad de la Persona)
        organ_donor_preference: data.organ_donor_preference,
        authorized_decision_maker: data.authorized_decision_maker,
        // Physical Measurements
        height: data.height,
        weight: data.weight,
      };

      const response = await apiClient.put<{ success: boolean; message: string }>('/profile/complete', apiRequest);

      console.log('✅ Personal patient info updated successfully');
      return { success: true, message: 'Información actualizada exitosamente' };
    } catch (error) {
      console.error('❌ Error updating personal patient info:', error);
      // Re-throw as standard Error for consistent error handling
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).status === 'number') {
        throw new Error((error as any).message);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const personalProfileApi = new PersonalProfileAPIService();