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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Error en validación",
                "errors": {"general": [str(e)]}
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": "Error interno del servidor",
                "errors": {"general": ["Error procesando registro"]}
            }
        )