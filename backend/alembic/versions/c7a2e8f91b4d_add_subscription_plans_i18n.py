"""add_subscription_plans_i18n

Revision ID: c7a2e8f91b4d
Revises: b8c5e9f72a3d
Create Date: 2025-11-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c7a2e8f91b4d'
down_revision: Union[str, Sequence[str], None] = 'b8c5e9f72a3d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add English translation columns to subscription_plans table."""
    op.add_column('subscription_plans', sa.Column('display_name_en', sa.String(length=100), nullable=True))
    op.add_column('subscription_plans', sa.Column('description_en', sa.Text(), nullable=True))
    op.add_column('subscription_plans', sa.Column('features_en', sa.JSON(), nullable=True))

    # Update existing plans with English translations
    op.execute("""
        UPDATE subscription_plans SET
            display_name_en = 'Free Plan',
            description_en = 'Perfect for starting to digitize your medical history',
            features_en = '["Emergency QR code", "Unlimited records", "Medication management", "Allergy records", "Illness history", "Surgery records"]'::json
        WHERE name = 'free';
    """)

    op.execute("""
        UPDATE subscription_plans SET
            display_name_en = 'Premium Plan',
            description_en = 'Complete access to all advanced features',
            features_en = '["Everything in Free Plan", "Document storage", "Medication reminders", "Export medical history", "Priority support"]'::json
        WHERE name = 'premium';
    """)

    op.execute("""
        UPDATE subscription_plans SET
            display_name_en = 'Family Plan',
            description_en = 'Manage your whole family''s health',
            features_en = '["Everything in Premium Plan", "Up to 5 family profiles", "Centralized management", "Shared notifications"]'::json
        WHERE name = 'family';
    """)


def downgrade() -> None:
    """Remove English translation columns from subscription_plans table."""
    op.drop_column('subscription_plans', 'features_en')
    op.drop_column('subscription_plans', 'description_en')
    op.drop_column('subscription_plans', 'display_name_en')
