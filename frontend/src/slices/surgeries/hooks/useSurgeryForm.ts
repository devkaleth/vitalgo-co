/**
 * useSurgeryForm hook
 * Manages surgery form state, validation, and submission with comprehensive error handling
 */

import { useState, useCallback, useEffect } from 'react';
import { SurgeryFormData, UseSurgeryFormResult, SurgeryFormErrors } from '../types';

// Default empty form data
const defaultFormData: SurgeryFormData = {
  procedureName: '',
  surgeryDate: '',
  hospitalName: '',
  surgeonName: '',
  anesthesiaType: '',
  durationHours: undefined,
  notes: '',
  complications: '',
};

// Validation rules
const validateField = (field: keyof SurgeryFormData, value: any, allData: SurgeryFormData): string | null => {
  switch (field) {
    case 'procedureName':
      if (!value || typeof value !== 'string' || value.trim().length === 0) {
        return 'El nombre del procedimiento es requerido';
      }
      if (value.trim().length > 300) {
        return 'El nombre del procedimiento no puede exceder 300 caracteres';
      }
      return null;

    case 'surgeryDate':
      if (value && typeof value === 'string' && value.trim().length > 0) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'La fecha debe ser válida';
        }
        const now = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(now.getFullYear() + 5); // Allow up to 5 years in future for scheduled surgeries
        if (date > maxDate) {
          return 'La fecha no puede ser más de 5 años en el futuro';
        }
      }
      return null;

    case 'hospitalName':
      if (value && typeof value === 'string' && value.trim().length > 200) {
        return 'El nombre del hospital no puede exceder 200 caracteres';
      }
      return null;

    case 'surgeonName':
      if (value && typeof value === 'string' && value.trim().length > 200) {
        return 'El nombre del cirujano no puede exceder 200 caracteres';
      }
      return null;

    case 'anesthesiaType':
      if (value && typeof value === 'string' && value.trim().length > 100) {
        return 'El tipo de anestesia no puede exceder 100 caracteres';
      }
      return null;

    case 'durationHours':
      if (value !== undefined && value !== null) {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) {
          return 'La duración debe ser un número válido';
        }
        if (num < 0) {
          return 'La duración no puede ser negativa';
        }
        if (num > 24) {
          return 'La duración no puede exceder 24 horas';
        }
      }
      return null;

    case 'notes':
    case 'complications':
      // No specific validation for text fields, just length limits handled by backend
      return null;

    default:
      return null;
  }
};

const validateAllFields = (formData: SurgeryFormData): SurgeryFormErrors => {
  const errors: SurgeryFormErrors = {};

  (Object.keys(formData) as Array<keyof SurgeryFormData>).forEach(field => {
    const error = validateField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

interface UseSurgeryFormOptions {
  onSubmit: (data: SurgeryFormData) => Promise<void>;
  initialData?: Partial<SurgeryFormData>;
  onCancel?: () => void;
}

export const useSurgeryForm = ({
  onSubmit,
  initialData,
  onCancel
}: UseSurgeryFormOptions): UseSurgeryFormResult => {
  if (typeof onSubmit !== 'function') {
    throw new Error(`useSurgeryForm: onSubmit must be a function, received: ${typeof onSubmit}`);
  }

  const [formData, setFormData] = useState<SurgeryFormData>({ ...defaultFormData, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validate form and determine if it's valid
  const isValid = Object.keys(errors).length === 0 &&
                  formData.procedureName.trim().length > 0;

  const handleInputChange = useCallback((field: keyof SurgeryFormData, value: string | number | undefined) => {
    setFormData(prevData => {
      const newData = { ...prevData, [field]: value };

      // Clear error for this field when user starts typing
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });

      // Validate the field in real-time
      const fieldError = validateField(field, value, newData);
      if (fieldError) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [field]: fieldError,
        }));
      }

      return newData;
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validationErrors = validateAllFields(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Clean the data before submission
      const cleanedData: SurgeryFormData = {
        procedureName: formData.procedureName.trim(),
        surgeryDate: formData.surgeryDate.trim(),
        hospitalName: formData.hospitalName?.trim() || undefined,
        surgeonName: formData.surgeonName?.trim() || undefined,
        anesthesiaType: formData.anesthesiaType?.trim() || undefined,
        durationHours: formData.durationHours,
        notes: formData.notes?.trim() || undefined,
        complications: formData.complications?.trim() || undefined,
      };

      await onSubmit(cleanedData);

    } catch (error) {
      // Let the parent component handle the error
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  const resetForm = useCallback(() => {
    setFormData({ ...defaultFormData, ...initialData });
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  const setFormDataPartial = useCallback((data: Partial<SurgeryFormData>) => {
    setFormData(prevData => ({ ...prevData, ...data }));

    // Clear errors for updated fields
    const updatedFields = Object.keys(data) as Array<keyof SurgeryFormData>;
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
      setErrors({});
    }
  }, [initialData]);

  return {
    formData,
    errors,
    isValid,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    resetForm,
    setFormData: setFormDataPartial,
  };
};