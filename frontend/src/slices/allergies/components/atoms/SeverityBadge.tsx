/**
 * SeverityBadge atom component
 * VitalGo brand-compliant severity level badge for allergies
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SeverityLevel } from '../../types';

interface SeverityBadgeProps {
  severityLevel: SeverityLevel;
  size?: 'sm' | 'md';
  className?: string;
  'data-testid'?: string;
}

const severityConfig = {
  leve: {
    color: 'bg-green-50 text-green-700 border-green-200',
    dotColor: 'bg-green-500'
  },
  moderada: {
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dotColor: 'bg-yellow-500'
  },
  severa: {
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    dotColor: 'bg-orange-500'
  },
  critica: {
    color: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500'
  }
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severityLevel,
  size = 'md',
  className = '',
  'data-testid': testId
}) => {
  const t = useTranslations('allergies');
  const config = severityConfig[severityLevel];
  const severityLabel = t(`severityLabels.${severityLevel}`);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${sizeClasses[size]}
        ${config.color}
        ${className}
      `}
      data-testid={testId}
      title={`${t('severity')}: ${severityLabel}`}
    >
      {/* Severity indicator dot */}
      <span
        className={`inline-block w-2 h-2 rounded-full mr-1 ${config.dotColor}`}
        aria-hidden="true"
      />
      {severityLabel}
    </span>
  );
};