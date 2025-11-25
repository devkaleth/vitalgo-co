/**
 * QRLandingPage Component
 * Smart landing page for QR code scans
 * Handles authentication routing for emergency access
 */
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/contexts/AuthContext';
import { EmergencyAccessPage } from './EmergencyAccessPage';

interface QRLandingPageProps {
  qrCode: string;
}

export const QRLandingPage: React.FC<QRLandingPageProps> = ({ qrCode }) => {
  const t = useTranslations('emergency');
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Not authenticated - redirect to login with return URL
    if (!isAuthenticated || !user) {
      const returnUrl = `/qr/${qrCode}`;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}&userType=paramedic`);
      return;
    }

    // Authenticated but not a paramedic - show error
    if (user.userType !== 'paramedic') {
      // Will render access denied message below
      return;
    }

    // Authenticated as paramedic - continue to emergency access page
  }, [isAuthenticated, isLoading, user, qrCode, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-semibold">{t('messages.verifying')}</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show message while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full p-8">
          <div className="bg-white border-2 border-blue-500 rounded-lg p-6 text-center shadow-lg">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">{t('errors.accessRestricted')}</h2>
            <p className="text-gray-700 mb-4">
              {t('errors.requiresAuth')}
            </p>
            <p className="text-sm text-gray-600">
              {t('messages.redirectingLogin')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but not a paramedic
  if (user.userType !== 'paramedic') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full p-8">
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 text-center shadow-lg">
            <div className="text-6xl mb-4">⛔</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">{t('errors.accessDenied')}</h2>
            <p className="text-gray-700 mb-4">
              {t('errors.paramedicOnly')}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              {t('messages.userType')} <strong>{user.userType}</strong>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                {t('actions.goToDashboard')}
              </button>
              <button
                onClick={() => {
                  // Logout and redirect to login
                  router.push('/login?userType=paramedic');
                }}
                className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
              >
                {t('actions.loginAsParamedic')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated as paramedic - show emergency access page
  return <EmergencyAccessPage qrCode={qrCode} />;
};
