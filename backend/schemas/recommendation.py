"""
Recommendation schemas.
"""
import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class RecommendedCourse(BaseModel):
    """Course recommendation item."""
    course_id: uuid.UUID
    title: str
    match_score: float  # 0.0 to 1.0
    explanation: str


class RecommendationRead(BaseModel):
    """Recommendation response."""
    id: uuid.UUID
    query: Optional[str] = None
    courses: List[RecommendedCourse]
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationListResponse(BaseModel):
    """List of recommendations."""
    recommendations: List[RecommendationRead]
    count: int


class RecommendationQuota(BaseModel):
    """User's recommendation quota status."""
    used: int
    limit: int
    remaining: int
