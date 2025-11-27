"""
Recommendation schemas.
"""
import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


# ============================================================
# Request Schemas
# ============================================================


class RecommendationRequest(BaseModel):
    """Request to generate AI recommendations."""

    query: Optional[str] = Field(
        None,
        max_length=500,
        description="What you want to learn (optional)",
        examples=["I want to learn machine learning for data analysis"],
    )
    num_recommendations: int = Field(
        5,
        ge=3,
        le=10,
        description="Number of courses to recommend",
    )


# ============================================================
# Response Schemas
# ============================================================


class RecommendedCourse(BaseModel):
    """Course recommendation item."""

    course_id: uuid.UUID
    title: str
    match_score: float  # 0.0 to 1.0
    explanation: str
    skill_gaps_addressed: List[str] = []
    fit_reasons: List[str] = []
    estimated_weeks: Optional[int] = None


class LearningPathStep(BaseModel):
    """Step in the learning path."""

    order: int
    course_id: uuid.UUID
    title: str
    rationale: str


class ProfileAnalysisSummary(BaseModel):
    """Summary of profile analysis."""

    skill_level: str
    skill_gaps: List[str]
    confidence: float


class RecommendationRead(BaseModel):
    """Recommendation response."""

    id: uuid.UUID
    query: Optional[str] = None
    profile_analysis: Optional[ProfileAnalysisSummary] = None
    courses: List[RecommendedCourse]
    learning_path: List[LearningPathStep] = []
    overall_summary: Optional[str] = None
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
