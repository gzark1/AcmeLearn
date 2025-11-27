"""
Recommendation service with rate limiting.

Handles AI recommendation generation with rate limits.
"""
import logging
import time
import uuid
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from repositories.recommendation_repository import RecommendationRepository
from repositories.user_profile_repository import UserProfileRepository
from repositories.course_repository import CourseRepository
from llm.agents.profile_analyzer import ProfileAnalyzerAgent
from llm.agents.course_recommender import CourseRecommenderAgent
from llm.filters import filter_courses
from llm.exceptions import (
    LLMEmptyProfileError,
    LLMNoCoursesError,
    LLMTimeoutError,
    LLMValidationError,
)
from core.config import settings


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

    async def get_quota(self, user_id: uuid.UUID) -> dict:
        """
        Get user's recommendation quota status.

        Returns:
            Dict with used, limit, remaining
        """
        used = await self.repo.count_recent_recommendations(
            user_id, hours=self.RATE_LIMIT_HOURS
        )
        return {
            "used": used,
            "limit": self.MAX_RECOMMENDATIONS_PER_PERIOD,
            "remaining": max(0, self.MAX_RECOMMENDATIONS_PER_PERIOD - used),
        }

    async def generate_recommendations(
        self,
        user_id: uuid.UUID,
        query: Optional[str] = None,
        num_recommendations: int = 5,
    ) -> dict:
        """
        Generate AI-powered course recommendations.

        Orchestrates the 2-agent pipeline:
        1. Check rate limit
        2. Load profile and history
        3. Pre-filter courses
        4. Agent 1: Analyze profile
        5. Agent 2: Generate recommendations
        6. Store and return results

        Args:
            user_id: User's UUID
            query: Optional learning request
            num_recommendations: Number of courses (3-10)

        Returns:
            Dict with recommendation_id, courses, learning_path, etc.

        Raises:
            HTTPException 429: Rate limit exceeded
            HTTPException 400: Profile issues
            HTTPException 504: LLM timeout
            HTTPException 500: LLM error
        """
        start_time = time.time()
        logger.info(f"[PERF] Starting recommendation for user {user_id}")

        # 1. Check rate limit
        t1 = time.time()
        await self.check_rate_limit(user_id)
        logger.info(f"[PERF] Rate limit check: {time.time() - t1:.2f}s")

        # 2. Load profile and history
        t2 = time.time()
        profile = await self.profile_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise HTTPException(status_code=400, detail="Profile not found")

        snapshots = await self.profile_repo.get_snapshots(profile.id, limit=3)
        logger.info(f"[PERF] Profile loaded: {time.time() - t2:.2f}s")

        # 3. Load and pre-filter courses
        t3 = time.time()
        course_repo = CourseRepository(self.db)
        all_courses = await course_repo.get_all_with_relationships()
        filtered_courses = filter_courses(all_courses, profile, query)
        logger.info(
            f"[PERF] Courses loaded/filtered: {time.time() - t3:.2f}s "
            f"({len(filtered_courses)} of {len(all_courses)} courses)"
        )

        if not filtered_courses:
            raise HTTPException(
                status_code=400,
                detail="No courses match your preferences. Try adjusting your interests.",
            )

        # 4. Agent 1: Profile Analysis
        t4 = time.time()
        try:
            analyzer = ProfileAnalyzerAgent()
            profile_analysis = await analyzer.analyze(
                profile=profile,
                history=snapshots,
                query=query,
            )
            logger.info(f"[PERF] Agent 1 (Profile Analysis): {time.time() - t4:.2f}s")
        except LLMEmptyProfileError:
            raise HTTPException(
                status_code=400,
                detail="Please complete your profile with a learning goal and interests.",
            )
        except LLMTimeoutError:
            raise HTTPException(
                status_code=504,
                detail="Recommendation engine is slow. Please try again.",
            )
        except LLMValidationError as e:
            raise HTTPException(
                status_code=500,
                detail="Error analyzing profile. Please try again.",
            )

        # 5. Agent 2: Course Recommendations
        t5 = time.time()
        try:
            recommender = CourseRecommenderAgent()
            recommendation = await recommender.recommend(
                analysis=profile_analysis,
                courses=filtered_courses,
                query=query,
                num_courses=num_recommendations,
            )
            logger.info(f"[PERF] Agent 2 (Course Recommendations): {time.time() - t5:.2f}s")
        except LLMNoCoursesError:
            raise HTTPException(
                status_code=400,
                detail="No courses match your preferences. Try adjusting your interests.",
            )
        except LLMTimeoutError:
            raise HTTPException(
                status_code=504,
                detail="Recommendation engine is slow. Please try again.",
            )
        except LLMValidationError as e:
            raise HTTPException(
                status_code=500,
                detail="Error generating recommendations. Please try again.",
            )

        # 6. Store recommendation with full structured data
        t6 = time.time()
        course_ids = [uuid.UUID(r.course_id) for r in recommendation.recommendations]

        stored = await self.repo.create_recommendation(
            user_id=user_id,
            profile_version=profile.version,
            recommended_course_ids=course_ids,
            explanation=recommendation.overall_summary,
            query=query,
            llm_model=settings.OPENAI_MODEL,
            profile_analysis_data=profile_analysis.model_dump(),
            recommendation_details=recommendation.model_dump(),
        )
        logger.info(f"[PERF] Database store: {time.time() - t6:.2f}s")

        total_time = time.time() - start_time
        logger.info(f"[PERF] Total recommendation time: {total_time:.2f}s")

        # 7. Build response with course titles
        course_titles = {str(c.id): c.title for c in all_courses}

        return {
            "id": stored.id,
            "query": query,
            "profile_analysis": {
                "skill_level": profile_analysis.skill_level,
                "skill_gaps": profile_analysis.skill_gaps,
                "confidence": profile_analysis.confidence,
            },
            "courses": [
                {
                    "course_id": uuid.UUID(r.course_id),
                    "title": course_titles.get(r.course_id, "Unknown"),
                    "match_score": r.match_score,
                    "explanation": r.explanation,
                    "skill_gaps_addressed": r.skill_gaps_addressed,
                    "fit_reasons": r.fit_reasons,
                    "estimated_weeks": r.estimated_weeks,
                }
                for r in recommendation.recommendations
            ],
            "learning_path": [
                {
                    "order": step.order,
                    "course_id": uuid.UUID(step.course_id),
                    "title": course_titles.get(step.course_id, "Unknown"),
                    "rationale": step.rationale,
                }
                for step in recommendation.learning_path
            ],
            "overall_summary": recommendation.overall_summary,
            "created_at": stored.created_at,
        }
