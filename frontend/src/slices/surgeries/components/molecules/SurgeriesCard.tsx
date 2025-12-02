/**
 * SurgeriesCard molecule component
 * Dashboard integration card for surgery management with CRUD functionality
 */
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SurgeriesCardProps, Surgery } from '../../types';
import { SurgeryIcon } from '../atoms/SurgeryIcon';
import { SurgeryCard } from './SurgeryCard';
import { SurgeryForm } from './SurgeryForm';
import { useSurgeries } from '../../hooks/useSurgeries';
import { useSurgeryActions } from '../../hooks/useSurgeryActions';
import { surgeryToFormData, formatDateShort, getSurgerySummary } from '../../utils/surgeryHelpers';

export const SurgeriesCard: React.FC<SurgeriesCardProps> = ({
  maxItems = 3,
  showAddButton = true,
  onNavigateToFull,
  onAddNew,
  className = '',
  'data-testid': testId
}) => {
  const t = useTranslations('surgeries');
  const tCommon = useTranslations('common');
  const [showForm, setShowForm] = useState(false);
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);

  const { surgeries, loading, error, refetch } = useSurgeries();
  const { createSurgery, updateSurgery, deleteSurgery, isLoading: actionLoading } = useSurgeryActions();

  // Get recent surgeries for display
  const recentSurgeries = surgeries
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, maxItems);

  const handleAddNew = () => {
    setEditingSurgery(null);
    setShowForm(true);
    if (onAddNew) {
      onAddNew();
    }
  };

  const handleEdit = (surgery: Surgery) => {
    setEditingSurgery(surgery);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingSurgery) {
        await updateSurgery(editingSurgery.id, formData);
      } else {
        await createSurgery(formData);
      }
      setShowForm(false);
      setEditingSurgery(null);
      await refetch();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSurgery(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSurgery(id);
      await refetch();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleViewAll = () => {
    if (onNavigateToFull) {
      onNavigateToFull();
    }
  };

  // Show form overlay - inline form replacement pattern like MedicationsCard and AllergiesCard
  if (showForm) {
    return (
      <div className={`bg-white rounded-xl border border-vitalgo-dark-lightest ${className}`} data-testid={testId}>
        <SurgeryForm
          initialData={editingSurgery ? surgeryToFormData(editingSurgery) : {}}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={actionLoading}
          mode={editingSurgery ? 'edit' : 'create'}
          data-testid={`${testId}-form`}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-red-200 p-6 ${className}`} data-testid={testId}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-red-800 font-medium">{t('errors.loadFailed')}</h3>
        </div>
        <p className="text-red-600 mt-1 text-sm">{error}</p>
        <button
          onClick={refetch}
          className="mt-3 text-sm font-medium text-vitalgo-green hover:text-vitalgo-green-light"
        >
          {tCommon('retry')}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-vitalgo-dark-lightest hover:shadow-lg hover:border-vitalgo-green transition-all duration-200 flex flex-col ${className}`}
      data-testid={testId}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 pb-0 cursor-pointer flex-shrink-0"
        onClick={handleViewAll}
      >
        <div className="flex items-center flex-1">
          <SurgeryIcon
            size="lg"
            color="primary"
            className="mr-3"
            data-testid={`${testId}-header-icon`}
          />
          <div>
            <h2 className="text-lg font-semibold text-vitalgo-dark">
              {t('title')}
            </h2>
            <p className="text-sm text-vitalgo-dark-light">
              {t('surgeryCount', { count: surgeries.length })}
            </p>
          </div>
        </div>

        {showAddButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddNew();
            }}
            disabled={loading || actionLoading}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-vitalgo-green rounded-lg hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green transition-colors duration-150 disabled:opacity-50 z-10"
            data-testid={`${testId}-add-button`}
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('actions.add')}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pt-6 flex-1 flex flex-col">
      {loading ? (
        <div className="space-y-4">
          {[...Array(maxItems)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-20"></div>
            </div>
          ))}
        </div>
      ) : recentSurgeries.length > 0 ? (
        <div className="space-y-4">
          {recentSurgeries.map((surgery) => (
            <SurgeryCard
              key={surgery.id}
              surgery={surgery}
              onEdit={handleEdit}
              onDelete={handleDelete}
              compact={true}
              data-testid={`${testId}-surgery-${surgery.id}`}
            />
          ))}

          {/* View All Footer */}
          {surgeries.length >= 1 && onNavigateToFull && (
            <div className="pt-4 border-t border-vitalgo-dark-lightest">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewAll();
                }}
                className="w-full text-center text-sm text-vitalgo-green hover:text-vitalgo-green-light font-medium"
                data-testid={`${testId}-view-all-footer`}
              >
                {t('viewAll', { count: surgeries.length })}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-vitalgo-green-lightest rounded-full flex items-center justify-center mb-4">
            <SurgeryIcon
              size="xl"
              color="primary"
              data-testid={`${testId}-empty-icon`}
            />
          </div>
          <h3 className="text-lg font-medium text-vitalgo-dark mb-2">
            {t('emptyState.title')}
          </h3>
          <p className="text-vitalgo-dark-light mb-4">
            {t('emptyState.description')}
          </p>
          {showAddButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddNew();
              }}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-vitalgo-green rounded-lg hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green transition-colors duration-150 disabled:opacity-50 z-10"
              data-testid={`${testId}-empty-add-button`}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('emptyState.addFirst')}
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
};