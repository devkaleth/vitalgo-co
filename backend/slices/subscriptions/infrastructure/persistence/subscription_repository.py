"""
Subscription Repository Implementation (Adapter)
Hexagonal Architecture - Infrastructure Layer
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from slices.subscriptions.domain.repository import SubscriptionRepositoryPort
from slices.subscriptions.domain.models import SubscriptionPlan, UserSubscription


class SubscriptionRepository(SubscriptionRepositoryPort):
    """SQLAlchemy implementation of SubscriptionRepositoryPort"""

    def __init__(self, session: Session):
        self.session = session

    async def get_all_active_plans(self) -> List[dict]:
        """Get all active subscription plans"""
        plans = self.session.query(SubscriptionPlan).filter(
            SubscriptionPlan.is_active == True
        ).order_by(SubscriptionPlan.price).all()
        return [plan.to_dict() for plan in plans]

    async def get_plan_by_id(self, plan_id: int) -> Optional[dict]:
        """Get a subscription plan by ID"""
        plan = self.session.query(SubscriptionPlan).filter(
            SubscriptionPlan.id == plan_id
        ).first()
        return plan.to_dict() if plan else None

    async def get_plan_by_name(self, plan_name: str) -> Optional[dict]:
        """Get a subscription plan by name"""
        plan = self.session.query(SubscriptionPlan).filter(
            SubscriptionPlan.name == plan_name
        ).first()
        return plan.to_dict() if plan else None

    async def create_user_subscription(
        self,
        user_id: UUID,
        plan_id: int,
        payment_method: Optional[str] = None,
        transaction_id: Optional[str] = None
    ) -> dict:
        """Create a new user subscription"""
        # Get the plan to calculate end_date
        plan_obj = self.session.query(SubscriptionPlan).filter(
            SubscriptionPlan.id == plan_id
        ).first()

        if not plan_obj:
            raise ValueError(f"Plan with ID {plan_id} not found")

        # Calculate end_date if plan has duration
        end_date = None
        if plan_obj.duration_days:
            end_date = datetime.now(timezone.utc) + timedelta(days=plan_obj.duration_days)

        # Create subscription
        subscription = UserSubscription(
            user_id=user_id,
            plan_id=plan_id,
            status='active',
            start_date=datetime.now(timezone.utc),
            end_date=end_date,
            payment_method=payment_method,
            transaction_id=transaction_id
        )

        self.session.add(subscription)
        self.session.commit()
        self.session.refresh(subscription)

        return subscription.to_dict()

    async def get_user_active_subscription(self, user_id: UUID) -> Optional[dict]:
        """Get user's active subscription"""
        subscription = self.session.query(UserSubscription).filter(
            UserSubscription.user_id == user_id,
            UserSubscription.status == 'active'
        ).order_by(UserSubscription.created_at.desc()).first()
        return subscription.to_dict() if subscription else None

    async def get_user_subscription_history(self, user_id: UUID) -> List[dict]:
        """Get all user subscriptions"""
        subscriptions = self.session.query(UserSubscription).filter(
            UserSubscription.user_id == user_id
        ).order_by(UserSubscription.created_at.desc()).all()
        return [sub.to_dict() for sub in subscriptions]

    async def cancel_user_subscription(self, user_id: UUID) -> bool:
        """Cancel user's active subscription by setting status to 'cancelled'"""
        subscription = self.session.query(UserSubscription).filter(
            UserSubscription.user_id == user_id,
            UserSubscription.status == 'active'
        ).first()

        if not subscription:
            return False

        subscription.status = 'cancelled'
        self.session.commit()
        return True
