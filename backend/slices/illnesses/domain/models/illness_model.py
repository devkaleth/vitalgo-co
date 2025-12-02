"""
Patient Illness domain model
"""
from datetime import datetime, date
from sqlalchemy import Column, String, Text, Date, DateTime, BigInteger, ForeignKey, func, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from shared.database.database import Base


class PatientIllness(Base):
    """Patient illnesses model with BIGSERIAL for performance"""

    __tablename__ = "patient_illnesses"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    illness_name = Column(String(200), nullable=False)
    diagnosis_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=False)  # activa, inactiva, en_tratamiento, curada
    is_chronic = Column(Boolean, default=False, nullable=False)
    treatment_description = Column(Text, nullable=True)
    cie10_code = Column(String(10), nullable=True)
    diagnosed_by = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    patient = relationship("Patient", backref="illnesses")

    def __repr__(self):
        return f"<PatientIllness(id={self.id}, illness_name='{self.illness_name}', status='{self.status}')>"