"""
Validation API endpoints for onBlur validation
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from shared.database import get_db
from slices.signup.application.use_cases.validate_document import ValidateDocumentUseCase
from slices.signup.application.use_cases.validate_email import ValidateEmailUseCase
from slices.signup.infrastructure.persistence.user_repository import SQLAlchemyUserRepository
from slices.signup.infrastructure.persistence.patient_repository import SQLAlchemyPatientRepository
from slices.signup.domain.models.document_type_model import DocumentType

router = APIRouter(prefix="/api/signup", tags=["Validation"])


def get_validate_document_use_case(db: Session = Depends(get_db)) -> ValidateDocumentUseCase:
    """Dependency injection for ValidateDocumentUseCase"""
    patient_repository = SQLAlchemyPatientRepository(db)
    return ValidateDocumentUseCase(patient_repository)


def get_validate_email_use_case(db: Session = Depends(get_db)) -> ValidateEmailUseCase:
    """Dependency injection for ValidateEmailUseCase"""
    user_repository = SQLAlchemyUserRepository(db)
    return ValidateEmailUseCase(user_repository)


@router.post("/validate-document")
async def validate_document(
    document_number: str = Query(..., description="Document number to validate"),
    document_type: str = Query(..., description="Document type code (CC, CE, PA, etc.)"),
    use_case: ValidateDocumentUseCase = Depends(get_validate_document_use_case)
) -> Dict[str, Any]:
    """
    Validate document number format and uniqueness (onBlur validation)

    Performs validation according to RF001:
    - Format validation based on document type
    - Uniqueness validation in database
    """
    result = await use_case.execute(document_number, document_type)
    return result


@router.post("/validate-email")
async def validate_email(
    email: str = Query(..., description="Email to validate"),
    use_case: ValidateEmailUseCase = Depends(get_validate_email_use_case)
) -> Dict[str, Any]:
    """
    Validate email format and uniqueness (onBlur validation)

    Performs validation according to RF001:
    - RFC 5322 format validation
    - Uniqueness validation in database
    """
    result = await use_case.execute(email)
    return result


@router.get("/document-types")
async def get_document_types(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    Get all active document types

    Returns list of Colombian document types for dropdown population
    """
    document_types = db.query(DocumentType).filter(DocumentType.is_active == True).all()

    return [
        {
            "id": dt.id,
            "code": dt.code,
            "name": dt.name,
            "name_en": dt.name_en,
            "description": dt.description
        }
        for dt in document_types
    ]