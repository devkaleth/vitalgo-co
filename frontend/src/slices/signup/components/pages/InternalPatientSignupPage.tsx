'use client';
/**
 * Internal Patient Signup Page (Example for staff/admin use)
 * Shows all document types - demonstrates reusability
 */
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PatientSignupForm } from '../organisms/PatientSignupForm';
import { RegistrationResponse } from '../../types';

export default function InternalPatientSignupPage() {
  const t = useTranslations('internalSignup');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSuccess = (response: RegistrationResponse) => {
    setErrorMessage('');
    setSuccessMessage(response.message);

    // Different redirect for internal users
    setTimeout(() => {
      window.location.href = response.redirect_url || '/admin/patients';
    }, 2000);
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
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/assets/images/logos/logos-blue-light-background.png"
                alt="VitalGo"
                className="h-8"
              />
              <span className="ml-4 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                {t('badge')}
              </span>
            </div>
            <a
              href="/admin"
              className="text-gray-600 hover:text-gray-900 font-medium"
              data-testid="back-to-admin"
            >
              {t('backToAdmin')}
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('title')}
              </h1>
              <p className="text-gray-600">
                {t('subtitle')}
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  {t('infoBox')}
                </p>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-lg bg-vitalgo-green-lightest border border-vitalgo-green-light" data-testid="success-message">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-vitalgo-green-light mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-vitalgo-green font-medium">{successMessage}</span>
                </div>
                <p className="text-vitalgo-green text-sm mt-1">
                  {t('redirectingToAdmin')}
                </p>
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

            {/* Registration Form - NO FILTER = ALL DOCUMENT TYPES */}
            {!successMessage && (
              <PatientSignupForm
                onSuccess={handleSuccess}
                onError={handleError}
                // No allowedDocumentTypes prop = shows all document types
              />
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {t('footer')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}