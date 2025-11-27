"""
Tests for AI recommendation endpoints.

Tests use mocked LLM responses for speed and reliability.
"""
import uuid
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from sqlalchemy import select, text
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))

from models.user_profile import UserProfile
from models.enums import DifficultyLevel, TimeCommitment
from llm.schemas import ProfileAnalysis, RecommendationOutput, CourseRecommendation, LearningPathStep


# ============================================================
# Fixtures
# ============================================================

@pytest_asyncio.fixture
async def user_with_profile(client, test_db):
    """Create user with complete profile for recommendations."""
    # Register user
    response = await client.post(
        "/auth/register",
        json={"email": "recommender@test.com", "password": "TestPass123"}
    )
    user_id = response.json()["id"]

    # Get tags for interests
    result = await test_db.execute(
        text("SELECT id FROM tags WHERE name IN ('python', 'machine-learning') LIMIT 2")
    )
    tag_ids = [str(row[0]) for row in result.fetchall()]

    # Login and update profile
    login_resp = await client.post(
        "/auth/jwt/login",
        data={"username": "recommender@test.com", "password": "TestPass123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    await client.patch(
        "/profiles/me",
        headers=headers,
        json={
            "learning_goal": "Learn machine learning for data science career",
            "current_level": "intermediate",
            "time_commitment": "5-10",
            "interest_tag_ids": tag_ids
        }
    )

    return {"user_id": user_id, "headers": headers}


def mock_profile_analysis():
    """Return a valid ProfileAnalysis for mocking."""
    return ProfileAnalysis(
        skill_level="intermediate",
        skill_gaps=["Deep learning fundamentals", "Neural network architectures"],
        ranked_interests=["machine-learning", "python", "data-science"],
        time_constraint_hours=7,
        learning_style_notes="Career changer focused on practical ML skills",
        profile_completeness="complete",
        confidence=0.85
    )


def mock_recommendation_output(course_ids: list):
    """Return a valid RecommendationOutput for mocking."""
    return RecommendationOutput(
        recommendations=[
            CourseRecommendation(
                course_id=course_ids[0],
                match_score=0.92,
                explanation="This course covers foundational ML concepts...",
                skill_gaps_addressed=["Deep learning fundamentals"],
                fit_reasons=["Matches goal", "Right difficulty"],
                estimated_weeks=4
            ),
            CourseRecommendation(
                course_id=course_ids[1],
                match_score=0.85,
                explanation="Builds on ML fundamentals with neural networks...",
                skill_gaps_addressed=["Neural network architectures"],
                fit_reasons=["Covers skill gap", "Aligns with interests"],
                estimated_weeks=6
            )
        ],
        learning_path=[
            LearningPathStep(order=1, course_id=course_ids[0], rationale="Foundation first"),
            LearningPathStep(order=2, course_id=course_ids[1], rationale="Advanced concepts")
        ],
        overall_summary="Personalized learning path focused on ML fundamentals to neural networks."
    )


# ============================================================
# Tests
# ============================================================

async def test_generate_recommendations_success(client, user_with_profile, test_db):
    """Test successful recommendation generation with mocked LLM."""
    # Get some course IDs for mock
    result = await test_db.execute(text("SELECT id FROM courses LIMIT 2"))
    course_ids = [str(row[0]) for row in result.fetchall()]

    with patch('services.recommendation_service.ProfileAnalyzerAgent') as MockAnalyzer, \
         patch('services.recommendation_service.CourseRecommenderAgent') as MockRecommender:

        # Setup mocks
        mock_analyzer = AsyncMock()
        mock_analyzer.analyze.return_value = mock_profile_analysis()
        MockAnalyzer.return_value = mock_analyzer

        mock_recommender = AsyncMock()
        mock_recommender.recommend.return_value = mock_recommendation_output(course_ids)
        MockRecommender.return_value = mock_recommender

        response = await client.post(
            "/users/me/recommendations",
            headers=user_with_profile["headers"],
            json={"query": "I want to learn ML", "num_recommendations": 5}
        )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "profile_analysis" in data
    assert len(data["courses"]) >= 1
    assert len(data["learning_path"]) >= 1


async def test_generate_recommendations_unauthenticated(client):
    """Test recommendation endpoint requires authentication."""
    response = await client.post(
        "/users/me/recommendations",
        json={"query": "test"}
    )
    assert response.status_code == 401


async def test_generate_recommendations_rate_limit(client, user_with_profile, test_db):
    """Test rate limit enforcement (10 per 24 hours)."""
    # Insert 10 recent recommendations directly
    user_id = user_with_profile["user_id"]
    for i in range(10):
        await test_db.execute(
            text("""
                INSERT INTO recommendations (id, user_id, profile_version, recommended_course_ids, explanation, created_at)
                VALUES (:id, :user_id, 1, '[]', 'test', NOW())
            """),
            {"id": str(uuid.uuid4()), "user_id": user_id}
        )
    await test_db.commit()

    response = await client.post(
        "/users/me/recommendations",
        headers=user_with_profile["headers"],
        json={"query": "test"}
    )

    assert response.status_code == 429
    assert "rate limit" in response.json()["detail"].lower()


async def test_get_recommendations_history(client, user_with_profile, test_db):
    """Test fetching recommendation history."""
    response = await client.get(
        "/users/me/recommendations",
        headers=user_with_profile["headers"]
    )

    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "count" in data


async def test_get_recommendation_quota(client, user_with_profile):
    """Test quota endpoint returns correct structure."""
    response = await client.get(
        "/users/me/recommendation-quota",
        headers=user_with_profile["headers"]
    )

    assert response.status_code == 200
    data = response.json()
    assert "used" in data
    assert "limit" in data
    assert "remaining" in data
    assert data["limit"] == 10


async def test_quota_reflects_usage(client, user_with_profile, test_db):
    """Test quota decreases with usage."""
    user_id = user_with_profile["user_id"]

    # Check initial quota
    response1 = await client.get(
        "/users/me/recommendation-quota",
        headers=user_with_profile["headers"]
    )
    initial_remaining = response1.json()["remaining"]
    assert initial_remaining == 10

    # Insert 3 recommendations
    for i in range(3):
        await test_db.execute(
            text("""
                INSERT INTO recommendations (id, user_id, profile_version, recommended_course_ids, explanation, created_at)
                VALUES (:id, :user_id, 1, '[]', 'test', NOW())
            """),
            {"id": str(uuid.uuid4()), "user_id": user_id}
        )
    await test_db.commit()

    # Check updated quota
    response2 = await client.get(
        "/users/me/recommendation-quota",
        headers=user_with_profile["headers"]
    )
    data = response2.json()
    assert data["used"] == 3
    assert data["remaining"] == 7
