"""
Recommendation repository for data access.

Handles CRUD operations for Recommendation model.
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.recommendation import Recommendation


class RecommendationRepository:
    """Repository for Recommendation data access."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def count_recent_recommendations(
        self, user_id: uuid.UUID, hours: int = 24
    ) -> int:
        """
        Count recommendations for a user in the last N hours.

        Used for rate limiting.

        Args:
            user_id: User's UUID
            hours: Time window in hours (default: 24)

        Returns:
            Count of recommendations
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)

        result = await self.db.execute(
            select(func.count(Recommendation.id)).where(
                Recommendation.user_id == user_id,
                Recommendation.created_at >= cutoff_time,
            )
        )

        return result.scalar() or 0

    async def create_recommendation(
        self,
        user_id: uuid.UUID,
        profile_version: int,
        recommended_course_ids: List[uuid.UUID],
        explanation: str,
        query: Optional[str] = None,
        llm_model: Optional[str] = None,
    ) -> Recommendation:
        """
        Create a new recommendation record.

        Args:
            user_id: User's UUID
            profile_version: Profile version at recommendation time
            recommended_course_ids: List of course UUIDs
            explanation: AI-generated explanation
            query: User's query (optional)
            llm_model: LLM model used (optional)

        Returns:
            Created Recommendation
        """
        # Convert UUIDs to strings for JSONB storage
        course_ids_json = [str(course_id) for course_id in recommended_course_ids]

        recommendation = Recommendation(
            user_id=user_id,
            profile_version=profile_version,
            query=query,
            recommended_course_ids=course_ids_json,
            explanation=explanation,
            llm_model=llm_model,
        )

        self.db.add(recommendation)
        await self.db.commit()
        await self.db.refresh(recommendation)

        return recommendation

    async def get_user_recommendations(
        self, user_id: uuid.UUID, limit: int = 10
    ) -> List[Recommendation]:
        """
        Get recent recommendations for a user.

        Args:
            user_id: User's UUID
            limit: Maximum number of recommendations to return

        Returns:
            List of Recommendation objects (newest first)
        """
        result = await self.db.execute(
            select(Recommendation)
            .where(Recommendation.user_id == user_id)
            .order_by(Recommendation.created_at.desc())
            .limit(limit)
        )

        return result.scalars().all()
