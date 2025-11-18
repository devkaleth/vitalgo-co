/**
 * Custom hook for medication form state management and validation
 * Handles form data, validation, and submission logic
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { MedicationFormData, UseMedicationFormResult, MedicationFormErrors } from '../types';

interface UseMedicationFormProps {
  initialData?: Partial<MedicationFormData>;
  onSubmit: (data: MedicationFormData) => Promise<void>;
  onCancel?: () => void;
}

const defaultFormData: MedicationFormData = {
  medicationName: '',
  dosage: '',
  frequency: '',
  startDate: new Date().toISOString().split('T')[0], // Today's date
  endDate: '',
  prescribedBy: '',
  notes: '',
  isActive: true
};

export function useMedicationForm({
  initialData = {},
  onSubmit,
  onCancel
}: UseMedicationFormProps): UseMedicationFormResult {
  const [formData, setFormData] = useState<MedicationFormData>({
    ...defaultFormData,
    ...initialData
  });
  const [errors, setErrors] = useState<MedicationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(prev => ({
      ...defaultFormData,
      ...initialData
    }));
  }, [initialData]);

  // Validation rules
  const validateField = useCallback((field: keyof MedicationFormData, value: string | boolean): string | null => {
    switch (field) {
      case 'medicationName':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'El nombre del medicamento es requerido';
        }
        if (typeof value === 'string' && value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        if (typeof value === 'string' && value.trim().length > 200) {
          return 'El nombre no puede exceder 200 caracteres';
        }
        break;

      case 'dosage':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'La dosis es requerida';
        }
        if (typeof value === 'string' && value.trim().length > 100) {
          return 'La dosis no puede exceder 100 caracteres';
        }
        break;

      case 'frequency':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'La frecuencia es requerida';
        }
        if (typeof value === 'string' && value.trim().length > 100) {
          return 'La frecuencia no puede exceder 100 caracteres';
        }
        break;

      case 'startDate':
        // Start date is now optional
        if (value && typeof value === 'string' && value.trim()) {
          const startDate = new Date(value);
          const today = new Date();
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(today.getFullYear() + 1);

          if (startDate > oneYearFromNow) {
            return 'La fecha de inicio no puede ser más de un año en el futuro';
          }
        }
        break;

      case 'endDate':
        if (value && typeof value === 'string' && value.trim()) {
          const endDate = new Date(value);
          // Only validate against start date if start date is provided
          if (formData.startDate && formData.startDate.trim()) {
            const startDate = new Date(formData.startDate);
            if (endDate <= startDate) {
              return 'La fecha de fin debe ser posterior a la fecha de inicio';
            }
          }
        }
        break;

      case 'prescribedBy':
        if (value && typeof value === 'string' && value.trim().length > 200) {
          return 'El nombre del doctor no puede exceder 200 caracteres';
        }
        break;

      case 'notes':
        if (value && typeof value === 'string' && value.trim().length > 1000) {
          return 'Las notas no pueden exceder 1000 caracteres';
        }
        break;
    }

    return null;
  }, [formData.startDate]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: MedicationFormErrors = {};

    (Object.keys(formData) as Array<keyof MedicationFormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Handle input change
  const handleInputChange = useCallback((field: keyof MedicationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Re-validate dependent fields
    if (field === 'startDate' && formData.endDate) {
      const endDateError = validateField('endDate', formData.endDate);
      if (endDateError) {
        setErrors(prev => ({ ...prev, endDate: endDateError }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.endDate;
          return newErrors;
        });
      }
    }
  }, [errors, formData.endDate, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    console.log('📝 useMedicationForm: Form submission started');

    if (!validateForm()) {
      console.warn('⚠️ useMedicationForm: Form validation failed');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('📝 useMedicationForm: Submitting form data:', formData);

      await onSubmit(formData);
      console.log('✅ useMedicationForm: Form submitted successfully');

      // Reset form on successful submission if no initial data (create mode)
      if (!initialData || Object.keys(initialData).length === 0) {
        resetForm();
      }
    } catch (error) {
      console.error('❌ useMedicationForm: Form submission error:', error);
      // Don't clear the form on error, let user retry
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, validateForm, onSubmit, initialData]);

  // Reset form to default values
  const resetForm = useCallback(() => {
    console.log('🔄 useMedicationForm: Resetting form');
    setFormData({ ...defaultFormData });
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // Set form data (for external control)
  const setFormDataExternal = useCallback((data: Partial<MedicationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0 &&
                  formData.medicationName.trim() !== '' &&
                  formData.dosage.trim() !== '' &&
                  formData.frequency.trim() !== '';

  return {
    formData,
    errors,
    isValid,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    resetForm,
    setFormData: setFormDataExternal
  };
}