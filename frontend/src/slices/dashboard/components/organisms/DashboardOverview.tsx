/**
 * Dashboard Overview organism component
 * Main dashboard layout with stats and medical cards
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { DashboardStats } from '../molecules/DashboardStats';
import { MedicationsCard } from '../../../medications/components/molecules/MedicationsCard';
import { AllergiesCard } from '../../../allergies/components/molecules/AllergiesCard';
import { SurgeriesCard } from '../../../surgeries/components/molecules/SurgeriesCard';
import { IllnessesCard } from '../../../illnesses/components/molecules/IllnessesCard';
import { DashboardData } from '../../types';
import { dashboardAPI } from '../../services/api';

interface DashboardOverviewProps {
  'data-testid'?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  'data-testid': testId
}) => {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'es';
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📊 Fetching dashboard data...');
        const data = await dashboardAPI.getDashboardData();
        console.log('✅ Dashboard data loaded successfully:', data);
        setDashboardData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('errors.loadingError');
        console.error('❌ Dashboard data loading failed:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6" data-testid={testId}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-red-800 font-medium">{t('errors.loadingError')}</h3>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('errors.reloadPage')}
          </button>
          <button
            onClick={() => {
              setError(null);
              // Refetch data
              const fetchData = async () => {
                try {
                  setLoading(true);
                  const data = await dashboardAPI.getDashboardData();
                  setDashboardData(data);
                } catch (err) {
                  setError(err instanceof Error ? err.message : t('errors.loadingError'));
                } finally {
                  setLoading(false);
                }
              };
              fetchData();
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t('errors.retryLoading')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid={testId}>
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-600">
          {t('description')}
        </p>
      </div>

      {/* Stats Overview */}
      {dashboardData && (
        <DashboardStats
          stats={dashboardData.stats}
          loading={loading}
          data-testid="dashboard-stats"
        />
      )}

      {/* Medical Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Illnesses Management Card */}
        <div id="illnesses-section" className="h-full">
          <IllnessesCard
            maxItems={3}
            showAddButton={true}
            onNavigateToFull={() => router.push(`/${locale}/illnesses`)}
            data-testid="dashboard-illnesses-card"
            className="h-full"
          />
        </div>

        {/* Medications Management Card */}
        <div id="medications-section" className="h-full">
          <MedicationsCard
            maxItems={4}
            showAddButton={true}
            onNavigateToFull={() => router.push(`/${locale}/medications`)}
            data-testid="dashboard-medications-card"
            className="h-full"
          />
        </div>

        {/* Allergies Management Card */}
        <div id="allergies-section" className="h-full">
          <AllergiesCard
            maxItems={3}
            showAddButton={true}
            onNavigateToFull={() => router.push(`/${locale}/allergies`)}
            data-testid="dashboard-allergies-card"
            className="h-full"
          />
        </div>

        {/* Surgeries Management Card */}
        <div id="surgeries-section" className="h-full">
          <SurgeriesCard
            maxItems={3}
            showAddButton={true}
            onNavigateToFull={() => router.push(`/${locale}/surgeries`)}
            data-testid="dashboard-surgeries-card"
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};