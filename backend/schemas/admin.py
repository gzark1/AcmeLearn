"""
Admin schemas for user management and analytics.
"""
import uuid
from datetime import datetime
from typing import Optional, List, Literal

from pydantic import BaseModel, Field

from models.enums import DifficultyLevel, TimeCommitment


class UserListItem(BaseModel):
    """User item in list response."""
    id: uuid.UUID
    email: str
    is_active: bool
    is_superuser: bool
    is_verified: bool
    # Profile summary
    has_learning_goal: bool = False
    has_level: bool = False
    has_time_commitment: bool = False
    interest_count: int = 0
    current_level: Optional[str] = None  # beginner, intermediate, advanced

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Paginated user list response."""
    users: List[UserListItem]
    total: int
    skip: int
    limit: int


class ProfileSummary(BaseModel):
    """Profile summary for user detail."""
    id: uuid.UUID
    learning_goal: Optional[str] = None
    current_level: Optional[DifficultyLevel] = None
    time_commitment: Optional[TimeCommitment] = None
    version: int
    interest_count: int = 0
    interests: List[str] = []  # Tag names
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserDetailResponse(BaseModel):
    """Detailed user response with profile."""
    id: uuid.UUID
    email: str
    is_active: bool
    is_superuser: bool
    is_verified: bool
    created_at: datetime  # User registration date
    recommendation_count: int = 0  # Count of AI recommendations
    profile: Optional[ProfileSummary] = None

    class Config:
        from_attributes = True


class SnapshotRead(BaseModel):
    """Profile snapshot response."""
    id: uuid.UUID
    version: int
    learning_goal: Optional[str] = None
    current_level: Optional[DifficultyLevel] = None
    time_commitment: Optional[TimeCommitment] = None
    interests_snapshot: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class SnapshotListResponse(BaseModel):
    """List of profile snapshots."""
    snapshots: List[SnapshotRead]
    count: int


# Analytics schemas

class AnalyticsOverview(BaseModel):
    """System-wide analytics overview."""
    total_users: int
    active_users: int
    superuser_count: int
    new_registrations_7d: int = 0
    new_registrations_30d: int = 0
    profile_completion_rate: float = Field(..., ge=0.0, le=1.0)
    avg_profile_updates: float = 0.0  # Average profile version across users
    profiles_complete_count: int = 0  # Users with all 4 fields filled


class PopularTag(BaseModel):
    """Tag popularity data."""
    tag_id: uuid.UUID
    tag_name: str
    tag_category: str
    user_count: int


class PopularTagsResponse(BaseModel):
    """Popular tags response."""
    tags: List[PopularTag]
    total_tags: int


class ProfileBreakdownResponse(BaseModel):
    """Profile completion breakdown."""
    complete: int  # Has goal, level, time, and 1+ interests
    partial: int   # Has some but not all fields
    empty: int     # No profile data
    total: int


class LevelDistributionResponse(BaseModel):
    """User level distribution."""
    beginner: int
    intermediate: int
    advanced: int
    not_set: int


class TimeDistributionResponse(BaseModel):
    """Time commitment distribution."""
    hours_1_5: int     # 1-5 hours/week
    hours_5_10: int    # 5-10 hours/week
    hours_10_20: int   # 10-20 hours/week
    hours_20_plus: int # 20+ hours/week
    not_set: int


class UserGrowthDataPoint(BaseModel):
    """Single data point for user growth chart."""
    date: str  # YYYY-MM-DD format
    new_users: int
    cumulative_users: int


class UserGrowthResponse(BaseModel):
    """User growth time series response."""
    data: List[UserGrowthDataPoint]
    period_days: int


# Dashboard schemas

class ActivityLogRead(BaseModel):
    """Activity log entry for dashboard feed."""
    id: uuid.UUID
    event_type: str
    user_id: uuid.UUID
    user_email: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityFeedResponse(BaseModel):
    """Activity feed response."""
    events: List[ActivityLogRead]
    count: int


class InsightItem(BaseModel):
    """Single insight item for dashboard."""
    icon: str  # emoji
    text: str
    type: Literal["positive", "warning", "info"]


class InsightsResponse(BaseModel):
    """Quick insights response."""
    insights: List[InsightItem]


class CategoryDistributionItem(BaseModel):
    """Single category in distribution."""
    category: str
    count: int
    percentage: float


class CategoryDistributionResponse(BaseModel):
    """Category interest distribution response."""
    categories: List[CategoryDistributionItem]
    total_selections: int
