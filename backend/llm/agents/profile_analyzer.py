"""
Profile Analyzer Agent (Agent 1).

Analyzes user profile, history, and query to understand learning needs.
Outputs structured ProfileAnalysis for Agent 2 and pre-filtering.
"""

import logging
from typing import List, Optional

from langchain_core.messages import HumanMessage, SystemMessage

from llm.config import get_llm
from llm.exceptions import LLMTimeoutError, LLMValidationError
from llm.prompts.profile_analyzer import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from llm.schemas import ProfileAnalysis
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
        query: Optional[str] = None,
        callbacks: Optional[List] = None,
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
            # Invoke LLM with structured output and optional callbacks
            config = {"callbacks": callbacks} if callbacks else {}
            result = await self.llm.ainvoke(messages, config=config)

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
        query: Optional[str],
    ) -> ProfileAnalysis:
        """Return low-confidence default for empty profiles."""
        return ProfileAnalysis(
            skill_level=profile.current_level.value if profile.current_level else "beginner",
            skill_gaps=["Define your learning goals", "Identify areas of interest"],
            ranked_interests=[],
            time_constraint_hours=self._parse_time_commitment(profile.time_commitment),
            learning_style_notes="Profile incomplete - please add your learning goal and interests for personalized recommendations.",
            profile_completeness="minimal",
            confidence=0.2,
        )

    def _build_messages(
        self,
        profile: UserProfile,
        history: List[UserProfileSnapshot],
        query: Optional[str],
    ) -> List:
        """Build message list for LLM invocation."""
        # Format interests
        interests_text = (
            ", ".join([tag.name for tag in profile.interests])
            if profile.interests
            else "None specified"
        )

        # Format history
        history_text = self._format_history(history)

        # Get time commitment string
        time_str = profile.time_commitment.value if profile.time_commitment else "Not specified"

        # Build user prompt from template
        user_prompt = USER_PROMPT_TEMPLATE.format(
            learning_goal=profile.learning_goal or "Not specified",
            current_level=profile.current_level.value if profile.current_level else "Not specified",
            time_commitment=time_str,
            interests=interests_text,
            profile_history=history_text,
            user_query=query or "No specific request - recommend based on my profile",
        )

        return [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]

    def _format_history(self, history: List[UserProfileSnapshot]) -> str:
        """Format profile history for context."""
        if not history:
            return "No previous profile changes recorded."

        lines = []
        for snapshot in history[-3:]:  # Last 3 snapshots
            interests = (
                ", ".join(snapshot.interests_snapshot)
                if snapshot.interests_snapshot
                else "None"
            )
            level_str = snapshot.current_level.value if snapshot.current_level else "None"
            lines.append(
                f"- Version {snapshot.version}: "
                f"Goal: '{snapshot.learning_goal or 'None'}', "
                f"Level: {level_str}, "
                f"Interests: [{interests}]"
            )
        return "\n".join(lines)

    def _parse_time_commitment(self, time_commitment) -> int:
        """Convert TimeCommitment enum to integer hours."""
        if not time_commitment:
            return 5
        mapping = {"1-5": 3, "5-10": 7, "10-20": 15, "20+": 25}
        return mapping.get(time_commitment.value, 5)
