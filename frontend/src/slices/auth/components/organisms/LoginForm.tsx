'use client';
/**
 * Login Form organism component - Pure UI form using centralized AuthContext
 * No direct API calls or router logic - uses AuthContext for authentication
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LoginCredentialsForm } from '../molecules/LoginCredentialsForm';
import { LoginOptionsForm } from '../molecules/LoginOptionsForm';
import { LoginButton } from '../atoms/LoginButton';
import { LoginLegalText } from '../atoms/LoginLegalText';
import { LoginForm as LoginFormType, LoginErrorResponse, FieldValidationState } from '../../types';
import { useAuth } from '../../../../shared/contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: (redirectUrl?: string) => void;
  onError?: (error: string) => void;
  'data-testid'?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  'data-testid': testId
}) => {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const t = useTranslations('auth');

  // Form state
  const [formData, setFormData] = useState<LoginFormType>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [emailValidation, setEmailValidation] = useState<FieldValidationState>({
    isValidating: false,
    isValid: null,
    error: null
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Log error type for debugging
  useEffect(() => {
    if (error) {
      console.log('🔍 LOGIN FORM: Error from context', {
        error,
        errorType: typeof error,
        isString: typeof error === 'string',
        errorConstructor: error?.constructor?.name
      });
    }
  }, [error]);

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Event handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    setGeneralError(null);

    // Real-time email validation
    if (value.length > 0) {
      setEmailValidation({
        isValidating: false,
        isValid: validateEmail(value),
        error: validateEmail(value) ? null : t('validation.enterValidEmail')
      });
    } else {
      setEmailValidation({
        isValidating: false,
        isValid: null,
        error: null
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    setPasswordError(null);
    setGeneralError(null);
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, rememberMe: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setGeneralError(null);
    setPasswordError(null);

    // Validate form
    if (!formData.email || !formData.password) {
      setGeneralError(t('validation.fillAllFields'));
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailValidation(prev => ({
        ...prev,
        isValid: false,
        error: t('validation.enterValidEmail')
      }));
      return;
    }

    try {
      console.log('🔍 LOGIN FORM: Using AuthContext login', {
        timestamp: new Date().toISOString(),
        email: formData.email,
        currentPath: window.location.pathname
      });
      const redirectUrl = await login(formData);

      // Check for returnUrl query parameter (takes precedence over backend redirectUrl)
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');

      console.log('🔍 LOGIN FORM: Login successful', {
        timestamp: new Date().toISOString(),
        backendRedirectUrl: redirectUrl,
        queryReturnUrl: returnUrl,
        hasOnSuccess: !!onSuccess
      });

      if (onSuccess) {
        onSuccess(returnUrl || redirectUrl);
      } else {
        // Prioritize: returnUrl (from query) > redirectUrl (from backend) > /dashboard (default)
        const targetUrl = returnUrl || redirectUrl || '/dashboard';
        console.log('🔍 LOGIN FORM: Redirecting to:', {
          timestamp: new Date().toISOString(),
          targetUrl,
          source: returnUrl ? 'query_param' : (redirectUrl ? 'backend' : 'default'),
          currentPath: window.location.pathname,
          redirectMethod: 'router.replace'
        });
        router.replace(targetUrl);
      }

    } catch (error) {
      console.error('🔍 LOGIN FORM: Login failed', error);

      // Handle login error responses
      if (error && typeof error === 'object' && 'success' in error) {
        const loginError = error as LoginErrorResponse;

        if (loginError.attemptsRemaining !== undefined && loginError.attemptsRemaining !== null) {
          setGeneralError(
            `${loginError.message}. ${t('validation.attemptsRemaining')}: ${loginError.attemptsRemaining}`
          );
        } else if (loginError.retryAfter) {
          const minutes = Math.ceil(loginError.retryAfter / 60);
          setGeneralError(
            `${loginError.message} ${t('validation.retryAfterMinutes').replace('{minutes}', minutes.toString())}`
          );
        } else {
          setGeneralError(loginError.message);
        }
      } else if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError(t('validation.connectionError'));
      }

      if (onError && error instanceof Error) {
        onError(error.message);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" data-testid={testId}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/assets/images/logos/logos-blue-light-background.png"
            alt="VitalGo Logo"
            className="mx-auto h-12 object-contain"
          />
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('loginTitle')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* General error message - Show both local and AuthContext errors */}
        {(generalError || error) && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4"
            data-testid="login-error-message"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {generalError || (typeof error === 'string' ? error : (error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Error de conexión'))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <LoginCredentialsForm
          email={formData.email}
          password={formData.password}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
          emailValidation={emailValidation}
          passwordError={passwordError || undefined}
          disabled={isLoading}
          data-testid="login-credentials-form"
        />

        {/* Options Form */}
        <LoginOptionsForm
          rememberMe={formData.rememberMe}
          onRememberMeChange={handleRememberMeChange}
          disabled={isLoading}
          data-testid="login-options-form"
        />

        {/* Submit Button */}
        <LoginButton
          loading={isLoading}
          disabled={isLoading || !formData.email || !formData.password}
          data-testid="login-submit-button"
        />

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('noAccount')}{' '}
            <a
              href="/precios"
              className="text-vitalgo-green hover:text-vitalgo-green/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-vitalgo-green/20 rounded-sm"
            >
              {t('signUpHere')}
            </a>
          </p>
        </div>

        {/* Legal acceptance text */}
        <LoginLegalText data-testid="login-legal-text" />
      </form>
    </div>
  );
};