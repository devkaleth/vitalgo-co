"""Country repository implementation."""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import asc
from slices.countries.domain.country import Country
from slices.countries.infrastructure.database.country_model import CountryModel


class CountryRepository:
    """Repository for country data access."""

    def __init__(self, db: Session):
        self.db = db

    def get_all_active(self) -> List[Country]:
        """Get all active countries ordered by ID (Colombia first)."""
        country_models = (
            self.db.query(CountryModel)
            .filter(CountryModel.is_active == True)
            .order_by(asc(CountryModel.id))
            .all()
        )

        return [self._model_to_domain(model) for model in country_models]

    def get_by_code(self, code: str) -> Optional[Country]:
        """Get country by ISO code."""
        country_model = (
            self.db.query(CountryModel)
            .filter(CountryModel.code == code)
            .filter(CountryModel.is_active == True)
            .first()
        )

        if not country_model:
            return None

        return self._model_to_domain(country_model)

    def _model_to_domain(self, model: CountryModel) -> Country:
        """Convert database model to domain entity."""
        return Country(
            id=model.id,
            name=model.name,
            code=model.code,
            flag_emoji=model.flag_emoji,
            phone_code=model.phone_code,
            is_active=model.is_active,
            name_en=model.name_en,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
