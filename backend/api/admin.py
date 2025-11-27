"""
Admin routes for user management and analytics.

All endpoints require superuser authentication.
"""
import uuid
from datetime import datetime, timedelta
from typing import Optional

import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_async_session
from core.users import current_superuser
from models.user import User
from models.user_profile import UserProfile, UserInterest
from models.course import Tag, Course
from models.recommendation import Recommendation
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
    ActivityLogRead,
    ActivityFeedResponse,
    InsightItem,
    InsightsResponse,
    CategoryDistributionItem,
    CategoryDistributionResponse,
    DifficultyStats,
    CourseSummaryResponse,
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
    profile_status: Optional[str] = Query(None, description="Filter by profile completion: complete, partial, empty"),
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    List all users with optional filters (superuser only).

    Supports pagination and filtering by email, is_active, is_superuser, profile_status.
    Profile status: complete (all fields), partial (some fields), empty (no fields).
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
        current_level = None

        if profile:
            has_learning_goal = profile.learning_goal is not None
            has_level = profile.current_level is not None
            has_time_commitment = profile.time_commitment is not None
            current_level = profile.current_level.value if profile.current_level else None
            # Count interests
            count_result = await db.execute(
                select(func.count())
                .select_from(UserInterest)
                .where(UserInterest.user_profile_id == profile.id)
            )
            interest_count = count_result.scalar() or 0

        # Determine profile completion status for filtering
        filled_fields = sum([has_learning_goal, has_level, has_time_commitment, interest_count > 0])
        if filled_fields == 4:
            user_profile_status = "complete"
        elif filled_fields == 0:
            user_profile_status = "empty"
        else:
            user_profile_status = "partial"

        # Skip user if profile_status filter doesn't match
        if profile_status and user_profile_status != profile_status:
            continue

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
            current_level=current_level,
        ))

    # Adjust total count if profile_status filter applied
    if profile_status:
        total = len(user_items)

    return UserListResponse(
        users=user_items,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/users/export")
async def export_users(
    email: Optional[str] = Query(None, description="Email substring search"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    profile_status: Optional[str] = Query(None, description="Filter by profile completion: complete, partial, empty"),
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Export users list as CSV (superuser only).

    Same filters as /users endpoint but returns all matching users as CSV.
    """
    repo = UserRepository(db)
    # Fetch all users without pagination
    users, _ = await repo.get_users_with_filters(
        skip=0,
        limit=10000,  # High limit for export
        email_search=email,
        is_active=is_active,
        is_superuser=None,
    )

    # Build CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        'Email', 'Status', 'Verified', 'Admin', 'Level',
        'Learning Goal', 'Time Commitment', 'Interests'
    ])

    # Data rows
    for user in users:
        # Get profile data
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == user.id)
        )
        profile = profile_result.scalar_one_or_none()

        # Profile fields
        has_learning_goal = False
        has_level = False
        has_time_commitment = False
        current_level = None
        learning_goal = None
        time_commitment = None
        interest_count = 0

        if profile:
            has_learning_goal = profile.learning_goal is not None
            has_level = profile.current_level is not None
            has_time_commitment = profile.time_commitment is not None
            current_level = profile.current_level.value if profile.current_level else None
            learning_goal = profile.learning_goal
            time_commitment = profile.time_commitment.value if profile.time_commitment else None

            # Count interests
            count_result = await db.execute(
                select(func.count())
                .select_from(UserInterest)
                .where(UserInterest.user_profile_id == profile.id)
            )
            interest_count = count_result.scalar() or 0

        # Determine profile status for filtering
        filled_fields = sum([has_learning_goal, has_level, has_time_commitment, interest_count > 0])
        if filled_fields == 4:
            user_profile_status = "complete"
        elif filled_fields == 0:
            user_profile_status = "empty"
        else:
            user_profile_status = "partial"

        # Skip if profile_status filter doesn't match
        if profile_status and user_profile_status != profile_status:
            continue

        writer.writerow([
            user.email,
            'Active' if user.is_active else 'Inactive',
            'Yes' if user.is_verified else 'No',
            'Yes' if user.is_superuser else 'No',
            current_level.capitalize() if current_level else '-',
            learning_goal or '-',
            time_commitment or '-',
            str(interest_count),
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users.csv"}
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

    # Count recommendations for this user
    rec_count_result = await db.execute(
        select(func.count())
        .select_from(Recommendation)
        .where(Recommendation.user_id == user_id)
    )
    recommendation_count = rec_count_result.scalar() or 0

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
        created_at=user.created_at,
        recommendation_count=recommendation_count,
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

    # Log deactivation event (non-blocking)
    try:
        from models.activity_log import ActivityLog, ActivityEventType

        activity_log = ActivityLog(
            event_type=ActivityEventType.DEACTIVATION,
            user_id=user.id,
            user_email=user.email,
            description="account deactivated",
        )
        db.add(activity_log)
        await db.commit()
    except Exception as e:
        print(f"Failed to log deactivation activity: {e}")

    # Get profile for response
    result = await repo.get_user_with_profile(user_id)
    _, profile = result

    # Count recommendations
    rec_count_result = await db.execute(
        select(func.count())
        .select_from(Recommendation)
        .where(Recommendation.user_id == user_id)
    )
    recommendation_count = rec_count_result.scalar() or 0

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
        created_at=user.created_at,
        recommendation_count=recommendation_count,
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

    # Calculate new registrations in last 7 and 30 days
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    new_7d_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= seven_days_ago)
    )
    new_registrations_7d = new_7d_result.scalar() or 0

    new_30d_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= thirty_days_ago)
    )
    new_registrations_30d = new_30d_result.scalar() or 0

    # Calculate average profile updates (version number)
    avg_version_result = await db.execute(
        select(func.avg(UserProfile.version))
    )
    avg_profile_updates = avg_version_result.scalar() or 0.0

    # Calculate complete profiles count (all 4 fields filled)
    profiles_result = await db.execute(select(UserProfile))
    profiles = profiles_result.scalars().all()
    complete_count = 0

    for profile in profiles:
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

        if all([has_goal, has_level, has_time, has_interests]):
            complete_count += 1

    return AnalyticsOverview(
        total_users=stats["total_users"],
        active_users=stats["active_users"],
        superuser_count=stats["superuser_count"],
        new_registrations_7d=new_registrations_7d,
        new_registrations_30d=new_registrations_30d,
        profile_completion_rate=completion_rate,
        avg_profile_updates=round(avg_profile_updates, 1),
        profiles_complete_count=complete_count,
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


@router.get("/analytics/category-distribution", response_model=CategoryDistributionResponse)
async def get_category_distribution(
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get category interest distribution (superuser only).

    Shows the percentage breakdown of user interest selections by tag category.
    """
    # Query to get count of user interests by tag category
    result = await db.execute(
        select(
            Tag.category,
            func.count(UserInterest.tag_id).label("count")
        )
        .join(UserInterest, Tag.id == UserInterest.tag_id)
        .group_by(Tag.category)
        .order_by(func.count(UserInterest.tag_id).desc())
    )
    rows = result.all()

    # Calculate total selections
    total_selections = sum(row.count for row in rows)

    # Build category distribution
    categories = []
    for row in rows:
        category_name = row.category.value if row.category else "OTHER"
        percentage = (row.count / total_selections * 100) if total_selections > 0 else 0
        categories.append(CategoryDistributionItem(
            category=category_name,
            count=row.count,
            percentage=round(percentage, 1),
        ))

    return CategoryDistributionResponse(
        categories=categories,
        total_selections=total_selections,
    )


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


@router.get("/analytics/course-summary", response_model=CourseSummaryResponse)
async def get_course_summary(
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get course catalog summary (superuser only).

    Returns difficulty distribution with counts, percentages, and average hours,
    plus total and average course duration.
    """
    # Query course stats grouped by difficulty
    result = await db.execute(
        select(
            Course.difficulty,
            func.count(Course.id).label("count"),
            func.avg(Course.duration).label("avg_hours"),
        )
        .group_by(Course.difficulty)
    )
    difficulty_rows = result.all()

    # Get totals
    total_result = await db.execute(
        select(
            func.count(Course.id).label("total"),
            func.sum(Course.duration).label("total_hours"),
            func.avg(Course.duration).label("avg_hours"),
        )
    )
    totals = total_result.first()
    total_courses = totals.total or 0
    total_hours = totals.total_hours or 0
    avg_course_hours = totals.avg_hours or 0.0

    # Build difficulty distribution with percentages
    difficulty_distribution = []
    for row in difficulty_rows:
        difficulty_name = row.difficulty.value if row.difficulty else "unknown"
        percentage = (row.count / total_courses * 100) if total_courses > 0 else 0
        difficulty_distribution.append(DifficultyStats(
            difficulty=difficulty_name,
            count=row.count,
            percentage=round(percentage, 1),
            avg_hours=round(row.avg_hours or 0, 1),
        ))

    # Sort by standard difficulty order: beginner, intermediate, advanced
    difficulty_order = {"beginner": 0, "intermediate": 1, "advanced": 2}
    difficulty_distribution.sort(key=lambda x: difficulty_order.get(x.difficulty, 99))

    return CourseSummaryResponse(
        difficulty_distribution=difficulty_distribution,
        total_courses=total_courses,
        total_hours=int(total_hours),
        avg_course_hours=round(avg_course_hours, 1),
    )


# ============================================================================
# Dashboard Endpoints
# ============================================================================


@router.get("/dashboard/activity", response_model=ActivityFeedResponse)
async def get_activity_feed(
    limit: int = Query(10, ge=1, le=50, description="Max events to return"),
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get recent activity events (superuser only).

    Returns the most recent platform activity for the dashboard feed.
    """
    from models.activity_log import ActivityLog

    result = await db.execute(
        select(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    )
    events = result.scalars().all()

    return ActivityFeedResponse(
        events=[
            ActivityLogRead(
                id=e.id,
                event_type=e.event_type.value,
                user_id=e.user_id,
                user_email=e.user_email,
                description=e.description,
                created_at=e.created_at,
            )
            for e in events
        ],
        count=len(events),
    )


@router.get("/dashboard/insights", response_model=InsightsResponse)
async def get_quick_insights(
    _: User = Depends(current_superuser),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get quick platform insights (superuser only).

    Returns 3 insight cards for the dashboard.
    """
    insights = []

    # Get all profiles with interest counts
    profiles_result = await db.execute(select(UserProfile))
    profiles = profiles_result.scalars().all()
    total_profiles = len(profiles)

    complete_count = 0
    users_without_interests = 0

    for profile in profiles:
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

        if all([has_goal, has_level, has_time, has_interests]):
            complete_count += 1
        if not has_interests:
            users_without_interests += 1

    completion_rate = (complete_count / total_profiles * 100) if total_profiles > 0 else 0

    # 1. Complete profiles insight (users with all 4 fields filled)
    if completion_rate >= 50:
        insights.append(InsightItem(
            icon="📈",
            text=f"{complete_count} of {total_profiles} users have complete profiles ({completion_rate:.0f}%)",
            type="positive",
        ))
    elif completion_rate < 30:
        insights.append(InsightItem(
            icon="⚠️",
            text=f"Only {complete_count} of {total_profiles} users have complete profiles ({completion_rate:.0f}%)",
            type="warning",
        ))
    else:
        insights.append(InsightItem(
            icon="📊",
            text=f"{complete_count} of {total_profiles} users have complete profiles ({completion_rate:.0f}%)",
            type="info",
        ))

    # 2. Most popular tag insight
    tag_result = await db.execute(
        select(Tag.name, func.count(UserInterest.tag_id).label("count"))
        .join(UserInterest, Tag.id == UserInterest.tag_id)
        .group_by(Tag.id, Tag.name)
        .order_by(func.count(UserInterest.tag_id).desc())
        .limit(1)
    )
    top_tag = tag_result.first()
    if top_tag:
        insights.append(InsightItem(
            icon="🔥",
            text=f"Top interest: \"{top_tag.name}\" ({top_tag.count} users)",
            type="info",
        ))

    # 3. Users without interests insight
    no_interest_rate = (users_without_interests / total_profiles * 100) if total_profiles > 0 else 0
    if no_interest_rate > 20:
        insights.append(InsightItem(
            icon="⚠️",
            text=f"{users_without_interests} users haven't selected interests",
            type="warning",
        ))
    else:
        insights.append(InsightItem(
            icon="✅",
            text="Most users have selected interests",
            type="positive",
        ))

    return InsightsResponse(insights=insights)
