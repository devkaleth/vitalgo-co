/**
 * Illnesses Page component
 * Dedicated page for managing patient illnesses
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MedicalDataList } from '../organisms/MedicalDataList';

interface IllnessesPageProps {
  'data-testid'?: string;
}

export const IllnessesPage: React.FC<IllnessesPageProps> = ({
  'data-testid': testId
}) => {
  const t = useTranslations('dashboard.pageTitles');

  return (
    <div className="space-y-6" data-testid={testId}>
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('illnesses')}
        </h1>
        <p className="text-gray-600">
          Registra enfermedades diagnosticadas para mantener un historial médico completo y facilitar el seguimiento de tu salud.
        </p>
      </div>

      <MedicalDataList
        type="illnesses"
        title="Enfermedades"
        emptyStateMessage="Agrega información sobre enfermedades diagnosticadas para un mejor seguimiento de tu historial médico."
        data-testid="illnesses-list"
      />
    </div>
  );
};