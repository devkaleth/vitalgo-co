/**
 * SurgeryForm molecule component
 * Brand-compliant form for creating/editing surgeries following MANUAL_DE_MARCA.md
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SurgeryFormProps, AnesthesiaTypeOption } from '../../types';
import { useSurgeryForm } from '../../hooks/useSurgeryForm';

export const SurgeryForm: React.FC<SurgeryFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  'data-testid': testId
}) => {
  const t = useTranslations('surgeries.form');

  const {
    formData,
    errors,
    isValid,
    isSubmitting,
    handleInputChange,
    handleSubmit
  } = useSurgeryForm({
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

  const anesthesiaOptions: AnesthesiaTypeOption[] = [
    { value: '', label: t('options.anesthesiaTypes.') },
    { value: 'general', label: t('options.anesthesiaTypes.general') },
    { value: 'local', label: t('options.anesthesiaTypes.local') },
    { value: 'regional', label: t('options.anesthesiaTypes.regional') },
    { value: 'spinal', label: t('options.anesthesiaTypes.spinal') },
    { value: 'epidural', label: t('options.anesthesiaTypes.epidural') },
    { value: 'conscious_sedation', label: t('options.anesthesiaTypes.conscious_sedation') },
    { value: 'other', label: t('options.anesthesiaTypes.other') }
  ];

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
        {/* Procedure Name */}
        <div>
          <label htmlFor="procedureName" className={labelClasses}>
            {t('fields.procedureName')} <span className={requiredClasses}>*</span>
          </label>
          <input
            type="text"
            id="procedureName"
            value={formData.procedureName}
            onChange={(e) => handleInputChange('procedureName', e.target.value)}
            className={fieldClasses('procedureName')}
            placeholder={t('placeholders.procedureName')}
            disabled={isFormLoading}
            data-testid={`${testId}-procedure-name`}
            style={{ fontSize: '16px' }} // Prevents iOS zoom
            autoComplete="off"
          />
          {errors.procedureName && (
            <p className={errorClasses} data-testid={`${testId}-procedure-name-error`}>
              {errors.procedureName}
            </p>
          )}
        </div>

        {/* Surgery Date */}
        <div>
          <label htmlFor="surgeryDate" className={labelClasses}>
            {t('fields.surgeryDate')}
          </label>
          <input
            type="date"
            id="surgeryDate"
            value={formData.surgeryDate}
            onChange={(e) => handleInputChange('surgeryDate', e.target.value)}
            className={fieldClasses('surgeryDate')}
            disabled={isFormLoading}
            data-testid={`${testId}-surgery-date`}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            style={{ fontSize: '16px' }} // Prevents iOS zoom
          />
          {errors.surgeryDate && (
            <p className={errorClasses} data-testid={`${testId}-surgery-date-error`}>
              {errors.surgeryDate}
            </p>
          )}
        </div>

        {/* Two-column layout for hospital and surgeon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hospital Name */}
          <div>
            <label htmlFor="hospitalName" className={labelClasses}>
              {t('fields.hospitalName')}
            </label>
            <input
              type="text"
              id="hospitalName"
              value={formData.hospitalName || ''}
              onChange={(e) => handleInputChange('hospitalName', e.target.value)}
              className={fieldClasses('hospitalName')}
              placeholder={t('placeholders.hospitalName')}
              disabled={isFormLoading}
              data-testid={`${testId}-hospital-name`}
              style={{ fontSize: '16px' }} // Prevents iOS zoom
              autoComplete="off"
            />
            {errors.hospitalName && (
              <p className={errorClasses} data-testid={`${testId}-hospital-name-error`}>
                {errors.hospitalName}
              </p>
            )}
          </div>

          {/* Surgeon Name */}
          <div>
            <label htmlFor="surgeonName" className={labelClasses}>
              {t('fields.surgeonName')}
            </label>
            <input
              type="text"
              id="surgeonName"
              value={formData.surgeonName || ''}
              onChange={(e) => handleInputChange('surgeonName', e.target.value)}
              className={fieldClasses('surgeonName')}
              placeholder={t('placeholders.surgeonName')}
              disabled={isFormLoading}
              data-testid={`${testId}-surgeon-name`}
              style={{ fontSize: '16px' }} // Prevents iOS zoom
              autoComplete="off"
            />
            {errors.surgeonName && (
              <p className={errorClasses} data-testid={`${testId}-surgeon-name-error`}>
                {errors.surgeonName}
              </p>
            )}
          </div>
        </div>

        {/* Two-column layout for anesthesia and duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anesthesia Type */}
          <div>
            <label htmlFor="anesthesiaType" className={labelClasses}>
              {t('fields.anesthesiaType')}
            </label>
            <select
              id="anesthesiaType"
              value={formData.anesthesiaType || ''}
              onChange={(e) => handleInputChange('anesthesiaType', e.target.value)}
              className={fieldClasses('anesthesiaType')}
              disabled={isFormLoading}
              data-testid={`${testId}-anesthesia-type`}
              style={{ fontSize: '16px' }} // Prevents iOS zoom
            >
              {anesthesiaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.anesthesiaType && (
              <p className={errorClasses} data-testid={`${testId}-anesthesia-type-error`}>
                {errors.anesthesiaType}
              </p>
            )}
          </div>

          {/* Duration Hours */}
          <div>
            <label htmlFor="durationHours" className={labelClasses}>
              {t('fields.durationHours')}
            </label>
            <input
              type="number"
              id="durationHours"
              value={formData.durationHours || ''}
              onChange={(e) => handleInputChange('durationHours', e.target.value ? parseInt(e.target.value) : undefined)}
              className={fieldClasses('durationHours')}
              placeholder={t('placeholders.durationHours')}
              min="0"
              max="24"
              step="1"
              disabled={isFormLoading}
              data-testid={`${testId}-duration-hours`}
              style={{ fontSize: '16px' }} // Prevents iOS zoom
            />
            {errors.durationHours && (
              <p className={errorClasses} data-testid={`${testId}-duration-hours-error`}>
                {errors.durationHours}
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className={labelClasses}>
            {t('fields.notes')}
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className={fieldClasses('notes')}
            placeholder={t('placeholders.notes')}
            rows={3}
            disabled={isFormLoading}
            data-testid={`${testId}-notes`}
            style={{ fontSize: '16px' }} // Prevents iOS zoom
          />
          {errors.notes && (
            <p className={errorClasses} data-testid={`${testId}-notes-error`}>
              {errors.notes}
            </p>
          )}
        </div>

        {/* Complications */}
        <div>
          <label htmlFor="complications" className={labelClasses}>
            {t('fields.complications')}
          </label>
          <textarea
            id="complications"
            value={formData.complications || ''}
            onChange={(e) => handleInputChange('complications', e.target.value)}
            className={fieldClasses('complications')}
            placeholder={t('placeholders.complications')}
            rows={3}
            disabled={isFormLoading}
            data-testid={`${testId}-complications`}
            style={{ fontSize: '16px' }} // Prevents iOS zoom
          />
          {errors.complications && (
            <p className={errorClasses} data-testid={`${testId}-complications-error`}>
              {errors.complications}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-vitalgo-dark-lightest">
          <button
            type="button"
            onClick={onCancel}
            disabled={isFormLoading}
            className="px-4 py-2 text-sm font-medium text-vitalgo-dark bg-white border border-vitalgo-dark-lighter rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-vitalgo-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            data-testid={`${testId}-cancel`}
          >
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            disabled={!isValid || isFormLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-vitalgo-green border border-transparent rounded-lg hover:bg-vitalgo-green-dark focus:outline-none focus:ring-2 focus:ring-vitalgo-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center"
            data-testid={`${testId}-submit`}
          >
            {isFormLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {t(mode === 'edit' ? 'actions.update' : 'actions.save')}
          </button>
        </div>
      </form>
    </div>
  );
};