/**
 * Dashboard Stats molecule component
 * Displays grid of statistics cards with medical data overview
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { StatsCard } from '../atoms/StatsCard';
import { DashboardStats as DashboardStatsType } from '../../types';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  loading?: boolean;
  'data-testid'?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  loading = false,
  'data-testid': testId
}) => {
  const t = useTranslations('dashboard');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Offset for navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid={testId}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-6 rounded-lg border-2 border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-8 bg-gray-300 rounded w-12"></div>
              </div>
              <div className="h-8 w-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const medicationIcon = (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );

  const allergyIcon = (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );

  const surgeryIcon = (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l4-4 8 8-4 4-8-8z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18l3-3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 16l2-2" />
    </svg>
  );

  const illnessIcon = (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid={testId}>
      <StatsCard
        title={t('stats.medications')}
        value={stats.active_medications}
        icon={medicationIcon}
        variant="info"
        onClick={() => scrollToSection('medications-section')}
        data-testid="stats-medications"
      />

      <StatsCard
        title={t('stats.allergies')}
        value={stats.active_allergies}
        icon={allergyIcon}
        variant="warning"
        onClick={() => scrollToSection('allergies-section')}
        data-testid="stats-allergies"
      />

      <StatsCard
        title={t('stats.surgeries')}
        value={stats.active_surgeries}
        icon={surgeryIcon}
        variant="default"
        onClick={() => scrollToSection('surgeries-section')}
        data-testid="stats-surgeries"
      />

      <StatsCard
        title={t('stats.illnesses')}
        value={stats.active_illnesses}
        icon={illnessIcon}
        variant="warning"
        onClick={() => scrollToSection('illnesses-section')}
        data-testid="stats-illnesses"
      />
    </div>
  );
};