"""
Profile completion DTOs for RF002, RF003, RF004
"""
from datetime import date, datetime
from typing import List, Optional, Union
from pydantic import BaseModel, Field
from uuid import UUID


class ProfileCompletenessResponse(BaseModel):
    """Response DTO for profile completeness check"""
    is_complete: bool = Field(..., description="Profile completeness status")
    mandatory_fields_completed: bool = Field(..., description="Mandatory fields completion status")
    missing_mandatory_fields: List[str] = Field(default=[], description="List of missing mandatory fields")
    completion_percentage: int = Field(..., description="Completion percentage (0-100)")
    next_required_step: Optional[int] = Field(None, description="Next step to complete (1-5)")
    redirect_url: str = Field(..., description="URL to redirect for completion")

    class Config:
        validate_assignment = True


class ExtendedPatientProfileDTO(BaseModel):
    """DTO for extended patient profile (RF002 fields)"""

    # RF002 Extended mandatory fields - Demographic Information
    biological_sex: Optional[str] = Field(None, description="Biological sex")
    gender: Optional[str] = Field(None, description="Gender identity")
    gender_other: Optional[str] = Field(None, description="Other gender if selected")
    birth_country: Optional[str] = Field(None, description="Birth country")
    birth_country_other: Optional[str] = Field(None, description="Other birth country if selected")
    birth_department: Optional[str] = Field(None, description="Birth department")
    birth_city: Optional[str] = Field(None, description="Birth city")

    # RF002 Extended mandatory fields - Residence Information
    residence_address: Optional[str] = Field(None, description="Residence address")
    residence_country: Optional[str] = Field(None, description="Residence country")
    residence_country_other: Optional[str] = Field(None, description="Other residence country if selected")
    residence_department: Optional[str] = Field(None, description="Residence department")
    residence_city: Optional[str] = Field(None, description="Residence city")

    # RF002 Extended mandatory fields - Social Security
    eps: Optional[str] = Field(None, description="EPS")
    eps_other: Optional[str] = Field(None, description="Other EPS if selected")
    occupation: Optional[str] = Field(None, description="Occupation")

    # RF002 Extended optional fields - Additional Insurance
    additional_insurance: Optional[str] = Field(None, description="Additional insurance")
    complementary_plan: Optional[str] = Field(None, description="Complementary plan")
    complementary_plan_other: Optional[str] = Field(None, description="Other complementary plan")

    # RF002 Extended mandatory fields - Basic Medical Information
    blood_type: Optional[str] = Field(None, description="Blood type")

    # RF002 Extended mandatory fields - Emergency Contact
    emergency_contact_name: Optional[str] = Field(None, description="Emergency contact name")
    emergency_contact_relationship: Optional[str] = Field(None, description="Emergency contact relationship")

    # Primary emergency phone - new separated structure
    emergency_contact_phone: Optional[str] = Field(None, description="Emergency contact phone (legacy)")
    emergency_contact_country_code: Optional[str] = Field(None, description="Emergency contact country code")
    emergency_contact_dial_code: Optional[str] = Field(None, description="Emergency contact dial code")
    emergency_contact_phone_number: Optional[str] = Field(None, description="Emergency contact phone number")

    # Alternative emergency phone - new separated structure
    emergency_contact_phone_alt: Optional[str] = Field(None, description="Emergency contact alternative phone (legacy)")
    emergency_contact_country_code_alt: Optional[str] = Field(None, description="Emergency contact alternative country code")
    emergency_contact_dial_code_alt: Optional[str] = Field(None, description="Emergency contact alternative dial code")
    emergency_contact_phone_number_alt: Optional[str] = Field(None, description="Emergency contact alternative phone number")

    # RF002 Gynecological Information Fields - for female patients only
    is_pregnant: Optional[bool] = Field(None, description="Is currently pregnant")
    pregnancy_weeks: Optional[int] = Field(None, ge=1, le=42, description="Pregnancy weeks if pregnant")
    last_menstruation_date: Optional[date] = Field(None, description="Last menstruation date")
    menstrual_status: Optional[str] = Field(None, max_length=20, description="Menstrual status: NOT_STARTED, ACTIVE, MENOPAUSE")
    pregnancies_count: Optional[int] = Field(None, ge=0, description="Number of pregnancies")
    births_count: Optional[int] = Field(None, ge=0, description="Number of births")
    cesareans_count: Optional[int] = Field(None, ge=0, description="Number of cesarean sections")
    abortions_count: Optional[int] = Field(None, ge=0, description="Number of abortions")
    contraceptive_method: Optional[str] = Field(None, max_length=100, description="Contraceptive method")

    # Donor Preference (Voluntad de la Persona)
    organ_donor_preference: Optional[str] = Field(None, max_length=30, description="Organ donor preference: DONANTE, NO_DONANTE, PREFIERO_NO_RESPONDER")
    authorized_decision_maker: Optional[str] = Field(None, max_length=255, description="Authorized decision maker name when preference is PREFIERO_NO_RESPONDER")

    # Physical Measurements
    height: Optional[int] = Field(None, ge=50, le=250, description="Height in centimeters (50-250 cm)")
    weight: Optional[int] = Field(None, ge=10, le=300, description="Weight in kilograms (10-300 kg)")
    preferred_unit_system: Optional[str] = Field(None, max_length=10, description="Preferred unit system: metric or imperial")

    class Config:
        str_strip_whitespace = True
        validate_assignment = True


class PatientProfileUpdateDTO(ExtendedPatientProfileDTO):
    """DTO for updating patient profile - extends from base with validation"""

    class Config:
        str_strip_whitespace = True
        validate_assignment = True


class MedicationDTO(BaseModel):
    """DTO for medication data"""
    id: Optional[UUID] = Field(None, description="Medication ID for updates")
    name: str = Field(..., min_length=2, max_length=200, description="Medication name")
    dosage: str = Field(..., min_length=1, max_length=50, description="Dosage (e.g., 50mg)")
    frequency: str = Field(..., min_length=1, max_length=100, description="Frequency (e.g., Cada 8 horas)")
    prescribed_by: Optional[str] = Field(None, max_length=200, description="Prescribing doctor")
    start_date: Optional[date] = Field(None, description="Start date")
    notes: Optional[str] = Field(None, max_length=500, description="Notes")

    class Config:
        str_strip_whitespace = True
        validate_assignment = True


class AllergyDTO(BaseModel):
    """DTO for allergy data"""
    id: Optional[UUID] = Field(None, description="Allergy ID for updates")
    allergen: str = Field(..., min_length=2, max_length=200, description="Allergen name")
    severity: str = Field(..., description="Severity: LEVE, MODERADA, SEVERA, CRITICA")
    symptoms: Optional[str] = Field(None, max_length=500, description="Symptoms")
    treatment: Optional[str] = Field(None, max_length=500, description="Treatment")
    diagnosis_date: Optional[date] = Field(None, description="Diagnosis date")
    notes: Optional[str] = Field(None, max_length=1000, description="Notes")

    class Config:
        str_strip_whitespace = True
        validate_assignment = True


class DiseaseDTO(BaseModel):
    """DTO for disease data"""
    id: Optional[UUID] = Field(None, description="Disease ID for updates")
    name: str = Field(..., min_length=2, max_length=200, description="Disease name")
    diagnosis_date: date = Field(..., description="Diagnosis date")
    cie10_code: Optional[str] = Field(None, max_length=10, description="CIE-10 code")
    symptoms: Optional[str] = Field(None, max_length=500, description="Symptoms")
    current_treatment: Optional[str] = Field(None, max_length=500, description="Current treatment")
    prescribing_doctor: Optional[str] = Field(None, max_length=200, description="Prescribing doctor")
    is_chronic: bool = Field(default=False, description="Is chronic condition")
    notes: Optional[str] = Field(None, max_length=1000, description="Notes")

    class Config:
        str_strip_whitespace = True
        validate_assignment = True


class SurgeryDTO(BaseModel):
    """DTO for surgery data"""
    id: Optional[UUID] = Field(None, description="Surgery ID for updates")
    name: str = Field(..., min_length=2, max_length=200, description="Surgery name")
    surgery_date: date = Field(..., description="Surgery date")
    surgeon: Optional[str] = Field(None, max_length=200, description="Surgeon name")
    hospital: Optional[str] = Field(None, max_length=200, description="Hospital name")
    description: Optional[str] = Field(None, max_length=1000, description="Surgery description")
    diagnosis: Optional[str] = Field(None, max_length=500, description="Diagnosis")
    anesthesia_type: Optional[str] = Field(None, description="Anesthesia type: GENERAL, LOCAL, REGIONAL, SEDACION")
    duration_minutes: Optional[int] = Field(None, ge=1, le=1440, description="Duration in minutes")
    notes: Optional[str] = Field(None, max_length=1000, description="Notes")

    class Config:
        str_strip_whitespace = True
        validate_assignment = True


class GynecologicalHistoryDTO(BaseModel):
    """DTO for gynecological history data (only for female patients)"""
    is_pregnant: Optional[bool] = Field(None, description="Is currently pregnant")
    pregnancy_weeks: Optional[int] = Field(None, ge=1, le=42, description="Pregnancy weeks if pregnant")
    last_menstruation_date: Optional[date] = Field(None, description="Last menstruation date")
    menstrual_status: Optional[str] = Field(None, max_length=20, description="Menstrual status: NOT_STARTED, ACTIVE, MENOPAUSE")
    pregnancies_count: Optional[int] = Field(None, ge=0, description="Number of pregnancies")
    births_count: Optional[int] = Field(None, ge=0, description="Number of births")
    cesareans_count: Optional[int] = Field(None, ge=0, description="Number of cesarean sections")
    abortions_count: Optional[int] = Field(None, ge=0, description="Number of abortions")
    contraceptive_method: Optional[str] = Field(None, max_length=100, description="Contraceptive method")

    class Config:
        str_strip_whitespace = True
        validate_assignment = True