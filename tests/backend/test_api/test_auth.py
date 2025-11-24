"""
Tests for authentication endpoints.

Tests registration, login, token validation, and automatic profile creation.
"""
import pytest
from sqlalchemy import select
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))

from models.user import User
from models.user_profile import UserProfile


async def test_register_user_success(client, test_db):
    """Test successful user registration."""
    response = await client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "SecurePassword123"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["is_active"] is True
    assert "password" not in data
    assert "hashed_password" not in data


async def test_register_duplicate_email(client, test_user):
    """Test registration fails with duplicate email."""
    response = await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",  # Already exists (test_user)
            "password": "AnotherPassword123"
        }
    )

    assert response.status_code == 400
    assert "register_user_already_exists" in response.text.lower()


async def test_login_success(client, test_user):
    """Test successful login returns JWT token."""
    response = await client.post(
        "/auth/jwt/login",
        data={
            "username": "test@example.com",
            "password": "TestPassword123"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 20  # JWT tokens are long


async def test_login_invalid_credentials(client, test_user):
    """Test login fails with invalid password."""
    response = await client.post(
        "/auth/jwt/login",
        data={
            "username": "test@example.com",
            "password": "WrongPassword"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 400
    assert "LOGIN_BAD_CREDENTIALS" in response.text


async def test_profile_auto_created_on_register(client, test_db):
    """Test that user profile is automatically created on registration."""
    # Register new user
    response = await client.post(
        "/auth/register",
        json={
            "email": "autouser@example.com",
            "password": "Password123"
        }
    )

    assert response.status_code == 201
    user_id = response.json()["id"]

    # Check profile was auto-created
    result = await test_db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    assert profile is not None
    assert str(profile.user_id) == user_id
    assert profile.version == 1
    assert profile.learning_goal is None  # Empty profile
    assert profile.current_level is None
    assert profile.time_commitment is None
