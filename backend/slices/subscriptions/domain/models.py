"""
Subscription Domain Models
Following Hexagonal Architecture principles
"""

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID
from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean, DateTime,
    BigInteger, ForeignKey, JSON, Date, Text
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()


class DiscountCode(Base):
    """Discount Code Model"""
    __tablename__ = 'discount_codes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    discount_type = Column(String(20), nullable=False)  # 'percentage' or 'fixed'
    discount_value = Column(Numeric(10, 2), nullable=False)
    max_uses = Column(Integer, nullable=True)
    used_count = Column(Integer, nullable=False, default=0)
    valid_from = Column(DateTime(timezone=True), nullable=True)
    valid_until = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    partner_company = Column(String(100), nullable=True)
    applicable_plans = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "code": self.code,
            "description": self.description,
            "discount_type": self.discount_type,
            "discount_value": float(self.discount_value),
            "max_uses": self.max_uses,
            "used_count": self.used_count,
            "valid_from": self.valid_from.isoformat() if self.valid_from else None,
            "valid_until": self.valid_until.isoformat() if self.valid_until else None,
            "is_active": self.is_active,
            "partner_company": self.partner_company,
            "applicable_plans": self.applicable_plans,
        }

    def is_valid(self, plan_id: Optional[int] = None) -> tuple[bool, Optional[str]]:
        """Check if discount code is valid"""
        if not self.is_active:
            return False, "Código de descuento inactivo"

        # Check usage limit
        if self.max_uses and self.used_count >= self.max_uses:
            return False, "Este código ha alcanzado su límite de uso"

        # Check date validity
        now = datetime.now(timezone.utc)
        if self.valid_from and now < self.valid_from:
            return False, "Este código aún no es válido"
        if self.valid_until and now > self.valid_until:
            return False, "Este código ha expirado"

        # Check plan applicability
        if plan_id and self.applicable_plans:
            if plan_id not in self.applicable_plans:
                return False, "Este código no es aplicable al plan seleccionado"

        return True, None

    def calculate_discount(self, original_price: float) -> float:
        """Calculate discounted price"""
        if self.discount_type == 'percentage':
            discount_amount = original_price * (float(self.discount_value) / 100)
            return max(0, original_price - discount_amount)
        elif self.discount_type == 'fixed':
            return max(0, original_price - float(self.discount_value))
        return original_price


class SubscriptionPlan(Base):
    """Subscription Plan Model"""
    __tablename__ = 'subscription_plans'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default='USD')
    duration_days = Column(Integer, nullable=True)  # NULL = lifetime
    is_active = Column(Boolean, nullable=False, default=True)
    is_popular = Column(Boolean, nullable=False, default=False)
    features = Column(JSON, nullable=True)
    max_records = Column(Integer, nullable=True)  # NULL = unlimited
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    subscriptions = relationship("UserSubscription", back_populates="plan")

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "display_name": self.display_name,
            "description": self.description,
            "price": float(self.price),
            "currency": self.currency,
            "duration_days": self.duration_days,
            "is_active": self.is_active,
            "is_popular": self.is_popular,
            "features": self.features,
            "max_records": self.max_records,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class UserSubscription(Base):
    """User Subscription Model - Links users to their plans"""
    __tablename__ = 'user_subscriptions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    plan_id = Column(Integer, ForeignKey('subscription_plans.id', ondelete='RESTRICT'), nullable=False)
    status = Column(String(20), nullable=False, default='active')  # active, expired, cancelled
    start_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    auto_renew = Column(Boolean, nullable=False, default=False)
    payment_method = Column(String(50), nullable=True)
    transaction_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": str(self.user_id),
            "plan_id": self.plan_id,
            "status": self.status,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "auto_renew": self.auto_renew,
            "payment_method": self.payment_method,
            "transaction_id": self.transaction_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "plan": self.plan.to_dict() if self.plan else None
        }

    def is_active(self) -> bool:
        """Check if subscription is currently active"""
        if self.status != 'active':
            return False

        if self.end_date is None:
            return True

        return datetime.now(timezone.utc) < self.end_date
