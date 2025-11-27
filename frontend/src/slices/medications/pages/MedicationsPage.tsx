/**
 * Standalone Medications Page
 * Complete medications management page showing all medications (active and inactive)
 */
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthGuard } from '../../../shared/components/guards/AuthGuard';
import { PatientNavbar } from '../../../shared/components/organisms/PatientNavbar';
import { MedicationForm } from '../components/molecules/MedicationForm';
import { MedicationCard } from '../components/molecules/MedicationCard';
import { MedicationIcon } from '../components/atoms/MedicationIcon';
import { useMedications } from '../hooks/useMedications';
import { useMedicationActions } from '../hooks/useMedicationActions';
import { medicationToFormData } from '../utils/medicationHelpers';
import { Medication } from '../types';

interface MedicationsPageProps {
  'data-testid'?: string;
}

export default function MedicationsPage({
  'data-testid': testId = 'medications-page'
}: MedicationsPageProps) {
  const t = useTranslations('medications');
  const tCommon = useTranslations('common');

  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const { medications, loading, error, refetch } = useMedications();
  const { createMedication, updateMedication, deleteMedication, isLoading: actionLoading } = useMedicationActions();

  // Filter medications based on status
  const filteredMedications = medications.filter(med => {
    if (filterStatus === 'active') return med.isActive;
    if (filterStatus === 'inactive') return !med.isActive;
    return true; // 'all'
  });

  // Sort medications by update date (most recent first)
  const sortedMedications = filteredMedications.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleAddNew = () => {
    setEditingMedication(null);
    setShowForm(true);
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

  const getStatusCounts = () => {
    const active = medications.filter(med => med.isActive).length;
    const inactive = medications.filter(med => !med.isActive).length;
    return { active, inactive, total: medications.length };
  };

  const statusCounts = getStatusCounts();

  return (
    <AuthGuard requiredUserType="patient">
      <div className="min-h-screen bg-gray-50" data-testid={testId}>
        {/* Navigation */}
        <PatientNavbar />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MedicationIcon
                  size="xl"
                  color="primary"
                  className="mr-4"
                  data-testid={`${testId}-header-icon`}
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('title')}
                  </h1>
                  <p className="text-gray-600">
                    {t('subtitle')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddNew}
                disabled={loading || actionLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-vitalgo-green rounded-lg hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green transition-colors duration-150 disabled:opacity-50"
                data-testid={`${testId}-add-button`}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('addButton')}
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-vitalgo-green">{statusCounts.total}</div>
                <div className="text-sm text-gray-600">{t('stats.total')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
                <div className="text-sm text-gray-600">{t('stats.active')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{statusCounts.inactive}</div>
                <div className="text-sm text-gray-600">{t('stats.inactive')}</div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">{t('filters.label')}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filterStatus === 'all'
                      ? 'text-vitalgo-green bg-vitalgo-green/10'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {t('filters.all', { count: statusCounts.total })}
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filterStatus === 'active'
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {t('filters.active', { count: statusCounts.active })}
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filterStatus === 'inactive'
                      ? 'text-gray-600 bg-gray-100'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {t('filters.inactive', { count: statusCounts.inactive })}
                </button>
              </div>
            </div>
          </div>

          {/* Medications List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {error ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('error.title')}
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-vitalgo-green rounded-lg hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green transition-colors duration-150"
                >
                  {tCommon('actions.retry')}
                </button>
              </div>
            ) : loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-24"></div>
                  </div>
                ))}
              </div>
            ) : sortedMedications.length > 0 ? (
              <div className="space-y-4">
                {sortedMedications.map((medication) => (
                  <MedicationCard
                    key={medication.id}
                    medication={medication}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    compact={false}
                    showActions={true}
                    data-testid={`${testId}-medication-${medication.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-vitalgo-green-lightest rounded-full flex items-center justify-center mb-6">
                  <MedicationIcon
                    size="xl"
                    color="primary"
                    data-testid={`${testId}-empty-icon`}
                  />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {filterStatus === 'all' ? t('empty.all.title') :
                   filterStatus === 'active' ? t('empty.active.title') :
                   t('empty.inactive.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filterStatus === 'all'
                    ? t('empty.all.description')
                    : t('empty.filtered.description')
                  }
                </p>
                {filterStatus === 'all' && (
                  <button
                    onClick={handleAddNew}
                    disabled={actionLoading}
                    className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-vitalgo-green rounded-lg hover:bg-vitalgo-green-light focus:outline-none focus:ring-2 focus:ring-vitalgo-green transition-colors duration-150 disabled:opacity-50"
                    data-testid={`${testId}-empty-add-button`}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('empty.all.action')}
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <p className="text-gray-500 text-sm">
                  {tCommon('footer.copyright', { year: new Date().getFullYear() })}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  {tCommon('footer.privacy')}
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  {tCommon('footer.terms')}
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  {tCommon('footer.support')}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <MedicationForm
              initialData={editingMedication ? medicationToFormData(editingMedication) : {}}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={actionLoading}
              mode={editingMedication ? 'edit' : 'create'}
              data-testid={`${testId}-form`}
            />
          </div>
        </div>
      )}
    </AuthGuard>
  );
}