"""
User profile routes.

Provides:
- GET /profiles/me (get current user's profile)
- PATCH /profiles/me (update profile with snapshot creation)
- GET /profiles/me/history (get profile snapshot history)
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_async_session
from core.users import current_active_user
from models.user import User
from models.user_profile import UserProfile
from models.user_profile_snapshot import UserProfileSnapshot
from schemas.profile import ProfileRead, ProfileUpdate, SnapshotRead, SnapshotListResponse
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


@router.get("/me/history", response_model=SnapshotListResponse)
async def get_my_profile_history(
    limit: int = Query(50, ge=1, le=100, description="Max snapshots to return"),
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get current user's profile snapshot history.

    Returns list of profile snapshots ordered by version (newest first).
    Each snapshot represents the profile state before an update.

    Args:
        limit: Maximum number of snapshots to return
        user: Current authenticated user
        db: Database session

    Returns:
        SnapshotListResponse: List of profile snapshots
    """
    # Get user's profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Get snapshots
    snapshots_result = await db.execute(
        select(UserProfileSnapshot)
        .where(UserProfileSnapshot.user_profile_id == profile.id)
        .order_by(UserProfileSnapshot.version.desc())
        .limit(limit)
    )
    snapshots = snapshots_result.scalars().all()

    snapshot_items = [
        SnapshotRead(
            id=s.id,
            version=s.version,
            learning_goal=s.learning_goal,
            current_level=s.current_level,
            time_commitment=s.time_commitment,
            interests_snapshot=s.interests_snapshot if isinstance(s.interests_snapshot, list) else [],
            created_at=s.created_at,
        )
        for s in snapshots
    ]

    return SnapshotListResponse(
        snapshots=snapshot_items,
        count=len(snapshot_items),
    )
