/**
 * Allergies Page component
 * Dedicated page for managing patient allergies
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MedicalDataList } from '../organisms/MedicalDataList';

interface AllergiesPageProps {
  'data-testid'?: string;
}

export const AllergiesPage: React.FC<AllergiesPageProps> = ({
  'data-testid': testId
}) => {
  const t = useTranslations('dashboard.pageTitles');

  return (
    <div className="space-y-6" data-testid={testId}>
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('allergies')}
        </h1>
        <p className="text-gray-600">
          Registra tus alergias conocidas para mantener un historial médico completo y evitar posibles reacciones adversas.
        </p>
      </div>

      <MedicalDataList
        type="allergies"
        title="Alergias"
        emptyStateMessage="Agrega información sobre tus alergias conocidas para mantener un historial médico completo."
        data-testid="allergies-list"
      />
    </div>
  );
};