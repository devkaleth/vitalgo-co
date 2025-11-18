/**
 * MedicationForm molecule component
 * Brand-compliant form for creating/editing medications following MANUAL_DE_MARCA.md
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MedicationFormProps } from '../../types';
import { useMedicationForm } from '../../hooks/useMedicationForm';

export const MedicationForm: React.FC<MedicationFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  'data-testid': testId
}) => {
  const t = useTranslations('medications.form');

  const {
    formData,
    errors,
    isValid,
    isSubmitting,
    handleInputChange,
    handleSubmit
  } = useMedicationForm({
    initialData,
    onSubmit,
    onCancel
  });

  const isFormLoading = isLoading || isSubmitting;

  // VitalGo brand-compliant field classes
  const fieldClasses = (fieldName: keyof typeof errors) => `
    w-full px-3 py-2 border rounded-md text-base
    focus:outline-none focus:ring-2 transition-colors duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
    ${errors[fieldName]
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-vitalgo-dark-lighter focus:ring-vitalgo-green focus:border-vitalgo-green'
    }
  `;

  const labelClasses = "block text-sm font-medium text-vitalgo-dark mb-1";
  const errorClasses = "mt-1 text-sm text-red-600 font-medium";
  const requiredClasses = "text-red-500";

  return (
    <div className="bg-white rounded-xl border border-vitalgo-dark-lightest p-6" data-testid={testId}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-vitalgo-dark">
          {t(mode === 'edit' ? 'title.edit' : 'title.create')}
        </h3>
        <p className="text-sm text-vitalgo-dark-light mt-1">
          {t(mode === 'edit' ? 'subtitle.edit' : 'subtitle.create')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Medication Name */}
        <div>
          <label htmlFor="medicationName" className={labelClasses}>
            {t('fields.medicationName')} <span className={requiredClasses}>*</span>
          </label>
          <input
            type="text"
            id="medicationName"
            value={formData.medicationName}
            onChange={(e) => handleInputChange('medicationName', e.target.value)}
            className={fieldClasses('medicationName')}
            placeholder={t('placeholders.medicationName')}
            disabled={isFormLoading}
            data-testid={`${testId}-medication-name`}
            style={{ fontSize: '16px' }} // Prevents iOS zoom
            autoComplete="off"
          />
          {errors.medicationName && (
            <p className={errorClasses} data-testid={`${testId}-medication-name-error`}>
              {errors.medicationName}
            </p>
          )}
        </div>

        {/* Dosage & Frequency Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dosage */}
          <div>
            <label htmlFor="dosage" className={labelClasses}>
              {t('fields.dosage')} <span className={requiredClasses}>*</span>
            </label>
            <input
              type="text"
              id="dosage"
              value={formData.dosage}
              onChange={(e) => handleInputChange('dosage', e.target.value)}
              className={fieldClasses('dosage')}
              placeholder={t('placeholders.dosage')}
              disabled={isFormLoading}
              data-testid={`${testId}-dosage`}
              style={{ fontSize: '16px' }}
              autoComplete="off"
            />
            {errors.dosage && (
              <p className={errorClasses} data-testid={`${testId}-dosage-error`}>
                {errors.dosage}
              </p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="frequency" className={labelClasses}>
              {t('fields.frequency')} <span className={requiredClasses}>*</span>
            </label>
            <input
              type="text"
              id="frequency"
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              className={fieldClasses('frequency')}
              placeholder={t('placeholders.frequency')}
              disabled={isFormLoading}
              data-testid={`${testId}-frequency`}
              style={{ fontSize: '16px' }}
              autoComplete="off"
            />
            {errors.frequency && (
              <p className={errorClasses} data-testid={`${testId}-frequency-error`}>
                {errors.frequency}
              </p>
            )}
          </div>
        </div>

        {/* Date Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className={labelClasses}>
              {t('fields.startDate')}
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={fieldClasses('startDate')}
              disabled={isFormLoading}
              data-testid={`${testId}-start-date`}
              style={{ fontSize: '16px' }}
            />
            {errors.startDate && (
              <p className={errorClasses} data-testid={`${testId}-start-date-error`}>
                {errors.startDate}
              </p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className={labelClasses}>
              {t('fields.endDate')}
            </label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate || ''}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={fieldClasses('endDate')}
              disabled={isFormLoading}
              data-testid={`${testId}-end-date`}
              style={{ fontSize: '16px' }}
              min={formData.startDate}
            />
            {errors.endDate && (
              <p className={errorClasses} data-testid={`${testId}-end-date-error`}>
                {errors.endDate}
              </p>
            )}
            <p className="mt-1 text-xs text-vitalgo-dark-light">
              {t('helpers.endDate')}
            </p>
          </div>
        </div>

        {/* Doctor Field */}
        <div>
          <label htmlFor="prescribedBy" className={labelClasses}>
            {t('fields.prescribedBy')}
          </label>
          <input
            type="text"
            id="prescribedBy"
            value={formData.prescribedBy || ''}
            onChange={(e) => handleInputChange('prescribedBy', e.target.value)}
            className={fieldClasses('prescribedBy')}
            placeholder={t('placeholders.prescribedBy')}
            disabled={isFormLoading}
            data-testid={`${testId}-prescribed-by`}
            style={{ fontSize: '16px' }}
            autoComplete="off"
          />
          {errors.prescribedBy && (
            <p className={errorClasses} data-testid={`${testId}-prescribed-by-error`}>
              {errors.prescribedBy}
            </p>
          )}
        </div>

        {/* Active Status Toggle */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-vitalgo-green focus:ring-vitalgo-green border-vitalgo-dark-lighter rounded transition-colors duration-150"
              disabled={isFormLoading}
              data-testid={`${testId}-is-active`}
            />
          </div>
          <div className="ml-3">
            <label htmlFor="isActive" className="text-sm text-vitalgo-dark cursor-pointer">
              {t('fields.isActive')}
            </label>
            <p className="text-xs text-vitalgo-dark-light">
              {t('helpers.isActive')}
            </p>
          </div>
        </div>

        {/* Notes Field */}
        <div>
          <label htmlFor="notes" className={labelClasses}>
            {t('fields.notes')}
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className={`${fieldClasses('notes')} resize-none`}
            placeholder={t('placeholders.notes')}
            disabled={isFormLoading}
            data-testid={`${testId}-notes`}
            style={{ fontSize: '16px' }}
            maxLength={1000}
          />
          {errors.notes && (
            <p className={errorClasses} data-testid={`${testId}-notes-error`}>
              {errors.notes}
            </p>
          )}
          <p className="mt-1 text-xs text-vitalgo-dark-light">
            {t('helpers.charactersCount', { count: formData.notes?.length || 0 })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-vitalgo-dark-lightest">
          <button
            type="button"
            onClick={onCancel}
            disabled={isFormLoading}
            className="px-4 py-2 text-sm font-medium text-vitalgo-dark bg-white border border-vitalgo-dark-lighter rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-vitalgo-green transition-colors duration-150 h-10 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid={`${testId}-cancel-button`}
          >
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            disabled={isFormLoading || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-vitalgo-green rounded-lg hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green transition-colors duration-150 h-10 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid={`${testId}-submit-button`}
          >
            {isFormLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('actions.saving')}
              </div>
            ) : (
              t(mode === 'edit' ? 'actions.update' : 'actions.save')
            )}
          </button>
        </div>

        {/* Form Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">
                  {t('validation.errorTitle')}
                </h4>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};