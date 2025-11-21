"""
Authenticate User Use Case
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException, status

from slices.auth.application.dto import LoginRequestDto, LoginResponseDto, UserResponseDto, LoginErrorResponseDto
from slices.auth.application.ports import AuthRepository, LoginAttemptRepository, UserSessionRepository
from slices.auth.infrastructure.security.password_service import PasswordService
from slices.auth.infrastructure.security.jwt_service import JWTService
from slices.subscriptions.infrastructure.persistence.subscription_repository import SubscriptionRepository


class AuthenticateUserUseCase:
    """Use case for user authentication with security features"""

    def __init__(
        self,
        auth_repository: AuthRepository,
        login_attempt_repository: LoginAttemptRepository,
        user_session_repository: UserSessionRepository,
        password_service: PasswordService,
        jwt_service: JWTService,
        subscription_repository: Optional[SubscriptionRepository] = None
    ):
        self.auth_repository = auth_repository
        self.login_attempt_repository = login_attempt_repository
        self.user_session_repository = user_session_repository
        self.password_service = password_service
        self.jwt_service = jwt_service
        self.subscription_repository = subscription_repository

    async def execute(
        self,
        login_request: LoginRequestDto,
        ip_address: str,
        user_agent: str
    ) -> Dict[str, Any]:
        """
        Authenticate user with comprehensive security checks

        Args:
            login_request: Login credentials and options
            ip_address: Client IP address for rate limiting
            user_agent: Client user agent for session tracking

        Returns:
            Dictionary with success/error response
        """
        # Step 1: Rate limiting checks
        await self._check_rate_limits(login_request.email, ip_address)

        # Step 2: Get user by email (support all user types, not just patients)
        user = await self.auth_repository.get_user_by_email(login_request.email)

        # Step 3: Verify user exists and account status
        if not user:
            await self._record_failed_attempt(
                login_request.email, ip_address, user_agent, "user_not_found"
            )
            return self._create_error_response("Email o contraseña incorrectos")

        # Check if user is locked
        if await self.auth_repository.is_user_locked(user.id):
            await self._record_failed_attempt(
                login_request.email, ip_address, user_agent, "account_locked", str(user.id)
            )
            return self._create_error_response("Cuenta bloqueada. Contacte al soporte.")

        # Step 4: Verify password
        if not self.password_service.verify_password(login_request.password, user.password_hash):
            await self._record_failed_attempt(
                login_request.email, ip_address, user_agent, "invalid_password", str(user.id)
            )

            # Increment failed attempts and check for lockout
            failed_attempts = await self.auth_repository.increment_failed_login_attempts(user.id)
            if failed_attempts >= 5:  # Lock after 5 failed attempts
                await self.auth_repository.lock_user_account(user.id)
                return self._create_error_response("Cuenta bloqueada por demasiados intentos fallidos")

            remaining_attempts = 5 - failed_attempts
            return self._create_error_response(
                "Email o contraseña incorrectos",
                attempts_remaining=remaining_attempts
            )

        # Step 5: Check email verification
        if not user.is_verified:
            await self._record_failed_attempt(
                login_request.email, ip_address, user_agent, "email_not_verified", str(user.id)
            )
            return self._create_error_response("Email no verificado. Revisa tu bandeja de entrada.")

        # Step 6: Successful authentication - generate tokens
        token_data = self.jwt_service.create_access_token(
            user_id=str(user.id),
            email=user.email,
            user_type=user.user_type,
            remember_me=login_request.remember_me
        )

        refresh_token_data = self.jwt_service.create_refresh_token(
            user_id=str(user.id),
            session_id=token_data["session_id"]
        )

        # Step 7: Create session record
        session = await self.user_session_repository.create_session(
            user_id=user.id,
            session_token=token_data["access_token"],
            refresh_token=refresh_token_data["refresh_token"],
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=token_data["expires_at"],
            refresh_expires_at=refresh_token_data["expires_at"]
        )

        # Step 8: Update user login info
        await self.auth_repository.update_last_login(user.id)
        await self.auth_repository.reset_failed_login_attempts(user.id)

        # Step 9: Record successful attempt
        await self._record_successful_attempt(login_request.email, ip_address, user_agent, str(user.id))

        # Step 10: Get patient data if user is a patient
        patient = None
        if user.user_type == 'patient':
            patient = await self.auth_repository.get_patient_by_user_id(user.id)

        # Step 11: Check if user has active subscription
        has_active_subscription = False
        if self.subscription_repository:
            try:
                subscription = await self.subscription_repository.get_user_active_subscription(user.id)
                has_active_subscription = subscription is not None
            except Exception as e:
                # Log error but continue - subscription check is not critical for login
                print(f"Error checking subscription: {e}")
                has_active_subscription = False

        # Step 12: Determine redirect URL based on user type, profile completeness, and subscription
        redirect_url = self._get_redirect_url(user, has_active_subscription)

        # Step 13: Create response - handle both patients and non-patients (paramedics, etc.)
        if patient:
            # Patient user - use patient profile data
            user_response = UserResponseDto(
                id=str(user.id),
                email=user.email,
                first_name=patient.first_name,
                last_name=patient.last_name,
                user_type=user.user_type,
                is_verified=user.is_verified,
                profile_completed=True,  # TODO: Implement actual profile completion logic
                mandatory_fields_completed=True,  # TODO: Implement actual mandatory fields validation
                has_active_subscription=has_active_subscription
            )
        else:
            # Non-patient user (paramedic, etc.) - derive name from email
            email_prefix = user.email.split('@')[0]
            # Convert "test.paramedic" to "Test Paramedic"
            name_parts = email_prefix.replace('.', ' ').replace('_', ' ').title().split()
            first_name = name_parts[0] if len(name_parts) > 0 else "User"
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else user.user_type.title()

            user_response = UserResponseDto(
                id=str(user.id),
                email=user.email,
                first_name=first_name,
                last_name=last_name,
                user_type=user.user_type,
                is_verified=user.is_verified,
                profile_completed=True,
                mandatory_fields_completed=True,
                has_active_subscription=has_active_subscription
            )

        return {
            "success": True,
            "data": LoginResponseDto(
                access_token=token_data["access_token"],
                refresh_token=refresh_token_data["refresh_token"],
                expires_in=token_data["expires_in"],
                user=user_response,
                redirect_url=redirect_url
            )
        }

    async def _check_rate_limits(self, email: str, ip_address: str) -> None:
        """Check rate limiting for email and IP"""
        now = datetime.utcnow()

        # Check IP-based rate limiting (15 attempts per hour)
        ip_failures = await self.login_attempt_repository.count_failures_by_ip(
            ip_address, now - timedelta(hours=1)
        )
        if ip_failures >= 15:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiados intentos desde esta IP. Intente más tarde."
            )

        # Check email-based rate limiting (5 attempts per 15 minutes)
        email_failures = await self.login_attempt_repository.count_failures_by_email(
            email, now - timedelta(minutes=15)
        )
        if email_failures >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiados intentos para este email. Intente en 15 minutos."
            )

    async def _record_failed_attempt(
        self, email: str, ip_address: str, user_agent: str, reason: str, user_id: Optional[str] = None
    ) -> None:
        """Record failed login attempt"""
        await self.login_attempt_repository.create_attempt(
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            success=False,
            failure_reason=reason,
            user_id=user_id
        )

    async def _record_successful_attempt(
        self, email: str, ip_address: str, user_agent: str, user_id: str
    ) -> None:
        """Record successful login attempt"""
        await self.login_attempt_repository.create_attempt(
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
            user_id=user_id
        )

    def _create_error_response(self, message: str, attempts_remaining: Optional[int] = None) -> Dict[str, Any]:
        """Create standardized error response"""
        error_data = LoginErrorResponseDto(
            message=message,
            attempts_remaining=attempts_remaining
        )
        return {
            "success": False,
            "error": error_data
        }

    def _get_redirect_url(self, user, has_active_subscription: bool = False) -> Optional[str]:
        """
        Determine redirect URL based on user profile completeness and subscription status

        Priority order:
        1. Profile completion (basic info)
        2. Mandatory fields completion (medical info)
        3. Subscription check
        4. Dashboard
        """
        # TODO: Implement actual profile completion logic
        # For now, always redirect to dashboard since profile fields are hardcoded as True
        profile_completed = getattr(user, 'profile_completed', True)
        mandatory_fields_completed = getattr(user, 'mandatory_fields_completed', True)

        if not profile_completed:
            return "/completar-perfil"
        elif not mandatory_fields_completed:
            return "/completar-perfil-medico"
        elif not has_active_subscription:
            # User needs to select a subscription plan
            return "/precios?from=login"
        else:
            return "/dashboard"