"""Country database model."""
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from shared.database import Base


class CountryModel(Base):
    """SQLAlchemy model for countries table."""

    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=True)  # English translation
    code = Column(String(2), unique=True, nullable=False, index=True)
    flag_emoji = Column(String(10), nullable=True)
    phone_code = Column(String(10), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True, server_default='true')
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
