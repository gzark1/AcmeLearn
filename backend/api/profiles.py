"""
User profile routes.

Provides:
- GET /profiles/me (get current user's profile)
- PATCH /profiles/me (update profile with snapshot creation)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_async_session
from core.users import current_active_user
from models.user import User
from schemas.profile import ProfileRead, ProfileUpdate
from services.profile_service import ProfileService
from repositories.user_profile_repository import UserProfileRepository


router = APIRouter()


@router.get("/me", response_model=ProfileRead)
async def get_my_profile(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get current user's profile.

    Returns:
        ProfileRead: User's profile with interests

    Raises:
        HTTPException: 404 if profile not found
    """
    repo = UserProfileRepository(db)
    profile = await repo.get_profile_by_user_id(user.id)

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.patch("/me", response_model=ProfileRead)
async def update_my_profile(
    profile_data: ProfileUpdate,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Update current user's profile.

    Automatically creates snapshot before updating.

    Args:
        profile_data: Profile fields to update
        user: Current authenticated user
        db: Database session

    Returns:
        ProfileRead: Updated profile

    Raises:
        HTTPException: 404 if profile not found
    """
    service = ProfileService(db)

    try:
        updated_profile = await service.update_profile_with_snapshot(
            user_id=user.id,
            learning_goal=profile_data.learning_goal,
            current_level=profile_data.current_level,
            time_commitment=profile_data.time_commitment,
            interest_tag_ids=profile_data.interest_tag_ids,
        )
        return updated_profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
