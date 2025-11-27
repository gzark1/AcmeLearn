"""
Activity log model for tracking user events.

Records registration, profile updates, recommendations, and deactivations.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import func

from models.base import Base


class ActivityEventType(str, enum.Enum):
    """Types of activity events."""

    REGISTRATION = "registration"
    PROFILE_UPDATE = "profile_update"
    RECOMMENDATION = "recommendation"  # Placeholder for future LLM feature
    DEACTIVATION = "deactivation"


class ActivityLog(Base):
    """
    Activity log entry for dashboard feed.

    Stores user actions for the admin activity feed.
    Non-blocking logging - failures shouldn't break user flows.
    """

    __tablename__ = "activity_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_type: Mapped[ActivityEventType] = mapped_column(
        Enum(ActivityEventType), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    user_email: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )
