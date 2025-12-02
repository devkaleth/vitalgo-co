/**
 * AllergiesCard molecule component
 * Dashboard integration card for allergy management with CRUD functionality
 * Replaces the "Alergias Recientes" section in dashboard
 */
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AllergiesCardProps, Allergy } from '../../types';
import { AllergyCard } from './AllergyCard';
import { AllergyForm } from './AllergyForm';
import { AllergyIcon } from '../atoms/AllergyIcon';
import { useAllergies } from '../../hooks/useAllergies';
import { useAllergyActions } from '../../hooks/useAllergyActions';

// Helper function to convert allergy to form data
const allergyToFormData = (allergy: Allergy) => ({
  allergen: allergy.allergen,
  severityLevel: allergy.severityLevel,
  reactionDescription: allergy.reactionDescription,
  diagnosisDate: allergy.diagnosisDate,
  notes: allergy.notes
});

export const AllergiesCard: React.FC<AllergiesCardProps> = ({
  maxItems = 3,
  showAddButton = true,
  onNavigateToFull,
  onAddNew,
  className = '',
  'data-testid': testId
}) => {
  const t = useTranslations('allergies');
  const tCommon = useTranslations('common');
  const [showForm, setShowForm] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);

  const { allergies, loading, error, refetch } = useAllergies();
  const { createAllergy, updateAllergy, deleteAllergy, isLoading: actionLoading } = useAllergyActions();

  // Get recent allergies for display
  const recentAllergies = allergies
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, maxItems);

  const handleAddNew = () => {
    setEditingAllergy(null);
    setShowForm(true);
    if (onAddNew) {
      onAddNew();
    }
  };

  const handleEdit = (allergy: Allergy) => {
    setEditingAllergy(allergy);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingAllergy) {
        await updateAllergy(editingAllergy.id, formData);
      } else {
        await createAllergy(formData);
      }
      setShowForm(false);
      setEditingAllergy(null);
      await refetch();
    } catch (error) {
      // Error is handled by the hook
      console.error('Form submission error:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAllergy(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAllergy(id);
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

  // Show form overlay
  if (showForm) {
    return (
      <div className={`bg-white rounded-xl border border-vitalgo-dark-lightest ${className}`} data-testid={testId}>
        <AllergyForm
          initialData={editingAllergy ? allergyToFormData(editingAllergy) : {}}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={actionLoading}
          mode={editingAllergy ? 'edit' : 'create'}
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
          <div className="flex-shrink-0 mr-3">
            <AllergyIcon size="lg" color="warning" data-testid={`${testId}-icon`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-vitalgo-dark">
              {t('title')}
            </h3>
            <p className="text-sm text-vitalgo-dark-light">
              {t('allergyCount', { count: allergies.length })}
            </p>
          </div>
        </div>

        {showAddButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddNew();
            }}
            disabled={actionLoading}
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
        <div className="space-y-4 flex-1">
        {loading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-vitalgo-dark-light">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">{t('loading')}</span>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <svg className="h-8 w-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 font-medium">{t('errors.loadFailed')}</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  refetch();
                }}
                className="mt-2 text-xs text-vitalgo-green hover:text-vitalgo-green-dark focus:outline-none z-10"
              >
                {tCommon('retry')}
              </button>
            </div>
          </div>
        ) : recentAllergies.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-vitalgo-green-lightest rounded-full flex items-center justify-center mb-4">
              <AllergyIcon size="xl" color="primary" data-testid={`${testId}-empty-icon`} />
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
        ) : (
          <div className="space-y-4">
            {/* Allergies List */}
            {recentAllergies.map((allergy) => (
              <AllergyCard
                key={allergy.id}
                allergy={allergy}
                onEdit={handleEdit}
                onDelete={handleDelete}
                compact={true}
                data-testid={`${testId}-allergy-${allergy.id}`}
              />
            ))}

            {/* View All Footer */}
            {allergies.length >= 1 && onNavigateToFull && (
              <div className="pt-4 border-t border-vitalgo-dark-lightest">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAll();
                  }}
                  className="w-full text-center text-sm text-vitalgo-green hover:text-vitalgo-green-light font-medium"
                  data-testid={`${testId}-view-all-footer`}
                >
                  {t('viewAll', { count: allergies.length })}
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};