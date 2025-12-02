/**
 * IllnessesCard molecule component - MAIN DASHBOARD CARD
 * VitalGo brand-compliant card for displaying patient illnesses with inline CRUD
 * Follows exact same structure as MedicationsCard, AllergiesCard, SurgeriesCard
 */
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IllnessesCardProps, PatientIllnessDTO, IllnessFormData } from '../../types';
import { useIllnesses } from '../../hooks/useIllnesses';
import { useIllnessActions } from '../../hooks/useIllnessActions';
import { IllnessCard } from './IllnessCard';
import { IllnessForm } from './IllnessForm';
import { IllnessIcon } from '../atoms/IllnessIcon';

export const IllnessesCard: React.FC<IllnessesCardProps> = ({
  maxItems = 3,
  showAddButton = true,
  onNavigateToFull,
  className = '',
  'data-testid': testId = 'illnesses-card'
}) => {
  const t = useTranslations('illnesses');
  const tCommon = useTranslations('common');

  // State management
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIllness, setEditingIllness] = useState<PatientIllnessDTO | null>(null);

  // Hooks
  const { illnesses, isLoading, error, refetch } = useIllnesses();
  const {
    createIllness,
    updateIllness,
    deleteIllness,
    isLoading: isActionsLoading
  } = useIllnessActions();

  // Handlers
  const handleAddClick = () => {
    setShowAddForm(true);
    setEditingIllness(null);
  };

  const handleEditClick = (illness: PatientIllnessDTO) => {
    setEditingIllness(illness);
    setShowAddForm(false);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingIllness(null);
  };

  const handleCreateIllness = async (data: IllnessFormData) => {
    try {
      await createIllness(data);
      setShowAddForm(false);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to create illness:', error);
      throw error; // Re-throw to let form handle error display
    }
  };

  const handleUpdateIllness = async (data: IllnessFormData) => {
    if (!editingIllness) return;

    try {
      await updateIllness(editingIllness.id, data);
      setEditingIllness(null);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to update illness:', error);
      throw error; // Re-throw to let form handle error display
    }
  };

  const handleDeleteIllness = async (id: number) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      await deleteIllness(id);
      setEditingIllness(null);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete illness:', error);
      // Could show a toast notification here
    }
  };

  const handleToggleCured = async (id: number, newStatus: 'activa' | 'curada') => {
    try {
      const illness = illnesses.find(ill => ill.id === id);
      if (illness) {
        const updatedData = {
          illnessName: illness.illnessName,
          diagnosisDate: illness.diagnosisDate,
          status: newStatus,
          isChronic: illness.isChronic,
          treatmentDescription: illness.treatmentDescription || '',
          cie10Code: illness.cie10Code || '',
          diagnosedBy: illness.diagnosedBy || '',
          notes: illness.notes || ''
        };
        await updateIllness(id, updatedData);
        refetch(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to toggle illness status:', error);
      // Could show a toast notification here
    }
  };

  // Sort illnesses by updated date (most recent first)
  const sortedIllnesses = [...illnesses].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Limit items for dashboard display
  const displayedIllnesses = sortedIllnesses.slice(0, maxItems);
  const hasMoreItems = sortedIllnesses.length > maxItems;

  const cardClasses = `bg-white rounded-xl border border-gray-200 shadow-sm ${className}`;

  const handleViewAll = () => {
    if (onNavigateToFull) {
      onNavigateToFull();
    }
  };

  return (
    <div
      className={`${cardClasses} hover:shadow-lg hover:border-vitalgo-green transition-all duration-200 flex flex-col`}
      data-testid={testId}
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer flex-shrink-0"
        onClick={handleViewAll}
      >
        <div className="flex items-center space-x-3 flex-1">
          <IllnessIcon size="lg" color="primary" />
          <div>
            <h2 className="text-lg font-semibold text-vitalgo-dark">
              {t('title')}
            </h2>
            <p className="text-sm text-vitalgo-dark-light">
              {t('illnessCount', { count: illnesses.length })}
            </p>
          </div>
        </div>
        {showAddButton && !showAddForm && !editingIllness && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddClick();
            }}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-vitalgo-green rounded-lg hover:bg-vitalgo-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vitalgo-green transition-colors duration-200 z-10"
            data-testid={`${testId}-add-button`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('actions.add')}
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Show Form ONLY when adding or editing */}
        {(showAddForm || editingIllness) ? (
          <div>
            <IllnessForm
              initialData={editingIllness || undefined}
              onSubmit={editingIllness ? handleUpdateIllness : handleCreateIllness}
              onCancel={handleCancelForm}
              isLoading={isActionsLoading}
              data-testid={editingIllness ? `${testId}-edit-form` : `${testId}-add-form`}
            />
          </div>
        ) : (
          <>
            {/* Loading State */}
            {isLoading && illnesses.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vitalgo-green"></div>
                <span className="ml-2 text-sm text-gray-600">{t('loading')}</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="text-red-600 text-sm mb-2">{t('errors.loadFailed')}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refetch();
                  }}
                  className="text-xs text-vitalgo-green hover:text-vitalgo-green-dark z-10"
                >
                  {tCommon('retry')}
                </button>
              </div>
            )}

            {/* Illnesses List */}
            {!isLoading && !error && illnesses.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-vitalgo-green-lightest rounded-full flex items-center justify-center mb-4">
                  <IllnessIcon size="xl" color="primary" data-testid={`${testId}-empty-icon`} />
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
                      handleAddClick();
                    }}
                    disabled={isActionsLoading}
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
                {displayedIllnesses.map((illness, index) => (
                  <IllnessCard
                    key={illness.id}
                    illness={illness}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteIllness}
                    onToggleCured={handleToggleCured}
                    showActions={true}
                    compact={true}
                    data-testid={`${testId}-illness-${index}`}
                  />
                ))}
              </div>
            )}

            {/* Show More Link */}
            {sortedIllnesses.length >= 1 && onNavigateToFull && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToFull();
                  }}
                  className="w-full text-center text-sm text-vitalgo-green hover:text-vitalgo-green-dark font-medium"
                  data-testid={`${testId}-show-more`}
                >
                  {t('viewAll', { count: sortedIllnesses.length })}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};