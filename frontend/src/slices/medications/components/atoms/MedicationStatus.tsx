/**
 * MedicationStatus atom component
 * VitalGo brand-compliant status badge for medications
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Medication } from '../../types';
import { isExpired, isExpiringSoon } from '../../utils/medicationHelpers';

interface MedicationStatusProps {
  medication: Medication;
  size?: 'sm' | 'md';
  className?: string;
  'data-testid'?: string;
}

export const MedicationStatus: React.FC<MedicationStatusProps> = ({
  medication,
  size = 'md',
  className = '',
  'data-testid': testId
}) => {
  const t = useTranslations('medications');

  // Determine status key based on medication state
  const getStatusKey = (): string => {
    if (!medication.isActive) return 'suspended';
    if (isExpired(medication.endDate)) return 'ended';
    return 'active';
  };

  const statusKey = getStatusKey();
  const statusLabel = t(`statusLabels.${statusKey}`);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  // VitalGo brand-compliant color scheme
  const getStatusClasses = () => {
    switch (statusKey) {
      case 'active':
        return 'bg-vitalgo-green-lightest text-vitalgo-dark border-vitalgo-green-lighter';
      case 'suspended':
        return 'bg-vitalgo-dark-lightest text-vitalgo-dark-light border-vitalgo-dark-lighter';
      case 'ended':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDotColor = () => {
    switch (statusKey) {
      case 'active':
        return 'bg-vitalgo-green';
      case 'suspended':
        return 'bg-vitalgo-dark-lighter';
      case 'ended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${sizeClasses[size]}
        ${getStatusClasses()}
        ${className}
      `}
      data-testid={testId}
      title={`${t('status')}: ${statusLabel}`}
    >
      {/* Status indicator dot */}
      <span
        className={`inline-block w-2 h-2 rounded-full mr-1 ${getDotColor()}`}
        aria-hidden="true"
      />
      {statusLabel}
    </span>
  );
};