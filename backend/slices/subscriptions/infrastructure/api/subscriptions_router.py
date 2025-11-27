"""
Subscriptions API endpoints
Hexagonal Architecture - Infrastructure Layer
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from shared.database.database import get_db
from slices.auth.infrastructure.api.auth_endpoints import get_current_user
from slices.signup.domain.models.user_model import User
from slices.subscriptions.application.subscription_service import SubscriptionService
from slices.subscriptions.infrastructure.persistence.subscription_repository import SubscriptionRepository
from slices.subscriptions.domain.models import DiscountCode

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])


# DTOs
class PlanResponse(BaseModel):
    """Subscription plan response DTO"""
    id: int
    name: str
    display_name: str
    description: Optional[str]
    price: float
    currency: str
    duration_days: Optional[int]
    is_active: bool
    is_popular: bool
    features: Optional[List[str]]
    max_records: Optional[int]
    # English translations
    display_name_en: Optional[str] = None
    description_en: Optional[str] = None
    features_en: Optional[List[str]] = None


class SubscriptionResponse(BaseModel):
    """User subscription response DTO"""
    id: int
    user_id: str
    plan_id: int
    status: str
    start_date: str
    end_date: Optional[str]
    auto_renew: bool
    plan: Optional[PlanResponse]


class CreateSubscriptionRequest(BaseModel):
    """Request to create a subscription"""
    plan_id: int
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None


class ValidateDiscountRequest(BaseModel):
    """Request to validate a discount code"""
    code: str
    plan_id: Optional[int] = None


class ValidateDiscountResponse(BaseModel):
    """Response for discount code validation"""
    valid: bool
    message: str
    discount_code: Optional[dict] = None
    discounted_price: Optional[float] = None
    original_price: Optional[float] = None


# Dependency
def get_subscription_service(db: Session = Depends(get_db)) -> SubscriptionService:
    """Dependency to get subscription service"""
    repository = SubscriptionRepository(db)
    return SubscriptionService(repository)


# Endpoints
@router.get("/plans", response_model=List[PlanResponse])
async def get_subscription_plans(
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    Get all available subscription plans.
    This endpoint is public (no authentication required).
    """
    try:
        plans = await service.get_available_plans()
        return plans
    except Exception as e:
        logger.error(f"Error getting subscription plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving subscription plans"
        )


@router.get("/plans/{plan_id}", response_model=PlanResponse)
async def get_plan_details(
    plan_id: int,
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    Get details of a specific subscription plan.
    This endpoint is public (no authentication required).
    """
    try:
        plan = await service.get_plan_details(plan_id)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plan with ID {plan_id} not found"
            )
        return plan
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting plan details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving plan details"
        )


@router.post("/subscribe", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    Subscribe the authenticated user to a plan.
    Requires authentication.
    """
    try:
        subscription = await service.subscribe_user_to_plan(
            user_id=current_user.id,
            plan_id=request.plan_id,
            payment_method=request.payment_method,
            transaction_id=request.transaction_id
        )
        return subscription
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating subscription"
        )


@router.get("/my-subscription", response_model=Optional[SubscriptionResponse])
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    Get the authenticated user's current active subscription.
    Requires authentication.
    """
    try:
        subscription = await service.get_user_subscription(current_user.id)
        return subscription
    except Exception as e:
        logger.error(f"Error getting user subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving subscription"
        )


@router.get("/my-history", response_model=List[SubscriptionResponse])
async def get_my_subscription_history(
    current_user: User = Depends(get_current_user),
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    Get the authenticated user's subscription history.
    Requires authentication.
    """
    try:
        history = await service.get_user_subscription_history(current_user.id)
        return history
    except Exception as e:
        logger.error(f"Error getting subscription history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving subscription history"
        )


@router.post("/cancel", status_code=status.HTTP_200_OK)
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    Cancel the authenticated user's active subscription.
    Sets status to 'cancelled' instead of deleting.
    Requires authentication.
    """
    try:
        result = await service.cancel_user_subscription(current_user.id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró suscripción activa para cancelar"
            )
        return {
            "success": True,
            "message": "Suscripción cancelada exitosamente"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error canceling subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al cancelar suscripción"
        )


@router.post("/validate-discount", response_model=ValidateDiscountResponse)
async def validate_discount_code(
    request: ValidateDiscountRequest,
    db: Session = Depends(get_db)
):
    """
    Validate a discount code.
    This endpoint is public (no authentication required).
    """
    try:
        # Find discount code (case-insensitive)
        discount = db.query(DiscountCode).filter(
            DiscountCode.code == request.code.upper()
        ).first()

        if not discount:
            return ValidateDiscountResponse(
                valid=False,
                message="Código de descuento no válido"
            )

        # Validate discount code
        is_valid, error_message = discount.is_valid(request.plan_id)

        if not is_valid:
            return ValidateDiscountResponse(
                valid=False,
                message=error_message or "Código de descuento no válido"
            )

        # Get plan price if plan_id provided
        discounted_price = None
        original_price = None
        if request.plan_id:
            plan = await get_subscription_service(db).get_plan_details(request.plan_id)
            if plan:
                original_price = plan['price']
                discounted_price = discount.calculate_discount(original_price)

        return ValidateDiscountResponse(
            valid=True,
            message=f"Código válido: {discount.discount_value}% de descuento" if discount.discount_type == 'percentage' else f"Código válido: ${discount.discount_value} de descuento",
            discount_code=discount.to_dict(),
            discounted_price=discounted_price,
            original_price=original_price
        )

    except Exception as e:
        logger.error(f"Error validating discount code: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error validando código de descuento"
        )
