"""
User management routes.

Provides:
- fastapi-users standard user routes (GET /me, PATCH /me, DELETE /me)
- Custom password change endpoint
- Recommendation history (stub)
- Recommendation quota (stub)
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi_users import exceptions
from fastapi_users.password import PasswordHelper
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_async_session
from core.users import fastapi_users, current_active_user
from schemas.user import UserRead, UserUpdate
from schemas.auth import PasswordChangeRequest
from schemas.recommendation import (
    RecommendationListResponse,
    RecommendationQuota,
    RecommendationRequest,
    RecommendationRead,
    ClarificationResponse,
)
from models.user import User
from services.recommendation_service import RecommendationService


router = APIRouter()


# Include fastapi-users standard user routes
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="",
    tags=["users"],
)


@router.post("/me/change-password", status_code=204)
async def change_password(
    password_data: PasswordChangeRequest,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Change password with old password verification.

    Args:
        password_data: Old and new passwords
        user: Current authenticated user
        db: Database session

    Returns:
        204 No Content on success

    Raises:
        HTTPException: 400 if old password is incorrect
    """
    password_helper = PasswordHelper()

    # Verify old password
    verified, _ = password_helper.verify_and_update(
        password_data.old_password, user.hashed_password
    )

    if not verified:
        raise HTTPException(status_code=400, detail="Incorrect old password")

    # Update password
    user.hashed_password = password_helper.hash(password_data.new_password)
    db.add(user)
    await db.commit()

    return None


@router.post("/me/recommendations")
async def generate_recommendations(
    request: RecommendationRequest,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Generate personalized AI course recommendations.

    Uses a 2-agent architecture:
    1. **Profile Analyzer**: Understands your learning context
    2. **Course Recommender**: Matches courses to your needs

    **Rate Limit**: 10 requests per 24 hours

    **Tip**: Complete your profile (learning goal, interests) for better results.
    """
    service = RecommendationService(db)
    result = await service.generate_recommendations(
        user_id=user.id,
        query=request.query,
        num_recommendations=request.num_recommendations,
    )

    # Handle clarification responses (vague/irrelevant queries)
    if result.get("type") == "clarification_needed":
        return ClarificationResponse(**result)

    return RecommendationRead(**result)


@router.get("/me/recommendations", response_model=RecommendationListResponse)
async def get_my_recommendations(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get current user's recommendation history.

    Returns recent AI-generated recommendations, newest first.
    """
    service = RecommendationService(db)
    recommendations = await service.get_user_recommendations(user.id, limit=10)

    # Convert to response format
    items = []
    for rec in recommendations:
        # Extract courses from recommendation_details if available
        courses = []
        learning_path = []
        profile_analysis = None
        overall_summary = rec.explanation

        if rec.recommendation_details:
            details = rec.recommendation_details
            for r in details.get("recommendations", []):
                courses.append({
                    "course_id": r["course_id"],
                    "title": r.get("title", "Unknown"),
                    "match_score": r["match_score"],
                    "explanation": r["explanation"],
                    "skill_gaps_addressed": r.get("skill_gaps_addressed", []),
                    "fit_reasons": r.get("fit_reasons", []),
                    "estimated_weeks": r.get("estimated_weeks"),
                })
            for step in details.get("learning_path", []):
                learning_path.append({
                    "order": step["order"],
                    "course_id": step["course_id"],
                    "title": step.get("title", "Unknown"),
                    "rationale": step["rationale"],
                })
            overall_summary = details.get("overall_summary", rec.explanation)

        if rec.profile_analysis_data:
            pa = rec.profile_analysis_data
            profile_analysis = {
                "skill_level": pa.get("skill_level", "unknown"),
                "skill_gaps": pa.get("skill_gaps", []),
                "confidence": pa.get("confidence", 0.0),
            }

        items.append(RecommendationRead(
            id=rec.id,
            query=rec.query,
            profile_analysis=profile_analysis,
            courses=courses,
            learning_path=learning_path,
            overall_summary=overall_summary,
            created_at=rec.created_at,
        ))

    return RecommendationListResponse(
        recommendations=items,
        count=len(items),
    )


@router.get("/me/recommendation-quota", response_model=RecommendationQuota)
async def get_my_recommendation_quota(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get current user's recommendation quota status.

    Shows how many recommendations you've used in the last 24 hours.
    """
    service = RecommendationService(db)
    quota = await service.get_quota(user.id)
    return RecommendationQuota(**quota)
