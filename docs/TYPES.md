# Types Reference

## Data Transformation Notes

**Field Naming Conventions:**
- Backend uses `snake_case` for field names (e.g., `origin_country`, `first_name`)
- Frontend uses `camelCase` for field names (e.g., `originCountry`, `firstName`)
- API services automatically transform between these formats
- Profile API service includes `originCountry` ↔ `origin_country` transformation

## Frontend TypeScript Types

### Core User & Auth Types (from /src/slices/auth/types/index.ts)
```typescript
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: string;
  isVerified: boolean;
  profileCompleted: boolean;
  mandatoryFieldsCompleted: boolean;
}

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  redirectUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
}

interface AuthApiClient {
  login: (credentials: LoginForm) => Promise<LoginResponse>;
  logout: (logoutAll?: boolean) => Promise<{ success: boolean; message: string }>;
  refreshToken: (refreshToken: string) => Promise<LoginResponse>;
  validateToken: () => Promise<{ valid: boolean; user?: User }>;
  getCurrentUser: () => Promise<{ success: boolean; user: User }>;
}
```

### Signup Types (from /src/slices/signup/types/index.ts)
```typescript
interface DocumentType {
  id: number;
  code: string;
  name: string;           // Spanish name
  name_en: string | null; // English translation (i18n support)
  description: string;
}

interface PatientRegistrationForm {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phoneInternational: string;
  birthDate: string;
  originCountry: string; // ISO 3166-1 alpha-2 country code
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface UserResponse {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string;
  is_verified: boolean;
  profile_completed: boolean;
  mandatory_fields_completed: boolean;
}

interface RegistrationResponse {
  success: boolean;
  message: string;
  user_id?: string;
  patient_id?: string;
  qr_code?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: UserResponse;
  redirect_url?: string;
  errors?: Record<string, string[]>;
}
```

### Profile Types (from /src/slices/profile/types/index.ts)
```typescript
// Tab identifiers
type ProfileTab = 'basic' | 'personal' | 'medical' | 'gynecological';

// Basic information interfaces (from signup)
interface BasicPatientInfo {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phoneInternational: string;
  birthDate: string;
  originCountry: string; // ISO 3166-1 alpha-2 country code
  email: string;
}

// Basic information update interface
interface BasicPatientUpdate {
  firstName?: string;
  lastName?: string;
  documentType?: string;
  documentNumber?: string;
  phoneInternational?: string;
  birthDate?: string;
  originCountry?: string; // ISO 3166-1 alpha-2 country code
  email?: string;
}

// Personal information interfaces (RF002 fields)
interface PersonalPatientInfo {
  biological_sex?: string | null;
  gender?: string | null;
  gender_other?: string | null;
  birth_country?: string | null;
  birth_country_other?: string | null;
  birth_department?: string | null;
  birth_city?: string | null;
  residence_address?: string | null;
  residence_country?: string | null;
  residence_country_other?: string | null;
  residence_department?: string | null;
  residence_city?: string | null;
  eps?: string | null;
  eps_other?: string | null;
  occupation?: string | null;
  additional_insurance?: string | null;
  complementary_plan?: string | null;
  complementary_plan_other?: string | null;
  blood_type?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_phone_alt?: string | null;
  // Gynecological Information Fields (RF003) - ✅ IMPLEMENTED
  is_pregnant?: boolean | null;
  pregnancy_weeks?: number | null;
  last_menstruation_date?: string | null;
  pregnancies_count?: number | null;
  births_count?: number | null;
  cesareans_count?: number | null;
  abortions_count?: number | null;
  contraceptive_method?: string | null;
  // Physical Measurements - ✅ IMPLEMENTED
  height?: number | null;  // Height in centimeters (50-250 cm)
  weight?: number | null;  // Weight in kilograms (10-300 kg)
  preferred_unit_system?: string | null;  // 'metric' or 'imperial'
}

// Personal information update interface
interface PersonalPatientUpdate {
  biological_sex?: string;
  gender?: string;
  gender_other?: string;
  birth_country?: string;
  birth_country_other?: string;
  birth_department?: string;
  birth_city?: string;
  residence_address?: string;
  residence_country?: string;
  residence_country_other?: string;
  residence_department?: string;
  residence_city?: string;
  eps?: string;
  eps_other?: string;
  occupation?: string;
  additional_insurance?: string;
  complementary_plan?: string;
  complementary_plan_other?: string;
  blood_type?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_phone_alt?: string;
  // Gynecological Information Fields (RF003) - ✅ IMPLEMENTED
  is_pregnant?: boolean | null;
  pregnancy_weeks?: number | null;
  last_menstruation_date?: string | null;
  menstrual_status?: string | null;  // 'NOT_STARTED', 'ACTIVE', 'MENOPAUSE', or null
  pregnancies_count?: number | null;
  births_count?: number | null;
  cesareans_count?: number | null;
  abortions_count?: number | null;
  contraceptive_method?: string | null;
  // Physical Measurements - ✅ IMPLEMENTED
  height?: number | null;  // Height in centimeters (50-250 cm)
  weight?: number | null;  // Weight in kilograms (10-300 kg)
  preferred_unit_system?: string | null;  // 'metric' or 'imperial'
}

// Hook result interfaces
interface UseBasicPatientInfoResult {
  basicInfo: BasicPatientInfo | null;
  loading: boolean;
  error: string | null;
  updateBasicInfo: (data: BasicPatientUpdate) => Promise<{ success: boolean; message: string }>;
  refetch: () => Promise<void>;
}

interface UsePersonalPatientInfoResult {
  personalInfo: PersonalPatientInfo | null;
  loading: boolean;
  error: string | null;
  updatePersonalInfo: (data: PersonalPatientUpdate) => Promise<{ success: boolean; message: string }>;
  refetch: () => Promise<void>;
}

// Tab component props
interface TabContentProps {
  'data-testid'?: string;
}

// Tab navigation props
interface TabNavigationProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  'data-testid'?: string;
}

// Gynecological Information Types (RF003) - ✅ IMPLEMENTED
interface GynecologicalInfo {
  is_pregnant?: boolean | null;
  pregnancy_weeks?: number | null;
  last_menstruation_date?: string | null;
  menstrual_status?: string | null;  // 'NOT_STARTED', 'ACTIVE', 'MENOPAUSE', or null
  pregnancies_count?: number | null;
  births_count?: number | null;
  cesareans_count?: number | null;
  abortions_count?: number | null;
  contraceptive_method?: string | null;
}

interface GynecologicalInfoUpdate extends GynecologicalInfo {}

interface GynecologicalInfoFormData {
  is_pregnant: boolean | null;
  pregnancy_weeks: number | null;
  last_menstruation_date: string | null;
  menstrual_status: string | null;  // 'NOT_STARTED', 'ACTIVE', 'MENOPAUSE', or null
  pregnancies_count: number | null;
  births_count: number | null;
  cesareans_count: number | null;
  abortions_count: number | null;
  contraceptive_method: string | null;
}

// Contraceptive method options
const CONTRACEPTIVE_METHODS = [
  { value: 'NINGUNO', label: 'Ninguno' },
  { value: 'ANTICONCEPTIVOS_ORALES', label: 'Anticonceptivos orales' },
  { value: 'DIU', label: 'DIU (Dispositivo intrauterino)' },
  { value: 'IMPLANTE', label: 'Implante' },
  { value: 'INYECCION', label: 'Inyección' },
  { value: 'PRESERVATIVO', label: 'Preservativo' },
  { value: 'METODO_NATURAL', label: 'Método natural' },
  { value: 'PARCHE', label: 'Parche' },
  { value: 'ANILLO_VAGINAL', label: 'Anillo vaginal' },
  { value: 'ESTERILIZACION', label: 'Esterilización' },
  { value: 'OTRO', label: 'Otro' },
] as const;

type ContraceptiveMethod = typeof CONTRACEPTIVE_METHODS[number]['value'];

// Pregnancy status options
const PREGNANCY_STATUS_OPTIONS = [
  { value: null, label: 'No especificado' },
  { value: false, label: 'No embarazada' },
  { value: true, label: 'Embarazada' },
] as const;

// Menstrual status options
const MENSTRUAL_STATUS_OPTIONS = [
  { value: null, label: 'No especificado' },
  { value: 'NOT_STARTED', label: 'No ha tenido menstruación' },
  { value: 'ACTIVE', label: 'Tiene menstruación' },
  { value: 'MENOPAUSE', label: 'En menopausia' },
] as const;

type MenstrualStatus = typeof MENSTRUAL_STATUS_OPTIONS[number]['value'];
```

### Dashboard Types (from /src/slices/dashboard/types/index.ts)
```typescript
interface MedicalDataBase {
  id: number;
  patient_id: string;
  created_at: string;
  updated_at: string;
}

// PatientMedication interface REMOVED - Now handled by medications slice
// See: frontend/src/slices/medications/types/index.ts

interface PatientAllergy extends MedicalDataBase {
  allergy_name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  notes?: string;
}

interface PatientSurgery extends MedicalDataBase {
  procedure_name: string;
  surgery_date: string;
  hospital_name?: string;
  surgeon_name?: string;
  anesthesia_type?: string;
  duration_hours?: number;
  notes?: string;
  complications?: string;
}

// PatientIllness interface REMOVED - Now handled by illnesses slice
// See: frontend/src/slices/illnesses/types/index.ts

interface DashboardStats {
  active_medications: number;
  active_allergies: number;
  allergies_by_severity: Record<string, number>;
  active_surgeries: number;
  active_illnesses: number;
  chronic_illnesses: number;
  profile_completeness: number;
  last_login?: string;
  last_updated?: string;
}

interface DashboardData {
  user_id: string;
  patient_id: string;
  full_name: string;
  email: string;
  stats: DashboardStats;
  medical_summary: {
    medications_count: number;
    allergies_count: number;
    surgeries_count: number;
    illnesses_count: number;
    has_critical_allergies: boolean;
    has_chronic_illnesses: boolean;
    recent_activity?: string;
  };
  recent_medications: any[]; // Now handled by medications slice
  recent_activities: Array<{
    type: 'medication' | 'allergy' | 'surgery' | 'illness';
    description: string;
    date: string;
  }>;
  is_first_visit: boolean;
}

interface MedicalDataFormData {
  // Medication fields REMOVED - Now handled by medications slice
  // See: frontend/src/slices/medications/types/index.ts

  allergy_name?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  surgery_name?: string;
  surgery_date?: string;
  hospital?: string;
  surgeon?: string;
  illness_name?: string;
  diagnosis_date?: string;
  is_chronic?: boolean;
  status?: 'active' | 'resolved' | 'managed';
}

type MedicalDataType = 'medications' | 'allergies' | 'surgeries' | 'illnesses';
```

### Medications Slice Types (from /src/slices/medications/types/index.ts)
```typescript
interface Medication {
  id: number;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  prescribedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicationFormData {
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
  notes?: string;
  prescribedBy?: string;
}

interface MedicationApiResponse {
  id: number;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  prescribed_by?: string;
  created_at: string;
  updated_at: string;
}

interface MedicationsCardProps {
  maxItems?: number;
  showAddButton?: boolean;
  onNavigateToFull?: () => void;
  onAddNew?: () => void;
  className?: string;
  'data-testid'?: string;
}

interface MedicationCardProps {
  medication: Medication;
  onEdit?: (medication: Medication) => void;
  onDelete?: (id: number) => void;
  onToggleActive?: (id: number, isActive: boolean) => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
  'data-testid'?: string;
}

interface MedicationFormProps {
  initialData?: Partial<MedicationFormData>;
  onSubmit: (data: MedicationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
  'data-testid'?: string;
}

interface MedicationsPageProps {
  'data-testid'?: string;
}
```

### Allergies Slice Types (from /src/slices/allergies/types/index.ts)
```typescript
interface Allergy {
  id: number;
  patientId: string;
  allergen: string;
  severityLevel: string;  // "leve" | "moderada" | "severa" | "critica"
  reactionDescription?: string;
  diagnosisDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AllergyFormData {
  allergen: string;
  severityLevel: string;
  reactionDescription?: string;
  diagnosisDate?: string;
  notes?: string;
}

interface CreateAllergyRequest {
  allergen: string;
  severity_level: string;
  reaction_description?: string;
  diagnosis_date?: string;
  notes?: string;
}

interface AllergyApiResponse {
  id: number;
  patient_id: string;
  allergen: string;
  severity_level: string;
  reaction_description?: string;
  diagnosis_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface UseAllergiesResult {
  allergies: Allergy[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseAllergyActionsResult {
  createAllergy: (data: AllergyFormData) => Promise<Allergy>;
  updateAllergy: (id: number, data: AllergyFormData) => Promise<Allergy>;
  deleteAllergy: (id: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface AllergyCardProps {
  allergy: Allergy;
  onEdit?: (allergy: Allergy) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
  'data-testid'?: string;
}

interface AllergyFormProps {
  initialData?: Partial<AllergyFormData>;
  onSubmit: (data: AllergyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
  'data-testid'?: string;
}

interface AllergiesCardProps {
  maxItems?: number;
  showAddButton?: boolean;
  onNavigateToFull?: () => void;
  onAddNew?: () => void;
  className?: string;
  'data-testid'?: string;
}

interface AllergiesListProps {
  allergies: Allergy[];
  onEdit?: (allergy: Allergy) => void;
  onDelete?: (id: number) => void;
  onAddNew?: () => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  'data-testid'?: string;
}

interface AllergiesPageProps {
  'data-testid'?: string;
}

// Severity level options for forms
type AllergySeverityLevel = 'leve' | 'moderada' | 'severa' | 'critica';

interface SeverityOption {
  value: AllergySeverityLevel;
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
}
```

### Surgeries Slice Types (from /src/slices/surgeries/types/index.ts)
```typescript
interface Surgery {
  id: number;
  patientId: string;
  procedureName: string;
  surgeryDate: string;
  hospitalName?: string;
  surgeonName?: string;
  anesthesiaType?: string;
  durationHours?: number;
  notes?: string;
  complications?: string;
  createdAt: string;
  updatedAt: string;
}

interface SurgeryFormData {
  procedureName: string;
  surgeryDate: string;
  hospitalName?: string;
  surgeonName?: string;
  anesthesiaType?: string;
  durationHours?: number;
  notes?: string;
  complications?: string;
}

interface SurgeriesCardProps {
  maxItems?: number;
  showAddButton?: boolean;
  onNavigateToFull?: () => void;
  className?: string;
  'data-testid'?: string;
}
```

### Illnesses Slice Types (from /src/slices/illnesses/types/index.ts)
```typescript
type IllnessStatus = 'activa' | 'en_tratamiento' | 'curada' | 'cronica';

interface PatientIllnessDTO {
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

interface IllnessFormData {
  illnessName: string;
  diagnosisDate: string;
  status: IllnessStatus;
  isChronic: boolean;
  treatmentDescription?: string;
  cie10Code?: string;
  diagnosedBy?: string;
  notes?: string;
}

interface IllnessCardProps {
  illness: PatientIllnessDTO;
  onEdit?: (illness: PatientIllnessDTO) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
  'data-testid'?: string;
}

interface IllnessesCardProps {
  maxItems?: number;
  showAddButton?: boolean;
  onNavigateToFull?: () => void;
  className?: string;
  'data-testid'?: string;
}

interface IllnessFormProps {
  initialData?: PatientIllnessDTO;
  onSubmit: (data: IllnessFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  'data-testid'?: string;
}

interface UseIllnessesResult {
  illnesses: PatientIllnessDTO[];
  isLoading: boolean;
  error: string | null;
  mutate: () => void;
}

interface UseIllnessActionsResult {
  createIllness: (data: IllnessFormData) => Promise<PatientIllnessDTO>;
  updateIllness: (id: number, data: IllnessFormData) => Promise<PatientIllnessDTO>;
  deleteIllness: (id: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Status options constant
const ILLNESS_STATUS_OPTIONS: { value: IllnessStatus; label: string }[] = [
  { value: 'activa', label: 'Activa' },
  { value: 'en_tratamiento', label: 'En Tratamiento' },
  { value: 'curada', label: 'Curada' },
  { value: 'cronica', label: 'Crónica' },
];
```

## Backend Python Types

### Auth DTOs (from /slices/auth/application/dto/)
```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class LoginRequestDto(BaseModel):
    """DTO for login request data"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=1, description="User's password")
    remember_me: Optional[bool] = Field(default=False, description="Whether to extend session duration")

class UserResponseDto(BaseModel):
    """DTO for user information in login response"""
    id: str = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    first_name: Optional[str] = Field(None, description="User's first name")
    last_name: Optional[str] = Field(None, description="User's last name")
    user_type: str = Field(..., description="Type of user account")
    is_verified: bool = Field(..., description="Whether the user's email is verified")
    profile_completed: bool = Field(..., description="Whether the user has completed their basic profile")
    mandatory_fields_completed: bool = Field(..., description="Whether the user has completed all mandatory medical profile fields")

class LoginResponseDto(BaseModel):
    """DTO for successful login response"""
    success: bool = Field(default=True, description="Whether the login was successful")
    access_token: str = Field(..., description="JWT access token")
    refresh_token: Optional[str] = Field(None, description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Type of token")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: UserResponseDto = Field(..., description="User information")
    redirect_url: Optional[str] = Field(None, description="URL to redirect user")
```

### Signup DTOs (from /slices/signup/application/dto/)
```python
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional

class PatientRegistrationDTO(BaseModel):
    """Data Transfer Object for patient registration"""
    full_name: str = Field(..., min_length=2, max_length=100, description="Patient full name")
    document_type: str = Field(..., min_length=2, max_length=5, description="Document type code")
    document_number: str = Field(..., min_length=6, max_length=20, description="Document number")
    phone_international: str = Field(..., min_length=10, max_length=20, description="Phone in international format")
    birth_date: date = Field(..., description="Birth date")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password")
    confirm_password: str = Field(..., min_length=8, max_length=128, description="Password confirmation")
    accept_terms: bool = Field(..., description="Accept terms and conditions")
    accept_privacy: bool = Field(..., description="Accept privacy policy")

class PatientRegistrationResponse(BaseModel):
    """Response DTO for successful patient registration with auto-login support"""
    success: bool = Field(default=True, description="Registration success status")
    message: str = Field(..., description="Success message")
    user_id: UUID = Field(..., description="Created user ID")
    patient_id: UUID = Field(..., description="Created patient ID")
    qr_code: UUID = Field(..., description="Patient QR code")
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: UserResponseDto = Field(..., description="User information")
    redirect_url: str = Field(default="/dashboard", description="Auto-redirect URL")
```

### Dashboard DTOs (from /slices/dashboard/application/dto/)
```python
from typing import Dict, Optional, List
from datetime import datetime, date
from pydantic import BaseModel

class DashboardStatsDTO(BaseModel):
    """Pydantic model for dashboard statistics"""
    active_medications: int
    active_allergies: int
    allergies_by_severity: Dict[str, int]
    active_surgeries: int
    active_illnesses: int
    chronic_illnesses: int
    profile_completeness: float
    last_login: Optional[datetime] = None
    last_updated: Optional[datetime] = None

class MedicalDataSummaryDTO(BaseModel):
    """Pydantic model for medical data summary"""
    medications_count: int
    allergies_count: int
    surgeries_count: int
    illnesses_count: int
    has_critical_allergies: bool
    has_chronic_illnesses: bool
    recent_activity: Optional[datetime] = None

class ActivityDTO(BaseModel):
    """Pydantic model for recent activity items"""
    type: str  # 'medication' | 'allergy' | 'surgery' | 'illness'
    description: str
    date: datetime

class DashboardDataDTO(BaseModel):
    """Pydantic model for complete dashboard data"""
    user_id: str
    patient_id: str
    full_name: str
    email: str
    stats: DashboardStatsDTO
    medical_summary: MedicalDataSummaryDTO
    recent_medications: List[PatientMedicationDTO] = []
    recent_activities: List[ActivityDTO] = []
    is_first_visit: bool = False

# Medical Data DTOs (from /slices/dashboard/application/dto/medical_data_dto.py)
class PatientMedicationDTO(BaseModel):
    """Pydantic model for PatientMedication responses"""
    id: int
    patient_id: UUID  # UUID field with string serialization
    medication_name: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    is_active: bool
    notes: Optional[str] = None
    prescribed_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_serializer('patient_id', when_used='json')
    def serialize_patient_id(self, value: UUID, _info) -> str:
        return str(value)

    class Config:
        from_attributes = True  # For Pydantic v2 compatibility

class PatientAllergyDTO(BaseModel):
    """Pydantic model for PatientAllergy responses"""
    id: int
    patient_id: UUID  # UUID field with string serialization
    allergen: str
    severity_level: str
    reaction_description: Optional[str] = None
    diagnosis_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_serializer('patient_id', when_used='json')
    def serialize_patient_id(self, value: UUID, _info) -> str:
        return str(value)

    class Config:
        from_attributes = True

class PatientSurgeryDTO(BaseModel):
    """Pydantic model for PatientSurgery responses"""
    id: int
    patient_id: UUID  # UUID field with string serialization
    procedure_name: str
    surgery_date: date
    hospital_name: Optional[str] = None
    surgeon_name: Optional[str] = None
    anesthesia_type: Optional[str] = None
    duration_hours: Optional[int] = None
    notes: Optional[str] = None
    complications: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_serializer('patient_id', when_used='json')
    def serialize_patient_id(self, value: UUID, _info) -> str:
        return str(value)

    class Config:
        from_attributes = True

class PatientIllnessDTO(BaseModel):
    """Pydantic model for PatientIllness responses"""
    id: int
    patient_id: UUID  # UUID field with string serialization
    illness_name: str
    diagnosis_date: date
    status: str
    is_chronic: bool
    treatment_description: Optional[str] = None
    cie10_code: Optional[str] = None
    diagnosed_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_serializer('patient_id', when_used='json')
    def serialize_patient_id(self, value: UUID, _info) -> str:
        return str(value)

    class Config:
        from_attributes = True

# Create/Update DTOs
class CreateMedicationDTO(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None
    prescribed_by: Optional[str] = None

class CreateAllergyDTO(BaseModel):
    allergen: str
    severity_level: str
    reaction_description: Optional[str] = None
    diagnosis_date: Optional[date] = None
    notes: Optional[str] = None

class UpdateAllergyDTO(BaseModel):
    allergen: Optional[str] = None
    severity_level: Optional[str] = None
    reaction_description: Optional[str] = None
    diagnosis_date: Optional[date] = None
    notes: Optional[str] = None

class CreateSurgeryDTO(BaseModel):
    procedure_name: str
    surgery_date: date
    hospital_name: Optional[str] = None
    surgeon_name: Optional[str] = None
    anesthesia_type: Optional[str] = None
    duration_hours: Optional[int] = None
    notes: Optional[str] = None
    complications: Optional[str] = None

class CreateIllnessDTO(BaseModel):
    illness_name: str
    diagnosis_date: date
    status: str
    is_chronic: bool = False
    treatment_description: Optional[str] = None
    cie10_code: Optional[str] = None
    diagnosed_by: Optional[str] = None
    notes: Optional[str] = None
```

### Profile DTOs (from /slices/profile/application/dto/)
```python
from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class BasicPatientInfoDTO(BaseModel):
    """DTO for basic patient information (from signup)"""
    first_name: str = Field(..., min_length=2, max_length=100, description="Patient first name")
    last_name: str = Field(..., min_length=2, max_length=100, description="Patient last name")
    document_type: str = Field(..., min_length=2, max_length=5, description="Document type code")
    document_number: str = Field(..., min_length=6, max_length=20, description="Document number")
    phone_international: str = Field(..., min_length=10, max_length=20, description="Phone in international format")
    birth_date: date = Field(..., description="Birth date")
    email: EmailStr = Field(..., description="Email address")

    class Config:
        str_strip_whitespace = True
        validate_assignment = True

class BasicPatientUpdateDTO(BaseModel):
    """DTO for updating basic patient information"""
    first_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Patient first name")
    last_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Patient last name")
    document_type: Optional[str] = Field(None, min_length=2, max_length=5, description="Document type code")
    document_number: Optional[str] = Field(None, min_length=6, max_length=20, description="Document number")
    phone_international: Optional[str] = Field(None, min_length=10, max_length=20, description="Phone in international format")
    birth_date: Optional[date] = Field(None, description="Birth date")
    origin_country: Optional[str] = Field(None, min_length=2, max_length=2, description="Country of origin (ISO 3166-1 alpha-2)")
    email: Optional[EmailStr] = Field(None, description="Email address")

    class Config:
        str_strip_whitespace = True
        validate_assignment = True

class LanguagePreferenceDTO(BaseModel):
    """DTO for updating user language preference (i18n support)"""
    preferred_language: Literal["es", "en"] = Field(
        ...,
        description="User's preferred language code (ISO 639-1): 'es' for Spanish, 'en' for English"
    )

    class Config:
        str_strip_whitespace = True
        validate_assignment = True
        json_schema_extra = {
            "example": {"preferred_language": "en"}
        }

class LanguagePreferenceResponseDTO(BaseModel):
    """DTO for language preference response"""
    preferred_language: str = Field(..., description="User's current preferred language code")
    message: str = Field(..., description="Success message")

    class Config:
        json_schema_extra = {
            "example": {
                "preferred_language": "en",
                "message": "Language preference updated successfully"
            }
        }
```

### Internationalization (i18n) Types

#### Frontend Language Types (from /src/i18n/*)
```typescript
// Locale types
type Locale = 'es' | 'en';
const locales = ['es', 'en'] as const;
const defaultLocale: Locale = 'es';

// Language Context types
interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  isChanging: boolean;
}

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale: Locale;
}

// Language Selector component types
interface LanguageSelectorProps {
  className?: string;
  'data-testid'?: string;
}

interface LanguageSelectorCompactProps {
  className?: string;
  'data-testid'?: string;
}
```

#### Backend Language Types (from /slices/profile/application/dto/language_dto.py)
```python
from typing import Literal
from pydantic import BaseModel, Field

LanguageCode = Literal["es", "en"]

class LanguagePreferenceDTO(BaseModel):
    """DTO for updating user language preference"""
    preferred_language: LanguageCode = Field(
        ...,
        description="User's preferred language code (ISO 639-1): 'es' for Spanish, 'en' for English"
    )

class LanguagePreferenceResponseDTO(BaseModel):
    """DTO for language preference response"""
    preferred_language: str = Field(..., description="User's current preferred language code")
    message: str = Field(..., description="Success message")
```

## Database Enums & Constraints

### User Types
```typescript
type UserType = 'patient' | 'doctor' | 'admin';
```

### Document Types (from database)
```typescript
type DocumentTypeCode = 'CC' | 'TI' | 'CE' | 'PA' | 'RC' | 'AS' | 'MS' | 'NU' | 'CD' | 'SC' | 'DNI';
```

### Medical Enums
```typescript
type AllergySeverity = 'leve' | 'moderada' | 'severa' | 'critica';
type IllnessStatus = 'activa' | 'en_tratamiento' | 'curada' | 'cronica';
type SessionTokenType = 'access' | 'refresh';
```

### Navigation & UI Component Types

#### Patient Navigation (from /src/shared/components/organisms/PatientNavbar.tsx)
```typescript
interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface PatientNavbarProps {
  className?: string;
  'data-testid'?: string;
}
```

#### Authentication Context Types (from /src/shared/contexts/AuthContext.tsx)
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginForm) => Promise<string | undefined>;
  logout: () => Promise<void>;
  error: string | null;
}
```

#### Authentication Hook Types (from /src/shared/hooks/useAuthUser.ts)
```typescript
interface AuthUser {
  name: string;
  role: string;
  avatar?: string;
  id?: string;
  email?: string;
}

interface UseAuthUserResult {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  error: string | null;
}
```

## Form Validation Types

### Validation Results
```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
}

interface FieldValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
  feedback?: string;
}
```

## API Response Types

### Generic API Responses
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  status?: number;
}

interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: any;
  status: number;
}

interface LoginErrorResponse {
  success: false;
  message: string;
  attemptsRemaining?: number;
  retryAfter?: number;
}
```

## Authentication & Security Types

### Session Management
```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
}

interface SessionInfo {
  sessionId: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  rememberMe: boolean;
  expiresAt: string;
  lastAccessed: string;
}
```

## Database Model Types

### Core Models (from SQLAlchemy)
```python
from uuid import UUID
from datetime import datetime, date
from typing import Optional, Dict, Any

# User model
class User:
    id: UUID
    email: str
    password_hash: str
    user_type: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]
    failed_login_attempts: int
    locked_until: Optional[datetime]

# Patient model
class Patient:
    id: UUID
    user_id: UUID
    qr_code: UUID
    full_name: str
    document_type_id: int
    document_number: str
    phone_international: str
    country_code: Optional[str]
    dial_code: Optional[str]
    phone_number: Optional[str]
    birth_date: date
    accept_terms: bool
    accept_terms_date: datetime
    accept_policy: bool
    accept_policy_date: datetime
    created_at: datetime
    updated_at: datetime

# UserSession model
class UserSession:
    id: int
    user_id: UUID
    session_token: str
    refresh_token: Optional[str]
    expires_at: datetime
    refresh_expires_at: Optional[datetime]
    created_at: datetime
    last_accessed: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    is_active: bool
    remember_me: bool
    device_fingerprint: Optional[str]
    location_info: Optional[Dict[str, Any]]

# Medical Data Models (Dashboard System)
# NOTE: Uses BigInteger PKs for performance optimization
class PatientMedication:
    """Single medications table - consolidated from duplicate Profile/Dashboard systems"""
    id: int  # BigInteger primary key for performance
    patient_id: UUID
    medication_name: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date]
    is_active: bool
    notes: Optional[str]
    prescribed_by: Optional[str]
    created_at: datetime
    updated_at: datetime

class PatientAllergy:
    id: int
    patient_id: UUID
    allergen: str
    severity_level: str
    reaction_description: Optional[str]
    diagnosis_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

class PatientSurgery:
    id: int
    patient_id: UUID
    procedure_name: str
    surgery_date: date
    hospital_name: Optional[str]
    surgeon_name: Optional[str]
    anesthesia_type: Optional[str]
    duration_hours: Optional[int]
    notes: Optional[str]
    complications: Optional[str]
    created_at: datetime
    updated_at: datetime

class PatientIllness:
    id: int
    patient_id: UUID
    illness_name: str
    diagnosis_date: date
    status: str
    is_chronic: bool
    treatment_description: Optional[str]
    cie10_code: Optional[str]
    diagnosed_by: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
```
### QR Slice Types (from /src/slices/qr/types/index.ts)
```typescript
interface QRCode {
  qrUuid: string;
  qrUrl: string;
  createdAt: string;
  expiresAt?: string;
}

interface QRApiResponse {
  qr_uuid: string;
  qr_url: string;
  created_at: string;
  expires_at?: string;
}

interface QRPageState {
  qr: QRCode | null;
  loading: boolean;
  error: string | null;
}

interface UsePatientQRResult {
  qr: QRCode | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

### Emergency Access Types (from /src/slices/emergency_access/types/index.ts)
```typescript
// Main emergency data interface
interface EmergencyData {
  fullName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  biologicalSex: string;
  bloodType: string | null;
  eps: string | null;
  occupation: string | null;
  residenceAddress: string | null;
  residenceCountry: string | null;
  residenceCity: string | null;
  emergencyContactName: string | null;
  emergencyContactRelationship: string | null;
  emergencyContactPhone: string | null;
  emergencyContactPhoneAlt: string | null;
  medications: EmergencyMedication[];
  allergies: EmergencyAllergy[];
  surgeries: EmergencySurgery[];
  illnesses: EmergencyIllness[];
  isPregnant: boolean | null;
  pregnancyWeeks: number | null;
  lastMenstruationDate: string | null;
  menstrualStatus: string | null;
  pregnanciesCount: number | null;
  birthsCount: number | null;
  cesareansCount: number | null;
  abortionsCount: number | null;
  contraceptiveMethod: string | null;
}

// Medical record interfaces
interface EmergencyMedication {
  medicationName: string;
  dosage: string;
  frequency: string;
  isActive: boolean;
  notes: string | null;
  prescribedBy: string | null;
}

interface EmergencyAllergy {
  allergen: string;
  severityLevel: string;
  reactionDescription: string | null;
  notes: string | null;
}

interface EmergencySurgery {
  procedureName: string;
  surgeryDate: string;
  hospitalName: string | null;
  complications: string | null;
}

interface EmergencyIllness {
  illnessName: string;
  diagnosisDate: string;
  status: string;
  isChronic: boolean;
  treatmentDescription: string | null;
  cie10Code: string | null;
}

// Error handling
interface EmergencyAccessError {
  message: string;
  status: number;
  detail?: string;
}

// Hook result
interface UseEmergencyDataResult {
  data: EmergencyData | null;
  loading: boolean;
  error: EmergencyAccessError | null;
  refetch: () => Promise<void>;
}

// Component props
interface EmergencyAccessPageProps {
  qrCode: string;
}

interface QRLandingPageProps {
  qrCode: string;
}
```

## Backend Python Types - QR Slice

### QR DTOs (from /slices/qr/application/dto/)
```python
from pydantic import BaseModel, field_serializer
from typing import Optional
from uuid import UUID
from datetime import datetime

class QRResponseDTO(BaseModel):
    """Response DTO for patient QR code information"""
    qr_uuid: str
    qr_url: str
    created_at: datetime
    expires_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @field_serializer('created_at', when_used='json')
    def serialize_created_at(self, value: datetime, _info) -> str:
        return value.isoformat() if value else None

    @field_serializer('expires_at', when_used='json')
    def serialize_expires_at(self, value: Optional[datetime], _info) -> Optional[str]:
        return value.isoformat() if value else None
```

### QR Model (from /slices/qr/domain/models/qr_model.py)
```python
# NOTE: The emergency_qrs table exists but is not currently used
# QR codes are now stored directly in the patients.qr_code field (UUID)
# The simple QR router (qr_simple_router.py) uses patients.qr_code directly
# See: backend/slices/qr/infrastructure/api/qr_simple_router.py

class QR(Base):
    """QR code model for patient emergency access (DEPRECATED - not actively used)"""
    __tablename__ = "emergency_qrs"

    id: UUID
    patient_id: UUID
    qr_uuid: UUID  # Unique identifier used in QR URLs
    generated_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    access_count: int
    last_accessed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    @property
    def qr_url(self) -> str:
        """Get the QR access URL"""
        return f"/qr/{self.qr_uuid}"
```

---

## Type System Implementation Status

### ✅ Fully Implemented & Documented
- **Auth Types** (`auth/types/index.ts`) - User, LoginForm, LoginResponse, AuthState
- **Signup Types** (`signup/types/index.ts`) - PatientRegistrationForm, DocumentType
- **Profile Types** (`profile/types/*`) - BasicPatientInfo, PersonalPatientInfo, GynecologicalInfo
- **Dashboard Types** (`dashboard/types/index.ts`) - DashboardData, DashboardStats
- **Medications Types** (`medications/types/index.ts`) - Medication, MedicationFormData
- **Allergies Types** (`allergies/types/index.ts`) - Allergy, AllergyFormData
- **Surgeries Types** (`surgeries/types/index.ts`) - Surgery, SurgeryFormData
- **Illnesses Types** (`illnesses/types/index.ts`) - PatientIllnessDTO, IllnessFormData
- **QR Types** (`qr/types/index.ts`) - QRCode, QRApiResponse
- **Emergency Access Types** (`emergency_access/types/index.ts`) - EmergencyData, Emergency medical records

### 🔄 Implementation Notes
- **QR System**: Uses `patients.qr_code` field directly, not `emergency_qrs` table
- **Profile Photos**: `profile_photo_url` field exists in patients table but no upload API yet
- **Case Conversion**: Automatic `snake_case` ↔ `camelCase` via unified API client
- **UUID Serialization**: Backend DTOs use `@field_serializer` for UUID → string conversion

### 📋 Type Consistency Rules
1. **Backend**: Always `snake_case` (Python/SQL convention)
2. **Frontend**: Always `camelCase` (TypeScript/JavaScript convention)
3. **API Responses**: Backend sends `snake_case`, frontend auto-converts to `camelCase`
4. **API Requests**: Frontend sends `camelCase`, backend auto-converts to `snake_case`
5. **DTOs**: All DTOs with UUID fields must include field serializers

**Last Updated:** November 2025
**Review Status:** ✅ Verified against codebase
