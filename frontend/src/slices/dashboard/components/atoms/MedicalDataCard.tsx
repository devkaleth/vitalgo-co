/**
 * Medical Data Card atom component
 * Displays individual medical data items with edit/delete actions
 */
import React from 'react';
import { useTranslations } from 'next-intl';
import { PatientMedication, PatientAllergy, PatientSurgery, PatientIllness } from '../../types';

type MedicalDataItem = PatientMedication | PatientAllergy | PatientSurgery | PatientIllness;

interface MedicalDataCardProps {
  data: MedicalDataItem;
  type: 'medication' | 'allergy' | 'surgery' | 'illness';
  onEdit?: (data: MedicalDataItem) => void;
  onDelete?: (id: number) => void;
  'data-testid'?: string;
}

export const MedicalDataCard: React.FC<MedicalDataCardProps> = ({
  data,
  type,
  onEdit,
  onDelete,
  'data-testid': testId
}) => {
  const t = useTranslations('dashboard.labels');
  const getTypeIcon = () => {
    switch (type) {
      case 'medication':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'allergy':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'surgery':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'illness':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getMainTitle = () => {
    switch (type) {
      case 'medication':
        return (data as PatientMedication).medication_name;
      case 'allergy':
        return (data as PatientAllergy).allergy_name;
      case 'surgery':
        return (data as PatientSurgery).surgery_name;
      case 'illness':
        return (data as PatientIllness).illness_name;
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'medication':
        const med = data as PatientMedication;
        return `${med.dosage} - ${med.frequency}`;
      case 'allergy':
        const allergy = data as PatientAllergy;
        return `${t('severity')}: ${allergy.severity}`;
      case 'surgery':
        const surgery = data as PatientSurgery;
        return new Date(surgery.surgery_date).toLocaleDateString('es-ES');
      case 'illness':
        const illness = data as PatientIllness;
        return `${t('status')}: ${illness.status}`;
    }
  };

  const getStatusBadge = () => {
    if (type === 'medication') {
      const med = data as PatientMedication;
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          med.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {med.is_active ? t('active') : t('inactive')}
        </span>
      );
    }

    if (type === 'allergy') {
      const allergy = data as PatientAllergy;
      const severityColors = {
        mild: 'bg-yellow-100 text-yellow-800',
        moderate: 'bg-orange-100 text-orange-800',
        severe: 'bg-red-100 text-red-800'
      };
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${severityColors[allergy.severity]}`}>
          {allergy.severity}
        </span>
      );
    }

    if (type === 'illness') {
      const illness = data as PatientIllness;
      const statusColors = {
        active: 'bg-red-100 text-red-800',
        resolved: 'bg-green-100 text-green-800',
        managed: 'bg-blue-100 text-blue-800'
      };
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[illness.status]}`}>
          {illness.status}
        </span>
      );
    }

    return null;
  };

  return (
    <div
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
      data-testid={testId}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-gray-500">
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {getMainTitle()}
            </h3>
            <p className="text-sm text-gray-600">
              {getSubtitle()}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {data.notes && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {data.notes}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {new Date(data.updated_at).toLocaleDateString('es-ES')}
        </span>

        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(data)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              data-testid={`${testId}-edit`}
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(data.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              data-testid={`${testId}-delete`}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};