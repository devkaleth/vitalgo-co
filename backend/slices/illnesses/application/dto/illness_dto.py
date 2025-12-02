"""
Illness DTOs for API request/response
"""
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, field_serializer, field_validator


class CreateIllnessDTO(BaseModel):
    """DTO for creating a new illness"""
    illness_name: str = Field(..., max_length=200, description="Illness name")
    diagnosis_date: Optional[date] = Field(None, description="Date when illness was diagnosed")
    status: str = Field(..., max_length=50, description="Status: activa, inactiva, en_tratamiento, curada")
    is_chronic: bool = Field(default=False, description="Whether the illness is chronic")
    treatment_description: Optional[str] = Field(None, description="Description of treatment")
    cie10_code: Optional[str] = Field(None, max_length=10, description="CIE-10 code for the illness")
    diagnosed_by: Optional[str] = Field(None, max_length=200, description="Doctor or entity who diagnosed")
    notes: Optional[str] = Field(None, description="Additional notes")


class UpdateIllnessDTO(BaseModel):
    """DTO for updating an existing illness"""
    illness_name: Optional[str] = Field(None, max_length=200, description="Illness name")
    diagnosis_date: Optional[date] = Field(None, description="Date when illness was diagnosed")
    status: Optional[str] = Field(None, max_length=50, description="Status")
    is_chronic: Optional[bool] = Field(None, description="Whether the illness is chronic")
    treatment_description: Optional[str] = Field(None, description="Description of treatment")
    cie10_code: Optional[str] = Field(None, max_length=10, description="CIE-10 code for the illness")
    diagnosed_by: Optional[str] = Field(None, max_length=200, description="Doctor or entity who diagnosed")
    notes: Optional[str] = Field(None, description="Additional notes")


class PatientIllnessDTO(BaseModel):
    """DTO for illness response with UUID string serialization"""
    id: int
    patient_id: str  # UUID as string
    illness_name: str
    diagnosis_date: Optional[date] = None
    status: str
    is_chronic: bool
    treatment_description: Optional[str] = None
    cie10_code: Optional[str] = None
    diagnosed_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_validator('patient_id', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        """Convert UUID objects to string for validation"""
        return str(v) if v is not None else None

    @field_serializer('patient_id', when_used='json')
    def serialize_patient_id(self, patient_id) -> str:
        """Ensure patient_id is always serialized as string"""
        return str(patient_id)

    @field_serializer('diagnosis_date', when_used='json')
    def serialize_diagnosis_date(self, diagnosis_date) -> str | None:
        """Serialize date as ISO string"""
        return diagnosis_date.isoformat() if diagnosis_date else None

    @field_serializer('created_at', when_used='json')
    def serialize_created_at(self, created_at) -> str:
        """Serialize datetime as ISO string"""
        return created_at.isoformat()

    @field_serializer('updated_at', when_used='json')
    def serialize_updated_at(self, updated_at) -> str:
        """Serialize datetime as ISO string"""
        return updated_at.isoformat()

    class Config:
        from_attributes = True