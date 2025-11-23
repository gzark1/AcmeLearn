"""
User schemas for authentication.

Based on fastapi-users standard schemas.
"""
import uuid
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

    Inherits from BaseUserUpdate:
    - email: Optional[EmailStr]
    - password: Optional[str]
    - is_active: Optional[bool]
    - is_superuser: Optional[bool]
    - is_verified: Optional[bool]
    """
    pass
