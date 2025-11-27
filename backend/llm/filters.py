"""
Course pre-filtering logic.

Reduces course list before LLM to minimize tokens while maintaining quality.
Uses scoring algorithm to rank relevance.

Target: 48 courses → ~30 courses (moderate filtering)
"""

import logging
import re
from typing import Dict, List, Optional

from models.course import Course
from models.enums import DifficultyLevel, TimeCommitment
from models.user_profile import UserProfile

logger = logging.getLogger(__name__)


def filter_courses(
    courses: List[Course],
    profile: UserProfile,
    user_query: Optional[str] = None,
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
        query_words = {w.lower() for w in re.findall(r"\w+", user_query) if len(w) > 2}

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
            title_words = {w.lower() for w in re.findall(r"\w+", course.title)}
            desc_words = {w.lower() for w in re.findall(r"\w+", course.description[:500])}

            title_matches = query_words & title_words
            desc_matches = query_words & desc_words

            if title_matches:
                score += 10  # Strong match in title
            elif desc_matches:
                score += 5  # Weaker match in description

        # Convert course to dict for LLM context
        course_dict = {
            "id": str(course.id),
            "title": course.title,
            "description": course.description,
            "difficulty": course.difficulty.value,
            "duration": course.duration,
            "tags": [tag.name for tag in course.tags],
            "skills": [skill.name for skill in course.skills],
            "relevance_score": score,
        }

        scored_courses.append(course_dict)

    # Sort by score (highest first)
    scored_courses.sort(key=lambda x: x["relevance_score"], reverse=True)

    # Adaptive cutoff: keep courses with score > 0, limit to 35
    filtered = [c for c in scored_courses if c["relevance_score"] > 0][:35]

    # Ensure minimum 20 courses for variety
    if len(filtered) < 20:
        remaining = [c for c in scored_courses if c not in filtered]
        filtered.extend(remaining[: 20 - len(filtered)])

    query_preview = user_query[:30] if user_query else "None"
    logger.info(
        f"Pre-filtering: {len(courses)} → {len(filtered)} courses "
        f"(query='{query_preview}...')"
    )

    return filtered


def _score_difficulty(
    course_difficulty: DifficultyLevel,
    user_level: Optional[DifficultyLevel],
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
        return 5  # Two levels away (still include but low priority)


def _score_duration(
    course_hours: int,
    time_commitment: Optional[TimeCommitment],
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
        "20+": 25,
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
        return 5  # Long commitment but still viable
