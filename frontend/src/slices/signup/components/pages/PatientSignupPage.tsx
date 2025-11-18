'use client';
/**
 * Patient Signup Page
 * URL: /signup/paciente
 */
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PatientSignupForm } from '../organisms/PatientSignupForm';
import { AutoLoginLoader } from '../atoms/AutoLoginLoader';
import { ProfileOnboarding } from '../organisms/ProfileOnboarding';
import { RegistrationResponse } from '../../types';
import { MinimalNavbar } from '../../../../shared/components/organisms/MinimalNavbar';
import { MinimalFooter } from '../../../../shared/components/organisms/MinimalFooter';
import { LocalStorageService } from '../../../../shared/services/local-storage-service';

export default function PatientSignupPage() {
  const t = useTranslations('signup.page');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isAutoLogging, setIsAutoLogging] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [registrationResponse, setRegistrationResponse] = useState<RegistrationResponse | null>(null);

  const handleSuccess = (response: RegistrationResponse) => {
    setErrorMessage('');
    setSuccessMessage(t('successMessage'));
    setRegistrationResponse(response);

    // Handle auto-login with tokens
    if (response.access_token && response.refresh_token) {
      // Start auto-login process with user awareness
      setIsAutoLogging(true);
    } else {
      // Fallback for old API responses without auto-login
      setTimeout(() => {
        window.location.href = response.redirect_url || '/completar-perfil-medico';
      }, 2000);
    }
  };

  const handleAutoLoginComplete = () => {
    if (registrationResponse?.access_token && registrationResponse?.refresh_token) {
      // Use centralized localStorage service for consistent token storage
      LocalStorageService.setAuthDataFromRegistration(registrationResponse);

      // Show onboarding instead of redirecting directly
      setIsAutoLogging(false);
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    // Redirect to dashboard after onboarding is complete
    window.location.href = '/dashboard';
  };

  const handleError = (error: string) => {
    setSuccessMessage('');
    setErrorMessage(error);

    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <MinimalNavbar
        backText={t('backToHome')}
        backUrl="/"
        showLogo={true}
      />

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Page Header - Solo se muestra si NO está en onboarding */}
            {!showOnboarding && (
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('title')}
                </h1>
                <p className="text-gray-600">
                  {t('subtitle')}
                </p>
              </div>
            )}

            {/* Success Message & Auto-Login Loader */}
            {successMessage && !isAutoLogging && (
              <div className="mb-6 p-4 rounded-lg bg-vitalgo-green-lightest border border-vitalgo-green-light" data-testid="success-message">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-vitalgo-green-light mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-vitalgo-green font-medium">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Auto-Login Loader */}
            {isAutoLogging && (
              <div className="mb-6 p-6 rounded-lg bg-vitalgo-green-lightest border border-vitalgo-green-light" data-testid="auto-login-section">
                <div className="flex items-center mb-4">
                  <svg className="h-5 w-5 text-vitalgo-green-light mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-vitalgo-green font-medium">{successMessage}</span>
                </div>
                <AutoLoginLoader
                  duration={3}
                  onComplete={handleAutoLoginComplete}
                  message={t('autoLoginMessage')}
                />
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200" data-testid="error-message">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800 font-medium">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Registration Form */}
            {!successMessage && !isAutoLogging && !showOnboarding && (
              <PatientSignupForm
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}

            {/* Onboarding - Replaces form after successful registration */}
            {showOnboarding && (
              <ProfileOnboarding onComplete={handleOnboardingComplete} />
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {t('benefits')}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <MinimalFooter />
    </div>
  );
}