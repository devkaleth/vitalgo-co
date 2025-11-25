/**
 * Medical Data List organism component
 * Displays and manages lists of medical data with CRUD operations
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MedicalDataCard } from '../atoms/MedicalDataCard';
import { MedicalDataForm } from '../molecules/MedicalDataForm';
import {
  PatientMedication,
  PatientAllergy,
  PatientSurgery,
  PatientIllness,
  MedicalDataFormData,
  MedicalDataType
} from '../../types';
import { dashboardAPI } from '../../services/api';

type MedicalDataItem = PatientMedication | PatientAllergy | PatientSurgery | PatientIllness;

interface MedicalDataListProps {
  type: MedicalDataType;
  title: string;
  emptyStateMessage: string;
  'data-testid'?: string;
}

export const MedicalDataList: React.FC<MedicalDataListProps> = ({
  type,
  title,
  emptyStateMessage,
  'data-testid': testId
}) => {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [data, setData] = useState<MedicalDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicalDataItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      switch (type) {
        case 'medications':
          result = await dashboardAPI.getMedications();
          break;
        case 'allergies':
          result = await dashboardAPI.getAllergies();
          break;
        case 'surgeries':
          result = await dashboardAPI.getSurgeries();
          break;
        case 'illnesses':
          result = await dashboardAPI.getIllnesses();
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: MedicalDataFormData) => {
    try {
      setFormLoading(true);

      let newItem;
      switch (type) {
        case 'medications':
          newItem = await dashboardAPI.createMedication(formData);
          break;
        case 'allergies':
          newItem = await dashboardAPI.createAllergy(formData);
          break;
        case 'surgeries':
          newItem = await dashboardAPI.createSurgery(formData);
          break;
        case 'illnesses':
          newItem = await dashboardAPI.createIllness(formData);
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }

      setData(prev => [newItem, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating item');
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData: MedicalDataFormData) => {
    if (!editingItem) return;

    try {
      setFormLoading(true);

      let updatedItem;
      switch (type) {
        case 'medications':
          updatedItem = await dashboardAPI.updateMedication(editingItem.id, formData);
          break;
        case 'allergies':
          updatedItem = await dashboardAPI.updateAllergy(editingItem.id, formData);
          break;
        case 'surgeries':
          updatedItem = await dashboardAPI.updateSurgery(editingItem.id, formData);
          break;
        case 'illnesses':
          updatedItem = await dashboardAPI.updateIllness(editingItem.id, formData);
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }

      setData(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
      setEditingItem(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating item');
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmations.deleteItem'))) {
      return;
    }

    try {
      switch (type) {
        case 'medications':
          await dashboardAPI.deleteMedication(id);
          break;
        case 'allergies':
          await dashboardAPI.deleteAllergy(id);
          break;
        case 'surgeries':
          await dashboardAPI.deleteSurgery(id);
          break;
        case 'illnesses':
          await dashboardAPI.deleteIllness(id);
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }

      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting item');
    }
  };

  const handleEdit = (item: MedicalDataItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const convertToFormData = (item: MedicalDataItem): MedicalDataFormData => {
    const baseData = {
      notes: item.notes || ''
    };

    switch (type) {
      case 'medications':
        const med = item as PatientMedication;
        return {
          ...baseData,
          medication_name: med.medication_name,
          dosage: med.dosage,
          frequency: med.frequency,
          start_date: med.start_date,
          end_date: med.end_date || '',
          prescribing_doctor: med.prescribing_doctor || '',
          is_active: med.is_active
        };

      case 'allergies':
        const allergy = item as PatientAllergy;
        return {
          ...baseData,
          allergy_name: allergy.allergy_name,
          severity: allergy.severity,
          reaction: allergy.reaction || ''
        };

      case 'surgeries':
        const surgery = item as PatientSurgery;
        return {
          ...baseData,
          surgery_name: surgery.surgery_name,
          surgery_date: surgery.surgery_date,
          hospital: surgery.hospital || '',
          surgeon: surgery.surgeon || ''
        };

      case 'illnesses':
        const illness = item as PatientIllness;
        return {
          ...baseData,
          illness_name: illness.illness_name,
          diagnosis_date: illness.diagnosis_date,
          is_chronic: illness.is_chronic,
          status: illness.status
        };

      default:
        return baseData;
    }
  };

  const getEmptyStateIcon = () => {
    switch (type) {
      case 'medications':
        return (
          <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'allergies':
        return (
          <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'surgeries':
        return (
          <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'illnesses':
        return (
          <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6" data-testid={testId}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-red-800 font-medium">{t('messages.loadingError', { title: title.toLowerCase() })}</h3>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchData}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          {tCommon('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid={testId}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-vitalgo-green text-white px-4 py-2 rounded-lg hover:bg-vitalgo-green/90 transition-colors flex items-center space-x-2"
          data-testid={`add-${type}`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{tCommon('add')}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <MedicalDataForm
          type={type}
          initialData={editingItem ? convertToFormData(editingItem) : {}}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          onCancel={handleCancel}
          isLoading={formLoading}
          data-testid={`${type}-form`}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-5 w-5 bg-gray-300 rounded"></div>
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-300 rounded w-12"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          {getEmptyStateIcon()}
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {t('messages.noItems', { title: title.toLowerCase() })}
          </h3>
          <p className="mt-2 text-gray-600 max-w-sm mx-auto">
            {emptyStateMessage}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-vitalgo-green text-white px-4 py-2 rounded-lg hover:bg-vitalgo-green/90 transition-colors"
          >
            {t('actions.addItem', { item: title.toLowerCase().slice(0, -1) })}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <MedicalDataCard
              key={item.id}
              data={item}
              type={type.slice(0, -1) as any} // Remove 's' from plural type
              onEdit={handleEdit}
              onDelete={handleDelete}
              data-testid={`${type}-item-${item.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};