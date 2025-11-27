# Backend Architecture - AI Recommendation System

**Status**: Implementation Ready
**Last Updated**: 2025-11-27
**LangChain Version**: v1.0 (Nov 2025)

---

## 1. File Structure

```
backend/
├── llm/                              # LLM integration module
│   ├── __init__.py
│   ├── config.py                     # LangChain LLM configuration
│   ├── exceptions.py                 # Custom LLM exceptions
│   ├── schemas.py                    # Pydantic models for structured outputs
│   ├── filters.py                    # Pre-filtering logic (48 → ~30)
│   ├── agents/
│   │   ├── __init__.py               # RecommendationState TypedDict
│   │   ├── profile_analyzer.py       # Agent 1: Profile & Context Analyzer
│   │   └── course_recommender.py     # Agent 2: Course Recommender
│   └── prompts/
│       ├── __init__.py
│       ├── profile_analyzer.py       # Agent 1 prompts (detailed)
│       └── course_recommender.py     # Agent 2 prompts (detailed)
│
├── api/
│   └── recommendations.py            # POST /recommendations/generate
│
├── repositories/
│   └── course_repository.py          # Course data access for filtering
│
├── services/
│   └── recommendation_service.py     # Extended with generate_recommendations()
│
├── models/
│   └── recommendation.py             # Add JSONB columns
│
├── schemas/
│   └── recommendation.py             # Request/response schemas
│
└── core/
    └── config.py                     # Add OpenAI settings
```

---

## 2. Pydantic Models for Structured LLM Outputs

### File: `backend/llm/schemas.py`

```python
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
        ge=1, le=40,
        description="Weekly hours available for learning (1-40). "
                    "Derived from time_commitment field."
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
        ge=0.0, le=1.0,
        description="Confidence in this analysis (0.0-1.0). "
                    "Lower if profile incomplete or data conflicting."
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
        ge=0.0, le=1.0,
        description="How well this course matches the user's needs (0.0-1.0). "
                    "Consider skill gaps, interests, difficulty, and time fit."
    )

    explanation: str = Field(
        description="Rich, personalized explanation (3-5 sentences) of why this course "
                    "is valuable for THIS specific learner. Reference their goals and gaps."
    )

    skill_gaps_addressed: List[str] = Field(
        default_factory=list,
        description="Which skill gaps from the profile analysis this course addresses. "
                    "Use exact terms from the skill_gaps list."
    )

    fit_reasons: List[str] = Field(
        min_length=2, max_length=4,
        description="Key reasons this course fits: e.g., 'Matches goal', 'Right difficulty', "
                    "'Covers skill gap', 'Aligns with interests'."
    )

    estimated_weeks: int = Field(
        ge=1, le=52,
        description="Estimated weeks to complete based on user's time_constraint_hours."
    )


class LearningPathStep(BaseModel):
    """
    A step in the recommended 2-3 course learning path.
    """

    order: int = Field(
        ge=1, le=3,
        description="Position in the learning path (1, 2, or 3)."
    )

    course_id: str = Field(
        description="UUID of the course at this step."
    )

    rationale: str = Field(
        description="Why this course comes at this position. "
                    "E.g., 'Builds foundation for next course' or 'Applies skills from previous courses'."
    )


class RecommendationOutput(BaseModel):
    """
    Agent 2 output: Complete recommendation response with courses and learning path.
    """

    recommendations: List[CourseRecommendation] = Field(
        min_length=1, max_length=10,
        description="Ordered list of recommended courses (best match first)."
    )

    learning_path: List[LearningPathStep] = Field(
        min_length=2, max_length=3,
        description="Optimal 2-3 course learning sequence. "
                    "Order: foundational → intermediate → advanced."
    )

    overall_summary: str = Field(
        description="2-3 sentence summary of the recommendation strategy. "
                    "Explain the overall approach taken for this learner."
    )
```

---

## 3. LLM Configuration

### File: `backend/llm/config.py`

```python
"""
LangChain LLM configuration.

Uses LangChain v1.0 patterns with OpenAI GPT-5-nano.
"""
import logging
from functools import lru_cache

from langchain_openai import ChatOpenAI

from core.config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_llm() -> ChatOpenAI:
    """
    Get configured LangChain LLM instance (singleton).

    Always uses GPT-5-nano. User tests with mini manually when needed.

    Returns:
        ChatOpenAI instance configured for recommendations

    Raises:
        ValueError: If OPENAI_API_KEY not configured
    """
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not configured in environment")

    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        temperature=settings.OPENAI_TEMPERATURE,
        max_tokens=settings.OPENAI_MAX_TOKENS,
        timeout=settings.OPENAI_TIMEOUT_SECONDS,
        api_key=settings.OPENAI_API_KEY,
    )

    if settings.LLM_DEBUG_MODE:
        logger.info(
            f"LLM initialized: model={settings.OPENAI_MODEL}, "
            f"temp={settings.OPENAI_TEMPERATURE}, "
            f"max_tokens={settings.OPENAI_MAX_TOKENS}"
        )

    return llm
```

### Settings to add to `backend/core/config.py`:

```python
# OpenAI / LLM Configuration
OPENAI_API_KEY: str = ""
OPENAI_MODEL: str = "gpt-5-nano-2025-08-07"
OPENAI_TEMPERATURE: float = 0.3  # Lower for more consistent outputs
OPENAI_MAX_TOKENS: int = 2000
OPENAI_TIMEOUT_SECONDS: int = 30

# LLM Feature Flags
LLM_ENABLED: bool = True
LLM_DEBUG_MODE: bool = False  # Log prompts/responses when True
```

---

## 4. Custom Exceptions

### File: `backend/llm/exceptions.py`

```python
"""
Custom exceptions for LLM operations.

Provides semantic error types for different failure modes.
"""


class LLMError(Exception):
    """Base exception for all LLM-related errors."""
    pass


class LLMTimeoutError(LLMError):
    """LLM request exceeded timeout (default 30s)."""

    def __init__(self, message: str = "LLM request timed out"):
        self.message = message
        super().__init__(self.message)


class LLMValidationError(LLMError):
    """LLM returned response that failed Pydantic validation."""

    def __init__(self, message: str = "LLM returned invalid response"):
        self.message = message
        super().__init__(self.message)


class LLMEmptyProfileError(LLMError):
    """User profile too empty for meaningful recommendations."""

    def __init__(self, message: str = "Profile needs more information for recommendations"):
        self.message = message
        super().__init__(self.message)


class LLMNoCoursesError(LLMError):
    """No courses match after pre-filtering."""

    def __init__(self, message: str = "No courses match your current preferences"):
        self.message = message
        super().__init__(self.message)
```

---

## 5. Pre-Filtering Logic

### File: `backend/llm/filters.py`

```python
"""
Course pre-filtering logic.

Reduces course list before LLM to minimize tokens while maintaining quality.
Uses scoring algorithm to rank relevance.

Target: 48 courses → ~30 courses (moderate filtering)
"""
import re
import logging
from typing import List, Dict, Optional

from models.course import Course
from models.user_profile import UserProfile
from models.enums import DifficultyLevel, TimeCommitment

logger = logging.getLogger(__name__)


def filter_courses(
    courses: List[Course],
    profile: UserProfile,
    user_query: Optional[str] = None
) -> List[Dict]:
    """
    Pre-filter and score courses before LLM processing.

    Scoring Strategy (max 100 points):
    1. Difficulty alignment: 0-30 points
    2. Tag/interest matching: 0-40 points
    3. Duration feasibility: 0-20 points
    4. Query keyword boost: 0-10 points

    Args:
        courses: All available courses (48)
        profile: User's profile with interests, level, time
        user_query: Optional search query for keyword boosting

    Returns:
        List of course dicts with 'relevance_score', sorted by score.
        Target size: 25-35 courses (adaptive based on scores).
    """
    scored_courses = []

    # Extract user interests as lowercase set
    user_interest_names = set()
    if profile.interests:
        user_interest_names = {tag.name.lower() for tag in profile.interests}

    # Parse query keywords (simple tokenization)
    query_words = set()
    if user_query:
        # Extract words, filter short ones
        query_words = {
            w.lower() for w in re.findall(r'\w+', user_query)
            if len(w) > 2
        }

    for course in courses:
        score = 0.0

        # 1. Difficulty alignment (0-30 points)
        score += _score_difficulty(course.difficulty, profile.current_level)

        # 2. Tag/interest matching (0-40 points)
        course_tag_names = {tag.name.lower() for tag in course.tags}
        overlap_count = len(user_interest_names & course_tag_names)
        score += min(overlap_count * 10, 40)  # 10 points per match, max 40

        # 3. Duration feasibility (0-20 points)
        score += _score_duration(course.duration, profile.time_commitment)

        # 4. Query keyword boost (0-10 points)
        if query_words:
            title_words = {w.lower() for w in re.findall(r'\w+', course.title)}
            desc_words = {w.lower() for w in re.findall(r'\w+', course.description[:500])}

            title_matches = query_words & title_words
            desc_matches = query_words & desc_words

            if title_matches:
                score += 10  # Strong match in title
            elif desc_matches:
                score += 5   # Weaker match in description

        # Convert course to dict for LLM context
        course_dict = {
            "id": str(course.id),
            "title": course.title,
            "description": course.description,
            "difficulty": course.difficulty.value,
            "duration": course.duration,
            "tags": [tag.name for tag in course.tags],
            "skills": [skill.name for skill in course.skills],
            "relevance_score": score
        }

        scored_courses.append(course_dict)

    # Sort by score (highest first)
    scored_courses.sort(key=lambda x: x["relevance_score"], reverse=True)

    # Adaptive cutoff: keep courses with score > 0, limit to 35
    filtered = [c for c in scored_courses if c["relevance_score"] > 0][:35]

    # Ensure minimum 20 courses for variety
    if len(filtered) < 20:
        remaining = [c for c in scored_courses if c not in filtered]
        filtered.extend(remaining[:20 - len(filtered)])

    logger.info(
        f"Pre-filtering: {len(courses)} → {len(filtered)} courses "
        f"(query='{user_query[:30] if user_query else 'None'}...')"
    )

    return filtered


def _score_difficulty(
    course_difficulty: DifficultyLevel,
    user_level: Optional[DifficultyLevel]
) -> float:
    """
    Score difficulty alignment (0-30 points).

    Perfect match = 30, adjacent level = 20, two levels away = 5.
    """
    if not user_level:
        return 15  # Neutral score if no level set

    levels = ["beginner", "intermediate", "advanced"]

    try:
        course_idx = levels.index(course_difficulty.value)
        user_idx = levels.index(user_level.value)
    except ValueError:
        return 15  # Neutral if unknown level

    diff = abs(course_idx - user_idx)

    if diff == 0:
        return 30  # Exact match
    elif diff == 1:
        return 20  # Adjacent level (stretch is good)
    else:
        return 5   # Two levels away (still include but low priority)


def _score_duration(
    course_hours: int,
    time_commitment: Optional[TimeCommitment]
) -> float:
    """
    Score duration feasibility (0-20 points).

    Based on whether course is completable in reasonable time.
    """
    if not time_commitment:
        return 10  # Neutral score

    # Map time commitment to weekly hours (conservative)
    hours_map = {
        "1-5": 3,
        "5-10": 7,
        "10-20": 15,
        "20+": 25
    }
    hours_per_week = hours_map.get(time_commitment.value, 5)

    # Calculate weeks to complete
    weeks = course_hours / hours_per_week if hours_per_week > 0 else 999

    if weeks <= 4:
        return 20  # Completable in a month
    elif weeks <= 8:
        return 15  # Completable in two months
    elif weeks <= 12:
        return 10  # Three months
    else:
        return 5   # Long commitment but still viable
```

---

## 6. Agent 1: Profile Analyzer

### File: `backend/llm/agents/profile_analyzer.py`

```python
"""
Profile Analyzer Agent (Agent 1).

Analyzes user profile, history, and query to understand learning needs.
Outputs structured ProfileAnalysis for Agent 2 and pre-filtering.
"""
import logging
from typing import List, Optional

from langchain_core.messages import SystemMessage, HumanMessage

from llm.config import get_llm
from llm.schemas import ProfileAnalysis
from llm.prompts.profile_analyzer import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from llm.exceptions import LLMTimeoutError, LLMValidationError
from models.user_profile import UserProfile
from models.user_profile_snapshot import UserProfileSnapshot

logger = logging.getLogger(__name__)


class ProfileAnalyzerAgent:
    """
    Agent 1: Analyzes user profile to understand learning context.

    Uses LangChain v1.0 `.with_structured_output()` for type-safe responses.
    """

    def __init__(self):
        # Get LLM with structured output enforcement
        self.llm = get_llm().with_structured_output(ProfileAnalysis)

    async def analyze(
        self,
        profile: UserProfile,
        history: List[UserProfileSnapshot],
        query: Optional[str] = None
    ) -> ProfileAnalysis:
        """
        Analyze user profile and return structured analysis.

        Args:
            profile: Current user profile
            history: Last 3 profile snapshots (for goal evolution)
            query: Optional current request

        Returns:
            ProfileAnalysis with skill level, gaps, interests, confidence

        Raises:
            LLMTimeoutError: If request times out
            LLMValidationError: If response fails validation
        """
        # Handle empty profile with default response
        if self._is_empty_profile(profile):
            logger.info(f"Empty profile for user {profile.user_id}, returning default")
            return self._default_analysis(profile, query)

        # Build prompt messages
        messages = self._build_messages(profile, history, query)

        try:
            # Invoke LLM with structured output
            result = await self.llm.ainvoke(messages)

            logger.info(
                f"Profile analysis complete: user={profile.user_id}, "
                f"level={result.skill_level}, confidence={result.confidence:.2f}"
            )

            return result

        except TimeoutError as e:
            logger.error(f"Profile analysis timeout: user={profile.user_id}")
            raise LLMTimeoutError("Profile analysis timed out") from e

        except Exception as e:
            logger.error(f"Profile analysis failed: user={profile.user_id}, error={e}")
            raise LLMValidationError(f"Failed to analyze profile: {e}") from e

    def _is_empty_profile(self, profile: UserProfile) -> bool:
        """Check if profile has minimal useful data."""
        has_goal = bool(profile.learning_goal and len(profile.learning_goal) > 10)
        has_interests = bool(profile.interests and len(profile.interests) > 0)
        return not has_goal and not has_interests

    def _default_analysis(
        self,
        profile: UserProfile,
        query: Optional[str]
    ) -> ProfileAnalysis:
        """Return low-confidence default for empty profiles."""
        return ProfileAnalysis(
            skill_level=profile.current_level.value if profile.current_level else "beginner",
            skill_gaps=["Define your learning goals", "Identify areas of interest"],
            ranked_interests=[],
            time_constraint_hours=self._parse_time_commitment(profile.time_commitment),
            learning_style_notes="Profile incomplete - please add your learning goal and interests for personalized recommendations.",
            profile_completeness="minimal",
            confidence=0.2
        )

    def _build_messages(
        self,
        profile: UserProfile,
        history: List[UserProfileSnapshot],
        query: Optional[str]
    ) -> List:
        """Build message list for LLM invocation."""
        # Format interests
        interests_text = ", ".join(
            [tag.name for tag in profile.interests]
        ) if profile.interests else "None specified"

        # Format history
        history_text = self._format_history(history)

        # Build user prompt from template
        user_prompt = USER_PROMPT_TEMPLATE.format(
            learning_goal=profile.learning_goal or "Not specified",
            current_level=profile.current_level.value if profile.current_level else "Not specified",
            time_commitment=profile.time_commitment.value if profile.time_commitment else "Not specified",
            interests=interests_text,
            profile_history=history_text,
            user_query=query or "No specific request - recommend based on my profile"
        )

        return [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_prompt)
        ]

    def _format_history(self, history: List[UserProfileSnapshot]) -> str:
        """Format profile history for context."""
        if not history:
            return "No previous profile changes recorded."

        lines = []
        for snapshot in history[-3:]:  # Last 3 snapshots
            interests = ", ".join(snapshot.interests_snapshot) if snapshot.interests_snapshot else "None"
            lines.append(
                f"- Version {snapshot.version}: "
                f"Goal: '{snapshot.learning_goal or 'None'}', "
                f"Level: {snapshot.current_level.value if snapshot.current_level else 'None'}, "
                f"Interests: [{interests}]"
            )
        return "\n".join(lines)

    def _parse_time_commitment(self, time_commitment) -> int:
        """Convert TimeCommitment enum to integer hours."""
        if not time_commitment:
            return 5
        mapping = {"1-5": 3, "5-10": 7, "10-20": 15, "20+": 25}
        return mapping.get(time_commitment.value, 5)
```

### File: `backend/llm/prompts/profile_analyzer.py`

```python
"""
Prompt templates for Profile Analyzer Agent (Agent 1).

These prompts use the DETAILED & EDUCATIONAL style for better quality.
"""

SYSTEM_PROMPT = """You are an expert learning advisor at AcmeLearn, an AI-powered education platform.

Your role is to deeply understand each learner by analyzing their profile, goals, and learning journey. You provide insightful assessments that help match learners with the perfect courses.

## Your Analysis Framework

When analyzing a learner's profile, you should:

1. **Assess True Skill Level**
   - Their stated level may not match their actual capabilities
   - Consider their goal complexity vs. current experience
   - Look for signs in their interests and learning history
   - If they say "beginner" but have advanced goals, note this mismatch

2. **Identify Specific Skill Gaps**
   - What skills do they need to achieve their stated goal?
   - Be concrete and actionable: "REST API design" not just "backend skills"
   - Consider both technical and conceptual gaps
   - Prioritize gaps by importance to their goal

3. **Rank Their Interests**
   - Order interests by relevance to their learning goal
   - The current query should influence ranking
   - Some interests may be tangential - note these lower

4. **Understand Time Constraints**
   - Calculate realistic weekly study hours
   - Consider course completion timelines
   - Factor in their commitment level

5. **Assess Profile Quality**
   - "complete": Has goal, level, time, and multiple relevant interests
   - "partial": Missing some key fields but workable
   - "minimal": Very little information to work with

6. **Set Confidence Appropriately**
   - 0.8-1.0: Complete profile, clear goal, consistent data
   - 0.5-0.7: Partial profile or some conflicting signals
   - 0.2-0.4: Minimal data, relying mostly on query
   - Below 0.2: Essentially guessing

## Important Guidelines

- Be analytical and specific - vague assessments don't help
- Reference actual profile data in your reasoning
- If data conflicts (e.g., beginner level but advanced goal), flag this
- The current query takes priority over older profile data
- Consider profile history to understand learning trajectory

Your analysis directly informs course recommendations, so focus on actionable insights."""


USER_PROMPT_TEMPLATE = """Please analyze this learner's profile for personalized course recommendations.

## Current Profile

**Learning Goal**: {learning_goal}

**Stated Skill Level**: {current_level}

**Time Commitment**: {time_commitment} hours per week

**Interests**: {interests}

## Profile History (Recent Changes)

{profile_history}

## Current Request

"{user_query}"

---

Based on all this information, provide your structured analysis including:

1. **skill_level**: Their actual/detected skill level (may differ from stated)
2. **skill_gaps**: Specific skills they need for their goal (be concrete)
3. **ranked_interests**: Their interests ordered by relevance to goal/query
4. **time_constraint_hours**: Weekly hours available (as integer)
5. **learning_style_notes**: Observations about their learning context
6. **profile_completeness**: "complete", "partial", or "minimal"
7. **confidence**: How confident you are in this analysis (0.0-1.0)

Think carefully about what this learner actually needs, not just what they've stated."""
```

---

## 7. Agent 2: Course Recommender

### File: `backend/llm/agents/course_recommender.py`

```python
"""
Course Recommender Agent (Agent 2).

Generates personalized course recommendations with rich explanations.
Uses profile analysis from Agent 1 and pre-filtered course list.
"""
import json
import logging
from typing import List, Dict, Optional

from langchain_core.messages import SystemMessage, HumanMessage

from llm.config import get_llm
from llm.schemas import ProfileAnalysis, RecommendationOutput
from llm.prompts.course_recommender import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from llm.exceptions import LLMNoCoursesError, LLMTimeoutError, LLMValidationError

logger = logging.getLogger(__name__)


class CourseRecommenderAgent:
    """
    Agent 2: Generates course recommendations based on profile analysis.

    Uses LangChain v1.0 `.with_structured_output()` for type-safe responses.
    """

    def __init__(self):
        self.llm = get_llm().with_structured_output(RecommendationOutput)

    async def recommend(
        self,
        analysis: ProfileAnalysis,
        courses: List[Dict],
        query: Optional[str] = None,
        num_courses: int = 5
    ) -> RecommendationOutput:
        """
        Generate course recommendations based on profile analysis.

        Args:
            analysis: ProfileAnalysis from Agent 1
            courses: Pre-filtered course list (dicts with id, title, etc.)
            query: Original user query
            num_courses: Number of recommendations (3-10)

        Returns:
            RecommendationOutput with courses, learning path, summary

        Raises:
            LLMNoCoursesError: If no courses to recommend
            LLMTimeoutError: If request times out
            LLMValidationError: If response fails validation
        """
        if not courses:
            raise LLMNoCoursesError("No courses available after filtering")

        # Build prompt messages
        messages = self._build_messages(analysis, courses, query, num_courses)

        try:
            # Invoke LLM with structured output
            result = await self.llm.ainvoke(messages)

            # Validate course IDs exist in filtered list
            valid_ids = {c["id"] for c in courses}
            result = self._validate_course_ids(result, valid_ids)

            logger.info(
                f"Recommendations generated: {len(result.recommendations)} courses, "
                f"{len(result.learning_path)} path steps"
            )

            return result

        except TimeoutError as e:
            logger.error("Course recommendation timeout")
            raise LLMTimeoutError("Course recommendation timed out") from e

        except Exception as e:
            logger.error(f"Course recommendation failed: {e}")
            raise LLMValidationError(f"Failed to generate recommendations: {e}") from e

    def _build_messages(
        self,
        analysis: ProfileAnalysis,
        courses: List[Dict],
        query: Optional[str],
        num_courses: int
    ) -> List:
        """Build message list for LLM invocation."""
        # Format courses for prompt (truncate descriptions to save tokens)
        courses_formatted = []
        for c in courses:
            courses_formatted.append({
                "id": c["id"],
                "title": c["title"],
                "description": c["description"][:300] + "..." if len(c["description"]) > 300 else c["description"],
                "difficulty": c["difficulty"],
                "duration_hours": c["duration"],
                "tags": c["tags"][:8],  # Limit tags
                "skills": c["skills"][:6]  # Limit skills
            })

        courses_json = json.dumps(courses_formatted, indent=2)

        # Build user prompt
        user_prompt = USER_PROMPT_TEMPLATE.format(
            skill_level=analysis.skill_level,
            skill_gaps=", ".join(analysis.skill_gaps) if analysis.skill_gaps else "None identified",
            ranked_interests=", ".join(analysis.ranked_interests) if analysis.ranked_interests else "Not specified",
            time_constraint_hours=analysis.time_constraint_hours,
            learning_style_notes=analysis.learning_style_notes,
            profile_completeness=analysis.profile_completeness,
            profile_confidence=analysis.confidence,
            courses_json=courses_json,
            user_query=query or "Recommend the best courses for my profile",
            num_courses=num_courses
        )

        return [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_prompt)
        ]

    def _validate_course_ids(
        self,
        result: RecommendationOutput,
        valid_ids: set
    ) -> RecommendationOutput:
        """Ensure all recommended course IDs exist in filtered list."""
        # Filter recommendations
        valid_recs = [r for r in result.recommendations if r.course_id in valid_ids]

        # Filter learning path
        valid_path = [s for s in result.learning_path if s.course_id in valid_ids]

        if len(valid_recs) < len(result.recommendations):
            dropped = len(result.recommendations) - len(valid_recs)
            logger.warning(f"Dropped {dropped} recommendations with invalid course IDs")

        return RecommendationOutput(
            recommendations=valid_recs,
            learning_path=valid_path,
            overall_summary=result.overall_summary
        )
```

### File: `backend/llm/prompts/course_recommender.py`

```python
"""
Prompt templates for Course Recommender Agent (Agent 2).

DETAILED & EDUCATIONAL style prompts for high-quality recommendations.
"""

SYSTEM_PROMPT = """You are an expert course recommendation specialist at AcmeLearn.

Your role is to match learners with the perfect courses from our catalog, providing rich explanations that help them understand why each course is valuable for their specific situation.

## Your Recommendation Philosophy

1. **Personalization is Key**
   - Every recommendation should reference the learner's specific profile
   - Generic explanations like "this is a good course" are not helpful
   - Connect courses to their stated goals, skill gaps, and interests

2. **Quality Over Quantity**
   - Better to recommend fewer, highly relevant courses
   - Each recommendation should have a clear reason for inclusion
   - If a course is only marginally relevant, don't include it

3. **Rich Explanations**
   - Explain WHY this course helps THIS learner
   - Reference their skill gaps and how the course addresses them
   - Mention difficulty appropriateness
   - Include time estimates based on their availability

4. **Learning Path Design**
   - The 2-3 course path should tell a story
   - Start with foundational → build to intermediate/advanced
   - Each course should prepare them for the next
   - Explain the progression logic

## Match Score Guidelines

- **0.85-1.0**: Perfect fit - addresses main goal, fills key skill gaps, right difficulty
- **0.70-0.84**: Strong match - good alignment but missing some aspects
- **0.55-0.69**: Decent match - relevant but not ideal
- **0.40-0.54**: Marginal - only partially relevant
- **Below 0.40**: Don't recommend unless options are very limited

## Important Rules

- ONLY recommend courses from the provided list
- Use the EXACT course IDs provided
- Reference actual course content in explanations
- Lower confidence if profile analysis confidence was low
- If few courses match well, say so honestly rather than padding

Your recommendations directly impact learners' education paths, so be thoughtful and precise."""


USER_PROMPT_TEMPLATE = """Generate personalized course recommendations for this learner.

## Profile Analysis (from our learning advisor)

**Detected Skill Level**: {skill_level}

**Identified Skill Gaps**: {skill_gaps}

**Ranked Interests**: {ranked_interests}

**Time Available**: {time_constraint_hours} hours per week

**Learning Context**: {learning_style_notes}

**Profile Quality**: {profile_completeness} (confidence: {profile_confidence})

## Learner's Request

"{user_query}"

## Available Courses

You MUST only recommend courses from this list. Use the exact course IDs.

```json
{courses_json}
```

## Your Task

1. Select the TOP {num_courses} courses that best match this learner's needs
2. Order them by match_score (best first)
3. For EACH course, provide:
   - A match_score (0.0-1.0) based on fit
   - A rich, personalized explanation (3-5 sentences)
   - Which skill_gaps it addresses (use exact terms)
   - fit_reasons (2-4 key reasons)
   - estimated_weeks to complete (based on their time)

4. Design a 2-3 course LEARNING PATH:
   - Choose the best sequence of courses
   - Order: foundational → intermediate → advanced
   - Explain why each course is at that position

5. Write an overall_summary (2-3 sentences) explaining your recommendation strategy

Remember: Be specific and personal. Reference their actual goals, gaps, and interests."""
```

---

## 8. Service Layer Integration

### Extended `backend/services/recommendation_service.py`

Add this method to the existing `RecommendationService` class:

```python
async def generate_recommendations(
    self,
    user_id: uuid.UUID,
    query: Optional[str] = None,
    num_recommendations: int = 5
) -> dict:
    """
    Generate AI-powered course recommendations.

    Orchestrates the 2-agent pipeline:
    1. Check rate limit
    2. Load profile and history
    3. Pre-filter courses
    4. Agent 1: Analyze profile
    5. Agent 2: Generate recommendations
    6. Store and return results

    Args:
        user_id: User's UUID
        query: Optional learning request
        num_recommendations: Number of courses (3-10)

    Returns:
        Dict with recommendation_id, courses, learning_path, etc.

    Raises:
        HTTPException 429: Rate limit exceeded
        LLMEmptyProfileError: Profile too empty
        LLMNoCoursesError: No matching courses
        LLMTimeoutError: LLM timeout
        LLMValidationError: Invalid LLM response
    """
    from llm.agents.profile_analyzer import ProfileAnalyzerAgent
    from llm.agents.course_recommender import CourseRecommenderAgent
    from llm.filters import filter_courses
    from repositories.course_repository import CourseRepository

    # 1. Check rate limit (existing method)
    await self.check_rate_limit(user_id)

    # 2. Load profile and history
    profile = await self.profile_repo.get_profile_by_user_id(user_id)
    if not profile:
        raise ValueError(f"Profile not found for user {user_id}")

    snapshots = await self.profile_repo.get_snapshots(profile.id, limit=3)

    # 3. Load and pre-filter courses
    course_repo = CourseRepository(self.db)
    all_courses = await course_repo.get_all_with_relationships()
    filtered_courses = filter_courses(all_courses, profile, query)

    # 4. Agent 1: Profile Analysis
    analyzer = ProfileAnalyzerAgent()
    profile_analysis = await analyzer.analyze(
        profile=profile,
        history=snapshots,
        query=query
    )

    # 5. Agent 2: Course Recommendations
    recommender = CourseRecommenderAgent()
    recommendation = await recommender.recommend(
        analysis=profile_analysis,
        courses=filtered_courses,
        query=query,
        num_courses=num_recommendations
    )

    # 6. Store recommendation with full structured data
    course_ids = [uuid.UUID(r.course_id) for r in recommendation.recommendations]

    stored = await self.repo.create_recommendation(
        user_id=user_id,
        profile_version=profile.version,
        recommended_course_ids=course_ids,
        explanation=recommendation.overall_summary,
        query=query,
        llm_model="gpt-5-nano",
        profile_analysis_data=profile_analysis.model_dump(),
        recommendation_details=recommendation.model_dump()
    )

    # 7. Build response with course titles
    course_titles = {str(c.id): c.title for c in all_courses}

    return {
        "recommendation_id": stored.id,
        "profile_analysis": {
            "skill_level": profile_analysis.skill_level,
            "skill_gaps": profile_analysis.skill_gaps,
            "confidence": profile_analysis.confidence
        },
        "courses": [
            {
                "course_id": uuid.UUID(r.course_id),
                "title": course_titles.get(r.course_id, "Unknown"),
                "match_score": r.match_score,
                "explanation": r.explanation,
                "skill_gaps_addressed": r.skill_gaps_addressed,
                "fit_reasons": r.fit_reasons,
                "estimated_weeks": r.estimated_weeks
            }
            for r in recommendation.recommendations
        ],
        "learning_path": [
            {
                "order": step.order,
                "course_id": uuid.UUID(step.course_id),
                "title": course_titles.get(step.course_id, "Unknown"),
                "rationale": step.rationale
            }
            for step in recommendation.learning_path
        ],
        "overall_summary": recommendation.overall_summary
    }
```

---

## 9. API Endpoint

### File: `backend/api/recommendations.py`

```python
"""
AI-powered recommendation API endpoints.

POST /recommendations/generate - Generate new recommendations
GET /recommendations/history - Get past recommendations (existing)
GET /recommendations/quota - Check remaining quota (existing)
"""
import uuid
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_async_session
from core.users import current_active_user
from models.user import User
from services.recommendation_service import RecommendationService
from llm.exceptions import (
    LLMEmptyProfileError,
    LLMNoCoursesError,
    LLMTimeoutError,
    LLMValidationError
)


router = APIRouter()


# ============================================================
# Request/Response Schemas
# ============================================================

class RecommendationRequest(BaseModel):
    """Request to generate AI recommendations."""
    query: Optional[str] = Field(
        None,
        max_length=500,
        description="What you want to learn (optional)",
        examples=["I want to learn machine learning for data analysis"]
    )
    num_recommendations: int = Field(
        5,
        ge=3,
        le=10,
        description="Number of courses to recommend"
    )


class CourseResponse(BaseModel):
    """Single course in recommendations."""
    course_id: uuid.UUID
    title: str
    match_score: float
    explanation: str
    skill_gaps_addressed: List[str]
    fit_reasons: List[str]
    estimated_weeks: int


class LearningPathStepResponse(BaseModel):
    """Step in learning path."""
    order: int
    course_id: uuid.UUID
    title: str
    rationale: str


class ProfileAnalysisSummary(BaseModel):
    """Summary of profile analysis for response."""
    skill_level: str
    skill_gaps: List[str]
    confidence: float


class RecommendationResponse(BaseModel):
    """Full recommendation response."""
    recommendation_id: uuid.UUID
    profile_analysis: ProfileAnalysisSummary
    courses: List[CourseResponse]
    learning_path: List[LearningPathStepResponse]
    overall_summary: str


# ============================================================
# Endpoints
# ============================================================

@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(
    request: RecommendationRequest,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Generate personalized AI course recommendations.

    Uses a 2-agent architecture:
    1. **Profile Analyzer**: Understands your learning context
    2. **Course Recommender**: Matches courses to your needs

    **Rate Limit**: 10 requests per 24 hours

    **Tip**: Complete your profile (learning goal, interests) for better results.
    """
    service = RecommendationService(db)

    try:
        result = await service.generate_recommendations(
            user_id=user.id,
            query=request.query,
            num_recommendations=request.num_recommendations
        )

        return RecommendationResponse(
            recommendation_id=result["recommendation_id"],
            profile_analysis=ProfileAnalysisSummary(**result["profile_analysis"]),
            courses=[CourseResponse(**c) for c in result["courses"]],
            learning_path=[LearningPathStepResponse(**s) for s in result["learning_path"]],
            overall_summary=result["overall_summary"]
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except LLMEmptyProfileError:
        raise HTTPException(
            status_code=400,
            detail="Please complete your profile with a learning goal and interests."
        )

    except LLMNoCoursesError:
        raise HTTPException(
            status_code=400,
            detail="No courses match your preferences. Try adjusting your interests."
        )

    except LLMTimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Recommendation engine is slow. Please try again."
        )

    except LLMValidationError:
        raise HTTPException(
            status_code=500,
            detail="Error generating recommendations. Please try again."
        )
```

### Register in `backend/main.py`:

```python
from api import recommendations

# Add with other routers
app.include_router(
    recommendations.router,
    prefix="/recommendations",
    tags=["recommendations"]
)
```

---

## 10. Database Updates

### Migration: Add JSONB columns

```python
"""Add structured data columns to recommendations

Revision ID: xxx_add_recommendation_jsonb
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


def upgrade():
    op.add_column('recommendations', sa.Column(
        'profile_analysis_data',
        JSONB,
        nullable=True,
        comment='ProfileAnalysis JSON from Agent 1'
    ))

    op.add_column('recommendations', sa.Column(
        'recommendation_details',
        JSONB,
        nullable=True,
        comment='Full RecommendationOutput JSON with scores and learning path'
    ))


def downgrade():
    op.drop_column('recommendations', 'recommendation_details')
    op.drop_column('recommendations', 'profile_analysis_data')
```

### Update `backend/models/recommendation.py`:

Add these columns to the Recommendation class:

```python
# Structured data storage (JSONB)
profile_analysis_data: Mapped[Optional[dict]] = mapped_column(
    JSONB,
    nullable=True,
    comment="ProfileAnalysis JSON from Agent 1"
)

recommendation_details: Mapped[Optional[dict]] = mapped_column(
    JSONB,
    nullable=True,
    comment="Full recommendation details: courses with scores, learning path"
)
```

### Update `backend/repositories/recommendation_repository.py`:

Update `create_recommendation()` to accept new parameters:

```python
async def create_recommendation(
    self,
    user_id: uuid.UUID,
    profile_version: int,
    recommended_course_ids: List[uuid.UUID],
    explanation: str,
    query: Optional[str] = None,
    llm_model: Optional[str] = None,
    profile_analysis_data: Optional[dict] = None,
    recommendation_details: Optional[dict] = None,
) -> Recommendation:
    # ... existing code ...

    recommendation = Recommendation(
        user_id=user_id,
        profile_version=profile_version,
        query=query,
        recommended_course_ids=course_ids_json,
        explanation=explanation,
        llm_model=llm_model,
        profile_analysis_data=profile_analysis_data,
        recommendation_details=recommendation_details,
    )
    # ... rest of method ...
```

---

## 11. Course Repository

### File: `backend/repositories/course_repository.py`

```python
"""
Course repository for data access.

Provides course queries with eager-loaded relationships.
"""
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.course import Course


class CourseRepository:
    """Repository for Course data access."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_with_relationships(self) -> List[Course]:
        """
        Get all courses with tags and skills eagerly loaded.

        Used by pre-filtering to avoid N+1 queries.

        Returns:
            List of Course objects with populated relationships
        """
        result = await self.db.execute(
            select(Course)
            .options(
                selectinload(Course.tags),
                selectinload(Course.skills)
            )
        )
        return list(result.scalars().all())
```

---

## 12. Dependencies

### Add to `backend/pyproject.toml`:

```toml
[project]
dependencies = [
    # ... existing deps ...
    "langchain>=0.3.0",
    "langchain-openai>=0.2.0",
    "tenacity>=8.2.0",
]
```

---

## 13. Error Handling Summary

| Scenario | Exception | HTTP | User Message |
|----------|-----------|------|--------------|
| LLM invalid JSON | `LLMValidationError` | 500 | "Error generating recommendations. Please try again." |
| LLM timeout (>30s) | `LLMTimeoutError` | 504 | "Recommendation engine is slow. Please try again." |
| Profile empty | `LLMEmptyProfileError` | 400 | "Please complete your profile with a learning goal and interests." |
| No matching courses | `LLMNoCoursesError` | 400 | "No courses match your preferences. Try adjusting your interests." |
| Rate limit (>10/24h) | `HTTPException(429)` | 429 | "Rate limit exceeded. Maximum 10 recommendations per 24 hours." |
| Profile not found | `ValueError` | 400 | "Profile not found for user {id}" |

---

## 14. Testing Checklist

### Unit Tests
- [ ] `ProfileAnalysis` Pydantic model validation
- [ ] `RecommendationOutput` Pydantic model validation
- [ ] `filter_courses()` scoring algorithm
- [ ] `_score_difficulty()` with all level combinations
- [ ] `_score_duration()` with all time commitments

### Integration Tests
- [ ] `ProfileAnalyzerAgent.analyze()` with mock LLM
- [ ] `CourseRecommenderAgent.recommend()` with mock LLM
- [ ] `RecommendationService.generate_recommendations()` full flow
- [ ] API endpoint with valid request
- [ ] API endpoint with empty profile
- [ ] API endpoint with rate limit exceeded

### E2E Tests (with real LLM)
- [ ] Complete profile → 5 recommendations
- [ ] Partial profile → lower confidence
- [ ] Specific query → query-aligned results
- [ ] Edge case: conflicting profile data

---

**Document Status**: Implementation Ready
**Related**: `01-TECHNICAL-LANDSCAPE.md` (decisions), `02-PRODUCT-STRATEGY.md` (features)
