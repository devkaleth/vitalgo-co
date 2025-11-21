"""
Subscription Application Service
Hexagonal Architecture - Application Layer
"""

from typing import List, Optional
from uuid import UUID

from slices.subscriptions.domain.repository import SubscriptionRepositoryPort


class SubscriptionService:
    """Subscription business logic service"""

    def __init__(self, repository: SubscriptionRepositoryPort):
        self.repository = repository

    async def get_available_plans(self) -> List[dict]:
        """Get all available subscription plans"""
        return await self.repository.get_all_active_plans()

    async def get_plan_details(self, plan_id: int) -> Optional[dict]:
        """Get details of a specific plan"""
        return await self.repository.get_plan_by_id(plan_id)

    async def subscribe_user_to_plan(
        self,
        user_id: UUID,
        plan_id: int,
        payment_method: Optional[str] = None,
        transaction_id: Optional[str] = None
    ) -> dict:
        """Subscribe a user to a plan"""
        # Check if plan exists
        plan = await self.repository.get_plan_by_id(plan_id)
        if not plan:
            raise ValueError(f"Plan with ID {plan_id} does not exist")

        # Create subscription
        return await self.repository.create_user_subscription(
            user_id=user_id,
            plan_id=plan_id,
            payment_method=payment_method,
            transaction_id=transaction_id
        )

    async def get_user_subscription(self, user_id: UUID) -> Optional[dict]:
        """Get user's current active subscription"""
        return await self.repository.get_user_active_subscription(user_id)

    async def get_user_subscription_history(self, user_id: UUID) -> List[dict]:
        """Get user's subscription history"""
        return await self.repository.get_user_subscription_history(user_id)

    async def cancel_user_subscription(self, user_id: UUID) -> bool:
        """Cancel user's active subscription"""
        return await self.repository.cancel_user_subscription(user_id)
