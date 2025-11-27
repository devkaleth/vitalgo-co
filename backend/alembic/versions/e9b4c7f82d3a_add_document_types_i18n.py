"""add_document_types_i18n

Revision ID: e9b4c7f82d3a
Revises: d8f3a2e51c6b
Create Date: 2025-11-27 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e9b4c7f82d3a'
down_revision: Union[str, Sequence[str], None] = 'd8f3a2e51c6b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add name_en column to document_types table for English translations."""
    op.add_column('document_types', sa.Column('name_en', sa.String(length=50), nullable=True))

    # Update existing document types with English translations
    translations = [
        ('CC', 'Citizenship ID'),
        ('CE', 'Foreigner ID'),
        ('PA', 'Passport'),
        ('TI', 'Identity Card'),
        ('RC', 'Birth Certificate'),
        ('AS', 'Adult without ID'),
        ('MS', 'Minor without ID'),
        ('NU', 'Personal ID Number (NUIP)'),
        ('CD', 'Diplomatic ID'),
        ('SC', 'Safe Conduct'),
        ('DNI', 'National ID (DNI)'),
    ]

    for code, name_en in translations:
        op.execute(f"UPDATE document_types SET name_en = '{name_en}' WHERE code = '{code}';")


def downgrade() -> None:
    """Remove name_en column from document_types table."""
    op.drop_column('document_types', 'name_en')
