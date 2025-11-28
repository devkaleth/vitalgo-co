/**
 * ResidenceInfoSection Molecule Component
 * Handles residence address and location information
 */
import { useTranslations, useLocale } from 'next-intl';
import { SelectField } from '../atoms/SelectField';
import { TextAreaField } from '../atoms/TextAreaField';
import { SearchableSelect } from '../atoms/SearchableSelect';
import { COLOMBIA_DEPARTMENTS, getCitiesForDepartment } from '../../../../shared/data/locations';
import { useCountries } from '../../../../hooks/useCountries';
import { PersonalInfoFormData } from '../../types/personalInfo';

interface ResidenceInfoSectionProps {
  data: PersonalInfoFormData;
  onChange: (field: keyof PersonalInfoFormData, value: any) => void;
  errors?: Record<string, string>;
}

export function ResidenceInfoSection({
  data,
  onChange,
  errors = {}
}: ResidenceInfoSectionProps) {
  const t = useTranslations('profile.forms');
  const locale = useLocale();
  const { countries } = useCountries();

  // Transform API countries to SearchableSelect format
  const countryOptions = countries.map(country => ({
    value: country.code,
    label: locale === 'en' && country.name_en ? country.name_en : country.name,
    flag: country.flag_emoji || ''
  }));

  const handleCountryChange = (country: string) => {
    onChange('residence_country', country);
    // Reset department and city when country changes
    if (country !== 'CO') {
      onChange('residence_department', '');
      onChange('residence_city', '');
    }
    // Reset other field when not OTHER
    if (country !== 'OTHER') {
      onChange('residence_country_other', '');
    }
  };

  const handleDepartmentChange = (department: string) => {
    onChange('residence_department', department);
    // Reset city when department changes
    onChange('residence_city', '');
  };

  const departmentCities = data.residence_department
    ? getCitiesForDepartment(data.residence_department)
    : [];

  // Only show department and city fields if residence country is Colombia
  const showColombianResidenceFields = data.residence_country === 'CO';

  return (
    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        {t('sections.residenceInfo')}
      </h4>
      <div className="space-y-4">
        <TextAreaField
          label={t('labels.residenceAddress')}
          value={data.residence_address || ''}
          onChange={(value) => onChange('residence_address', value)}
          placeholder={t('placeholders.residenceAddress')}
          required
          rows={2}
          error={errors.residence_address}
        />

        <SearchableSelect
          label={t('labels.residenceCountry')}
          value={data.residence_country || ''}
          onChange={handleCountryChange}
          options={countryOptions}
          required
          error={errors.residence_country}
          hasOtherOption={true}
          otherValue={data.residence_country_other || ''}
          onOtherChange={(value) => onChange('residence_country_other', value)}
          useCountryFlag={true}
        />

        {showColombianResidenceFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label={t('labels.residenceDepartment')}
              value={data.residence_department || ''}
              onChange={handleDepartmentChange}
              options={COLOMBIA_DEPARTMENTS}
              required
              error={errors.residence_department}
            />

            {data.residence_department && (
              <SelectField
                label={t('labels.residenceCity')}
                value={data.residence_city || ''}
                onChange={(value) => onChange('residence_city', value)}
                options={departmentCities}
                required
                error={errors.residence_city}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}