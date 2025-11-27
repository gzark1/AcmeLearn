"""
Profile service with business logic.

Handles profile updates with automatic snapshot creation.
"""
import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select

from models.user_profile import UserProfile
from models.user_profile_snapshot import UserProfileSnapshot
from models.enums import DifficultyLevel, TimeCommitment
from repositories.user_profile_repository import UserProfileRepository


class ProfileService:
    """Service for profile-related business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserProfileRepository(db)

    async def update_profile_with_snapshot(
        self,
        user_id: uuid.UUID,
        learning_goal: Optional[str] = None,
        current_level: Optional[DifficultyLevel] = None,
        time_commitment: Optional[TimeCommitment] = None,
        interest_tag_ids: Optional[List[uuid.UUID]] = None,
    ) -> UserProfile:
        """
        Update user profile and create snapshot atomically.

        Strategy:
        1. Get current profile
        2. Update profile fields and increment version
        3. Create snapshot of NEW state (after update)
        4. Commit both changes

        Args:
            user_id: User's UUID
            learning_goal: New learning goal
            current_level: New current level
            time_commitment: New time commitment
            interest_tag_ids: New list of tag IDs

        Returns:
            Updated UserProfile

        Raises:
            ValueError: If profile not found
        """
        # 1. Get current profile
        profile = await self.repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        # 2. Update profile (includes version increment)
        updated_profile = await self.repo.update_profile(
            profile=profile,
            learning_goal=learning_goal,
            current_level=current_level,
            time_commitment=time_commitment,
            interest_tag_ids=interest_tag_ids,
        )

        # 3. Create snapshot of NEW state (AFTER update)
        snapshot = UserProfileSnapshot(
            user_profile_id=updated_profile.id,
            version=updated_profile.version,
            learning_goal=updated_profile.learning_goal,
            current_level=updated_profile.current_level,
            time_commitment=updated_profile.time_commitment,
            interests_snapshot=[tag.name for tag in updated_profile.interests],
        )
        self.db.add(snapshot)
        await self.db.commit()
        await self.db.refresh(updated_profile)

        # Log profile update event (non-blocking)
        try:
            from models.activity_log import ActivityLog, ActivityEventType
            from models.user import User

            user_result = await self.db.execute(
                select(User.email).where(User.id == user_id)
            )
            user_email = user_result.scalar_one_or_none() or "unknown"

            activity_log = ActivityLog(
                event_type=ActivityEventType.PROFILE_UPDATE,
                user_id=user_id,
                user_email=user_email,
                description=f"updated profile (v{updated_profile.version})",
            )
            self.db.add(activity_log)
            await self.db.commit()
        except Exception as e:
            print(f"Failed to log profile update activity: {e}")

        return updated_profile
