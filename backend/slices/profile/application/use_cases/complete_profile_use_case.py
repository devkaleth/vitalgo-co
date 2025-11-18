"""
Profile completion use case for RF002
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

from slices.signup.domain.models.patient_model import Patient
from slices.signup.domain.models.user_model import User
from slices.signup.domain.models.document_type_model import DocumentType
# TODO: Add back profile domain models when they are available
# from slices.profile.domain.models import Medication, Allergy, Disease, Surgery, GynecologicalHistory
# from slices.profile.domain.models.allergy_model import AllergySeverity
# from slices.profile.domain.models.surgery_model import AnesthesiaType
# from slices.profile.domain.models.gynecological_model import ContraceptiveMethod
from slices.profile.application.dto.profile_completion_dto import (
    ProfileCompletenessResponse,
    ExtendedPatientProfileDTO,
    PatientProfileUpdateDTO,
    MedicationDTO,
    AllergyDTO,
    DiseaseDTO,
    SurgeryDTO,
    GynecologicalHistoryDTO
)
from slices.profile.application.dto.basic_patient_dto import (
    BasicPatientInfoDTO,
    BasicPatientUpdateDTO
)


class CompleteProfileUseCase:
    """Use case for RF002 profile completion functionality"""

    def __init__(self, db: Session):
        self.db = db

    def get_profile_completeness(self, user_id: str) -> ProfileCompletenessResponse:
        """
        Get profile completeness status for a user

        Args:
            user_id: User UUID string

        Returns:
            ProfileCompletenessResponse with completeness information
        """
        patient = self.db.query(Patient).filter(Patient.user_id == user_id).first()
        if not patient:
            return ProfileCompletenessResponse(
                is_complete=False,
                mandatory_fields_completed=False,
                missing_mandatory_fields=["patient_profile_not_found"],
                completion_percentage=0,
                next_required_step=1,
                redirect_url="/profile/complete"
            )

        # TODO: Implement completeness check once extended fields are available
        completeness_info = {
            "is_complete": False,
            "mandatory_fields_completed": True,  # Basic signup fields are complete
            "missing_mandatory_fields": [],
            "completion_percentage": 25,  # Basic info only
            "next_required_step": 2,
            "redirect_url": "/profile/complete"
        }
        return ProfileCompletenessResponse(**completeness_info)

    def get_extended_profile(self, user_id: str) -> Optional[ExtendedPatientProfileDTO]:
        """
        Get extended patient profile data

        Args:
            user_id: User UUID string

        Returns:
            ExtendedPatientProfileDTO or None if patient not found
        """
        patient = self.db.query(Patient).filter(Patient.user_id == user_id).first()
        if not patient:
            return None

        return ExtendedPatientProfileDTO(
            # Demographic information - now reading from database
            biological_sex=patient.biological_sex,
            gender=patient.gender,
            gender_other=patient.gender_other,

            # Birth location - now reading from database
            birth_country=patient.birth_country,
            birth_country_other=patient.birth_country_other,
            birth_department=patient.birth_department,
            birth_city=patient.birth_city,

            # Residence information - now reading from database
            residence_address=patient.residence_address,
            residence_country=patient.residence_country,
            residence_country_other=patient.residence_country_other,
            residence_department=patient.residence_department,
            residence_city=patient.residence_city,

            # Medical information fields - now reading from database
            eps=patient.eps,
            eps_other=patient.eps_other,
            occupation=patient.occupation,
            additional_insurance=patient.additional_insurance,
            complementary_plan=patient.complementary_plan,
            complementary_plan_other=patient.complementary_plan_other,
            blood_type=patient.blood_type,
            emergency_contact_name=patient.emergency_contact_name,
            emergency_contact_relationship=patient.emergency_contact_relationship,

            # Primary emergency phone fields
            emergency_contact_phone=patient.emergency_contact_phone,
            emergency_contact_country_code=patient.emergency_contact_country_code,
            emergency_contact_dial_code=patient.emergency_contact_dial_code,
            emergency_contact_phone_number=patient.emergency_contact_phone_number,

            # Alternative emergency phone fields
            emergency_contact_phone_alt=patient.emergency_contact_phone_alt,
            emergency_contact_country_code_alt=patient.emergency_contact_country_code_alt,
            emergency_contact_dial_code_alt=patient.emergency_contact_dial_code_alt,
            emergency_contact_phone_number_alt=patient.emergency_contact_phone_number_alt,

            # Gynecological information fields - now reading from database
            is_pregnant=patient.is_pregnant,
            pregnancy_weeks=patient.pregnancy_weeks,
            last_menstruation_date=patient.last_menstruation_date,
            pregnancies_count=patient.pregnancies_count,
            births_count=patient.births_count,
            cesareans_count=patient.cesareans_count,
            abortions_count=patient.abortions_count,
            contraceptive_method=patient.contraceptive_method,

            # Organ donor preference fields (Voluntad de la Persona)
            organ_donor_preference=patient.organ_donor_preference,
            authorized_decision_maker=patient.authorized_decision_maker,

            # Physical measurements fields (Medidas Físicas)
            height=patient.height,
            weight=patient.weight,
        )

    def update_extended_profile(self, user_id: str, profile_data: PatientProfileUpdateDTO) -> Dict[str, Any]:
        """
        Update extended patient profile with RF002 data

        Args:
            user_id: User UUID string
            profile_data: PatientProfileUpdateDTO with updated data

        Returns:
            Dictionary with update result
        """
        logger.info(f"🔵 UPDATE_EXTENDED_PROFILE called for user_id: {user_id}")
        logger.info(f"📦 Received profile_data: {profile_data.model_dump()}")

        patient = self.db.query(Patient).filter(Patient.user_id == user_id).first()
        if not patient:
            return {"success": False, "message": "Patient not found"}

        try:
            # Update demographic information fields
            if profile_data.biological_sex is not None:
                patient.biological_sex = profile_data.biological_sex
            if profile_data.gender is not None:
                patient.gender = profile_data.gender
            if profile_data.gender_other is not None:
                patient.gender_other = profile_data.gender_other

            # Update birth location fields
            if profile_data.birth_country is not None:
                patient.birth_country = profile_data.birth_country
            if profile_data.birth_country_other is not None:
                patient.birth_country_other = profile_data.birth_country_other
            if profile_data.birth_department is not None:
                patient.birth_department = profile_data.birth_department
            if profile_data.birth_city is not None:
                patient.birth_city = profile_data.birth_city

            # Update residence information fields
            if profile_data.residence_address is not None:
                patient.residence_address = profile_data.residence_address
            if profile_data.residence_country is not None:
                patient.residence_country = profile_data.residence_country
            if profile_data.residence_country_other is not None:
                patient.residence_country_other = profile_data.residence_country_other
            if profile_data.residence_department is not None:
                patient.residence_department = profile_data.residence_department
            if profile_data.residence_city is not None:
                patient.residence_city = profile_data.residence_city

            # Update medical information fields
            if profile_data.eps is not None:
                patient.eps = profile_data.eps
            if profile_data.eps_other is not None:
                patient.eps_other = profile_data.eps_other
            if profile_data.occupation is not None:
                patient.occupation = profile_data.occupation
            if profile_data.additional_insurance is not None:
                patient.additional_insurance = profile_data.additional_insurance
            if profile_data.complementary_plan is not None:
                patient.complementary_plan = profile_data.complementary_plan
            if profile_data.complementary_plan_other is not None:
                patient.complementary_plan_other = profile_data.complementary_plan_other
            if profile_data.blood_type is not None:
                patient.blood_type = profile_data.blood_type
            if profile_data.emergency_contact_name is not None:
                patient.emergency_contact_name = profile_data.emergency_contact_name
            if profile_data.emergency_contact_relationship is not None:
                patient.emergency_contact_relationship = profile_data.emergency_contact_relationship

            # Update primary emergency phone fields
            if profile_data.emergency_contact_phone is not None:
                patient.emergency_contact_phone = profile_data.emergency_contact_phone
            if profile_data.emergency_contact_country_code is not None:
                patient.emergency_contact_country_code = profile_data.emergency_contact_country_code
            if profile_data.emergency_contact_dial_code is not None:
                patient.emergency_contact_dial_code = profile_data.emergency_contact_dial_code
            if profile_data.emergency_contact_phone_number is not None:
                patient.emergency_contact_phone_number = profile_data.emergency_contact_phone_number

            # Update alternative emergency phone fields
            if profile_data.emergency_contact_phone_alt is not None:
                patient.emergency_contact_phone_alt = profile_data.emergency_contact_phone_alt
            if profile_data.emergency_contact_country_code_alt is not None:
                patient.emergency_contact_country_code_alt = profile_data.emergency_contact_country_code_alt
            if profile_data.emergency_contact_dial_code_alt is not None:
                patient.emergency_contact_dial_code_alt = profile_data.emergency_contact_dial_code_alt
            if profile_data.emergency_contact_phone_number_alt is not None:
                patient.emergency_contact_phone_number_alt = profile_data.emergency_contact_phone_number_alt

            # Update gynecological information fields (only for female patients)
            if profile_data.is_pregnant is not None:
                patient.is_pregnant = profile_data.is_pregnant
            if profile_data.pregnancy_weeks is not None:
                patient.pregnancy_weeks = profile_data.pregnancy_weeks
            if profile_data.last_menstruation_date is not None:
                patient.last_menstruation_date = profile_data.last_menstruation_date
            if profile_data.pregnancies_count is not None:
                patient.pregnancies_count = profile_data.pregnancies_count
            if profile_data.births_count is not None:
                patient.births_count = profile_data.births_count
            if profile_data.cesareans_count is not None:
                patient.cesareans_count = profile_data.cesareans_count
            if profile_data.abortions_count is not None:
                patient.abortions_count = profile_data.abortions_count
            if profile_data.contraceptive_method is not None:
                patient.contraceptive_method = profile_data.contraceptive_method

            # Update organ donor preference fields (Voluntad de la Persona)
            logger.info(f"🔍 ORGAN DONOR DATA - organ_donor_preference: {profile_data.organ_donor_preference}")
            logger.info(f"🔍 ORGAN DONOR DATA - authorized_decision_maker: {profile_data.authorized_decision_maker}")
            if profile_data.organ_donor_preference is not None:
                logger.info(f"✅ Setting organ_donor_preference to: {profile_data.organ_donor_preference}")
                patient.organ_donor_preference = profile_data.organ_donor_preference
            if profile_data.authorized_decision_maker is not None:
                logger.info(f"✅ Setting authorized_decision_maker to: {profile_data.authorized_decision_maker}")
                patient.authorized_decision_maker = profile_data.authorized_decision_maker

            # Update physical measurements fields (Medidas Físicas)
            logger.info(f"🔍 PHYSICAL MEASUREMENTS - height: {profile_data.height}")
            logger.info(f"🔍 PHYSICAL MEASUREMENTS - weight: {profile_data.weight}")
            if profile_data.height is not None:
                logger.info(f"✅ Setting height to: {profile_data.height}")
                patient.height = profile_data.height
            if profile_data.weight is not None:
                logger.info(f"✅ Setting weight to: {profile_data.weight}")
                patient.weight = profile_data.weight

            self.db.commit()

            # TODO: Check updated completeness once completeness calculation is implemented
            completeness_info = {
                "completion_percentage": 60.0,  # Higher since we're actually saving data now
                "is_complete": False,
                "mandatory_fields_completed": True  # Core demographic fields are saved
            }

            return {
                "success": True,
                "message": "Profile updated successfully",
                "completeness": completeness_info
            }

        except ValueError as e:
            self.db.rollback()
            return {"success": False, "message": f"Invalid enum value: {str(e)}"}
        except Exception as e:
            self.db.rollback()
            return {"success": False, "message": f"Error updating profile: {str(e)}"}

    def get_medications(self, user_id: str) -> List[MedicationDTO]:
        """Get patient medications - TODO: Implement when Medication model is available"""
        return []

    def add_medication(self, user_id: str, medication_data: MedicationDTO) -> Dict[str, Any]:
        """Add new medication - TODO: Implement when Medication model is available"""
        return {"success": False, "message": "Medication functionality not yet implemented"}

    def update_medication(self, user_id: str, medication_id: str, medication_data: MedicationDTO) -> Dict[str, Any]:
        """Update existing medication - TODO: Implement when Medication model is available"""
        return {"success": False, "message": "Medication functionality not yet implemented"}

    def delete_medication(self, user_id: str, medication_id: str) -> Dict[str, Any]:
        """Delete medication - TODO: Implement when Medication model is available"""
        return {"success": False, "message": "Medication functionality not yet implemented"}

    # Allergy management methods (following same pattern as medications)
    def get_allergies(self, user_id: str) -> List[AllergyDTO]:
        """Get all allergies for a patient - TODO: Implement when Allergy model is available"""
        return []

    def add_allergy(self, user_id: str, allergy_data: AllergyDTO) -> Dict[str, Any]:
        """Add new allergy - TODO: Implement when Allergy model is available"""
        return {"success": False, "message": "Allergy functionality not yet implemented"}

    def update_allergy(self, user_id: str, allergy_id: str, allergy_data: AllergyDTO) -> Dict[str, Any]:
        """Update existing allergy - TODO: Implement when Allergy model is available"""
        return {"success": False, "message": "Allergy functionality not yet implemented"}

    def delete_allergy(self, user_id: str, allergy_id: str) -> Dict[str, Any]:
        """Delete allergy - TODO: Implement when Allergy model is available"""
        return {"success": False, "message": "Allergy functionality not yet implemented"}

    def get_basic_patient_info(self, user_id: str) -> Optional[BasicPatientInfoDTO]:
        """
        Get basic patient information (from signup)

        Args:
            user_id: User UUID string

        Returns:
            BasicPatientInfoDTO or None if patient not found
        """
        patient = (
            self.db.query(Patient)
            .join(User, Patient.user_id == User.id)
            .join(DocumentType, Patient.document_type_id == DocumentType.id)
            .filter(Patient.user_id == user_id)
            .first()
        )

        if not patient:
            return None

        return BasicPatientInfoDTO(
            first_name=patient.first_name,
            last_name=patient.last_name,
            document_type=patient.document_type.code,
            document_number=patient.document_number,
            phone_international=patient.phone_international,
            birth_date=patient.birth_date,
            origin_country=patient.origin_country or 'CO',  # Safe fallback to default Colombia
            birth_country=patient.birth_country,  # Birth country field
            residence_country=patient.residence_country,  # Residence country field
            country_code=patient.country_code or patient.origin_country or 'CO',  # Phone country code fallback to origin country
            dial_code=patient.dial_code,  # Add database field
            phone_number=patient.phone_number,  # Add database field
            email=patient.user.email
        )

    def update_basic_patient_info(self, user_id: str, update_data: BasicPatientUpdateDTO) -> Dict[str, Any]:
        """
        Update basic patient information

        Args:
            user_id: User UUID string
            update_data: BasicPatientUpdateDTO with updated data

        Returns:
            Dictionary with update result
        """
        patient = self.db.query(Patient).join(User, Patient.user_id == User.id).filter(Patient.user_id == user_id).first()
        if not patient:
            return {"success": False, "message": "Patient not found"}

        try:
            # Update patient fields
            if update_data.first_name is not None:
                patient.first_name = update_data.first_name
            if update_data.last_name is not None:
                patient.last_name = update_data.last_name
            if update_data.document_type is not None:
                doc_type = self.db.query(DocumentType).filter(DocumentType.code == update_data.document_type).first()
                if not doc_type:
                    return {"success": False, "message": "Invalid document type"}
                patient.document_type_id = doc_type.id
            if update_data.document_number is not None:
                # Check if document number already exists for another patient
                existing = self.db.query(Patient).filter(
                    Patient.document_number == update_data.document_number,
                    Patient.id != patient.id
                ).first()
                if existing:
                    return {"success": False, "message": "Document number already exists"}
                patient.document_number = update_data.document_number
            if update_data.phone_international is not None:
                patient.phone_international = update_data.phone_international
            if update_data.birth_date is not None:
                patient.birth_date = update_data.birth_date
            if update_data.origin_country is not None:
                # Validate country code
                from shared.utils.countries import is_valid_country_code
                if not is_valid_country_code(update_data.origin_country):
                    return {"success": False, "message": f"Código de país inválido: {update_data.origin_country}"}
                patient.origin_country = update_data.origin_country
            if update_data.country_code is not None:
                # Validate country code
                from shared.utils.countries import is_valid_country_code
                if not is_valid_country_code(update_data.country_code):
                    return {"success": False, "message": f"Código de país inválido: {update_data.country_code}"}
                patient.country_code = update_data.country_code
            if update_data.dial_code is not None:
                patient.dial_code = update_data.dial_code
            if update_data.phone_number is not None:
                patient.phone_number = update_data.phone_number
            if update_data.birth_country is not None:
                # Validate country code
                from shared.utils.countries import is_valid_country_code
                if not is_valid_country_code(update_data.birth_country):
                    return {"success": False, "message": f"Código de país de nacimiento inválido: {update_data.birth_country}"}
                patient.birth_country = update_data.birth_country
            if update_data.residence_country is not None:
                # Validate country code
                from shared.utils.countries import is_valid_country_code
                if not is_valid_country_code(update_data.residence_country):
                    return {"success": False, "message": f"Código de país de residencia inválido: {update_data.residence_country}"}
                patient.residence_country = update_data.residence_country

            # Update user email if provided
            if update_data.email is not None:
                # Check if email already exists for another user
                existing_user = self.db.query(User).filter(
                    User.email == update_data.email,
                    User.id != patient.user_id
                ).first()
                if existing_user:
                    return {"success": False, "message": "Email already exists"}
                patient.user.email = update_data.email

            self.db.commit()

            return {
                "success": True,
                "message": "Basic patient information updated successfully"
            }

        except Exception as e:
            self.db.rollback()
            return {"success": False, "message": f"Error updating basic patient info: {str(e)}"}

    # Similar methods for diseases, surgeries, and gynecological history
    # (Following the same pattern as medications and allergies)