"""
LLM metrics repository for data access.

Handles CRUD operations for LLMMetrics model.
"""
import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from models.llm_metrics import LLMMetrics


class LLMMetricsRepository:
    """Repository for LLM metrics data access."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        operation: str,
        duration_ms: int,
        user_id: Optional[uuid.UUID] = None,
        recommendation_id: Optional[uuid.UUID] = None,
        model: Optional[str] = None,
        tokens_input: Optional[int] = None,
        tokens_output: Optional[int] = None,
        tokens_total: Optional[int] = None,
        status: str = "success",
        error: Optional[str] = None,
    ) -> LLMMetrics:
        """
        Create a new LLM metrics record.

        Args:
            operation: Operation name (profile_analysis, course_recommendation)
            duration_ms: Request duration in milliseconds
            user_id: Optional user UUID
            recommendation_id: Optional recommendation UUID
            model: LLM model used
            tokens_input: Input tokens
            tokens_output: Output tokens
            tokens_total: Total tokens
            status: 'success' or 'error'
            error: Error message if failed

        Returns:
            Created LLMMetrics
        """
        metrics = LLMMetrics(
            operation=operation,
            duration_ms=duration_ms,
            user_id=user_id,
            recommendation_id=recommendation_id,
            model=model,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            tokens_total=tokens_total,
            status=status,
            error=error,
        )

        self.db.add(metrics)
        await self.db.flush()

        return metrics
