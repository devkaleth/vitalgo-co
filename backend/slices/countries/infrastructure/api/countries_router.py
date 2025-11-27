"""Countries API router."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from shared.database import get_db
from slices.countries.infrastructure.database.country_repository import CountryRepository
from slices.countries.application.country_service import CountryService


router = APIRouter(prefix="/api/countries", tags=["countries"])


# Response models
class CountryResponse(BaseModel):
    """Country response model."""
    id: int
    name: str
    name_en: str | None = None
    code: str
    flag_emoji: str | None
    phone_code: str
    is_active: bool

    class Config:
        from_attributes = True


@router.get("", response_model=List[CountryResponse])
async def get_countries(db: Session = Depends(get_db)):
    """
    Get all active countries.

    Returns countries ordered by ID:
    - Colombia first (ID: 1)
    - Then neighboring countries
    - Then by geographic proximity

    This endpoint is public and doesn't require authentication.
    """
    try:
        repository = CountryRepository(db)
        service = CountryService(repository)
        countries = service.get_all_countries()
        return countries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching countries: {str(e)}")


@router.get("/{code}", response_model=CountryResponse)
async def get_country_by_code(code: str, db: Session = Depends(get_db)):
    """
    Get a specific country by its ISO 3166-1 alpha-2 code.

    Args:
        code: Two-letter country code (e.g., "CO", "US", "MX")

    Returns:
        Country data including name, flag emoji, and phone code
    """
    try:
        repository = CountryRepository(db)
        service = CountryService(repository)
        country = service.get_country_by_code(code.upper())

        if not country:
            raise HTTPException(status_code=404, detail=f"Country with code '{code}' not found")

        return country
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching country: {str(e)}")
