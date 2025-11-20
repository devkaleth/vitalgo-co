"""
Subscription Repository Interface (Port)
Hexagonal Architecture - Domain Layer
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID


class SubscriptionRepositoryPort(ABC):
    """Repository interface for subscription operations"""

    @abstractmethod
    async def get_all_active_plans(self) -> List[dict]:
        """Get all active subscription plans"""
        pass

    @abstractmethod
    async def get_plan_by_id(self, plan_id: int) -> Optional[dict]:
        """Get a subscription plan by ID"""
        pass

    @abstractmethod
    async def get_plan_by_name(self, plan_name: str) -> Optional[dict]:
        """Get a subscription plan by name"""
        pass

    @abstractmethod
    async def create_user_subscription(
        self,
        user_id: UUID,
        plan_id: int,
        payment_method: Optional[str] = None,
        transaction_id: Optional[str] = None
    ) -> dict:
        """Create a new user subscription"""
        pass

    @abstractmethod
    async def get_user_active_subscription(self, user_id: UUID) -> Optional[dict]:
        """Get user's active subscription"""
        pass

    @abstractmethod
    async def get_user_subscription_history(self, user_id: UUID) -> List[dict]:
        """Get all user subscriptions"""
        pass
