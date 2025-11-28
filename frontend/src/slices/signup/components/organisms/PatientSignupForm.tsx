'use client';
/**
 * Patient Signup Form organism component
 */
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { PersonalInfoSection } from '../molecules/PersonalInfoSection';
import { AccountSection } from '../molecules/AccountSection';
import { CheckboxWithLink } from '../atoms/CheckboxWithLink';
import { SubmitButton } from '../atoms/SubmitButton';
import { SignupApiService } from '../../services/signupApi';
import { DocumentType, PatientRegistrationForm, FieldValidationState, RegistrationResponse } from '../../types';
import { Country, getDefaultCountry, getCountryByCode } from '../../data/countries';
import { fetchCountries } from '../../../../services/countriesService';
import { useGeolocation } from '../../../../shared/hooks/useGeolocation';
import { getAllowedDocumentTypes } from '../../utils/documentTypesByCountry';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface PatientSignupFormProps {
  onSuccess: (response: RegistrationResponse) => void;
  onError: (error: string) => void;
}

export const PatientSignupForm: React.FC<PatientSignupFormProps> = ({
  onSuccess,
  onError
}) => {
  // Translation hooks
  const tSignup = useTranslations('signup');
  const tValidation = useTranslations('validation');
  const tForms = useTranslations('forms');
  const tCommon = useTranslations('common');

  // Get locale from params
  const params = useParams();
  const locale = params?.locale as string || 'es';

  // Geolocation hook - Auto-detect user's country
  const { countryCode: detectedCountryCode, dialCode: detectedDialCode, isLoading: isDetectingLocation } = useGeolocation({
    autoFetch: true,
    fetchFullData: false,
    fallbackCountry: 'CO',
  });

  // Form state
  const [formData, setFormData] = useState<PatientRegistrationForm>({
    firstName: '',
    lastName: '',
    documentType: '',
    documentNumber: '',
    phoneInternational: '', // Computed from country + phone
    birthDate: '',
    originCountry: 'CO', // Will be updated by geolocation
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  // New phone fields state
  const [phoneState, setPhoneState] = useState({
    countryCode: getDefaultCountry().code, // Will be updated by geolocation
    dialCode: getDefaultCountry().dialCode,
    phoneNumber: ''
  });

  // Document types
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

  // Countries state
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  // Validation states
  const [validationStates, setValidationStates] = useState<{
    [key: string]: FieldValidationState;
  }>({});

  // Form errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected plan state
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const countriesData = await fetchCountries();

        // Transform API countries to match the local Country interface with i18n
        const transformedCountries: Country[] = countriesData.map(c => ({
          code: c.code,
          name: locale === 'en' && c.name_en ? c.name_en : c.name,
          dialCode: c.phone_code,
          flag: c.flag_emoji || '',
        }));

        setCountries(transformedCountries);
      } catch (error) {
        console.error('Error loading countries:', error);
        onError(tSignup('errors.loadCountries') || 'Error al cargar países');
      } finally {
        setIsLoadingCountries(false);
      }
    };

    loadCountries();
  }, [locale, onError, tSignup]);

  // Load selected plan from localStorage
  useEffect(() => {
    const loadSelectedPlan = async () => {
      const planId = localStorage.getItem('selectedPlanId');
      if (planId) {
        setLoadingPlan(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans/${planId}`);
          if (response.ok) {
            const plan = await response.json();
            setSelectedPlan(plan);
          }
        } catch (error) {
          console.error('Error loading plan:', error);
        } finally {
          setLoadingPlan(false);
        }
      }
    };

    loadSelectedPlan();
  }, []);

  // Load document types on mount and when origin country changes
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const types = await SignupApiService.getDocumentTypes();

        // Filter document types based on selected country and sort by allowed order
        const allowedTypes = getAllowedDocumentTypes(formData.originCountry);
        const filteredTypes = types
          .filter(type => allowedTypes.includes(type.code))
          .sort((a, b) => allowedTypes.indexOf(a.code) - allowedTypes.indexOf(b.code));

        setDocumentTypes(filteredTypes);

        // Reset document type if current selection is not in the allowed list
        if (formData.documentType && !allowedTypes.includes(formData.documentType)) {
          setFormData(prev => ({ ...prev, documentType: '' }));
        }
      } catch (error) {
        onError(tSignup('errors.loadDocumentTypes'));
      }
    };

    loadDocumentTypes();
  }, [formData.originCountry, onError, tSignup]);

  // Update country and phone dial code when geolocation is detected
  useEffect(() => {
    if (detectedCountryCode && !isDetectingLocation && countries.length > 0) {
      // Update origin country in form data
      setFormData(prev => ({
        ...prev,
        originCountry: detectedCountryCode
      }));

      // Update phone country code and dial code from loaded countries
      const detectedCountry = countries.find(c => c.code === detectedCountryCode);
      if (detectedCountry) {
        setPhoneState(prev => ({
          ...prev,
          countryCode: detectedCountry.code,
          dialCode: detectedCountry.dialCode
        }));
      } else if (detectedDialCode) {
        // Fallback to dial code from geolocation hook
        setPhoneState(prev => ({
          ...prev,
          countryCode: detectedCountryCode,
          dialCode: detectedDialCode
        }));
      }
    }
  }, [detectedCountryCode, detectedDialCode, isDetectingLocation, countries]);

  // Handle input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'phoneNumber') {
      setPhoneState(prev => {
        const newState = { ...prev, phoneNumber: value as string };
        // Update computed phoneInternational field
        const cleanNumber = (value as string).replace(/\D/g, '');
        if (cleanNumber) {
          setFormData(prevForm => ({
            ...prevForm,
            phoneInternational: `${newState.dialCode} ${cleanNumber}`
          }));
        }
        return newState;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Real-time password confirmation validation
    if (field === 'password' || field === 'confirmPassword') {
      setTimeout(() => {
        const currentPassword = field === 'password' ? (value as string) : formData.password;
        const currentConfirmPassword = field === 'confirmPassword' ? (value as string) : formData.confirmPassword;

        if (currentConfirmPassword) {
          const isValid = currentConfirmPassword === currentPassword;
          setValidationStates(prev => ({
            ...prev,
            confirmPassword: {
              isValidating: false,
              isValid,
              error: null,
              feedback: isValid ? tSignup('validation.passwordsMatch') : tSignup('validation.passwordsMismatch')
            }
          }));
        }
      }, 0);
    }
  };

  // Handle country change
  const handleCountryChange = (country: Country) => {
    setPhoneState(prev => {
      const newState = {
        ...prev,
        countryCode: country.code,
        dialCode: country.dialCode
      };
      // Update computed phoneInternational field
      const cleanNumber = prev.phoneNumber.replace(/\D/g, '');
      if (cleanNumber) {
        setFormData(prevForm => ({
          ...prevForm,
          phoneInternational: `${country.dialCode} ${cleanNumber}`
        }));
      }
      return newState;
    });
  };

  // Handle origin country change
  const handleOriginCountryChange = (country: Country) => {
    setFormData(prev => ({ ...prev, originCountry: country.code }));
  };

  // Handle field blur validation
  const handleFieldBlur = async (field: string) => {
    const value = formData[field as keyof PatientRegistrationForm];

    // Skip validation for empty optional fields
    if (!value && !isRequiredField(field)) return;

    setValidationStates(prev => ({
      ...prev,
      [field]: { isValidating: true, isValid: null, error: null }
    }));

    try {
      switch (field) {
        case 'firstName':
          validateFirstName(value as string);
          break;
        case 'lastName':
          validateLastName(value as string);
          break;
        case 'documentNumber':
          if (formData.documentType && value) {
            await validateDocumentNumber(value as string, formData.documentType);
          }
          break;
        case 'email':
          if (value) {
            await validateEmail(value as string);
          }
          break;
        case 'password':
          validatePassword(value as string);
          break;
        case 'confirmPassword':
          validateConfirmPassword(value as string);
          break;
        case 'phone':
          validatePhone(phoneState.phoneNumber, phoneState.countryCode);
          break;
        case 'birthDate':
          validateBirthDate(value as string);
          break;
      }
    } catch (error) {
      setValidationStates(prev => ({
        ...prev,
        [field]: { isValidating: false, isValid: false, error: tSignup('errors.validationError') }
      }));
    }
  };

  const isRequiredField = (field: string): boolean => {
    const requiredFields = [
      'firstName', 'lastName', 'documentType', 'documentNumber',
      'phoneInternational', 'birthDate', 'originCountry', 'email',
      'password', 'confirmPassword'
    ];
    return requiredFields.includes(field);
  };

  const validateFirstName = (name: string) => {
    const isValid = name.trim().length >= 1 && name.length <= 50 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name);

    setValidationStates(prev => ({
      ...prev,
      firstName: {
        isValidating: false,
        isValid,
        error: isValid ? null : tSignup('validation.firstNameInvalid')
      }
    }));
  };

  const validateLastName = (name: string) => {
    const isValid = name.trim().length >= 1 && name.length <= 50 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name);

    setValidationStates(prev => ({
      ...prev,
      lastName: {
        isValidating: false,
        isValid,
        error: isValid ? null : tSignup('validation.lastNameInvalid')
      }
    }));
  };

  const validateDocumentNumber = async (documentNumber: string, documentType: string) => {
    try {
      const result = await SignupApiService.validateDocument(documentNumber, documentType);

      // Translate error_key from backend to localized message
      let errorMessage: string | null = null;
      if (!result.valid && result.error_key) {
        errorMessage = tValidation(`document.${result.error_key}`);
      } else if (!result.valid) {
        errorMessage = tValidation('document.documentInvalid');
      }

      setValidationStates(prev => ({
        ...prev,
        documentNumber: {
          isValidating: false,
          isValid: result.valid,
          error: errorMessage
        }
      }));
    } catch (error) {
      setValidationStates(prev => ({
        ...prev,
        documentNumber: {
          isValidating: false,
          isValid: false,
          error: tValidation('document.documentValidationError')
        }
      }));
    }
  };

  const validateEmail = async (email: string) => {
    try {
      const result = await SignupApiService.validateEmail(email);

      // Translate error_key from backend to localized message
      let errorMessage: string | null = null;
      if (!result.valid && result.error_key) {
        errorMessage = tValidation(`email.${result.error_key}`);
      } else if (!result.valid) {
        errorMessage = tValidation('email.emailInvalid');
      }

      setValidationStates(prev => ({
        ...prev,
        email: {
          isValidating: false,
          isValid: result.valid,
          error: errorMessage
        }
      }));
    } catch (error) {
      setValidationStates(prev => ({
        ...prev,
        email: {
          isValidating: false,
          isValid: false,
          error: tValidation('email.emailValidationError')
        }
      }));
    }
  };

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8 && password.length <= 128,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
    };

    const isValid = Object.values(checks).every(Boolean);

    setValidationStates(prev => ({
      ...prev,
      password: {
        isValidating: false,
        isValid,
        error: isValid ? null : tSignup('validation.passwordWeak')
      }
    }));
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    const isValid = confirmPassword === formData.password;

    setValidationStates(prev => ({
      ...prev,
      confirmPassword: {
        isValidating: false,
        isValid,
        error: isValid ? null : tSignup('validation.passwordsMismatch'),
        feedback: isValid ? tSignup('validation.passwordsMatch') : tSignup('validation.passwordsMismatch')
      }
    }));
  };

  const validatePhone = (phoneNumber: string, countryCode: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Validation based on country
    let isValid = false;
    let errorMessage = '';

    if (!cleanNumber) {
      errorMessage = tSignup('validation.phoneRequired');
    } else {
      // Country-specific validation
      switch (countryCode) {
        case 'CO': // Colombia
          isValid = /^3\d{9}$/.test(cleanNumber);
          errorMessage = isValid ? '' : tSignup('validation.phoneInvalidCO');
          break;
        case 'US':
        case 'CA': // North America
          isValid = /^\d{10}$/.test(cleanNumber);
          errorMessage = isValid ? '' : tSignup('validation.phoneInvalidUSCA');
          break;
        case 'MX': // México
          isValid = /^\d{10}$/.test(cleanNumber);
          errorMessage = isValid ? '' : tSignup('validation.phoneInvalidMX');
          break;
        default:
          // Generic validation for other countries
          isValid = cleanNumber.length >= 7 && cleanNumber.length <= 15;
          errorMessage = isValid ? '' : tSignup('validation.phoneInvalidGeneric');
      }
    }

    setValidationStates(prev => ({
      ...prev,
      phone: {
        isValidating: false,
        isValid,
        error: isValid ? null : errorMessage
      }
    }));
  };

  const validateBirthDate = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear() -
                ((today.getMonth() < birth.getMonth() ||
                  (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) ? 1 : 0);

    if (age < 18) {
      setErrors(prev => ({ ...prev, birthDate: tSignup('validation.ageRestriction') }));
    } else if (age > 120) {
      setErrors(prev => ({ ...prev, birthDate: tSignup('validation.ageInvalid') }));
    } else {
      setErrors(prev => ({ ...prev, birthDate: '' }));
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const requiredFieldsValid = [
      formData.firstName,
      formData.lastName,
      formData.documentType,
      formData.documentNumber,
      phoneState.phoneNumber,
      formData.birthDate,
      formData.originCountry,
      formData.email,
      formData.password,
      formData.confirmPassword
    ].every(field => field.trim() !== '');

    const acceptancesValid = formData.acceptTerms && formData.acceptPrivacy;

    const validationsValid = Object.values(validationStates).every(
      state => state.isValid !== false
    );

    const noErrors = Object.values(errors).every(error => !error);

    return requiredFieldsValid && acceptancesValid && validationsValid && noErrors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      onError(tSignup('errors.completeAllFields'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Get selected plan from localStorage
      const selectedPlanId = localStorage.getItem('selectedPlanId');
      const formDataWithPlan = {
        ...formData,
        planId: selectedPlanId ? parseInt(selectedPlanId, 10) : undefined
      };

      const response = await SignupApiService.registerPatient(formDataWithPlan);

      if (response.success) {
        // Clear selected plan from localStorage after successful registration
        localStorage.removeItem('selectedPlanId');
        onSuccess(response);
      } else {
        onError(response.message || tSignup('errors.registrationFailed'));
      }
    } catch (error) {
      onError(tSignup('errors.connectionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" data-testid="patient-signup-form">
      {/* Selected Plan Indicator */}
      {selectedPlan && (
        <div className="bg-gradient-to-r from-vitalgo-green/10 to-green-50 border-2 border-vitalgo-green rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-vitalgo-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                ✓
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">{tSignup('plan.selectedPlan')}</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {locale === 'en' && selectedPlan.display_name_en ? selectedPlan.display_name_en : selectedPlan.display_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPlan.price === 0 ? (
                    <span className="font-semibold text-vitalgo-green">{tSignup('plan.freeForever')}</span>
                  ) : (
                    <span>
                      <span className="font-semibold text-gray-900">${selectedPlan.price}</span>
                      {selectedPlan.duration_days && <span className="text-gray-500"> / {selectedPlan.duration_days} {tSignup('plan.days')}</span>}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <a
              href={`/${locale}/precios`}
              className="text-vitalgo-green hover:text-vitalgo-green/80 font-medium text-sm underline"
            >
              {tSignup('plan.changePlan')}
            </a>
          </div>
        </div>
      )}

      {loadingPlan && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="bg-gray-300 rounded-full w-12 h-12"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-48"></div>
            </div>
          </div>
        </div>
      )}

      <PersonalInfoSection
        firstName={formData.firstName}
        lastName={formData.lastName}
        documentType={formData.documentType}
        documentNumber={formData.documentNumber}
        birthDate={formData.birthDate}
        originCountry={formData.originCountry}
        countryCode={phoneState.countryCode}
        phoneNumber={phoneState.phoneNumber}
        onInputChange={handleInputChange}
        onFieldBlur={handleFieldBlur}
        onCountryChange={handleCountryChange}
        onOriginCountryChange={handleOriginCountryChange}
        documentTypes={documentTypes}
        countries={countries}
        isLoadingCountries={isLoadingCountries}
        validationStates={{
          firstName: validationStates.firstName,
          lastName: validationStates.lastName,
          documentNumber: validationStates.documentNumber,
          phone: validationStates.phone
        }}
        errors={{
          documentType: errors.documentType,
          birthDate: errors.birthDate,
          phone: errors.phone,
          originCountry: errors.originCountry
        }}
      />

      <AccountSection
        email={formData.email}
        password={formData.password}
        confirmPassword={formData.confirmPassword}
        onInputChange={handleInputChange}
        onFieldBlur={handleFieldBlur}
        validationStates={{
          email: validationStates.email,
          password: validationStates.password,
          confirmPassword: validationStates.confirmPassword
        }}
      />

      {/* Legal Section - Enlaces al slice legal */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-900">{tSignup('legalSectionTitle')}</h3>
          <p className="text-sm text-gray-600">
            {tSignup('legalSectionSubtitle')}
          </p>
        </div>

        <div className="space-y-4">
          <CheckboxWithLink
            id="acceptTerms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            text={tSignup('legal.acceptTermsText')}
            linkText={tCommon('termsAndConditions')}
            linkUrl="/terminos-y-condiciones"
            required
            data-testid="acceptTerms-checkbox"
            enableAcceptButton={true}
          />

          <CheckboxWithLink
            id="acceptPrivacy"
            name="acceptPrivacy"
            checked={formData.acceptPrivacy}
            onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
            text={tSignup('legal.acceptPrivacyText')}
            linkText={tCommon('privacyPolicy')}
            linkUrl="/politica-de-privacidad"
            required
            data-testid="acceptPrivacy-checkbox"
            enableAcceptButton={true}
          />
        </div>

        <div className="pt-6">
          <SubmitButton
            disabled={!isFormValid()}
            loading={isSubmitting}
            data-testid="submit-button"
          >
            {tSignup('createAccountButton')}
          </SubmitButton>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {tSignup('alreadyHaveAccount')}{' '}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="login-link"
              >
                {tSignup('loginLink')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};