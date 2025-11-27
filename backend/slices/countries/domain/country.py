"""Country domain model."""
from datetime import datetime
from typing import Optional


class Country:
    """Country domain entity."""

    def __init__(
        self,
        id: int,
        name: str,
        code: str,
        flag_emoji: Optional[str],
        phone_code: str,
        is_active: bool = True,
        name_en: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.name = name
        self.name_en = name_en
        self.code = code
        self.flag_emoji = flag_emoji
        self.phone_code = phone_code
        self.is_active = is_active
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self) -> dict:
        """Convert country to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "name_en": self.name_en,
            "code": self.code,
            "flag_emoji": self.flag_emoji,
            "phone_code": self.phone_code,
            "is_active": self.is_active
        }
