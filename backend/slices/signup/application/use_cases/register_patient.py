"""
Register patient use case - Main business logic for patient registration
"""
import bcrypt
from datetime import datetime, date
from typing import Dict, Any, Optional

from slices.signup.application.ports.user_repository import UserRepository
from slices.signup.application.ports.patient_repository import PatientRepository
from slices.signup.application.dto.patient_registration import PatientRegistrationDTO, PatientRegistrationResponse
from slices.signup.domain.models.user_model import User
from slices.signup.domain.models.patient_model import Patient
from slices.auth.infrastructure.security.jwt_service import JWTService
from slices.auth.application.ports.user_session_repository import UserSessionRepository
from slices.auth.application.ports.auth_repository import AuthRepository
from slices.auth.application.dto import UserResponseDto
from slices.subscriptions.domain.repository import SubscriptionRepositoryPort


class RegisterPatientUseCase:
    """Use case for registering a new patient"""

    def __init__(
        self,
        user_repository: UserRepository,
        patient_repository: PatientRepository,
        jwt_service: JWTService,
        user_session_repository: UserSessionRepository,
        auth_repository: AuthRepository,
        subscription_repository: Optional[SubscriptionRepositoryPort] = None
    ):
        self.user_repository = user_repository
        self.patient_repository = patient_repository
        self.jwt_service = jwt_service
        self.user_session_repository = user_session_repository
        self.auth_repository = auth_repository
        self.subscription_repository = subscription_repository

    async def execute(
        self,
        registration_data: PatientRegistrationDTO,
        ip_address: str = "127.0.0.1",
        user_agent: str = "Unknown"
    ) -> PatientRegistrationResponse:
        """Execute patient registration process"""

        # 1. Validate business rules
        await self._validate_registration(registration_data)

        # 2. Create user
        user = await self._create_user(registration_data)

        # 3. Create patient
        patient = await self._create_patient(user, registration_data)

        # 4. Generate JWT tokens for auto-login
        token_data = self.jwt_service.create_access_token(
            user_id=str(user.id),
            email=user.email,
            user_type=user.user_type,
            remember_me=False  # Default to false for signup
        )

        refresh_token_data = self.jwt_service.create_refresh_token(
            user_id=str(user.id),
            session_id=token_data["session_id"]
        )

        # 5. Create session record for auto-login
        session = await self.user_session_repository.create_session(
            user_id=user.id,
            session_token=token_data["access_token"],
            refresh_token=refresh_token_data["refresh_token"],
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=token_data["expires_at"],
            refresh_expires_at=refresh_token_data["expires_at"]
        )

        # 6. Create subscription if plan_id provided
        if registration_data.plan_id and self.subscription_repository:
            try:
                await self.subscription_repository.create_user_subscription(
                    user_id=user.id,
                    plan_id=registration_data.plan_id
                )
            except Exception as e:
                # Log error but don't fail registration
                # User can be assigned plan later
                print(f"Warning: Could not create subscription: {e}")
        elif not registration_data.plan_id and self.subscription_repository:
            # If no plan selected, assign default free plan
            try:
                free_plan = await self.subscription_repository.get_plan_by_name("free")
                if free_plan:
                    await self.subscription_repository.create_user_subscription(
                        user_id=user.id,
                        plan_id=free_plan["id"]
                    )
            except Exception as e:
                print(f"Warning: Could not assign default free plan: {e}")

        # 7. Update user login info (first login)
        await self.auth_repository.update_last_login(user.id)

        # 8. Create user response for consistent format with auth
        user_response = UserResponseDto(
            id=str(user.id),
            email=user.email,
            first_name=patient.first_name,  # Now captured in signup
            last_name=patient.last_name,    # Now captured in signup
            user_type=user.user_type,
            is_verified=user.is_verified,
            profile_completed=False,  # New users need to complete profile
            mandatory_fields_completed=False  # New users need to add medical data
        )

        # 9. Return enhanced response with auth tokens
        return PatientRegistrationResponse(
            success=True,
            message="Cuenta creada exitosamente",
            user_id=user.id,
            patient_id=patient.id,
            qr_code=patient.qr_code,
            access_token=token_data["access_token"],
            refresh_token=refresh_token_data["refresh_token"],
            expires_in=token_data["expires_in"],
            user=user_response,
            redirect_url="/dashboard"  # Auto-redirect to dashboard
        )

    async def _validate_registration(self, data: PatientRegistrationDTO) -> None:
        """Validate registration data"""

        # Validate password confirmation
        if data.password != data.confirm_password:
            raise ValueError("Las contraseñas no coinciden")

        # Validate age (must be 18+)
        today = date.today()
        age = today.year - data.birth_date.year - ((today.month, today.day) < (data.birth_date.month, data.birth_date.day))
        if age < 18:
            raise ValueError("Debe ser mayor de 18 años para registrarse")

        # Validate email uniqueness
        if await self.user_repository.email_exists(data.email.lower()):
            raise ValueError("El email ya está registrado")

        # Validate document uniqueness
        if await self.patient_repository.document_exists(data.document_number):
            raise ValueError("El número de documento ya está registrado")

        # Validate required acceptances
        if not data.accept_terms:
            raise ValueError("Debe aceptar los términos y condiciones")

        if not data.accept_privacy:
            raise ValueError("Debe aceptar la política de privacidad")

        # Validate origin country code
        from shared.utils.countries import is_valid_country_code
        if not is_valid_country_code(data.origin_country):
            raise ValueError(f"Código de país inválido: {data.origin_country}")

    async def _create_user(self, data: PatientRegistrationDTO) -> User:
        """Create user with hashed password"""

        # Hash password with bcrypt
        password_hash = bcrypt.hashpw(
            data.password.encode('utf-8'),
            bcrypt.gensalt(rounds=12)
        ).decode('utf-8')

        user = User(
            email=data.email.lower(),
            password_hash=password_hash,
            user_type="patient",
            is_verified=True  # Default to True as per RF001
        )

        return await self.user_repository.create(user)

    async def _create_patient(self, user: User, data: PatientRegistrationDTO) -> Patient:
        """Create patient with legal acceptance timestamps"""

        # Get document type ID from code
        document_types = await self.patient_repository.get_document_types()
        document_type = next((dt for dt in document_types if dt.code == data.document_type), None)

        if not document_type:
            raise ValueError(f"Tipo de documento inválido: {data.document_type}")

        # Create timestamp for legal acceptances
        acceptance_timestamp = datetime.utcnow()

        patient = Patient(
            user_id=user.id,
            first_name=data.first_name,
            last_name=data.last_name,
            document_type_id=document_type.id,
            document_number=data.document_number,
            phone_international=data.phone_international,
            birth_date=data.birth_date,
            origin_country=data.origin_country,
            accept_terms=data.accept_terms,
            accept_terms_date=acceptance_timestamp,
            accept_policy=data.accept_privacy,
            accept_policy_date=acceptance_timestamp
        )

        return await self.patient_repository.create(patient)

