'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PublicNavbar } from '@/shared/components/organisms/PublicNavbar';
import { PublicFooter } from '@/shared/components/organisms/PublicFooter';

interface FieldValidationState {
  isValid: boolean | undefined;
  isValidating: boolean;
  message: string;
}

export function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPasswordPage');
  const tValidation = useTranslations('auth.validation');
  const [email, setEmail] = useState('');
  const [emailValidation, setEmailValidation] = useState<FieldValidationState>({
    isValid: undefined,
    isValidating: false,
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setEmailValidation({
        isValid: false,
        isValidating: false,
        message: tValidation('enterValidEmail')
      });
    } else if (value && emailRegex.test(value)) {
      setEmailValidation({
        isValid: true,
        isValidating: false,
        message: ''
      });
    } else {
      setEmailValidation({
        isValid: undefined,
        isValidating: false,
        message: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !emailValidation.isValid) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement forgot password API call
      // For now, just simulate the request
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending reset email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicNavbar />

        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-vitalgo-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-vitalgo-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('success.title')}
              </h2>

              <p className="text-gray-600 mb-8">
                {t('success.message')}{' '}
                <span className="font-medium text-gray-900">{email}</span>
              </p>

              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  {t('success.noEmailReceived')}
                </p>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-vitalgo-green/20"
                  >
                    {t('success.tryAnotherEmail')}
                  </button>

                  <button
                    onClick={() => window.location.href = '/login'}
                    className="w-full py-3 px-4 bg-vitalgo-green text-white rounded-lg font-medium hover:bg-vitalgo-green/90 transition-colors focus:outline-none focus:ring-2 focus:ring-vitalgo-green/20"
                  >
                    {t('backToLogin')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('title')}
            </h2>
            <p className="text-gray-600">
              {t('subtitle')}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  emailValidation.isValid === false
                    ? 'border-red-300 focus:ring-red-200'
                    : emailValidation.isValid === true
                    ? 'border-green-300 focus:ring-green-200'
                    : 'border-gray-300 focus:ring-vitalgo-green/20'
                }`}
                data-testid="forgot-password-email-input"
              />
              {emailValidation.message && (
                <p className={`mt-2 text-sm ${emailValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {emailValidation.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={!email || !emailValidation.isValid || isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-vitalgo-green/20 ${
                  !email || !emailValidation.isValid || isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-vitalgo-green hover:bg-vitalgo-green/90'
                }`}
                data-testid="forgot-password-submit-button"
              >
                {isLoading ? t('submitting') : t('submitButton')}
              </button>

              <div className="text-center">
                <a
                  href="/login"
                  className="text-sm text-vitalgo-green hover:text-vitalgo-green/80 font-medium"
                  data-testid="forgot-password-back-to-login"
                >
                  {t('backToLoginArrow')}
                </a>
              </div>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  {t('comingSoon.title')}
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {t('comingSoon.message')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}