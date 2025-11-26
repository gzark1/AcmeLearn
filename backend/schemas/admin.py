"""
Admin schemas for user management and analytics.
"""
import uuid
from datetime import datetime
from typing import Optional, List

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
    new_registrations_7d: int = 0  # Stub - would need created_at on User
    new_registrations_30d: int = 0  # Stub
    profile_completion_rate: float = Field(..., ge=0.0, le=1.0)


class PopularTag(BaseModel):
    """Tag popularity data."""
    tag_id: uuid.UUID
    tag_name: str
    user_count: int


class PopularTagsResponse(BaseModel):
    """Popular tags response."""
    tags: List[PopularTag]
    total_tags: int


class UserGrowthDataPoint(BaseModel):
    """Single data point for user growth chart."""
    date: str  # YYYY-MM-DD format
    new_users: int
    cumulative_users: int


class UserGrowthResponse(BaseModel):
    """User growth time series response."""
    data: List[UserGrowthDataPoint]
    period_days: int
