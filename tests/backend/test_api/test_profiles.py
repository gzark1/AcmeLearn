"""
Tests for user profile endpoints.

Tests profile CRUD operations, snapshot creation, and validation.
"""
import pytest
from sqlalchemy import select
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))

from models.user_profile import UserProfile
from models.user_profile_snapshot import UserProfileSnapshot
from models.enums import DifficultyLevel, TimeCommitment


async def test_get_profile_authenticated(client, auth_headers, test_user_profile):
    """Test authenticated user can get their profile."""
    response = await client.get("/profiles/me", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == str(test_user_profile.user_id)
    assert data["version"] == 1
    assert "interests" in data


async def test_get_profile_unauthenticated_returns_401(client):
    """Test unauthenticated request returns 401."""
    response = await client.get("/profiles/me")

    assert response.status_code == 401


async def test_update_profile_creates_snapshot(client, auth_headers, test_db, test_user):
    """Test updating profile creates a snapshot."""
    # Update profile
    response = await client.patch(
        "/profiles/me",
        headers=auth_headers,
        json={
            "learning_goal": "Become a data scientist",
            "current_level": "beginner"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["learning_goal"] == "Become a data scientist"
    assert data["version"] == 2  # Incremented

    # Check snapshot was created
    result = await test_db.execute(
        select(UserProfileSnapshot)
        .join(UserProfile)
        .where(UserProfile.user_id == test_user.id)
        .where(UserProfileSnapshot.version == 2)
    )
    snapshot = result.scalar_one()

    assert snapshot.learning_goal == "Become a data scientist"
    assert snapshot.current_level == DifficultyLevel.BEGINNER
    assert snapshot.version == 2


async def test_update_profile_increments_version(client, auth_headers):
    """Test multiple updates increment version correctly."""
    # First update
    response1 = await client.patch(
        "/profiles/me",
        headers=auth_headers,
        json={"learning_goal": "Goal 1"}
    )
    assert response1.json()["version"] == 2

    # Second update
    response2 = await client.patch(
        "/profiles/me",
        headers=auth_headers,
        json={"learning_goal": "Goal 2"}
    )
    assert response2.json()["version"] == 3

    # Third update
    response3 = await client.patch(
        "/profiles/me",
        headers=auth_headers,
        json={"learning_goal": "Goal 3"}
    )
    assert response3.json()["version"] == 4


async def test_update_time_commitment_with_enum(client, auth_headers):
    """Test updating time_commitment with valid enum value."""
    response = await client.patch(
        "/profiles/me",
        headers=auth_headers,
        json={"time_commitment": "10-20"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["time_commitment"] == "10-20"


async def test_update_time_commitment_invalid_enum_rejected(client, auth_headers):
    """Test invalid time_commitment value is rejected."""
    response = await client.patch(
        "/profiles/me",
        headers=auth_headers,
        json={"time_commitment": "invalid-value"}
    )

    assert response.status_code == 422  # Validation error


async def test_update_interests_with_tag_ids(client, auth_headers, test_db):
    """Test updating user interests with tag IDs."""
    # Get some tag IDs
    from backend.models.course import Tag
    result = await test_db.execute(select(Tag).limit(3))
    tags = result.scalars().all()
    tag_ids = [str(tag.id) for tag in tags]

    # Update interests
    response = await client.patch(
        "/profiles/me",
        headers=auth_headers,
        json={"interest_tag_ids": tag_ids}
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["interests"]) == 3
    assert all("category" in interest for interest in data["interests"])


async def test_snapshot_captures_correct_state(client, auth_headers, test_db, test_user):
    """Test snapshot captures the state AFTER update."""
    # Initial state (version 1, empty)
    response1 = await client.get("/profiles/me", headers=auth_headers)
    assert response1.json()["version"] == 1

    # Update to version 2
    await client.patch(
        "/profiles/me",
        headers=auth_headers,
        json={
            "learning_goal": "Version 2 goal",
            "time_commitment": "5-10"
        }
    )

    # Check version 2 snapshot
    result = await test_db.execute(
        select(UserProfileSnapshot)
        .join(UserProfile)
        .where(UserProfile.user_id == test_user.id)
        .where(UserProfileSnapshot.version == 2)
    )
    snapshot_v2 = result.scalar_one()

    assert snapshot_v2.learning_goal == "Version 2 goal"
    assert snapshot_v2.time_commitment == TimeCommitment.HOURS_5_10
    assert snapshot_v2.version == 2
