"""
Patient registration DTOs
"""
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional

from slices.auth.application.dto import UserResponseDto


class PatientRegistrationDTO(BaseModel):
    """Data Transfer Object for patient registration"""

    # Name fields - industry standard separated structure
    first_name: str = Field(..., min_length=1, max_length=50, description="Patient first name")
    last_name: str = Field(..., min_length=1, max_length=50, description="Patient last name")

    document_type: str = Field(..., min_length=2, max_length=5, description="Document type code")
    document_number: str = Field(..., min_length=6, max_length=20, description="Document number")
    phone_international: str = Field(..., min_length=10, max_length=20, description="Phone in international format")
    birth_date: date = Field(..., description="Birth date")
    origin_country: str = Field(default="CO", min_length=2, max_length=2, description="Country of origin (ISO 3166-1 alpha-2)")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password")
    confirm_password: str = Field(..., min_length=8, max_length=128, description="Password confirmation")
    accept_terms: bool = Field(..., description="Accept terms and conditions")
    accept_privacy: bool = Field(..., description="Accept privacy policy")
    plan_id: Optional[int] = Field(default=None, description="Selected subscription plan ID (optional)")

    class Config:
        str_strip_whitespace = True
        validate_assignment = True


class PatientRegistrationResponse(BaseModel):
    """Response DTO for successful patient registration with auto-login support"""

    success: bool = Field(default=True, description="Registration success status")
    message: str = Field(..., description="Success message")
    user_id: UUID = Field(..., description="Created user ID")
    patient_id: UUID = Field(..., description="Created patient ID")
    qr_code: UUID = Field(..., description="Patient QR code")

    # Authentication tokens for auto-login
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    expires_in: int = Field(..., description="Token expiration time in seconds")

    # User information for frontend
    user: UserResponseDto = Field(..., description="User information")

    # Navigation
    redirect_url: str = Field(default="/dashboard", description="Auto-redirect URL")

    class Config:
        validate_assignment = True