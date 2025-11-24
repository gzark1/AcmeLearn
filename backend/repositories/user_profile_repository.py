"""
User profile repository for data access.

Handles CRUD operations for UserProfile model.
"""
import uuid
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.user_profile import UserProfile
from models.course import Tag


class UserProfileRepository:
    """Repository for UserProfile data access."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile_by_user_id(self, user_id: uuid.UUID) -> Optional[UserProfile]:
        """
        Get user profile by user_id with interests eagerly loaded.

        Args:
            user_id: User's UUID

        Returns:
            UserProfile or None if not found
        """
        result = await self.db.execute(
            select(UserProfile)
            .where(UserProfile.user_id == user_id)
            .options(selectinload(UserProfile.interests))
        )
        return result.scalar_one_or_none()

    async def create_profile(
        self,
        user_id: uuid.UUID,
        learning_goal: Optional[str] = None,
        current_level: Optional[str] = None,
        time_commitment: Optional[int] = None,
        interest_tag_ids: Optional[List[uuid.UUID]] = None,
    ) -> UserProfile:
        """
        Create a new user profile.

        Args:
            user_id: User's UUID
            learning_goal: User's learning goal
            current_level: User's current level
            time_commitment: Hours per week
            interest_tag_ids: List of tag IDs

        Returns:
            Created UserProfile
        """
        profile = UserProfile(
            user_id=user_id,
            learning_goal=learning_goal,
            current_level=current_level,
            time_commitment=time_commitment,
            version=1,
        )

        self.db.add(profile)
        await self.db.flush()

        # Associate interests
        if interest_tag_ids:
            tags = await self.db.execute(
                select(Tag).where(Tag.id.in_(interest_tag_ids))
            )
            profile.interests = tags.scalars().all()

        await self.db.commit()
        await self.db.refresh(profile)

        return profile

    async def update_profile(
        self,
        profile: UserProfile,
        learning_goal: Optional[str] = None,
        current_level: Optional[str] = None,
        time_commitment: Optional[int] = None,
        interest_tag_ids: Optional[List[uuid.UUID]] = None,
    ) -> UserProfile:
        """
        Update existing user profile.

        Note: This method does NOT create snapshots.
        Use ProfileService.update_profile_with_snapshot() for that.

        Args:
            profile: Existing UserProfile instance
            learning_goal: New learning goal
            current_level: New current level
            time_commitment: New time commitment
            interest_tag_ids: New list of tag IDs (replaces existing)

        Returns:
            Updated UserProfile
        """
        if learning_goal is not None:
            profile.learning_goal = learning_goal
        if current_level is not None:
            profile.current_level = current_level
        if time_commitment is not None:
            profile.time_commitment = time_commitment

        # Replace interests if provided
        if interest_tag_ids is not None:
            tags = await self.db.execute(
                select(Tag).where(Tag.id.in_(interest_tag_ids))
            )
            profile.interests = tags.scalars().all()

        # Increment version
        profile.version += 1

        await self.db.commit()
        await self.db.refresh(profile, ["interests"])

        return profile
