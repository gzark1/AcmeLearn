"""
Course pre-filtering logic.

Reduces course list before LLM to minimize tokens while maintaining quality.
Uses QUERY-FIRST scoring: user's request is primary, profile is enrichment.

Target: 48 courses → ~20 courses (tighter filtering for token efficiency)
"""

import logging
import re
from typing import Dict, List, Optional

from models.course import Course
from models.enums import DifficultyLevel, TimeCommitment
from models.user_profile import UserProfile

logger = logging.getLogger(__name__)

# Description truncation for token savings
MAX_DESCRIPTION_LENGTH = 150


def filter_courses(
    courses: List[Course],
    profile: UserProfile,
    user_query: Optional[str] = None,
) -> List[Dict]:
    """
    Pre-filter and score courses before LLM processing.

    QUERY-FIRST Scoring Strategy (max 100 points):
    - Query matching: 0-50 points (PRIMARY - what they asked for)
    - Profile matching: 0-50 points (ENRICHMENT - who they are)

    Query scoring (when query present):
      - Title match: +30 points (direct relevance)
      - Tag match: +20 points (categorical relevance)
      - Description match: +15 points (content relevance)
      - Capped at 50 total

    Profile scoring:
      - Tag/interest overlap: 0-25 points
      - Difficulty alignment: 0-15 points
      - Duration feasibility: 0-10 points

    When NO query: Profile scoring becomes primary driver.

    Args:
        courses: All available courses (48)
        profile: User's profile with interests, level, time
        user_query: User's learning request (PRIMARY driver when present)

    Returns:
        List of course dicts with 'relevance_score', sorted by score.
        Target size: ~20 courses (token-efficient).
    """
    scored_courses = []

    # Extract user interests as lowercase set
    user_interest_names = set()
    if profile.interests:
        user_interest_names = {tag.name.lower() for tag in profile.interests}

    # Parse query keywords (simple tokenization)
    query_words = set()
    has_query = bool(user_query and user_query.strip())
    if has_query:
        # Extract words, filter short ones and common stop words
        stop_words = {"the", "and", "for", "with", "about", "want", "need", "help", "please"}
        query_words = {
            w.lower()
            for w in re.findall(r"\w+", user_query)
            if len(w) > 2 and w.lower() not in stop_words
        }

    for course in courses:
        query_score = 0.0
        profile_score = 0.0

        # ===== QUERY SCORING (0-50 points) - PRIMARY when query present =====
        if query_words:
            title_lower = course.title.lower()
            title_words = set(re.findall(r"\w+", title_lower))
            course_tag_names_lower = {tag.name.lower() for tag in course.tags}
            desc_lower = course.description[:500].lower()
            desc_words = set(re.findall(r"\w+", desc_lower))

            # Title match: strongest signal (+30)
            title_matches = query_words & title_words
            # Also check if query words appear as substrings in title
            title_substring_match = any(qw in title_lower for qw in query_words)
            if title_matches or title_substring_match:
                query_score += 30

            # Tag match: categorical relevance (+20)
            # Check both exact match and substring match in tags
            tag_matches = query_words & course_tag_names_lower
            tag_substring_match = any(
                qw in tag_name
                for qw in query_words
                for tag_name in course_tag_names_lower
            )
            if tag_matches or tag_substring_match:
                query_score += 20

            # Description match: content relevance (+15)
            desc_matches = query_words & desc_words
            desc_substring_match = any(qw in desc_lower for qw in query_words)
            if desc_matches or desc_substring_match:
                query_score += 15

            # Cap query score at 50
            query_score = min(query_score, 50)

        # ===== PROFILE SCORING (0-50 points) - ENRICHMENT =====

        # Tag/interest overlap (0-25 points)
        course_tag_names = {tag.name.lower() for tag in course.tags}
        overlap_count = len(user_interest_names & course_tag_names)
        profile_score += min(overlap_count * 8, 25)  # 8 points per match, max 25

        # Difficulty alignment (0-15 points)
        profile_score += _score_difficulty(course.difficulty, profile.current_level)

        # Duration feasibility (0-10 points)
        profile_score += _score_duration(course.duration, profile.time_commitment)

        # ===== TOTAL SCORE =====
        # When query present: query_score + profile_score (query dominates)
        # When no query: profile_score is the only score (profile drives)
        total_score = query_score + profile_score

        # Convert course to dict for LLM context
        # Truncate description for token savings
        truncated_desc = course.description[:MAX_DESCRIPTION_LENGTH]
        if len(course.description) > MAX_DESCRIPTION_LENGTH:
            truncated_desc = truncated_desc.rsplit(" ", 1)[0] + "..."

        course_dict = {
            "id": str(course.id),
            "title": course.title,
            "description": truncated_desc,
            "difficulty": course.difficulty.value,
            "duration": course.duration,
            "tags": [tag.name for tag in course.tags],
            "relevance_score": total_score,
        }

        scored_courses.append(course_dict)

    # Sort by score (highest first)
    scored_courses.sort(key=lambda x: x["relevance_score"], reverse=True)

    # When query is present, prioritize query-matching courses
    if has_query:
        # Courses with query_score > 0 should come first
        # We already scored them higher, but ensure minimum query relevance
        filtered = [c for c in scored_courses if c["relevance_score"] > 0][:20]
    else:
        # No query: just use profile scoring, limit to 20
        filtered = [c for c in scored_courses if c["relevance_score"] > 0][:20]

    # Ensure minimum 10 courses for variety (reduced from 20)
    if len(filtered) < 10:
        remaining = [c for c in scored_courses if c not in filtered]
        filtered.extend(remaining[: 10 - len(filtered)])

    query_preview = user_query[:30] if user_query else "None"
    logger.info(
        f"Pre-filtering: {len(courses)} → {len(filtered)} courses "
        f"(query='{query_preview}...', has_query={has_query})"
    )

    return filtered


def _score_difficulty(
    course_difficulty: DifficultyLevel,
    user_level: Optional[DifficultyLevel],
) -> float:
    """
    Score difficulty alignment (0-15 points).

    Perfect match = 15, adjacent level = 10, two levels away = 3.
    """
    if not user_level:
        return 8  # Neutral score if no level set

    levels = ["beginner", "intermediate", "advanced"]

    try:
        course_idx = levels.index(course_difficulty.value)
        user_idx = levels.index(user_level.value)
    except ValueError:
        return 8  # Neutral if unknown level

    diff = abs(course_idx - user_idx)

    if diff == 0:
        return 15  # Exact match
    elif diff == 1:
        return 10  # Adjacent level (stretch is good)
    else:
        return 3  # Two levels away (still include but low priority)


def _score_duration(
    course_hours: int,
    time_commitment: Optional[TimeCommitment],
) -> float:
    """
    Score duration feasibility (0-10 points).

    Based on whether course is completable in reasonable time.
    """
    if not time_commitment:
        return 5  # Neutral score

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
        return 10  # Completable in a month
    elif weeks <= 8:
        return 7  # Completable in two months
    elif weeks <= 12:
        return 5  # Three months
    else:
        return 2  # Long commitment but still viable
