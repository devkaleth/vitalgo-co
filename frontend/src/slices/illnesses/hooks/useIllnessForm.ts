/**
 * Custom hook for illness form state management and validation
 * Handles form data, validation, and submission logic
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { IllnessFormData, PatientIllnessDTO, UseIllnessFormResult, IllnessStatus } from '../types';

interface UseIllnessFormProps {
  initialData?: PatientIllnessDTO;
  onSubmit: (data: IllnessFormData) => Promise<void>;
}

type IllnessFormErrors = Partial<Record<keyof IllnessFormData, string>>;

const defaultFormData: IllnessFormData = {
  illnessName: '',
  diagnosisDate: '',
  status: 'activa' as IllnessStatus,
  isChronic: false,
  treatmentDescription: '',
  cie10Code: '',
  diagnosedBy: '',
  notes: '',
};

// Convert illness DTO to form data
const illnessToFormData = (illness: PatientIllnessDTO): IllnessFormData => ({
  illnessName: illness.illnessName,
  diagnosisDate: illness.diagnosisDate,
  status: illness.status,
  isChronic: illness.isChronic,
  treatmentDescription: illness.treatmentDescription || '',
  cie10Code: illness.cie10Code || '',
  diagnosedBy: illness.diagnosedBy || '',
  notes: illness.notes || '',
});

export function useIllnessForm({
  initialData,
  onSubmit
}: UseIllnessFormProps): UseIllnessFormResult {
  const [formData, setFormData] = useState<IllnessFormData>(() =>
    initialData ? illnessToFormData(initialData) : defaultFormData
  );
  const [errors, setErrors] = useState<IllnessFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(illnessToFormData(initialData));
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  // Validation rules
  const validateField = useCallback((field: keyof IllnessFormData, value: any): string | null => {
    switch (field) {
      case 'illnessName':
        if (!value || !value.toString().trim()) {
          return null; // No hardcoded required message, handled by form level validation
        }
        if (value.toString().trim().length > 200) {
          return 'El nombre no puede exceder 200 caracteres';
        }
        break;

      case 'diagnosisDate':
        if (!value || !value.toString().trim()) {
          return null; // No hardcoded required message, handled by form level validation
        }
        const date = new Date(value);
        const today = new Date();
        if (date > today) {
          return 'La fecha no puede ser futura';
        }
        break;

      case 'status':
        if (!value || !value.toString().trim()) {
          return null; // No hardcoded required message
        }
        break;

      case 'cie10Code':
        if (value && value.toString().trim().length > 10) {
          return 'El código CIE-10 no puede exceder 10 caracteres';
        }
        break;

      case 'diagnosedBy':
        if (value && value.toString().trim().length > 200) {
          return 'El campo "Diagnosticado por" no puede exceder 200 caracteres';
        }
        break;

      case 'treatmentDescription':
        if (value && value.toString().trim().length > 1000) {
          return 'La descripción del tratamiento no puede exceder 1000 caracteres';
        }
        break;

      case 'notes':
        if (value && value.toString().trim().length > 1000) {
          return 'Las notas no pueden exceder 1000 caracteres';
        }
        break;
    }

    return null;
  }, []);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: IllnessFormErrors = {};

    (Object.keys(formData) as Array<keyof IllnessFormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Handle input change
  const handleChange = useCallback((field: keyof IllnessFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    console.log('📝 useIllnessForm: Form submission started');

    if (!validateForm()) {
      console.warn('⚠️ useIllnessForm: Form validation failed');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('📝 useIllnessForm: Submitting form data:', formData.illnessName);

      await onSubmit(formData);
      console.log('✅ useIllnessForm: Form submitted successfully');

      // Reset form on successful submission if no initial data (create mode)
      if (!initialData) {
        resetForm();
      }
    } catch (error) {
      console.error('❌ useIllnessForm: Form submission error:', error);
      // Don't clear the form on error, let user retry
      throw error; // Re-throw to allow parent component to handle
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, validateForm, onSubmit, initialData]);

  // Reset form to default values
  const resetForm = useCallback(() => {
    console.log('🔄 useIllnessForm: Resetting form');
    setFormData({ ...defaultFormData });
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // Set form data (for external control)
  const setFormDataExternal = useCallback((data: Partial<IllnessFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // Check if form is valid (required fields + no errors)
  const isValid = Object.keys(errors).length === 0 &&
                  formData.illnessName.trim() !== '' &&
                  formData.status.trim() !== '';

  return {
    formData,
    errors,
    isValid,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData: setFormDataExternal
  };
}