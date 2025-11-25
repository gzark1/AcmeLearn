"""
User schemas for authentication.

Based on fastapi-users standard schemas.
"""
import uuid
from typing import Optional
from pydantic import field_validator
from fastapi_users import schemas


class UserRead(schemas.BaseUser[uuid.UUID]):
    """
    User response schema.

    Inherits from BaseUser:
    - id: UUID
    - email: EmailStr
    - is_active: bool
    - is_superuser: bool
    - is_verified: bool
    """
    pass


class UserCreate(schemas.BaseUserCreate):
    """
    User registration schema (basic fields only).

    For profile data, use RegisterRequest in auth.py.

    Inherits from BaseUserCreate:
    - email: EmailStr
    - password: str
    - is_active: bool = True
    - is_superuser: bool = False
    - is_verified: bool = False
    """
    pass


class UserUpdate(schemas.BaseUserUpdate):
    """
    User update schema.

    Security: is_superuser is always forced to None to prevent self-promotion.
    Only env var-based superuser creation can set this flag.

    Inherits from BaseUserUpdate:
    - email: Optional[EmailStr]
    - password: Optional[str]
    - is_active: Optional[bool]
    - is_verified: Optional[bool]
    """
    # Override is_superuser to always be None (prevents self-promotion)
    is_superuser: Optional[bool] = None

    @field_validator("is_superuser", mode="before")
    @classmethod
    def force_is_superuser_none(cls, v):
        """Always return None for is_superuser to prevent self-promotion."""
        return None
