/**
 * Emergency Info Card Components
 * Display patient emergency information for paramedic access
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type {
  EmergencyData,
  EmergencyMedication,
  EmergencyAllergy,
  EmergencySurgery,
  EmergencyIllness,
} from '../../types';

interface InfoCardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  variant?: 'default' | 'critical';
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, variant = 'default' }) => {
  const borderColor = variant === 'critical' ? 'border-l-red-500' : 'border-l-vitalgo-green';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${borderColor} overflow-hidden`}>
      <div className="bg-white px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-vitalgo-dark flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

interface InfoRowProps {
  label: string;
  value?: string | number | null;
  critical?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, critical }) => {
  if (!value) return null;

  return (
    <div className="flex py-3 border-b border-gray-50 last:border-0">
      <span className="font-medium text-gray-600 w-1/3">{label}:</span>
      <span className={`text-gray-900 w-2/3 ${critical ? 'text-red-600 font-bold' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
};

export const BasicInfoCard: React.FC<{ data: EmergencyData }> = ({ data }) => {
  const t = useTranslations('emergencyAccess');

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getBiologicalSexLabel = (sex?: string): string | undefined => {
    if (!sex) return undefined;
    return t(`biologicalSex.${sex}`) || sex;
  };

  const getGenderLabel = (gender?: string): string | undefined => {
    if (!gender) return undefined;
    return t(`gender.${gender}`) || gender;
  };

  return (
    <InfoCard title={t('cards.basicInfo.title')} icon="👤">
      <InfoRow label={t('cards.basicInfo.fullName')} value={data.fullName} />
      <InfoRow label={t('cards.basicInfo.documentType')} value={data.documentType} />
      <InfoRow label={t('cards.basicInfo.documentNumber')} value={data.documentNumber} />
      <InfoRow label={t('cards.basicInfo.birthDate')} value={data.birthDate} />
      <InfoRow label={t('cards.basicInfo.age')} value={`${calculateAge(data.birthDate)} ${t('cards.basicInfo.years')}`} />
      <InfoRow label={t('cards.basicInfo.biologicalSex')} value={getBiologicalSexLabel(data.biologicalSex)} />
      <InfoRow label={t('cards.basicInfo.gender')} value={getGenderLabel(data.gender)} />
    </InfoCard>
  );
};

export const PersonalInfoCard: React.FC<{ data: EmergencyData }> = ({ data }) => {
  const t = useTranslations('emergencyAccess.cards.personalInfo');
  const tEnums = useTranslations('emergencyAccess.enums');

  const getRelationshipLabel = (relationship?: string): string | undefined => {
    if (!relationship) return undefined;
    const key = relationship.toUpperCase();
    const translated = tEnums(`relationships.${key}`);
    return translated.startsWith('relationships.') ? relationship : translated;
  };

  return (
    <InfoCard title={t('title')} icon="📋">
      <InfoRow label={t('bloodType')} value={data.bloodType} critical={true} />
      <InfoRow label={t('eps')} value={data.eps} />
      <InfoRow label={t('occupation')} value={data.occupation} />
      <InfoRow label={t('address')} value={data.residenceAddress} />
      <InfoRow label={t('city')} value={data.residenceCity} />
      <InfoRow label={t('country')} value={data.residenceCountry} />

      {(data.emergencyContactName || data.emergencyContactPhone) && (
        <>
          <div className="mt-4 pt-4 border-t border-vitalgo-green/20">
            <h3 className="font-bold text-vitalgo-dark mb-3 flex items-center gap-2">
              <span className="text-xl">📞</span>
              {t('emergencyContact')}
            </h3>
          </div>
          <InfoRow label={t('name')} value={data.emergencyContactName} />
          <InfoRow label={t('relationship')} value={getRelationshipLabel(data.emergencyContactRelationship)} />
          <InfoRow label={t('phone')} value={data.emergencyContactPhone} critical={true} />
          <InfoRow label={t('alternativePhone')} value={data.emergencyContactPhoneAlt} />
        </>
      )}
    </InfoCard>
  );
};

export const MedicalInfoCard: React.FC<{ data: EmergencyData }> = ({ data }) => {
  const t = useTranslations('emergencyAccess.cards.medicalInfo');
  const tEnums = useTranslations('emergencyAccess.enums');

  const getSeverityLabel = (severity?: string): string => {
    if (!severity) return '';
    const key = severity.toLowerCase();
    const translated = tEnums(`severityLevels.${key}`);
    return translated.startsWith('severityLevels.') ? severity : translated;
  };

  const getIllnessStatusLabel = (status?: string): string => {
    if (!status) return '';
    const key = status.toLowerCase();
    const translated = tEnums(`illnessStatus.${key}`);
    return translated.startsWith('illnessStatus.') ? status : translated;
  };

  const hasMedicalData =
    data.medications.length > 0 ||
    data.allergies.length > 0 ||
    data.surgeries.length > 0 ||
    data.illnesses.length > 0;

  return (
    <InfoCard title={t('title')} icon="🏥" variant="critical">
      {/* Allergies - Most Critical */}
      {data.allergies.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-red-600 text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            {t('allergies')}
          </h3>
          {data.allergies.map((allergy, index) => (
            <div key={index} className="mb-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <p className="font-bold text-red-700 text-lg mb-2">{allergy.allergen}</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('severity')}:</span> {getSeverityLabel(allergy.severityLevel)}
                </p>
                {allergy.reactionDescription && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{t('reaction')}:</span> {allergy.reactionDescription}
                  </p>
                )}
                {allergy.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">{t('notes')}:</span> {allergy.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Medications */}
      {data.medications.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-vitalgo-dark text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">💊</span>
            {t('medications')}
          </h3>
          {data.medications.map((med, index) => (
            <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="font-bold text-vitalgo-dark text-base mb-2">{med.medicationName}</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('dosage')}:</span> {med.dosage}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('frequency')}:</span> {med.frequency}
                </p>
                {med.prescribedBy && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{t('prescribedBy')}:</span> {med.prescribedBy}
                  </p>
                )}
                {med.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">{t('notes')}:</span> {med.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chronic Illnesses */}
      {data.illnesses.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-vitalgo-dark text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            {t('illnesses')}
          </h3>
          {data.illnesses.map((illness, index) => (
            <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="font-bold text-vitalgo-dark text-base mb-2">
                {illness.illnessName}
                {illness.isChronic && <span className="text-xs ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full">({t('chronic')})</span>}
              </p>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('status')}:</span> {getIllnessStatusLabel(illness.status)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('diagnosisDate')}:</span> {illness.diagnosisDate}
                </p>
                {illness.cie10Code && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{t('cie10Code')}:</span> {illness.cie10Code}
                  </p>
                )}
                {illness.treatmentDescription && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">{t('treatment')}:</span> {illness.treatmentDescription}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Surgeries */}
      {data.surgeries.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-vitalgo-dark text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🔪</span>
            {t('surgeries')}
          </h3>
          {data.surgeries.map((surgery, index) => (
            <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="font-bold text-vitalgo-dark text-base mb-2">{surgery.procedureName}</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('date')}:</span> {surgery.surgeryDate}
                </p>
                {surgery.hospitalName && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{t('hospital')}:</span> {surgery.hospitalName}
                  </p>
                )}
                {surgery.complications && (
                  <p className="text-sm text-red-600 mt-1">
                    <span className="font-semibold">{t('complications')}:</span> {surgery.complications}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasMedicalData && (
        <p className="text-gray-500 text-center py-8">{t('noMedicalData')}</p>
      )}
    </InfoCard>
  );
};

export const GynecologicalInfoCard: React.FC<{ data: EmergencyData }> = ({ data }) => {
  const t = useTranslations('emergencyAccess.cards.gynecologicalInfo');

  // Only render if patient is female
  if (data.biologicalSex !== 'F') {
    return null;
  }

  const hasGynecologicalData =
    data.isPregnant !== null &&
    data.isPregnant !== undefined ||
    data.pregnancyWeeks ||
    data.lastMenstruationDate ||
    data.pregnanciesCount !== null &&
    data.pregnanciesCount !== undefined ||
    data.contraceptiveMethod;

  if (!hasGynecologicalData) {
    return null;
  }

  return (
    <InfoCard title={t('title')} icon="🤰" variant={data.isPregnant ? 'critical' : 'default'}>
      {data.isPregnant && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
          <p className="font-bold text-red-700 text-lg flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            {t('pregnant')}
          </p>
          {data.pregnancyWeeks && (
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-semibold">{t('gestationWeeks')}:</span> {data.pregnancyWeeks}
            </p>
          )}
        </div>
      )}

      <InfoRow label={t('lastMenstruation')} value={data.lastMenstruationDate} />
      <InfoRow label={t('previousPregnancies')} value={data.pregnanciesCount} />
      <InfoRow label={t('births')} value={data.birthsCount} />
      <InfoRow label={t('cesareans')} value={data.cesareansCount} />
      <InfoRow label={t('abortions')} value={data.abortionsCount} />
      <InfoRow label={t('contraceptiveMethod')} value={data.contraceptiveMethod} />
    </InfoCard>
  );
};
