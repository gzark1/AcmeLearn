"""
Admin routes for user management and analytics.

All endpoints require superuser authentication.
"""
import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_async_session
from core.users import current_superuser
from models.user import User
from models.user_profile import UserProfile, UserInterest
from models.course import Tag
from repositories.user_repository import UserRepository
from schemas.admin import (
    UserListItem,
    UserListResponse,
    UserDetailResponse,
    ProfileSummary,
    SnapshotRead,
    SnapshotListResponse,
    AnalyticsOverview,
    PopularTag,
    PopularTagsResponse,
    ProfileBreakdownResponse,
    LevelDistributionResponse,
    TimeDistributionResponse,
    UserGrowthDataPoint,
    UserGrowthResponse,
)


router = APIRouter()


# ============================================================================
# User Management Endpoints
# ============================================================================


@router.get("/users", response_model=UserListResponse)
async def list_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    email: Optional[str] = Query(None, description="Email substring search"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_superuser: Optional[bool] = Query(None, description="Filter by superuser status"),
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    List all users with optional filters (superuser only).

    Supports pagination and filtering by email, is_active, is_superuser.
    """
    repo = UserRepository(db)
    users, total = await repo.get_users_with_filters(
        skip=skip,
        limit=limit,
        email_search=email,
        is_active=is_active,
        is_superuser=is_superuser,
    )

    # Build response with profile summaries
    user_items = []
    for user in users:
        # Get profile summary for each user
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == user.id)
        )
        profile = profile_result.scalar_one_or_none()

        interest_count = 0
        has_learning_goal = False
        has_level = False
        has_time_commitment = False

        if profile:
            has_learning_goal = profile.learning_goal is not None
            has_level = profile.current_level is not None
            has_time_commitment = profile.time_commitment is not None
            # Count interests
            count_result = await db.execute(
                select(func.count())
                .select_from(UserInterest)
                .where(UserInterest.user_profile_id == profile.id)
            )
            interest_count = count_result.scalar() or 0

        user_items.append(UserListItem(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            is_superuser=user.is_superuser,
            is_verified=user.is_verified,
            has_learning_goal=has_learning_goal,
            has_level=has_level,
            has_time_commitment=has_time_commitment,
            interest_count=interest_count,
        ))

    return UserListResponse(
        users=user_items,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/users/{user_id}", response_model=UserDetailResponse)
async def get_user_detail(
    user_id: uuid.UUID,
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get detailed user information with profile (superuser only).
    """
    repo = UserRepository(db)
    result = await repo.get_user_with_profile(user_id)

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    user, profile = result

    profile_summary = None
    if profile:
        interests = [tag.name for tag in profile.interests] if profile.interests else []
        profile_summary = ProfileSummary(
            id=profile.id,
            learning_goal=profile.learning_goal,
            current_level=profile.current_level,
            time_commitment=profile.time_commitment,
            version=profile.version,
            interest_count=len(interests),
            interests=interests,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    return UserDetailResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        is_verified=user.is_verified,
        profile=profile_summary,
    )


@router.patch("/users/{user_id}/deactivate", response_model=UserDetailResponse)
async def deactivate_user(
    user_id: uuid.UUID,
    admin: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Soft-delete user by setting is_active=False (superuser only).

    Cannot deactivate yourself.
    """
    if user_id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot deactivate yourself"
        )

    repo = UserRepository(db)
    user = await repo.deactivate_user(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get profile for response
    result = await repo.get_user_with_profile(user_id)
    _, profile = result

    profile_summary = None
    if profile:
        interests = [tag.name for tag in profile.interests] if profile.interests else []
        profile_summary = ProfileSummary(
            id=profile.id,
            learning_goal=profile.learning_goal,
            current_level=profile.current_level,
            time_commitment=profile.time_commitment,
            version=profile.version,
            interest_count=len(interests),
            interests=interests,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    return UserDetailResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        is_verified=user.is_verified,
        profile=profile_summary,
    )


@router.get("/users/{user_id}/profile-history", response_model=SnapshotListResponse)
async def get_user_profile_history(
    user_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100, description="Max snapshots to return"),
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get profile snapshot history for a user (superuser only).
    """
    repo = UserRepository(db)
    snapshots = await repo.get_user_profile_snapshots(user_id, limit=limit)

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


# ============================================================================
# Analytics Endpoints
# ============================================================================


@router.get("/analytics/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get system-wide analytics overview (superuser only).
    """
    repo = UserRepository(db)

    stats = await repo.get_user_count_stats()
    completion_rate = await repo.get_profile_completion_rate()

    return AnalyticsOverview(
        total_users=stats["total_users"],
        active_users=stats["active_users"],
        superuser_count=stats["superuser_count"],
        new_registrations_7d=0,  # Would need created_at tracking
        new_registrations_30d=0,  # Would need created_at tracking
        profile_completion_rate=completion_rate,
    )


@router.get("/analytics/tags/popular", response_model=PopularTagsResponse)
async def get_popular_tags(
    limit: int = Query(20, ge=1, le=100, description="Max tags to return"),
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get most popular tags by user interest count (superuser only).
    """
    # Query tags with user interest count and category
    result = await db.execute(
        select(
            Tag.id,
            Tag.name,
            Tag.category,
            func.count(UserInterest.user_profile_id).label("user_count")
        )
        .outerjoin(UserInterest, Tag.id == UserInterest.tag_id)
        .group_by(Tag.id, Tag.name, Tag.category)
        .order_by(func.count(UserInterest.user_profile_id).desc())
        .limit(limit)
    )

    rows = result.all()

    tags = [
        PopularTag(
            tag_id=row.id,
            tag_name=row.name,
            tag_category=row.category.value if row.category else "OTHER",
            user_count=row.user_count
        )
        for row in rows
    ]

    # Get total tag count
    total_result = await db.execute(select(func.count()).select_from(Tag))
    total_tags = total_result.scalar() or 0

    return PopularTagsResponse(tags=tags, total_tags=total_tags)


@router.get("/analytics/profile-breakdown", response_model=ProfileBreakdownResponse)
async def get_profile_breakdown(
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get profile completion breakdown (superuser only).

    - Complete: has goal, level, time commitment, and 1+ interests
    - Partial: has some but not all fields
    - Empty: no profile data set
    """
    # Get all profiles with interest counts
    profiles_result = await db.execute(select(UserProfile))
    profiles = profiles_result.scalars().all()

    complete = 0
    partial = 0
    empty = 0

    for profile in profiles:
        # Count interests for this profile
        interest_count_result = await db.execute(
            select(func.count())
            .select_from(UserInterest)
            .where(UserInterest.user_profile_id == profile.id)
        )
        interest_count = interest_count_result.scalar() or 0

        has_goal = profile.learning_goal is not None
        has_level = profile.current_level is not None
        has_time = profile.time_commitment is not None
        has_interests = interest_count > 0

        filled_fields = sum([has_goal, has_level, has_time, has_interests])

        if filled_fields == 4:
            complete += 1
        elif filled_fields == 0:
            empty += 1
        else:
            partial += 1

    total = complete + partial + empty

    return ProfileBreakdownResponse(
        complete=complete,
        partial=partial,
        empty=empty,
        total=total,
    )


@router.get("/analytics/level-distribution", response_model=LevelDistributionResponse)
async def get_level_distribution(
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get user level distribution (superuser only).
    """
    profiles_result = await db.execute(select(UserProfile.current_level))
    levels = profiles_result.scalars().all()

    beginner = 0
    intermediate = 0
    advanced = 0
    not_set = 0

    for level in levels:
        if level is None:
            not_set += 1
        elif level.value == "beginner":
            beginner += 1
        elif level.value == "intermediate":
            intermediate += 1
        elif level.value == "advanced":
            advanced += 1

    return LevelDistributionResponse(
        beginner=beginner,
        intermediate=intermediate,
        advanced=advanced,
        not_set=not_set,
    )


@router.get("/analytics/time-distribution", response_model=TimeDistributionResponse)
async def get_time_distribution(
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get time commitment distribution (superuser only).

    Buckets: 1-5, 5-10, 10-20, 20+ hours/week
    """
    profiles_result = await db.execute(select(UserProfile.time_commitment))
    time_values = profiles_result.scalars().all()

    hours_1_5 = 0
    hours_5_10 = 0
    hours_10_20 = 0
    hours_20_plus = 0
    not_set = 0

    for time_commitment in time_values:
        if time_commitment is None:
            not_set += 1
        else:
            # TimeCommitment enum - compare by name or value
            tc_name = time_commitment.name if hasattr(time_commitment, 'name') else str(time_commitment)
            if tc_name == "HOURS_1_5" or (hasattr(time_commitment, 'value') and time_commitment.value == "1-5"):
                hours_1_5 += 1
            elif tc_name == "HOURS_5_10" or (hasattr(time_commitment, 'value') and time_commitment.value == "5-10"):
                hours_5_10 += 1
            elif tc_name == "HOURS_10_20" or (hasattr(time_commitment, 'value') and time_commitment.value == "10-20"):
                hours_10_20 += 1
            elif tc_name == "HOURS_20_PLUS" or (hasattr(time_commitment, 'value') and time_commitment.value == "20+"):
                hours_20_plus += 1

    return TimeDistributionResponse(
        hours_1_5=hours_1_5,
        hours_5_10=hours_5_10,
        hours_10_20=hours_10_20,
        hours_20_plus=hours_20_plus,
        not_set=not_set,
    )


@router.get("/analytics/user-growth", response_model=UserGrowthResponse)
async def get_user_growth(
    days: int = Query(30, ge=7, le=90, description="Number of days to include"),
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get user growth data for the last N days (superuser only).

    Returns daily new user counts and cumulative totals.
    """
    # Calculate date range
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)

    # Query users grouped by registration date
    result = await db.execute(
        select(
            cast(User.created_at, Date).label("date"),
            func.count(User.id).label("count")
        )
        .where(cast(User.created_at, Date) >= start_date)
        .group_by(cast(User.created_at, Date))
        .order_by(cast(User.created_at, Date))
    )
    daily_counts = {row.date: row.count for row in result.all()}

    # Get total users before the start date (for cumulative base)
    base_count_result = await db.execute(
        select(func.count(User.id))
        .where(cast(User.created_at, Date) < start_date)
    )
    base_count = base_count_result.scalar() or 0

    # Build data points with cumulative counts, filling in gaps
    data_points = []
    cumulative = base_count
    current_date = start_date

    while current_date <= end_date:
        new_users = daily_counts.get(current_date, 0)
        cumulative += new_users
        data_points.append(UserGrowthDataPoint(
            date=current_date.isoformat(),
            new_users=new_users,
            cumulative_users=cumulative,
        ))
        current_date += timedelta(days=1)

    return UserGrowthResponse(
        data=data_points,
        period_days=days,
    )
