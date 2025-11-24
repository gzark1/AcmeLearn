"""
Tests for ProfileService business logic.

Tests snapshot creation, version management, and atomic operations.
"""
import pytest
from sqlalchemy import select
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))

from services.profile_service import ProfileService
from repositories.user_profile_repository import UserProfileRepository
from models.user_profile import UserProfile
from models.user_profile_snapshot import UserProfileSnapshot
from models.enums import DifficultyLevel, TimeCommitment


async def test_update_profile_with_snapshot_atomic(
    test_db,
    test_user_profile
):
    """Test that profile update and snapshot creation are atomic."""
    # Create service instance with test db
    profile_service = ProfileService(test_db)

    # Update profile
    updated_profile = await profile_service.update_profile_with_snapshot(
        user_id=test_user_profile.user_id,
        learning_goal="Master Python",
        current_level=DifficultyLevel.INTERMEDIATE
    )

    # Profile should be updated
    assert updated_profile.learning_goal == "Master Python"
    assert updated_profile.current_level == DifficultyLevel.INTERMEDIATE
    assert updated_profile.version == 2

    # Snapshot should exist
    result = await test_db.execute(
        select(UserProfileSnapshot)
        .where(UserProfileSnapshot.user_profile_id == test_user_profile.id)
        .where(UserProfileSnapshot.version == 2)
    )
    snapshot = result.scalar_one()

    assert snapshot.learning_goal == "Master Python"
    assert snapshot.current_level == DifficultyLevel.INTERMEDIATE


async def test_snapshot_version_matches_profile_version(
    test_db,
    test_user_profile
):
    """Test snapshot version always matches profile version."""
    # Create service instance with test db
    profile_service = ProfileService(test_db)

    # Update 3 times
    for i in range(3):
        await profile_service.update_profile_with_snapshot(
            user_id=test_user_profile.user_id,
            learning_goal=f"Goal {i + 2}"
        )

    # Check all snapshots
    result = await test_db.execute(
        select(UserProfileSnapshot)
        .where(UserProfileSnapshot.user_profile_id == test_user_profile.id)
        .order_by(UserProfileSnapshot.version)
    )
    snapshots = result.scalars().all()

    # Should have 4 snapshots (initial + 3 updates)
    assert len(snapshots) == 4

    # Version should be 1, 2, 3, 4
    for i, snapshot in enumerate(snapshots, start=1):
        assert snapshot.version == i


async def test_snapshot_handles_null_fields(
    test_db,
    test_user_profile
):
    """Test snapshots correctly handle NULL/None fields."""
    # Create service instance with test db
    profile_service = ProfileService(test_db)

    # Update with some fields None
    updated_profile = await profile_service.update_profile_with_snapshot(
        user_id=test_user_profile.user_id,
        learning_goal="Test goal"
        # current_level and time_commitment remain None
    )

    # Check snapshot
    result = await test_db.execute(
        select(UserProfileSnapshot)
        .where(UserProfileSnapshot.user_profile_id == test_user_profile.id)
        .where(UserProfileSnapshot.version == 2)
    )
    snapshot = result.scalar_one()

    assert snapshot.learning_goal == "Test goal"
    assert snapshot.current_level is None
    assert snapshot.time_commitment is None


async def test_multiple_updates_create_multiple_snapshots(
    test_db,
    test_user_profile
):
    """Test that multiple updates create separate snapshots."""
    # Create service instance with test db
    profile_service = ProfileService(test_db)

    updates_data = [
        {"learning_goal": "Goal 1", "time_commitment": TimeCommitment.HOURS_1_5},
        {"learning_goal": "Goal 2", "time_commitment": TimeCommitment.HOURS_5_10},
        {"learning_goal": "Goal 3", "time_commitment": TimeCommitment.HOURS_10_20},
    ]

    for update_data in updates_data:
        await profile_service.update_profile_with_snapshot(
            user_id=test_user_profile.user_id,
            **update_data
        )

    # Check all snapshots were created
    result = await test_db.execute(
        select(UserProfileSnapshot)
        .where(UserProfileSnapshot.user_profile_id == test_user_profile.id)
        .order_by(UserProfileSnapshot.version)
    )
    snapshots = result.scalars().all()

    # Should have 4 snapshots (initial + 3 updates)
    assert len(snapshots) == 4

    # Check each snapshot has correct data
    assert snapshots[1].learning_goal == "Goal 1"
    assert snapshots[1].time_commitment == TimeCommitment.HOURS_1_5

    assert snapshots[2].learning_goal == "Goal 2"
    assert snapshots[2].time_commitment == TimeCommitment.HOURS_5_10

    assert snapshots[3].learning_goal == "Goal 3"
    assert snapshots[3].time_commitment == TimeCommitment.HOURS_10_20
