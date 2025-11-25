"""
Tests for admin endpoints and superuser functionality.

Tests user management, analytics, and security features.
"""
import pytest
import pytest_asyncio
import uuid
from sqlalchemy import select, text
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))

from models.user import User
from models.user_profile import UserProfile
from models.user_profile_snapshot import UserProfileSnapshot
from models.course import Tag


# =============================================================================
# Helper Functions
# =============================================================================

async def register_and_login(client, email: str, password: str) -> dict:
    """
    Register a user and return authentication headers.

    Returns:
        dict: {"Authorization": "Bearer <token>"}
    """
    await client.post(
        "/auth/register",
        json={"email": email, "password": password}
    )
    login_response = await client.post(
        "/auth/jwt/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def create_superuser(client, test_db, email: str = "admin@example.com", password: str = "AdminPass123") -> User:
    """
    Create a superuser by registering and promoting via DB.

    Returns:
        User: The superuser model instance
    """
    response = await client.post(
        "/auth/register",
        json={"email": email, "password": password}
    )
    user_id = response.json()["id"]

    # Promote to superuser in DB
    await test_db.execute(
        text('UPDATE "user" SET is_superuser = true WHERE id = :id'),
        {"id": user_id}
    )
    await test_db.commit()

    # Return the user model
    result = await test_db.execute(select(User).where(User.id == user_id))
    return result.scalar_one()


# =============================================================================
# Fixtures
# =============================================================================

@pytest_asyncio.fixture
async def superuser(client, test_db):
    """Create a superuser for testing admin endpoints."""
    return await create_superuser(client, test_db)


@pytest_asyncio.fixture
async def superuser_headers(client, superuser):
    """Get authentication headers for the superuser."""
    login_response = await client.post(
        "/auth/jwt/login",
        data={"username": "admin@example.com", "password": "AdminPass123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def multiple_users(client, test_db):
    """
    Create multiple users with different profiles for testing.

    Creates:
    - user1@example.com: Has learning goal, 2 interests
    - user2@example.com: Has learning goal, 1 interest
    - user3@example.com: No learning goal (empty profile)

    Returns:
        dict: {"user1": User, "user2": User, "user3": User, "headers": {...}}
    """
    # Get some tags for interests
    result = await test_db.execute(select(Tag).limit(3))
    tags = result.scalars().all()
    tag_ids = [str(tag.id) for tag in tags]

    users = {}
    headers = {}

    # User 1: Active, has learning goal and 2 interests
    headers["user1"] = await register_and_login(client, "user1@example.com", "Password123")
    await client.patch(
        "/profiles/me",
        headers=headers["user1"],
        json={
            "learning_goal": "Become a data scientist",
            "current_level": "beginner",
            "interest_tag_ids": tag_ids[:2] if len(tag_ids) >= 2 else tag_ids
        }
    )
    result = await test_db.execute(select(User).where(User.email == "user1@example.com"))
    users["user1"] = result.scalar_one()

    # User 2: Active, has learning goal and 1 interest
    headers["user2"] = await register_and_login(client, "user2@example.com", "Password123")
    await client.patch(
        "/profiles/me",
        headers=headers["user2"],
        json={
            "learning_goal": "Learn web development",
            "current_level": "intermediate",
            "interest_tag_ids": tag_ids[:1] if tag_ids else []
        }
    )
    result = await test_db.execute(select(User).where(User.email == "user2@example.com"))
    users["user2"] = result.scalar_one()

    # User 3: Active, no learning goal (empty profile)
    headers["user3"] = await register_and_login(client, "user3@example.com", "Password123")
    result = await test_db.execute(select(User).where(User.email == "user3@example.com"))
    users["user3"] = result.scalar_one()

    return {"users": users, "headers": headers, "tag_ids": tag_ids}


# =============================================================================
# A. Superuser Authentication Tests
# =============================================================================

class TestSuperuserAuthentication:
    """Tests for superuser dependency and security."""

    async def test_admin_endpoint_returns_403_for_regular_user(self, client, auth_headers):
        """Regular users should get 403 on admin endpoints."""
        response = await client.get("/admin/users", headers=auth_headers)
        assert response.status_code == 403
        assert "superuser" in response.json()["detail"].lower()

    async def test_admin_endpoint_allows_superuser(self, client, superuser_headers):
        """Superusers should access admin endpoints."""
        response = await client.get("/admin/users", headers=superuser_headers)
        assert response.status_code == 200

    async def test_admin_endpoint_returns_401_without_auth(self, client):
        """Unauthenticated requests should get 401."""
        response = await client.get("/admin/users")
        assert response.status_code == 401

    async def test_is_superuser_cannot_be_self_set(self, client, test_db, test_user, auth_headers):
        """Users cannot promote themselves to superuser via PATCH /users/me."""
        # Try to set is_superuser via user update
        response = await client.patch(
            "/users/me",
            headers=auth_headers,
            json={"is_superuser": True}
        )

        # Should succeed (200) but is_superuser should NOT be changed
        assert response.status_code == 200

        # Verify user is still not superuser
        await test_db.refresh(test_user)
        assert test_user.is_superuser is False


# =============================================================================
# B. Admin User Management Tests
# =============================================================================

class TestAdminUserManagement:
    """Tests for admin user management endpoints."""

    async def test_list_users_returns_all_users(self, client, superuser_headers, multiple_users):
        """GET /admin/users returns all users."""
        response = await client.get("/admin/users", headers=superuser_headers)

        assert response.status_code == 200
        data = response.json()

        # Should have 4 users: superuser + 3 from multiple_users
        assert data["total"] == 4
        assert len(data["users"]) == 4
        assert "skip" in data
        assert "limit" in data

    async def test_list_users_pagination(self, client, superuser_headers, multiple_users):
        """GET /admin/users supports pagination."""
        # Get first 2 users
        response = await client.get(
            "/admin/users",
            headers=superuser_headers,
            params={"skip": 0, "limit": 2}
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["users"]) == 2
        assert data["total"] == 4
        assert data["skip"] == 0
        assert data["limit"] == 2

    async def test_list_users_filter_by_email(self, client, superuser_headers, multiple_users):
        """GET /admin/users filters by email substring."""
        response = await client.get(
            "/admin/users",
            headers=superuser_headers,
            params={"email": "user1"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["users"][0]["email"] == "user1@example.com"

    async def test_list_users_filter_by_is_superuser(self, client, superuser_headers, multiple_users):
        """GET /admin/users filters by is_superuser status."""
        response = await client.get(
            "/admin/users",
            headers=superuser_headers,
            params={"is_superuser": True}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["users"][0]["is_superuser"] is True

    async def test_list_users_includes_profile_summary(self, client, superuser_headers, multiple_users):
        """GET /admin/users includes profile summary (has_learning_goal, interest_count)."""
        response = await client.get("/admin/users", headers=superuser_headers)

        assert response.status_code == 200
        data = response.json()

        # Find user1 who has a learning goal
        user1 = next((u for u in data["users"] if u["email"] == "user1@example.com"), None)
        assert user1 is not None
        assert user1["has_learning_goal"] is True
        assert user1["interest_count"] >= 1

        # Find user3 who has no learning goal
        user3 = next((u for u in data["users"] if u["email"] == "user3@example.com"), None)
        assert user3 is not None
        assert user3["has_learning_goal"] is False

    async def test_get_user_detail(self, client, superuser_headers, multiple_users):
        """GET /admin/users/{id} returns user with profile."""
        user_id = str(multiple_users["users"]["user1"].id)

        response = await client.get(
            f"/admin/users/{user_id}",
            headers=superuser_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "user1@example.com"
        assert data["profile"] is not None
        assert data["profile"]["learning_goal"] == "Become a data scientist"
        assert "interests" in data["profile"]

    async def test_get_user_detail_not_found(self, client, superuser_headers):
        """GET /admin/users/{id} returns 404 for non-existent user."""
        fake_id = str(uuid.uuid4())

        response = await client.get(
            f"/admin/users/{fake_id}",
            headers=superuser_headers
        )

        assert response.status_code == 404

    async def test_deactivate_user(self, client, superuser_headers, multiple_users, test_db):
        """PATCH /admin/users/{id}/deactivate sets is_active=False."""
        user_id = str(multiple_users["users"]["user3"].id)

        response = await client.patch(
            f"/admin/users/{user_id}/deactivate",
            headers=superuser_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

        # Verify in database
        result = await test_db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one()
        assert user.is_active is False

    async def test_deactivate_self_fails(self, client, superuser_headers, superuser):
        """PATCH /admin/users/{id}/deactivate fails when trying to deactivate yourself."""
        user_id = str(superuser.id)

        response = await client.patch(
            f"/admin/users/{user_id}/deactivate",
            headers=superuser_headers
        )

        assert response.status_code == 400
        assert "yourself" in response.json()["detail"].lower()

    async def test_get_user_profile_history(self, client, superuser_headers, multiple_users, test_db):
        """GET /admin/users/{id}/profile-history returns snapshots."""
        # User1 has updated their profile (should have version 1 and 2 snapshots)
        user_id = str(multiple_users["users"]["user1"].id)

        response = await client.get(
            f"/admin/users/{user_id}/profile-history",
            headers=superuser_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "snapshots" in data
        assert "count" in data
        # Should have at least the update snapshot
        assert data["count"] >= 1


# =============================================================================
# C. Admin Analytics Tests
# =============================================================================

class TestAdminAnalytics:
    """Tests for admin analytics endpoints."""

    async def test_analytics_overview(self, client, superuser_headers, multiple_users):
        """GET /admin/analytics/overview returns correct stats."""
        response = await client.get(
            "/admin/analytics/overview",
            headers=superuser_headers
        )

        assert response.status_code == 200
        data = response.json()

        # Check all required fields
        assert "total_users" in data
        assert "active_users" in data
        assert "superuser_count" in data
        assert "profile_completion_rate" in data

        # Verify counts make sense
        assert data["total_users"] == 4  # superuser + 3 users
        assert data["active_users"] == 4
        assert data["superuser_count"] == 1

        # Profile completion: 2 out of 4 have learning goals (user1, user2)
        # Rate should be 0.5 (2/4)
        assert 0.4 <= data["profile_completion_rate"] <= 0.6

    async def test_popular_tags(self, client, superuser_headers, multiple_users):
        """GET /admin/analytics/tags/popular returns tags sorted by interest count."""
        response = await client.get(
            "/admin/analytics/tags/popular",
            headers=superuser_headers
        )

        assert response.status_code == 200
        data = response.json()

        assert "tags" in data
        assert "total_tags" in data

        # Should have some tags with user counts
        if data["tags"]:
            first_tag = data["tags"][0]
            assert "tag_id" in first_tag
            assert "tag_name" in first_tag
            assert "user_count" in first_tag


# =============================================================================
# D. Profile History Tests (User's Own)
# =============================================================================

class TestProfileHistory:
    """Tests for user's own profile history endpoint."""

    async def test_get_own_profile_history(self, client, test_user, auth_headers, test_db):
        """GET /profiles/me/history returns user's snapshots."""
        # First, make some updates to create snapshots
        response1 = await client.patch(
            "/profiles/me",
            headers=auth_headers,
            json={"learning_goal": "Goal version 2"}
        )
        assert response1.status_code == 200

        response2 = await client.patch(
            "/profiles/me",
            headers=auth_headers,
            json={"learning_goal": "Goal version 3"}
        )
        assert response2.status_code == 200

        response = await client.get("/profiles/me/history", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "snapshots" in data
        assert "count" in data

        # Should have 3 snapshots (initial + 2 updates)
        assert data["count"] >= 2

        # Snapshots should be ordered by version desc (newest first)
        if len(data["snapshots"]) >= 2:
            assert data["snapshots"][0]["version"] > data["snapshots"][1]["version"]

    async def test_profile_history_empty_for_new_user(self, client, test_db):
        """GET /profiles/me/history returns only initial snapshot for new user."""
        headers = await register_and_login(client, "newuser@example.com", "Password123")

        response = await client.get("/profiles/me/history", headers=headers)

        assert response.status_code == 200
        data = response.json()
        # Should have initial snapshot (version 1)
        assert data["count"] == 1
        assert data["snapshots"][0]["version"] == 1

    async def test_profile_history_unauthenticated(self, client):
        """GET /profiles/me/history returns 401 without auth."""
        response = await client.get("/profiles/me/history")
        assert response.status_code == 401

    async def test_snapshot_contains_correct_fields(self, client, test_user, auth_headers):
        """Snapshots contain all expected fields."""
        # Make an update
        response1 = await client.patch(
            "/profiles/me",
            headers=auth_headers,
            json={
                "learning_goal": "Test goal",
                "current_level": "intermediate",
                "time_commitment": "10-20"
            }
        )
        assert response1.status_code == 200

        response = await client.get("/profiles/me/history", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # Check latest snapshot has all fields
        latest = data["snapshots"][0]
        assert "id" in latest
        assert "version" in latest
        assert "learning_goal" in latest
        assert "current_level" in latest
        assert "time_commitment" in latest
        assert "interests_snapshot" in latest
        assert "created_at" in latest


# =============================================================================
# E. Recommendation Stub Tests
# =============================================================================

class TestRecommendationStubs:
    """Tests for recommendation stub endpoints."""

    async def test_get_recommendations_returns_empty(self, client, auth_headers):
        """GET /users/me/recommendations returns empty list (stub)."""
        response = await client.get("/users/me/recommendations", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["recommendations"] == []
        assert data["count"] == 0

    async def test_get_recommendation_quota_returns_static(self, client, auth_headers):
        """GET /users/me/recommendation-quota returns static quota (stub)."""
        response = await client.get("/users/me/recommendation-quota", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["used"] == 0
        assert data["limit"] == 10
        assert data["remaining"] == 10

    async def test_recommendations_require_auth(self, client):
        """Recommendation endpoints require authentication."""
        response1 = await client.get("/users/me/recommendations")
        assert response1.status_code == 401

        response2 = await client.get("/users/me/recommendation-quota")
        assert response2.status_code == 401
