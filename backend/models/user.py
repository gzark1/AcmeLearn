"""
User model for authentication.

Extends fastapi-users base model with built-in fields for authentication.
"""
from datetime import datetime

from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    """
    User model for authentication.

    Inherits from SQLAlchemyBaseUserTableUUID, which provides:
    - id: UUID (primary key)
    - email: String (unique, indexed)
    - hashed_password: String
    - is_active: Boolean (for soft delete)
    - is_superuser: Boolean (admin privileges)
    - is_verified: Boolean (email verification)

    We use a separate UserProfile table for user preferences/settings,
    keeping authentication concerns separate from profile data.
    """

    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        nullable=False
    )
