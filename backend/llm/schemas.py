"""
Pydantic models for LLM structured outputs.

Uses LangChain v1.0 `.with_structured_output()` pattern for type-safe responses.
These models define the exact JSON structure the LLM must return.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


# ============================================================
# Agent 1 Output: Profile Analysis
# ============================================================


class ProfileAnalysis(BaseModel):
    """
    Agent 1 output: Comprehensive analysis of user's learning profile.

    QUERY-FIRST: This analysis helps personalize recommendations for the user's REQUEST,
    not redirect them to different topics.
    """

    skill_level: str = Field(
        description="User's detected skill level FOR THEIR REQUESTED AREA: 'beginner', 'intermediate', or 'advanced'. "
        "Consider transferable skills from their background."
    )

    skill_gaps: List[str] = Field(
        max_length=3,
        description="Max 3 specific skills the user needs FOR WHAT THEY'RE REQUESTING. "
        "Short phrases only. Be concrete and relevant to their query."
    )

    time_constraint_hours: int = Field(
        ge=1,
        le=40,
        description="Weekly hours available for learning (1-40). "
        "Derived from time_commitment field.",
    )

    personalization_note: str = Field(
        description="1-2 sentences: how user's background connects to their request + learning context. "
        "Example: 'Your data skills make you ideal for analytics-driven sales. Time-constrained learner.'"
    )

    profile_completeness: str = Field(
        description="Assessment of profile quality: 'complete', 'partial', or 'minimal'. "
        "Affects recommendation confidence."
    )

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence in this personalization (0.0-1.0). "
        "Lower if profile incomplete or request unclear.",
    )

    profile_feedback: Optional[str] = Field(
        default=None,
        description="Optional suggestion for the user to improve their profile. "
        "Set this if profile has issues: no interests, vague goal, outdated info, or contradictions. "
        "Example: 'Adding your current skill level would help us recommend better courses.' "
        "Leave as null if profile is adequate.",
    )


# ============================================================
# Agent 2 Output: Course Recommendations
# ============================================================


class CourseRecommendation(BaseModel):
    """
    Single course recommendation with rich, personalized explanation.
    """

    course_id: str = Field(
        description="UUID of the recommended course (as string). "
        "Must be from the provided filtered course list."
    )

    match_score: float = Field(
        ge=0.0,
        le=1.0,
        description="How well this course matches the user's needs (0.0-1.0). "
        "Consider skill gaps, interests, difficulty, and time fit.",
    )

    explanation: str = Field(
        description="Rich, personalized explanation (3-5 sentences) of why this course "
        "is valuable for THIS specific learner. Reference their goals and gaps."
    )

    skill_gaps_addressed: List[str] = Field(
        default_factory=list,
        max_length=2,
        description="Max 2 skill gaps this course addresses. Use exact terms from skill_gaps list.",
    )

    estimated_weeks: int = Field(
        ge=1,
        le=52,
        description="Estimated weeks to complete based on user's time_constraint_hours.",
    )


class LearningPathStep(BaseModel):
    """
    A step in the recommended 2-3 course learning path.
    """

    order: int = Field(ge=1, le=3, description="Position in the learning path (1, 2, or 3).")

    course_id: str = Field(description="UUID of the course at this step.")

    rationale: str = Field(
        description="Why this course comes at this position. "
        "E.g., 'Builds foundation for next course' or 'Applies skills from previous courses'."
    )


class RecommendationOutput(BaseModel):
    """
    Agent 2 output: Complete recommendation response with courses and learning path.
    """

    recommendations: List[CourseRecommendation] = Field(
        min_length=1,
        max_length=10,
        description="Ordered list of recommended courses (best match first).",
    )

    learning_path: List[LearningPathStep] = Field(
        min_length=2,
        max_length=3,
        description="Optimal 2-3 course learning sequence. "
        "Order: foundational → intermediate → advanced.",
    )

    overall_summary: str = Field(
        description="2-3 sentence summary of the recommendation strategy. "
        "Explain the overall approach taken for this learner."
    )
