"""
Tests for AI recommendation endpoints.

Tests quota and history endpoints (LLM generation tested manually).
"""
import uuid

import pytest_asyncio
from sqlalchemy import text
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))


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


# ============================================================
# Tests
# ============================================================

async def test_generate_recommendations_unauthenticated(client):
    """Test recommendation endpoint requires authentication."""
    response = await client.post(
        "/users/me/recommendations",
        json={"query": "test"}
    )
    assert response.status_code == 401


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
