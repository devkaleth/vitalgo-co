"""add_dni_document_type

Revision ID: d8f3a2e51c6b
Revises: c7a2e8f91b4d
Create Date: 2025-11-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd8f3a2e51c6b'
down_revision: Union[str, Sequence[str], None] = 'c7a2e8f91b4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add DNI (Documento Nacional de Identidad) as international document type."""
    op.execute("""
        INSERT INTO document_types (code, name, description, is_active)
        VALUES ('DNI', 'Documento Nacional de Identidad', 'National identity document used internationally (Spain, Argentina, Peru, etc.)', true)
        ON CONFLICT (code) DO NOTHING;
    """)


def downgrade() -> None:
    """Remove DNI document type."""
    op.execute("DELETE FROM document_types WHERE code = 'DNI';")
