"""
DocumentType SQLAlchemy model
"""
from sqlalchemy import Column, Integer, String, Text, Boolean
from shared.database import Base


class DocumentType(Base):
    """Document type model for Colombian identification documents"""

    __tablename__ = "document_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(5), unique=True, nullable=False)
    name = Column(String(50), nullable=False)
    name_en = Column(String(50), nullable=True)  # English translation
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<DocumentType(code='{self.code}', name='{self.name}')>"