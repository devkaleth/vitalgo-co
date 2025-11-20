"""create_discount_codes_table

Revision ID: 033d67e092f3
Revises: 5431636a0a46
Create Date: 2025-11-20 12:37:12.229431

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '033d67e092f3'
down_revision: Union[str, Sequence[str], None] = '5431636a0a46'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create discount_codes table
    op.create_table(
        'discount_codes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('discount_type', sa.String(length=20), nullable=False),  # 'percentage' or 'fixed'
        sa.Column('discount_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('max_uses', sa.Integer(), nullable=True),  # NULL = unlimited
        sa.Column('used_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('valid_from', sa.DateTime(timezone=True), nullable=True),
        sa.Column('valid_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('partner_company', sa.String(length=100), nullable=True),
        sa.Column('applicable_plans', sa.JSON(), nullable=True),  # List of plan IDs or NULL for all
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )

    # Create indexes
    op.create_index(op.f('ix_discount_codes_code'), 'discount_codes', ['code'], unique=False)
    op.create_index(op.f('ix_discount_codes_is_active'), 'discount_codes', ['is_active'], unique=False)

    # Insert default discount codes for partner companies
    op.execute("""
        INSERT INTO discount_codes (code, description, discount_type, discount_value, max_uses, partner_company, is_active)
        VALUES
        ('WINDSTAR2024', 'Descuento exclusivo para empleados de Windstar', 'percentage', 20.00, NULL, 'Windstar', true),
        ('ALMART2024', 'Descuento exclusivo para empleados de Almart', 'percentage', 15.00, NULL, 'Almart', true),
        ('GYMX2024', 'Descuento exclusivo para miembros de Gimnasio X', 'percentage', 25.00, NULL, 'Gimnasio X', true);
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_discount_codes_is_active'), table_name='discount_codes')
    op.drop_index(op.f('ix_discount_codes_code'), table_name='discount_codes')
    op.drop_table('discount_codes')
