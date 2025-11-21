"""
Authentication API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Dict, Any, Union

from shared.database import get_db
from slices.auth.application.dto import LoginRequestDto, LoginResponseDto, LoginErrorResponseDto
from slices.auth.application.use_cases import (
    AuthenticateUserUseCase,
    ValidateTokenUseCase,
    LogoutUserUseCase,
    RefreshTokenUseCase
)
from slices.auth.infrastructure.persistence import (
    SQLAlchemyAuthRepository,
    SQLAlchemyLoginAttemptRepository,
    SQLAlchemyUserSessionRepository
)
from slices.auth.infrastructure.security.password_service import PasswordService
from slices.auth.infrastructure.security.jwt_service_singleton import get_jwt_service
from slices.subscriptions.infrastructure.persistence.subscription_repository import SubscriptionRepository

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()


# Dependency injection functions
def get_auth_use_case(db: Session = Depends(get_db)) -> AuthenticateUserUseCase:
    """Dependency injection for AuthenticateUserUseCase"""
    auth_repository = SQLAlchemyAuthRepository(db)
    login_attempt_repository = SQLAlchemyLoginAttemptRepository(db)
    user_session_repository = SQLAlchemyUserSessionRepository(db)
    subscription_repository = SubscriptionRepository(db)
    password_service = PasswordService()
    jwt_service = get_jwt_service()

    return AuthenticateUserUseCase(
        auth_repository=auth_repository,
        login_attempt_repository=login_attempt_repository,
        user_session_repository=user_session_repository,
        password_service=password_service,
        jwt_service=jwt_service,
        subscription_repository=subscription_repository
    )


def get_validate_token_use_case(db: Session = Depends(get_db)) -> ValidateTokenUseCase:
    """Dependency injection for ValidateTokenUseCase"""
    auth_repository = SQLAlchemyAuthRepository(db)
    user_session_repository = SQLAlchemyUserSessionRepository(db)
    jwt_service = get_jwt_service()

    return ValidateTokenUseCase(
        auth_repository=auth_repository,
        user_session_repository=user_session_repository,
        jwt_service=jwt_service
    )


def get_logout_use_case(db: Session = Depends(get_db)) -> LogoutUserUseCase:
    """Dependency injection for LogoutUserUseCase"""
    user_session_repository = SQLAlchemyUserSessionRepository(db)
    jwt_service = get_jwt_service()

    return LogoutUserUseCase(
        user_session_repository=user_session_repository,
        jwt_service=jwt_service
    )


def get_refresh_token_use_case(db: Session = Depends(get_db)) -> RefreshTokenUseCase:
    """Dependency injection for RefreshTokenUseCase"""
    auth_repository = SQLAlchemyAuthRepository(db)
    user_session_repository = SQLAlchemyUserSessionRepository(db)
    jwt_service = get_jwt_service()

    return RefreshTokenUseCase(
        auth_repository=auth_repository,
        user_session_repository=user_session_repository,
        jwt_service=jwt_service
    )


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request"""
    # Check for forwarded headers first (for reverse proxies)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Get the first IP in the chain (original client)
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to direct connection IP
    return request.client.host if request.client else "unknown"


# Authentication endpoints
@router.post("/login")
async def login(
    login_request: LoginRequestDto,
    request: Request,
    use_case: AuthenticateUserUseCase = Depends(get_auth_use_case)
) -> Union[LoginResponseDto, LoginErrorResponseDto]:
    """
    Authenticate user and return JWT tokens

    Implements RF000 authentication requirements:
    - Email/password validation
    - Rate limiting (IP and email based)
    - Account lockout after failed attempts
    - Session management with JWT
    - Profile completeness validation
    - Comprehensive security audit logging
    """
    try:
        # Extract client information
        ip_address = get_client_ip(request)
        user_agent = request.headers.get("User-Agent", "unknown")

        # Execute authentication
        result = await use_case.execute(login_request, ip_address, user_agent)

        if result["success"]:
            return result["data"]
        else:
            # Return error response with proper status code
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result["error"].dict()
            )

    except HTTPException:
        # Re-raise HTTP exceptions (rate limiting, etc.)
        raise

    except Exception as e:
        # Handle unexpected errors - log for debugging
        import traceback
        print(f"🔍 LOGIN ERROR DEBUG - Exception caught:")
        print(f"   Exception type: {type(e).__name__}")
        print(f"   Exception message: {str(e)}")
        print(f"   Traceback: {traceback.format_exc()}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": "Error interno del servidor",
                "error_code": "INTERNAL_ERROR"
            }
        )


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    logout_all: bool = False,
    use_case: LogoutUserUseCase = Depends(get_logout_use_case)
) -> Dict[str, Any]:
    """
    Logout user by revoking session(s)

    Args:
        logout_all: Whether to logout from all devices
    """
    try:
        token = credentials.credentials
        result = await use_case.execute(token, logout_all)
        return result

    except Exception:
        # Always return success for logout to prevent information leakage
        return {"success": True, "message": "Logout exitoso"}


@router.post("/refresh")
async def refresh_token(
    refresh_request: Dict[str, str],
    use_case: RefreshTokenUseCase = Depends(get_refresh_token_use_case)
) -> LoginResponseDto:
    """
    Refresh JWT access token using refresh token
    """
    try:
        refresh_token = refresh_request.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required"
            )

        result = await use_case.execute(refresh_token)
        return result["data"]

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.get("/me")
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    use_case: ValidateTokenUseCase = Depends(get_validate_token_use_case)
) -> Dict[str, Any]:
    """
    Get current authenticated user information
    """
    try:
        token = credentials.credentials
        user_info = await use_case.execute(token)
        return {
            "success": True,
            "user": user_info
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


@router.post("/validate")
async def validate_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    use_case: ValidateTokenUseCase = Depends(get_validate_token_use_case)
) -> Dict[str, Any]:
    """
    Validate JWT token (for internal use by frontend)
    """
    try:
        token = credentials.credentials
        user_info = await use_case.execute(token)
        return {
            "valid": True,
            "user": user_info
        }

    except HTTPException:
        return {"valid": False}

    except Exception:
        return {"valid": False}


# Dependency function for authentication
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> 'User':
    """
    Dependency to get current authenticated user from JWT token
    Returns User object for use in protected endpoints
    """
    try:
        print(f"🔍 GET_CURRENT_USER DEBUG - Starting authentication:")
        token = credentials.credentials
        print(f"   Token length: {len(token)}")
        print(f"   Token preview: {token[:50]}...")

        # Create use case with proper dependency injection
        auth_repository = SQLAlchemyAuthRepository(db)
        user_session_repository = SQLAlchemyUserSessionRepository(db)
        jwt_service = get_jwt_service()

        use_case = ValidateTokenUseCase(
            auth_repository=auth_repository,
            user_session_repository=user_session_repository,
            jwt_service=jwt_service
        )

        print(f"🔍 GET_CURRENT_USER DEBUG - About to execute ValidateTokenUseCase...")
        user_data = await use_case.execute(token)
        print(f"🔍 GET_CURRENT_USER DEBUG - ValidateTokenUseCase completed successfully")
        print(f"   User data: {user_data}")

        # Import here to avoid circular imports
        from slices.signup.domain.models.user_model import User

        # Get the actual User object from the database using the validated user_id
        user_id = user_data["user_id"]
        print(f"🔍 GET_CURRENT_USER DEBUG - Getting user by ID: {user_id}")
        user = await auth_repository.get_user_by_id(user_id)

        if not user:
            print(f"🔍 GET_CURRENT_USER DEBUG - ❌ User not found in database")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        print(f"🔍 GET_CURRENT_USER DEBUG - ✅ Authentication successful for user: {user.email}")
        return user

    except HTTPException as e:
        print(f"🔍 GET_CURRENT_USER DEBUG - ❌ HTTPException: {e.detail}")
        raise

    except Exception as e:
        print(f"🔍 GET_CURRENT_USER DEBUG - ❌ Unexpected exception: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"🔍 GET_CURRENT_USER DEBUG - ❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )