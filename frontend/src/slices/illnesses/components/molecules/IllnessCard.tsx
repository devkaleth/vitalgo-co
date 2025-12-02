/**
 * IllnessCard molecule component
 * VitalGo brand-compliant card for displaying individual illness information
 * Follows exact same pattern as MedicationCard
 */
'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { IllnessCardProps } from '../../types';
import { IllnessIcon } from '../atoms/IllnessIcon';
import { IllnessStatus } from '../atoms/IllnessStatus';

// Helper functions
const formatDate = (dateString: string, locale: string): string => {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateShort = (dateString: string, locale: string): string => {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const IllnessCard: React.FC<IllnessCardProps> = ({
  illness,
  onEdit,
  onDelete,
  onToggleCured,
  showActions = true,
  compact = false,
  'data-testid': testId
}) => {
  const t = useTranslations('illnesses.card');
  const locale = useLocale();

  // Helper function for getting illness summary with translations (for compact mode)
  const getIllnessSummary = (illness: any): string => {
    const parts = [];
    if (illness.diagnosedBy) parts.push(`${t('labels.diagnosedBy')} ${illness.diagnosedBy}`);
    if (illness.treatmentDescription) parts.push(illness.treatmentDescription);
    return parts.join(' • ') || t('emptyStates.noDetails');
  };

  const cardClasses = `
    bg-white rounded-xl border border-vitalgo-dark-lightest p-4
    hover:shadow-md transition-shadow duration-200
    ${compact ? 'p-3' : 'p-4'}
  `;

  const titleClasses = `
    font-semibold text-vitalgo-dark
    ${compact ? 'text-sm' : 'text-base'}
  `;

  const subtitleClasses = `
    text-vitalgo-dark-light
    ${compact ? 'text-xs' : 'text-sm'}
  `;

  const metadataClasses = `
    text-vitalgo-dark-lighter
    ${compact ? 'text-xs' : 'text-xs'}
  `;

  return (
    <div className={cardClasses} data-testid={testId}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Illness Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <IllnessIcon
              size={compact ? 'md' : 'lg'}
              color="primary"
              data-testid={`${testId}-icon`}
            />
          </div>

          {/* Illness Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`${titleClasses} truncate`} title={illness.illnessName}>
              {illness.illnessName}
            </h3>
            <p className={`${subtitleClasses} mt-1`}>
              {t('labels.diagnosed')}: {illness.diagnosisDate ? formatDate(illness.diagnosisDate, locale) : t('emptyStates.noDate')}
            </p>
            {illness.diagnosedBy && !compact && (
              <p className={`${metadataClasses} mt-1`}>
                {t('labels.diagnosedBy')}: {illness.diagnosedBy}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0 ml-3">
          <IllnessStatus
            illness={illness}
            size={compact ? 'sm' : 'md'}
            data-testid={`${testId}-status`}
          />
        </div>
      </div>

      {/* Treatment Information */}
      {!compact && illness.treatmentDescription && (
        <div className="mb-3">
          <p className={`${subtitleClasses} line-clamp-2`} title={illness.treatmentDescription}>
            <span className="font-medium">{t('labels.treatment')}:</span> {illness.treatmentDescription}
          </p>
        </div>
      )}

      {/* CIE-11 Code */}
      {illness.cie10Code && (
        <div className={`mb-3 bg-blue-50 border border-blue-100 rounded-lg ${compact ? 'p-1.5' : 'p-2'}`}>
          <div className="flex items-start space-x-2">
            <svg className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600 mt-0.5 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <div className="flex items-center group relative">
                <span className="text-xs font-semibold text-blue-900">
                  {t('labels.cie10')}: <span className="font-mono text-blue-700">{illness.cie10Code}</span>
                </span>
                <svg className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-blue-600 ml-1 cursor-help`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {/* Tooltip with full explanation */}
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg">
                  {t('labels.cie10Explanation')}
                  <div className="absolute left-4 top-full w-2 h-2 bg-gray-900 transform rotate-45 -mt-1"></div>
                </div>
              </div>
              {!compact && (
                <p className="text-xs text-blue-700 mt-1">
                  {t('labels.cie10Brief')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {illness.notes && !compact && (
        <div className="mb-3">
          <p className={`${subtitleClasses} line-clamp-2`} title={illness.notes}>
            {illness.notes}
          </p>
        </div>
      )}

      {/* Footer Section */}
      <div className="flex items-center justify-between">
        {/* Last Updated */}
        <div className="flex items-center">
          <svg className="h-3 w-3 text-vitalgo-dark-lighter mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={metadataClasses}>
            {t('labels.updated')}: {formatDateShort(illness.updatedAt, locale)}
          </span>
        </div>

        {/* Actions */}
        {showActions && (onEdit || onDelete || onToggleCured) && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(illness)}
                className="inline-flex items-center text-xs font-medium text-vitalgo-green hover:text-vitalgo-green-light transition-colors duration-150"
                data-testid={`${testId}-edit-button`}
              >
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('actions.edit')}
              </button>
            )}
            {onToggleCured && (
              <button
                onClick={() => onToggleCured(illness.id, illness.status === 'activa' || illness.status === 'en_tratamiento' ? 'curada' : 'activa')}
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150"
                data-testid={`${testId}-toggle-button`}
              >
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {illness.status === 'curada' ? t('actions.markAsActive') : t('actions.markAsCured')}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(illness.id)}
                className="inline-flex items-center text-xs font-medium text-red-600 hover:text-red-700 transition-colors duration-150"
                data-testid={`${testId}-delete-button`}
              >
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('actions.delete')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Compact Summary for very small cards */}
      {compact && (
        <div className="mt-2 pt-2 border-t border-vitalgo-dark-lightest">
          <p className={`${metadataClasses} truncate`} title={getIllnessSummary(illness)}>
            {getIllnessSummary(illness)}
          </p>
        </div>
      )}
    </div>
  );
};