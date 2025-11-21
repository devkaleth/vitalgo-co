"""
Login Response Data Transfer Objects
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class UserResponseDto(BaseModel):
    """DTO for user information in login response"""

    id: str = Field(
        ...,
        description="User's unique identifier",
        example="550e8400-e29b-41d4-a716-446655440000"
    )

    email: str = Field(
        ...,
        description="User's email address",
        example="paciente@vitalgo.com"
    )

    first_name: Optional[str] = Field(
        None,
        description="User's first name",
        example="Juan"
    )

    last_name: Optional[str] = Field(
        None,
        description="User's last name",
        example="Pérez"
    )

    user_type: str = Field(
        ...,
        description="Type of user account",
        example="patient"
    )

    is_verified: bool = Field(
        ...,
        description="Whether the user's email is verified",
        example=True
    )

    profile_completed: bool = Field(
        ...,
        description="Whether the user has completed their basic profile",
        example=False
    )

    mandatory_fields_completed: bool = Field(
        ...,
        description="Whether the user has completed all mandatory medical profile fields",
        example=False
    )

    has_active_subscription: bool = Field(
        default=False,
        description="Whether the user has an active subscription plan",
        example=True
    )

    class Config:
        """Pydantic configuration"""
        from_attributes = True


class LoginResponseDto(BaseModel):
    """DTO for successful login response"""

    success: bool = Field(
        default=True,
        description="Whether the login was successful",
        example=True
    )

    access_token: str = Field(
        ...,
        description="JWT access token",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )

    refresh_token: Optional[str] = Field(
        None,
        description="JWT refresh token for token renewal",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )

    token_type: str = Field(
        default="bearer",
        description="Type of token",
        example="bearer"
    )

    expires_in: int = Field(
        ...,
        description="Token expiration time in seconds",
        example=1800
    )

    user: UserResponseDto = Field(
        ...,
        description="User information"
    )

    redirect_url: Optional[str] = Field(
        None,
        description="URL to redirect user based on profile completeness",
        example="/completar-perfil-medico"
    )

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "success": True,
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "paciente@vitalgo.com",
                    "first_name": "Juan",
                    "last_name": "Pérez",
                    "user_type": "patient",
                    "is_verified": True,
                    "profile_completed": False,
                    "mandatory_fields_completed": False
                },
                "redirect_url": "/completar-perfil-medico"
            }
        }


class LoginErrorResponseDto(BaseModel):
    """DTO for login error response"""

    success: bool = Field(
        default=False,
        description="Whether the login was successful",
        example=False
    )

    message: str = Field(
        ...,
        description="Error message",
        example="Email o contraseña incorrectos"
    )

    attempts_remaining: Optional[int] = Field(
        None,
        description="Number of login attempts remaining before account lockout",
        example=4
    )

    retry_after: Optional[int] = Field(
        None,
        description="Seconds to wait before retry (for rate limiting)",
        example=900
    )

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "success": False,
                "message": "Email o contraseña incorrectos",
                "attempts_remaining": 4
            }
        }