"""
Validate document use case for onBlur validation
"""
from typing import Dict, Any
from slices.signup.application.ports.patient_repository import PatientRepository


class DocumentValidationError(Exception):
    """Custom exception for document validation errors with error_key"""
    def __init__(self, error_key: str):
        self.error_key = error_key
        super().__init__(error_key)


class ValidateDocumentUseCase:
    """Use case for validating document number uniqueness (onBlur)"""

    def __init__(self, patient_repository: PatientRepository):
        self.patient_repository = patient_repository

    async def execute(self, document_number: str, document_type: str) -> Dict[str, Any]:
        """Validate document number and format"""

        try:
            # Validate format based on document type
            self._validate_document_format(document_number, document_type)

            # Check uniqueness
            exists = await self.patient_repository.document_exists(document_number)

            if exists:
                return {
                    "valid": False,
                    "error_key": "document_already_registered"
                }

            return {
                "valid": True,
                "message_key": "document_available"
            }

        except DocumentValidationError as e:
            return {
                "valid": False,
                "error_key": e.error_key
            }

    def _validate_document_format(self, document_number: str, document_type: str) -> None:
        """Validate document format based on type"""

        if document_type == "CC":  # Cédula de Ciudadanía
            if not document_number.isdigit() or not (6 <= len(document_number) <= 10):
                raise DocumentValidationError("cc_invalid_length")

        elif document_type == "TI":  # Tarjeta de Identidad
            if not document_number.isdigit() or not (8 <= len(document_number) <= 11):
                raise DocumentValidationError("ti_invalid_length")

        elif document_type == "CE":  # Cédula de Extranjería
            if not document_number.isdigit() or not (6 <= len(document_number) <= 9):
                raise DocumentValidationError("ce_invalid_length")

        elif document_type == "PA":  # Pasaporte
            if not (6 <= len(document_number) <= 12):
                raise DocumentValidationError("passport_invalid_length")

        else:
            # For other document types (AS, MS, RC) - basic validation
            if not (6 <= len(document_number) <= 20):
                raise DocumentValidationError("document_invalid_length")