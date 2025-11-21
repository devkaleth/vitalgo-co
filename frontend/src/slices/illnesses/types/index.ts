/**
 * Illness types for VitalGo frontend
 * Following sophisticated UUID strategy: BigInteger ID + UUID patient_id pattern
 */

// Core illness status types
export type IllnessStatus = 'activa' | 'en_tratamiento' | 'curada' | 'cronica';

// Main illness DTO interface - matches backend PatientIllnessDTO
export interface PatientIllnessDTO {
  id: number;                         // BigInteger primary key from backend
  patientId: string;                  // UUID as string (sophisticated serialization)
  illnessName: string;
  diagnosisDate: string;              // ISO date string
  status: IllnessStatus;
  isChronic: boolean;
  treatmentDescription?: string;
  cie10Code?: string;
  diagnosedBy?: string;
  notes?: string;
  createdAt: string;                  // ISO datetime string
  updatedAt: string;                  // ISO datetime string
}

// Form data interface for creating/updating illnesses
export interface IllnessFormData {
  illnessName: string;
  diagnosisDate: string;
  status: IllnessStatus;
  treatmentDescription?: string;
  cie10Code?: string;
  diagnosedBy?: string;
  notes?: string;
}

// Props for illness card component
export interface IllnessCardProps {
  illness: PatientIllnessDTO;
  onEdit?: (illness: PatientIllnessDTO) => void;
  onDelete?: (id: number) => void;
  onToggleCured?: (id: number, newStatus: IllnessStatus) => void;
  showActions?: boolean;
  compact?: boolean;
  'data-testid'?: string;
}

// Props for illnesses card (dashboard component)
export interface IllnessesCardProps {
  maxItems?: number;
  showAddButton?: boolean;
  onNavigateToFull?: () => void;
  className?: string;
  'data-testid'?: string;
}

// Form props interface
export interface IllnessFormProps {
  initialData?: PatientIllnessDTO;
  onSubmit: (data: IllnessFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  'data-testid'?: string;
}

// Hook return types
export interface UseIllnessesResult {
  illnesses: PatientIllnessDTO[];
  isLoading: boolean;
  error: string | null;
  mutate: () => void;
}

export interface UseIllnessActionsResult {
  createIllness: (data: IllnessFormData) => Promise<PatientIllnessDTO>;
  updateIllness: (id: number, data: IllnessFormData) => Promise<PatientIllnessDTO>;
  deleteIllness: (id: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface UseIllnessFormResult {
  formData: IllnessFormData;
  errors: Partial<Record<keyof IllnessFormData, string>>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof IllnessFormData, value: any) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setFormData: (data: Partial<IllnessFormData>) => void;
}

// Status options for forms
export const ILLNESS_STATUS_OPTIONS: { value: IllnessStatus; label: string }[] = [
  { value: 'activa', label: 'Activa' },
  { value: 'en_tratamiento', label: 'En Tratamiento' },
  { value: 'curada', label: 'Curada' },
  { value: 'cronica', label: 'Crónica' },
];

// Illness icon props
export interface IllnessIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'danger' | 'success';
  'data-testid'?: string;
}

// Illness status badge props
export interface IllnessStatusProps {
  illness: PatientIllnessDTO;
  size?: 'sm' | 'md' | 'lg';
  'data-testid'?: string;
}

// Illness actions props
export interface IllnessActionsProps {
  illness: PatientIllnessDTO;
  onEdit?: (illness: PatientIllnessDTO) => void;
  onDelete?: (id: number) => void;
  onToggleCured?: (id: number, newStatus: IllnessStatus) => void;
  'data-testid'?: string;
}