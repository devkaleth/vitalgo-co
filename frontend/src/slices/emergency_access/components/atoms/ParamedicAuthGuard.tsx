/**
 * ParamedicAuthGuard Component
 * Protects emergency access routes - only allows users with userType='paramedic'
 */
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/contexts/AuthContext';

interface ParamedicAuthGuardProps {
  children: React.ReactNode;
}

export const ParamedicAuthGuard: React.FC<ParamedicAuthGuardProps> = ({ children }) => {
  const t = useTranslations('emergency');
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated || !user) {
        console.warn('🚫 ParamedicAuthGuard: User not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      // Authenticated but not a paramedic - redirect to dashboard
      if (user.userType !== 'paramedic') {
        console.warn('🚫 ParamedicAuthGuard: User is not a paramedic, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('messages.verifying')}</p>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  // User authenticated but not a paramedic
  if (user.userType !== 'paramedic') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">{t('errors.accessDenied')}</h2>
          <p className="text-gray-700">
            {t('errors.paramedicOnlyPage')}
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and is a paramedic
  return <>{children}</>;
};
