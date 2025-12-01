"""
Patient signup API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from shared.database import get_db
from slices.signup.application.dto.patient_registration import PatientRegistrationDTO, PatientRegistrationResponse
from slices.signup.application.use_cases.register_patient import RegisterPatientUseCase
from slices.signup.infrastructure.persistence.user_repository import SQLAlchemyUserRepository
from slices.signup.infrastructure.persistence.patient_repository import SQLAlchemyPatientRepository
from slices.auth.infrastructure.security.jwt_service_singleton import get_jwt_service
from slices.auth.infrastructure.persistence.sqlalchemy_user_session_repository import SQLAlchemyUserSessionRepository
from slices.auth.infrastructure.persistence.sqlalchemy_auth_repository import SQLAlchemyAuthRepository
from slices.subscriptions.infrastructure.persistence.subscription_repository import SubscriptionRepository

router = APIRouter(prefix="/api/signup", tags=["Patient Signup"])


def get_register_patient_use_case(db: Session = Depends(get_db)) -> RegisterPatientUseCase:
    """Dependency injection for RegisterPatientUseCase"""
    user_repository = SQLAlchemyUserRepository(db)
    patient_repository = SQLAlchemyPatientRepository(db)
    jwt_service = get_jwt_service()
    user_session_repository = SQLAlchemyUserSessionRepository(db)
    auth_repository = SQLAlchemyAuthRepository(db)
    subscription_repository = SubscriptionRepository(db)
    return RegisterPatientUseCase(
        user_repository,
        patient_repository,
        jwt_service,
        user_session_repository,
        auth_repository,
        subscription_repository
    )


@router.post("/patient", response_model=PatientRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_patient(
    registration_data: PatientRegistrationDTO,
    use_case: RegisterPatientUseCase = Depends(get_register_patient_use_case)
):
    """
    Register a new patient

    Creates a new user and patient record with all validations according to RF001:
    - Email and document uniqueness validation
    - Age validation (18+ years)
    - Password policy validation
    - Legal acceptance requirements
    """
    try:
        result = await use_case.execute(registration_data)
        return result

    except ValueError as e:
        error_message = str(e)

        # Map error messages to specific fields and error_keys for i18n
        error_mapping = {
            "El email ya está registrado": ("email", "email_already_registered"),
            "El número de documento ya está registrado": ("document", "document_already_registered"),
            "Las contraseñas no coinciden": ("password", "password_mismatch"),
            "Debe ser mayor de 18 años para registrarse": ("birthDate", "age_requirement"),
            "Debe aceptar los términos y condiciones": ("acceptTerms", "terms_required"),
            "Debe aceptar la política de privacidad": ("acceptPrivacy", "privacy_required"),
        }

        # Check if error matches any known pattern
        field = "general"
        error_key = "registration_failed"

        for msg_pattern, (mapped_field, mapped_key) in error_mapping.items():
            if msg_pattern in error_message:
                field = mapped_field
                error_key = mapped_key
                break

        # Check for invalid country code pattern
        if "Código de país inválido" in error_message:
            field = "originCountry"
            error_key = "invalid_country"

        # Use HTTP 409 CONFLICT for duplicate entries (email/document already registered)
        is_conflict = error_key in ("email_already_registered", "document_already_registered")
        status_code = status.HTTP_409_CONFLICT if is_conflict else status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=status_code,
            detail={
                "success": False,
                "message": error_message,
                "error_key": error_key,
                "field": field,
                "errors": {field: [error_message]}
            }
        )

    except Exception as e:
        import traceback
        error_msg = str(e)
        tb = traceback.format_exc()
        print(f"=" * 80)
        print(f"ERROR en registro: {error_msg}")
        print(f"=" * 80)
        print(f"Traceback completo:\n{tb}")
        print(f"=" * 80)

        # Write to file for debugging
        with open("/tmp/signup_error.log", "a") as f:
            f.write(f"\n{'=' * 80}\n")
            f.write(f"ERROR: {error_msg}\n")
            f.write(f"Traceback:\n{tb}\n")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": "Error interno del servidor",
                "errors": {"general": [f"Error procesando registro: {error_msg}"]}
            }
        )