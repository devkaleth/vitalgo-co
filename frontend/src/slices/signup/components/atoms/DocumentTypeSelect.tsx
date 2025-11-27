/**
 * Document Type Select atom component
 */
import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DocumentType } from '../../types';

interface DocumentTypeSelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  documentTypes: DocumentType[];
  required?: boolean;
  'data-testid'?: string;
}

export const DocumentTypeSelect: React.FC<DocumentTypeSelectProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  documentTypes,
  required = false,
  'data-testid': testId
}) => {
  const locale = useLocale();
  const t = useTranslations('signup.documentType');

  const getLocalizedName = (docType: DocumentType) =>
    locale === 'en' && docType.name_en ? docType.name_en : docType.name;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        data-testid={testId}
        required={required}
      >
        <option value="">{t('selectType')}</option>
        {documentTypes.map((docType) => (
          <option key={docType.id} value={docType.code}>
            {docType.code} - {getLocalizedName(docType)}
          </option>
        ))}
      </select>
    </div>
  );
};