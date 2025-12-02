/**
 * MedicationsCard molecule component
 * Dashboard integration card for medication management with CRUD functionality
 * Replaces the "Medicamentos Recientes" section in dashboard
 */
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MedicationsCardProps, Medication } from '../../types';
import { MedicationCard } from './MedicationCard';
import { MedicationForm } from './MedicationForm';
import { MedicationIcon } from '../atoms/MedicationIcon';
import { useMedications } from '../../hooks/useMedications';
import { useMedicationActions } from '../../hooks/useMedicationActions';
import { medicationToFormData } from '../../utils/medicationHelpers';

export const MedicationsCard: React.FC<MedicationsCardProps> = ({
  maxItems = 3,
  showAddButton = true,
  onNavigateToFull,
  onAddNew,
  className = '',
  'data-testid': testId
}) => {
  const t = useTranslations('medications');
  const tCommon = useTranslations('common');
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const { medications, loading, error, refetch } = useMedications();
  const { createMedication, updateMedication, deleteMedication, isLoading: actionLoading } = useMedicationActions();

  // Get recent medications for display
  const recentMedications = medications
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, maxItems);

  const handleAddNew = () => {
    setEditingMedication(null);
    setShowForm(true);
    if (onAddNew) {
      onAddNew();
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingMedication) {
        await updateMedication(editingMedication.id, formData);
      } else {
        await createMedication(formData);
      }
      setShowForm(false);
      setEditingMedication(null);
      await refetch();
    } catch (error) {
      // Error is handled by the hook
      console.error('Form submission error:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMedication(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMedication(id);
      await refetch();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const medication = medications.find(med => med.id === id);
      if (medication) {
        const updatedData = {
          ...medicationToFormData(medication),
          isActive
        };
        await updateMedication(id, updatedData);
        await refetch();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  const handleViewAll = () => {
    if (onNavigateToFull) {
      onNavigateToFull();
    }
  };

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

  // Show form overlay
  if (showForm) {
    return (
      <div className={`bg-white rounded-xl border border-vitalgo-dark-lightest ${className}`} data-testid={testId}>
        <MedicationForm
          initialData={editingMedication ? medicationToFormData(editingMedication) : {}}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={actionLoading}
          mode={editingMedication ? 'edit' : 'create'}
          data-testid={`${testId}-form`}
        />
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
            <MedicationIcon
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
                {t('medicationCount', { count: medications.length })}
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
          ) : recentMedications.length > 0 ? (
            <div className="space-y-4">
              {recentMedications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  compact={true}
                  showActions={true}
                  data-testid={`${testId}-medication-${medication.id}`}
                />
              ))}

              {/* View All Footer */}
              {medications.length >= 1 && onNavigateToFull && (
                <div className="pt-4 border-t border-vitalgo-dark-lightest">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAll();
                    }}
                    className="w-full text-center text-sm text-vitalgo-green hover:text-vitalgo-green-light font-medium"
                    data-testid={`${testId}-view-all-footer`}
                  >
                    {t('viewAll', { count: medications.length })}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-vitalgo-green-lightest rounded-full flex items-center justify-center mb-4">
                <MedicationIcon
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