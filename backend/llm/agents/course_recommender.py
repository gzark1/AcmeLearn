"""
Course Recommender Agent (Agent 2).

Generates personalized course recommendations with rich explanations.
Uses profile analysis from Agent 1 and pre-filtered course list.
"""

import json
import logging
from typing import Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage

from llm.config import get_llm
from llm.exceptions import LLMNoCoursesError, LLMTimeoutError, LLMValidationError
from llm.prompts.course_recommender import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from llm.schemas import ProfileAnalysis, RecommendationOutput

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
        num_courses: int = 5,
        callbacks: Optional[List] = None,
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
            # Invoke LLM with structured output and optional callbacks
            config = {"callbacks": callbacks} if callbacks else {}
            result = await self.llm.ainvoke(messages, config=config)

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
        num_courses: int,
    ) -> List:
        """Build message list for LLM invocation."""
        # Format courses for prompt (descriptions already truncated by filter)
        courses_formatted = []
        for c in courses:
            courses_formatted.append(
                {
                    "id": c["id"],
                    "title": c["title"],
                    "description": c["description"],  # Already truncated by filter
                    "difficulty": c["difficulty"],
                    "duration_hours": c["duration"],
                    "tags": c["tags"][:8],  # Limit tags for token savings
                }
            )

        courses_json = json.dumps(courses_formatted, indent=2)

        # Build user prompt
        user_prompt = USER_PROMPT_TEMPLATE.format(
            skill_level=analysis.skill_level,
            skill_gaps=(
                ", ".join(analysis.skill_gaps[:3]) if analysis.skill_gaps else "None identified"
            ),
            time_constraint_hours=analysis.time_constraint_hours,
            personalization_note=analysis.personalization_note,
            profile_completeness=analysis.profile_completeness,
            profile_confidence=analysis.confidence,
            courses_json=courses_json,
            user_query=query or "Recommend the best courses for my profile",
            num_courses=num_courses,
        )

        return [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]

    def _validate_course_ids(
        self,
        result: RecommendationOutput,
        valid_ids: set,
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
            overall_summary=result.overall_summary,
        )
