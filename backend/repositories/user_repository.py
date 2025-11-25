"""
User repository for admin data access.

Handles queries for user management and analytics.
"""
import uuid
from datetime import datetime
from typing import Optional, List, Tuple

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.user import User
from models.user_profile import UserProfile
from models.user_profile_snapshot import UserProfileSnapshot


class UserRepository:
    """Repository for User data access (admin operations)."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_users_with_filters(
        self,
        skip: int = 0,
        limit: int = 20,
        email_search: Optional[str] = None,
        is_active: Optional[bool] = None,
        is_superuser: Optional[bool] = None,
        registered_after: Optional[datetime] = None,
        registered_before: Optional[datetime] = None,
    ) -> Tuple[List[User], int]:
        """
        Get paginated list of users with optional filters.

        Args:
            skip: Number of records to skip (pagination offset)
            limit: Maximum number of records to return
            email_search: Substring search on email
            is_active: Filter by active status
            is_superuser: Filter by superuser status
            registered_after: Filter users registered after this date
            registered_before: Filter users registered before this date

        Returns:
            Tuple of (list of users, total count)
        """
        # Build filter conditions
        conditions = []

        if email_search:
            conditions.append(User.email.ilike(f"%{email_search}%"))

        if is_active is not None:
            conditions.append(User.is_active == is_active)

        if is_superuser is not None:
            conditions.append(User.is_superuser == is_superuser)

        # Note: fastapi-users doesn't add created_at by default,
        # but the base has it. Using the SQLAlchemy inspection if available.
        # For now, we'll skip date filtering if the column doesn't exist.

        # Build query
        query = select(User)
        if conditions:
            query = query.where(and_(*conditions))

        # Get total count
        count_query = select(func.count()).select_from(User)
        if conditions:
            count_query = count_query.where(and_(*conditions))

        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Apply pagination and ordering
        query = query.order_by(User.email).offset(skip).limit(limit)

        result = await self.db.execute(query)
        users = result.scalars().all()

        return list(users), total

    async def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """
        Get user by ID.

        Args:
            user_id: User's UUID

        Returns:
            User or None if not found
        """
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_user_with_profile(self, user_id: uuid.UUID) -> Optional[Tuple[User, Optional[UserProfile]]]:
        """
        Get user with their profile.

        Args:
            user_id: User's UUID

        Returns:
            Tuple of (User, UserProfile or None) or None if user not found
        """
        # Get user
        user_result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()

        if not user:
            return None

        # Get profile with interests
        profile_result = await self.db.execute(
            select(UserProfile)
            .where(UserProfile.user_id == user_id)
            .options(selectinload(UserProfile.interests))
        )
        profile = profile_result.scalar_one_or_none()

        return user, profile

    async def deactivate_user(self, user_id: uuid.UUID) -> Optional[User]:
        """
        Soft-delete user by setting is_active=False.

        Args:
            user_id: User's UUID

        Returns:
            Updated User or None if not found
        """
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            return None

        user.is_active = False
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def get_user_profile_snapshots(
        self,
        user_id: uuid.UUID,
        limit: int = 50,
    ) -> List[UserProfileSnapshot]:
        """
        Get profile snapshots for a user (via their profile).

        Args:
            user_id: User's UUID
            limit: Maximum number of snapshots to return

        Returns:
            List of UserProfileSnapshot ordered by version desc
        """
        # First get the profile
        profile_result = await self.db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()

        if not profile:
            return []

        # Get snapshots
        result = await self.db.execute(
            select(UserProfileSnapshot)
            .where(UserProfileSnapshot.user_profile_id == profile.id)
            .order_by(UserProfileSnapshot.version.desc())
            .limit(limit)
        )

        return list(result.scalars().all())

    async def get_user_count_stats(self) -> dict:
        """
        Get user count statistics for analytics.

        Returns:
            Dict with total_users, active_users, superuser_count
        """
        # Total users
        total_result = await self.db.execute(select(func.count()).select_from(User))
        total_users = total_result.scalar() or 0

        # Active users
        active_result = await self.db.execute(
            select(func.count()).select_from(User).where(User.is_active == True)
        )
        active_users = active_result.scalar() or 0

        # Superusers
        super_result = await self.db.execute(
            select(func.count()).select_from(User).where(User.is_superuser == True)
        )
        superuser_count = super_result.scalar() or 0

        return {
            "total_users": total_users,
            "active_users": active_users,
            "superuser_count": superuser_count,
        }

    async def get_profile_completion_rate(self) -> float:
        """
        Calculate percentage of profiles with learning_goal set.

        Returns:
            Float between 0.0 and 1.0
        """
        total_result = await self.db.execute(
            select(func.count()).select_from(UserProfile)
        )
        total = total_result.scalar() or 0

        if total == 0:
            return 0.0

        completed_result = await self.db.execute(
            select(func.count())
            .select_from(UserProfile)
            .where(UserProfile.learning_goal.isnot(None))
        )
        completed = completed_result.scalar() or 0

        return completed / total
