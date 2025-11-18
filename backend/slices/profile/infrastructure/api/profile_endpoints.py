"""
Profile completion API endpoints for RF002
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List

from shared.database import get_db
from slices.auth.infrastructure.api.auth_endpoints import get_current_user
from slices.signup.domain.models.user_model import User
from slices.profile.application.use_cases.complete_profile_use_case import CompleteProfileUseCase
from slices.profile.application.use_cases.update_language_use_case import UpdateLanguagePreferenceUseCase
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
from slices.profile.application.dto.language_dto import (
    LanguagePreferenceDTO,
    LanguagePreferenceResponseDTO
)

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/completeness", response_model=ProfileCompletenessResponse)
async def get_profile_completeness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get profile completeness status for RF002 validation
    """
    use_case = CompleteProfileUseCase(db)
    return use_case.get_profile_completeness(current_user.id)


@router.get("/extended", response_model=ExtendedPatientProfileDTO)
async def get_extended_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get extended patient profile data (RF002 fields)
    """
    use_case = CompleteProfileUseCase(db)
    profile = use_case.get_extended_profile(current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )

    return profile


@router.put("/complete")
async def update_extended_profile(
    profile_data: PatientProfileUpdateDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update extended patient profile with RF002 data
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"🔵 ENDPOINT: Received profile_data with fields: organ_donor_preference={profile_data.organ_donor_preference}, height={profile_data.height}, weight={profile_data.weight}")
    logger.info(f"📦 ENDPOINT: Full profile_data: {profile_data.model_dump()}")

    use_case = CompleteProfileUseCase(db)
    result = use_case.update_extended_profile(current_user.id, profile_data)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result


@router.get("/basic", response_model=BasicPatientInfoDTO)
async def get_basic_patient_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get basic patient information (from signup)
    """
    use_case = CompleteProfileUseCase(db)
    basic_info = use_case.get_basic_patient_info(current_user.id)

    if not basic_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )

    return basic_info


@router.put("/basic")
async def update_basic_patient_info(
    update_data: BasicPatientUpdateDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update basic patient information
    """
    use_case = CompleteProfileUseCase(db)
    result = use_case.update_basic_patient_info(current_user.id, update_data)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result


@router.get("/medications", response_model=List[MedicationDTO])
async def get_medications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get patient medications
    """
    use_case = CompleteProfileUseCase(db)
    return use_case.get_medications(current_user.id)


@router.post("/medications")
async def add_medication(
    medication_data: MedicationDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add new medication
    """
    use_case = CompleteProfileUseCase(db)
    result = use_case.add_medication(current_user.id, medication_data)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result


@router.put("/medications/{medication_id}")
async def update_medication(
    medication_id: str,
    medication_data: MedicationDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update existing medication
    """
    use_case = CompleteProfileUseCase(db)
    result = use_case.update_medication(current_user.id, medication_id, medication_data)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result


@router.delete("/medications/{medication_id}")
async def delete_medication(
    medication_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete medication
    """
    use_case = CompleteProfileUseCase(db)
    result = use_case.delete_medication(current_user.id, medication_id)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result


@router.get("/allergies", response_model=List[AllergyDTO])
async def get_allergies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get patient allergies
    """
    use_case = CompleteProfileUseCase(db)
    return use_case.get_allergies(current_user.id)


@router.post("/allergies")
async def add_allergy(
    allergy_data: AllergyDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add new allergy
    """
    use_case = CompleteProfileUseCase(db)
    result = use_case.add_allergy(current_user.id, allergy_data)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result


@router.put("/allergies/{allergy_id}")
async def update_allergy(
    allergy_id: str,
    allergy_data: AllergyDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update existing allergy
    """
    use_case = CompleteProfileUseCase(db)
    result = use_case.update_allergy(current_user.id, allergy_id, allergy_data)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result


@router.delete("/allergies/{allergy_id}")
async def delete_allergy(
    allergy_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete allergy
    """
    use_case = CompleteProfileUseCase(db)
    result = use_case.delete_allergy(current_user.id, allergy_id)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return result


@router.get("/language")
async def get_language_preference(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's current language preference
    """
    use_case = UpdateLanguagePreferenceUseCase(db)
    result = use_case.get_current_language(str(current_user.id))

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"]
        )

    return {
        "preferred_language": result["preferred_language"]
    }


@router.put("/language", response_model=LanguagePreferenceResponseDTO)
async def update_language_preference(
    language_data: LanguagePreferenceDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user's preferred language (es/en)

    This endpoint allows users to change their interface language preference.
    The preference is stored in the database and persists across sessions.
    """
    use_case = UpdateLanguagePreferenceUseCase(db)
    result = use_case.execute(str(current_user.id), language_data)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    return LanguagePreferenceResponseDTO(
        preferred_language=result["preferred_language"],
        message=result["message"]
    )