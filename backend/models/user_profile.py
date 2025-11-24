"""
User profile models for learning preferences and interests.

Separate from User model to keep authentication and profile data decoupled.
"""
import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import Integer, Text, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, DifficultyLevel


class UserProfile(Base):
    """
    User profile with learning preferences.

    This is the current state table - one row per user, updated in place.
    Historical changes are tracked in UserProfileSnapshot table.
    """

    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("user.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Profile fields (all optional - can be filled gradually)
    learning_goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    current_level: Mapped[Optional[DifficultyLevel]] = mapped_column(
        String, nullable=True
    )
    time_commitment: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True
    )  # Time range: "1-5", "5-10", "10-20", "20+"

    # Versioning for snapshot tracking
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    interests: Mapped[List["Tag"]] = relationship(
        "Tag", secondary="user_interests", back_populates="interested_users"
    )


class UserInterest(Base):
    """
    Junction table for UserProfile ↔ Tag (many-to-many).

    Links user profiles to tags representing their learning interests.
    """

    __tablename__ = "user_interests"

    user_profile_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("user_profiles.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    )
