/**
 * Surgeries Page component
 * Dedicated page for managing patient surgeries
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MedicalDataList } from '../organisms/MedicalDataList';

interface SurgeriesPageProps {
  'data-testid'?: string;
}

export const SurgeriesPage: React.FC<SurgeriesPageProps> = ({
  'data-testid': testId
}) => {
  const t = useTranslations('dashboard.pageTitles');

  return (
    <div className="space-y-6" data-testid={testId}>
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('surgeries')}
        </h1>
        <p className="text-gray-600">
          Mantén un registro completo de todas tus cirugías y procedimientos médicos para un historial médico detallado.
        </p>
      </div>

      <MedicalDataList
        type="surgeries"
        title="Cirugías"
        emptyStateMessage="Registra información sobre cirugías o procedimientos médicos que hayas tenido para mantener un historial completo."
        data-testid="surgeries-list"
      />
    </div>
  );
};