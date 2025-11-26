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
from schemas.recommendation import RecommendationListResponse, RecommendationQuota
from models.user import User


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


@router.get("/me/recommendations", response_model=RecommendationListResponse)
async def get_my_recommendations(
    user: User = Depends(current_active_user),
):
    """
    Get current user's recommendation history.

    Note: This is a stub endpoint. Full implementation requires
    LLM integration in Phase 4.

    Returns:
        RecommendationListResponse: Empty list (stub)
    """
    # Stub - returns empty list until LLM integration is complete
    return RecommendationListResponse(
        recommendations=[],
        count=0,
    )


@router.get("/me/recommendation-quota", response_model=RecommendationQuota)
async def get_my_recommendation_quota(
    user: User = Depends(current_active_user),
):
    """
    Get current user's recommendation quota status.

    Note: This is a stub endpoint. Quota tracking will be
    implemented with rate limiting in a future phase.

    Returns:
        RecommendationQuota: Static quota (10 limit, 0 used)
    """
    # Stub - returns static quota until rate limiting is implemented
    return RecommendationQuota(
        used=0,
        limit=10,
        remaining=10,
    )
