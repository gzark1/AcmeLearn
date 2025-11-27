"""
Pydantic models for LLM structured outputs.

Uses LangChain v1.0 `.with_structured_output()` pattern for type-safe responses.
These models define the exact JSON structure the LLM must return.
"""

from typing import List

from pydantic import BaseModel, Field


# ============================================================
# Agent 1 Output: Profile Analysis
# ============================================================


class ProfileAnalysis(BaseModel):
    """
    Agent 1 output: Comprehensive analysis of user's learning profile.

    This structured output guides pre-filtering and Agent 2's recommendations.
    """

    skill_level: str = Field(
        description="User's detected skill level: 'beginner', 'intermediate', or 'advanced'. "
        "May differ from their stated level based on goal complexity."
    )

    skill_gaps: List[str] = Field(
        description="Specific skills the user needs to develop to achieve their learning goal. "
        "Be concrete: 'REST API design' not 'backend skills'."
    )

    ranked_interests: List[str] = Field(
        description="User's interests ranked by relevance to their learning goal and current query. "
        "Most relevant first."
    )

    time_constraint_hours: int = Field(
        ge=1,
        le=40,
        description="Weekly hours available for learning (1-40). "
        "Derived from time_commitment field.",
    )

    learning_style_notes: str = Field(
        description="Brief observations about user's learning context, preferences, or journey stage. "
        "Example: 'Career changer focused on practical skills, time-constrained.'"
    )

    profile_completeness: str = Field(
        description="Assessment of profile quality: 'complete', 'partial', or 'minimal'. "
        "Affects recommendation confidence."
    )

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence in this analysis (0.0-1.0). "
        "Lower if profile incomplete or data conflicting.",
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
        description="Which skill gaps from the profile analysis this course addresses. "
        "Use exact terms from the skill_gaps list.",
    )

    fit_reasons: List[str] = Field(
        min_length=2,
        max_length=4,
        description="Key reasons this course fits: e.g., 'Matches goal', 'Right difficulty', "
        "'Covers skill gap', 'Aligns with interests'.",
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
