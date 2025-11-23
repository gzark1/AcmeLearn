"""
Recommendation service with rate limiting.

Handles AI recommendation generation with rate limits.
"""
import uuid
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.recommendation_repository import RecommendationRepository
from repositories.user_profile_repository import UserProfileRepository


class RecommendationService:
    """Service for recommendation-related business logic."""

    RATE_LIMIT_HOURS = 24
    MAX_RECOMMENDATIONS_PER_PERIOD = 10

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = RecommendationRepository(db)
        self.profile_repo = UserProfileRepository(db)

    async def check_rate_limit(self, user_id: uuid.UUID) -> None:
        """
        Check if user has exceeded rate limit.

        Rate limit: 10 recommendations per 24 hours.

        Args:
            user_id: User's UUID

        Raises:
            HTTPException: 429 if rate limit exceeded
        """
        count = await self.repo.count_recent_recommendations(
            user_id, hours=self.RATE_LIMIT_HOURS
        )

        if count >= self.MAX_RECOMMENDATIONS_PER_PERIOD:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {self.MAX_RECOMMENDATIONS_PER_PERIOD} recommendations per {self.RATE_LIMIT_HOURS} hours.",
            )

    async def create_recommendation(
        self,
        user_id: uuid.UUID,
        recommended_course_ids: List[uuid.UUID],
        explanation: str,
        query: Optional[str] = None,
        llm_model: Optional[str] = None,
    ):
        """
        Create a new recommendation after rate limit check.

        Args:
            user_id: User's UUID
            recommended_course_ids: List of course UUIDs
            explanation: AI-generated explanation
            query: User's query (optional)
            llm_model: LLM model used (optional)

        Returns:
            Created Recommendation

        Raises:
            HTTPException: 429 if rate limit exceeded
            ValueError: If profile not found
        """
        # Check rate limit first
        await self.check_rate_limit(user_id)

        # Get current profile version
        profile = await self.profile_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        # Create recommendation
        recommendation = await self.repo.create_recommendation(
            user_id=user_id,
            profile_version=profile.version,
            recommended_course_ids=recommended_course_ids,
            explanation=explanation,
            query=query,
            llm_model=llm_model,
        )

        return recommendation

    async def get_user_recommendations(
        self, user_id: uuid.UUID, limit: int = 10
    ):
        """
        Get recent recommendations for a user.

        Args:
            user_id: User's UUID
            limit: Maximum number of recommendations

        Returns:
            List of Recommendation objects
        """
        return await self.repo.get_user_recommendations(user_id, limit=limit)
