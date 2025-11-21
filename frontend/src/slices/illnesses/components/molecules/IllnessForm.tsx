/**
 * IllnessForm molecule component
 * Inline form for creating and editing illnesses
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { IllnessFormProps, ILLNESS_STATUS_OPTIONS } from '../../types';
import { useIllnessForm } from '../../hooks/useIllnessForm';

export const IllnessForm: React.FC<IllnessFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  'data-testid': testId
}) => {
  const t = useTranslations('illnesses.form');

  const {
    formData,
    errors,
    isValid,
    isSubmitting,
    handleChange,
    handleSubmit
  } = useIllnessForm({
    initialData,
    onSubmit
  });

  const isFormLoading = isLoading || isSubmitting;

  // VitalGo brand-compliant field classes with error states
  const fieldClasses = (fieldName: keyof typeof errors) => `
    w-full px-3 py-2 border rounded-md text-base
    focus:outline-none focus:ring-2 transition-colors duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
    ${errors[fieldName]
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-vitalgo-dark-lighter focus:ring-vitalgo-green focus:border-vitalgo-green'
    }
  `;

  const errorClasses = 'mt-1 text-sm text-red-600 font-medium';
  const labelClasses = 'block text-sm font-medium text-vitalgo-dark mb-1';
  const requiredClasses = 'text-red-500';

  return (
    <div className="bg-white rounded-xl border border-vitalgo-dark-lightest p-6" data-testid={testId}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-vitalgo-dark">
          {t(initialData ? 'title.edit' : 'title.create')}
        </h3>
        <p className="text-sm text-vitalgo-dark-light mt-1">
          {t(initialData ? 'subtitle.edit' : 'subtitle.create')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Row 1: Illness Name and Diagnosis Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Illness Name */}
          <div>
            <label htmlFor="illnessName" className={labelClasses}>
              {t('fields.illnessName')} <span className={requiredClasses}>*</span>
            </label>
            <input
              type="text"
              id="illnessName"
              value={formData.illnessName}
              onChange={(e) => handleChange('illnessName', e.target.value)}
              className={fieldClasses('illnessName')}
              disabled={isFormLoading}
              placeholder={t('placeholders.illnessName')}
              data-testid={`${testId}-illness-name`}
              style={{ fontSize: '16px' }}
              autoComplete="off"
            />
            {errors.illnessName && (
              <p className={errorClasses}>{errors.illnessName}</p>
            )}
          </div>

          {/* Diagnosis Date */}
          <div>
            <label htmlFor="diagnosisDate" className={labelClasses}>
              {t('fields.diagnosisDate')}
            </label>
            <input
              type="date"
              id="diagnosisDate"
              value={formData.diagnosisDate}
              onChange={(e) => handleChange('diagnosisDate', e.target.value)}
              className={fieldClasses('diagnosisDate')}
              disabled={isFormLoading}
              data-testid={`${testId}-diagnosis-date`}
              style={{ fontSize: '16px' }}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.diagnosisDate && (
              <p className={errorClasses}>{errors.diagnosisDate}</p>
            )}
          </div>
        </div>

        {/* Row 2: Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="status" className={labelClasses}>
              {t('fields.status')} <span className={requiredClasses}>*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={fieldClasses('status')}
              disabled={isFormLoading}
              data-testid={`${testId}-status`}
              style={{ fontSize: '16px' }}
            >
              {ILLNESS_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className={errorClasses}>{errors.status}</p>
            )}
          </div>
        </div>

        {/* Row 3: CIE-10 Code and Diagnosed By */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CIE-11 Code */}
          <div>
            <label htmlFor="cie10Code" className={labelClasses}>
              {t('fields.cie10Code')}
              <span className="ml-2 inline-flex items-center group relative">
                <svg className="h-3.5 w-3.5 text-blue-600 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {/* Tooltip */}
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg">
                  <strong className="block mb-1">{t('fields.cie10Code')}</strong>
                  {t('cie10Explanation')}
                  <div className="absolute left-4 top-full w-2 h-2 bg-gray-900 transform rotate-45 -mt-1"></div>
                </div>
              </span>
            </label>
            <input
              type="text"
              id="cie10Code"
              value={formData.cie10Code}
              onChange={(e) => handleChange('cie10Code', e.target.value)}
              className={fieldClasses('cie10Code')}
              disabled={isFormLoading}
              placeholder={t('placeholders.cie10Code')}
              maxLength={10}
              data-testid={`${testId}-cie10-code`}
              style={{ fontSize: '16px' }}
              autoComplete="off"
            />
            {/* Help text */}
            <p className="mt-1 text-xs text-blue-700 flex items-start">
              <svg className="h-3.5 w-3.5 text-blue-600 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('cie10Brief')}</span>
            </p>
            {errors.cie10Code && (
              <p className={errorClasses}>{errors.cie10Code}</p>
            )}
          </div>

          {/* Diagnosed By */}
          <div>
            <label htmlFor="diagnosedBy" className={labelClasses}>
              {t('fields.diagnosedBy')}
            </label>
            <input
              type="text"
              id="diagnosedBy"
              value={formData.diagnosedBy}
              onChange={(e) => handleChange('diagnosedBy', e.target.value)}
              className={fieldClasses('diagnosedBy')}
              disabled={isFormLoading}
              placeholder={t('placeholders.diagnosedBy')}
              data-testid={`${testId}-diagnosed-by`}
              style={{ fontSize: '16px' }}
              autoComplete="off"
            />
            {errors.diagnosedBy && (
              <p className={errorClasses}>{errors.diagnosedBy}</p>
            )}
          </div>
        </div>

        {/* Treatment Description */}
        <div>
          <label htmlFor="treatmentDescription" className={labelClasses}>
            {t('fields.treatmentDescription')}
          </label>
          <textarea
            id="treatmentDescription"
            value={formData.treatmentDescription}
            onChange={(e) => handleChange('treatmentDescription', e.target.value)}
            className={`${fieldClasses('treatmentDescription')} resize-none`}
            rows={3}
            disabled={isFormLoading}
            placeholder={t('placeholders.treatmentDescription')}
            data-testid={`${testId}-treatment-description`}
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className={labelClasses}>
            {t('fields.notes')}
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className={`${fieldClasses('notes')} resize-none`}
            rows={3}
            disabled={isFormLoading}
            placeholder={t('placeholders.notes')}
            data-testid={`${testId}-notes`}
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-vitalgo-dark-lightest">
          <button
            type="button"
            onClick={onCancel}
            disabled={isFormLoading}
            className="px-4 py-2 text-sm font-medium text-vitalgo-dark bg-white border border-vitalgo-dark-lighter rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-vitalgo-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            data-testid={`${testId}-cancel-button`}
          >
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-vitalgo-green border border-transparent rounded-lg hover:bg-vitalgo-green-dark focus:outline-none focus:ring-2 focus:ring-vitalgo-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center"
            disabled={!isValid || isFormLoading}
            data-testid={`${testId}-submit-button`}
          >
            {isFormLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {t(initialData ? 'actions.update' : 'actions.save')}
          </button>
        </div>
      </form>
    </div>
  );
};