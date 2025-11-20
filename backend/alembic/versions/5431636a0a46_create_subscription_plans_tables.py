"""create_subscription_plans_tables

Revision ID: 5431636a0a46
Revises: 743c17eeac08
Create Date: 2025-11-20 12:10:30.456121

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5431636a0a46'
down_revision: Union[str, Sequence[str], None] = '743c17eeac08'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create subscription_plans table
    op.create_table(
        'subscription_plans',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False, server_default='USD'),
        sa.Column('duration_days', sa.Integer(), nullable=True),  # NULL = lifetime
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_popular', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('max_records', sa.Integer(), nullable=True),  # NULL = unlimited
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create user_subscriptions table
    op.create_table(
        'user_subscriptions',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('plan_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('auto_renew', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('payment_method', sa.String(length=50), nullable=True),
        sa.Column('transaction_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['plan_id'], ['subscription_plans.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(op.f('ix_user_subscriptions_user_id'), 'user_subscriptions', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_subscriptions_status'), 'user_subscriptions', ['status'], unique=False)
    op.create_index(op.f('ix_user_subscriptions_end_date'), 'user_subscriptions', ['end_date'], unique=False)

    # Insert default plans
    op.execute("""
        INSERT INTO subscription_plans (name, display_name, description, price, currency, duration_days, is_active, is_popular, features, max_records)
        VALUES
        ('free', 'Plan Gratuito', 'Perfecto para empezar a digitalizar tu historial médico', 0.00, 'USD', NULL, true, true,
         '["Código QR de emergencia", "Registros ilimitados", "Gestión de medicamentos", "Registro de alergias", "Historial de enfermedades", "Registro de cirugías"]'::json,
         NULL),
        ('premium', 'Plan Premium', 'Acceso completo a todas las funcionalidades avanzadas', 9.99, 'USD', 30, true, false,
         '["Todo lo del Plan Gratuito", "Almacenamiento de documentos", "Recordatorios de medicamentos", "Exportar historial médico", "Soporte prioritario"]'::json,
         NULL),
        ('family', 'Plan Familiar', 'Gestiona la salud de toda tu familia', 19.99, 'USD', 30, true, false,
         '["Todo lo del Plan Premium", "Hasta 5 perfiles familiares", "Gestión centralizada", "Notificaciones compartidas"]'::json,
         NULL);
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_user_subscriptions_end_date'), table_name='user_subscriptions')
    op.drop_index(op.f('ix_user_subscriptions_status'), table_name='user_subscriptions')
    op.drop_index(op.f('ix_user_subscriptions_user_id'), table_name='user_subscriptions')
    op.drop_table('user_subscriptions')
    op.drop_table('subscription_plans')
