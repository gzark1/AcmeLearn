"""
Recommendation model for AI-generated course suggestions.

Tracks recommendation history with context for analytics and improvements.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Text, ForeignKey, Integer, Index
from sqlalchemy.dialects.postgresql import UUID as Uuid, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Recommendation(Base):
    """
    AI-generated course recommendations with full context.

    Captures:
    - What was recommended (course IDs, explanation)
    - Context (user profile version, query)
    - Metadata (LLM model used, timestamp)

    Enables:
    - Recommendation history viewing
    - Rate limiting (10 per 24h)
    - Quality analytics (which profiles get better recs?)
    - A/B testing (GPT-5-nano vs Claude performance)
    """

    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )

    # Context at recommendation time
    profile_version: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # Links to profile state
    query: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # User's specific request

    # LLM output
    recommended_course_ids: Mapped[list] = mapped_column(
        JSONB, nullable=False
    )  # Array of UUIDs
    explanation: Mapped[str] = mapped_column(Text, nullable=False)  # AI reasoning
    llm_model: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # "gpt-5-nano", "claude-3-sonnet"

    # Structured data storage (JSONB) for analytics and debugging
    profile_analysis_data: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="ProfileAnalysis JSON from Agent 1",
    )
    recommendation_details: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Full recommendation details: courses with scores, learning path",
    )

    # Timestamp (used for rate limiting)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    # Index for rate limiting queries (user + recent timestamps)
    __table_args__ = (Index("idx_user_created", "user_id", "created_at"),)
