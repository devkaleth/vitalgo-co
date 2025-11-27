/**
 * DemographicInfoSection Molecule Component
 * Handles biological sex, gender, organ donor preference, and physical measurements
 */
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RadioButtonField } from '../atoms/RadioButtonField';
import { PersonalInfoFormData } from '../../types/personalInfo';

interface DemographicInfoSectionProps {
  data: PersonalInfoFormData;
  onChange: (field: keyof PersonalInfoFormData, value: any) => void;
  errors?: Record<string, string>;
}

// Conversion functions
const cmToFeet = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

const feetToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 12 + inches) * 2.54);
};

const kgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462);
};

const lbsToKg = (lbs: number): number => {
  return Math.round(lbs / 2.20462);
};

export function DemographicInfoSection({
  data,
  onChange,
  errors = {}
}: DemographicInfoSectionProps) {
  const t = useTranslations('profile.forms');

  // Build options using translations
  const BIOLOGICAL_SEX_OPTIONS = [
    { value: 'M', label: t('options.biologicalSex.male') },
    { value: 'F', label: t('options.biologicalSex.female') },
    { value: 'I', label: t('options.biologicalSex.intersex') }
  ];

  const GENDER_OPTIONS = [
    { value: 'MASCULINO', label: t('options.gender.male') },
    { value: 'FEMENINO', label: t('options.gender.female') },
    { value: 'NO_BINARIO', label: t('options.gender.nonBinary') },
    { value: 'OTRO', label: t('options.gender.other') },
    { value: 'PREFIERO_NO_DECIR', label: t('options.gender.preferNotToSay') }
  ];

  // Unit system state (metric or imperial) - initialized from data or defaults to metric
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(
    (data.preferred_unit_system as 'metric' | 'imperial') || 'metric'
  );
  const [displayHeight, setDisplayHeight] = useState({ feet: 0, inches: 0 });
  const [displayWeight, setDisplayWeight] = useState(0);

  // Initialize display values from data and sync unit system from props
  useEffect(() => {
    // Sync unit system from data when it changes (e.g., on initial load from API)
    if (data.preferred_unit_system && data.preferred_unit_system !== unitSystem) {
      setUnitSystem(data.preferred_unit_system as 'metric' | 'imperial');
    }
  }, [data.preferred_unit_system]);

  useEffect(() => {
    if (data.height && unitSystem === 'imperial') {
      setDisplayHeight(cmToFeet(data.height));
    }
    if (data.weight && unitSystem === 'imperial') {
      setDisplayWeight(kgToLbs(data.weight));
    }
  }, [data.height, data.weight, unitSystem]);

  const handleUnitSystemChange = (newSystem: 'metric' | 'imperial') => {
    if (newSystem === 'imperial') {
      // Convert existing values to imperial
      if (data.height) {
        setDisplayHeight(cmToFeet(data.height));
      }
      if (data.weight) {
        setDisplayWeight(kgToLbs(data.weight));
      }
    }
    setUnitSystem(newSystem);
    // Save the preference to the database
    onChange('preferred_unit_system', newSystem);
  };

  const handleHeightChange = (value: number | undefined, unit: 'cm' | 'feet' | 'inches' = 'cm') => {
    if (value === undefined) {
      onChange('height', undefined);
      return;
    }

    if (unitSystem === 'metric') {
      onChange('height', value);
    } else {
      // Imperial system
      if (unit === 'feet') {
        const newHeight = feetToCm(value, displayHeight.inches);
        onChange('height', newHeight);
        setDisplayHeight({ feet: value, inches: displayHeight.inches });
      } else if (unit === 'inches') {
        const newHeight = feetToCm(displayHeight.feet, value);
        onChange('height', newHeight);
        setDisplayHeight({ feet: displayHeight.feet, inches: value });
      }
    }
  };

  const handleWeightChange = (value: number | undefined) => {
    if (value === undefined) {
      onChange('weight', undefined);
      return;
    }

    if (unitSystem === 'metric') {
      onChange('weight', value);
    } else {
      // Imperial system - convert lbs to kg
      const kg = lbsToKg(value);
      onChange('weight', kg);
      setDisplayWeight(value);
    }
  };

  const handleGenderChange = (gender: string) => {
    onChange('gender', gender);
    // Reset other field when not OTRO
    if (gender !== 'OTRO') {
      onChange('gender_other', '');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {t('sections.demographicInfo')}
        </h4>
        <div className="space-y-4">
          <RadioButtonField
            label={t('labels.biologicalSex')}
            name="biological_sex"
            value={data.biological_sex || ''}
            onChange={(value) => onChange('biological_sex', value)}
            options={BIOLOGICAL_SEX_OPTIONS}
            required
            error={errors.biological_sex}
            layout="columns"
          />
          <RadioButtonField
            label={t('labels.gender')}
            name="gender"
            value={data.gender || ''}
            onChange={handleGenderChange}
            options={GENDER_OPTIONS}
            required
            error={errors.gender}
            otherOption={true}
            otherValue={data.gender_other || ''}
            onOtherChange={(value) => onChange('gender_other', value)}
            layout="columns"
          />
        </div>
      </div>

      {/* Voluntad de la Persona - Organ Donor Preference */}
      <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {t('sections.donorPreference')}
        </h4>
        <div className="space-y-4">
          <RadioButtonField
            label={t('labels.organDonorPreference')}
            name="organ_donor_preference"
            value={data.organ_donor_preference || ''}
            onChange={(value) => onChange('organ_donor_preference', value)}
            options={[
              { value: 'DONANTE', label: t('options.donorYes') },
              { value: 'NO_DONANTE', label: t('options.donorNo') },
              { value: 'PREFIERO_NO_RESPONDER', label: t('options.donorPreferNotToSay') }
            ]}
            required={false}
            error={errors.organ_donor_preference}
            layout="vertical"
          />

          {/* Show additional field when "Prefer not to say" is selected */}
          {data.organ_donor_preference === 'PREFIERO_NO_RESPONDER' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('authorizedDecisionMaker.label')} <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-3">
                {t('authorizedDecisionMaker.description')}
              </p>
              <textarea
                value={data.authorized_decision_maker || ''}
                onChange={(e) => onChange('authorized_decision_maker', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalgo-green focus:border-transparent"
                placeholder={t('authorizedDecisionMaker.placeholder')}
                rows={2}
              />
              {errors.authorized_decision_maker && (
                <p className="mt-1 text-sm text-red-600">{errors.authorized_decision_maker}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Physical Measurements - Peso y Talla */}
      <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">
            {t('sections.physicalMeasurements')}
          </h4>

          {/* Unit System Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleUnitSystemChange('metric')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                unitSystem === 'metric'
                  ? 'bg-vitalgo-green text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('unitSystem.metric')}
            </button>
            <button
              type="button"
              onClick={() => handleUnitSystemChange('imperial')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                unitSystem === 'imperial'
                  ? 'bg-vitalgo-green text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('unitSystem.imperial')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Height Input */}
          {unitSystem === 'metric' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('measurements.heightCm')}
              </label>
              <input
                type="number"
                min="50"
                max="250"
                value={data.height || ''}
                onChange={(e) => handleHeightChange(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalgo-green focus:border-transparent"
                placeholder={t('measurements.placeholderCm')}
              />
              {errors.height && (
                <p className="mt-1 text-sm text-red-600">{errors.height}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('measurements.heightFtIn')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="3"
                    max="8"
                    value={displayHeight.feet || ''}
                    onChange={(e) => handleHeightChange(e.target.value ? parseInt(e.target.value) : 0, 'feet')}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalgo-green focus:border-transparent"
                    placeholder={t('measurements.feet')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                    ft
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={displayHeight.inches || ''}
                    onChange={(e) => handleHeightChange(e.target.value ? parseInt(e.target.value) : 0, 'inches')}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalgo-green focus:border-transparent"
                    placeholder={t('measurements.inches')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                    in
                  </span>
                </div>
              </div>
              {errors.height && (
                <p className="mt-1 text-sm text-red-600">{errors.height}</p>
              )}
            </div>
          )}

          {/* Weight Input */}
          {unitSystem === 'metric' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('measurements.weightKg')}
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={data.weight || ''}
                onChange={(e) => handleWeightChange(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalgo-green focus:border-transparent"
                placeholder={t('measurements.placeholderKg')}
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('measurements.weightLbs')}
              </label>
              <input
                type="number"
                min="22"
                max="660"
                value={displayWeight || ''}
                onChange={(e) => handleWeightChange(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalgo-green focus:border-transparent"
                placeholder={t('measurements.placeholderLbs')}
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}