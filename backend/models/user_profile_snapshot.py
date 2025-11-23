"""
User profile snapshot model for historical tracking.

Captures profile state at each update for analytics and audit trails.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, Text, ForeignKey, String, Index
from sqlalchemy.dialects.postgresql import UUID as Uuid, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class UserProfileSnapshot(Base):
    """
    Immutable snapshots of user profile states.

    Strategy:
    - Created BEFORE each profile update (captures old state)
    - Insert-only: never UPDATE or DELETE
    - Enables temporal queries and analytics

    Use cases:
    - Track learning goal evolution
    - Analyze interest changes over time
    - Measure profile refinement effectiveness
    - Audit trail for recommendations
    """

    __tablename__ = "user_profile_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_profile_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False
    )

    # Version at time of snapshot
    version: Mapped[int] = mapped_column(Integer, nullable=False)

    # Snapshot of profile fields
    learning_goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    current_level: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    time_commitment: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Interests snapshot (JSONB array of tag names)
    # Denormalized for historical accuracy - tags might be renamed/deleted
    interests_snapshot: Mapped[dict] = mapped_column(
        JSONB, nullable=False, default=list
    )

    # When this snapshot was created
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    # Composite index for efficient temporal queries
    __table_args__ = (Index("idx_profile_version", "user_profile_id", "version"),)
