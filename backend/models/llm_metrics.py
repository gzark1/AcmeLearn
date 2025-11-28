"""
LLM metrics model for observability.

Tracks token usage, timing, and status for each LLM call.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Text, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as Uuid
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class LLMMetrics(Base):
    """
    LLM call metrics for observability.

    Captures:
    - Operation type (profile_analysis, course_recommendation)
    - Token usage (input, output, total)
    - Timing (duration in milliseconds)
    - Status (success/error)

    Enables:
    - Performance monitoring
    - Token usage tracking
    - Error rate analysis
    """

    __tablename__ = "llm_metrics"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    # Context
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )
    recommendation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True
    )

    # Operation info
    operation: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Performance metrics
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    tokens_input: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tokens_output: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tokens_total: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="success")
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
