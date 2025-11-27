"""
User manager for authentication hooks.

Handles on_after_register to create UserProfile and initial snapshot.
"""
import uuid
from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, UUIDIDMixin

from models.user import User
from models.user_profile import UserProfile
from models.user_profile_snapshot import UserProfileSnapshot
from core.database import get_async_session
from core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    """
    Custom user manager with registration hooks.

    Responsibilities:
    - on_after_register: Create UserProfile + initial snapshot atomically
    - Password reset token generation (future)
    - Email verification (future)
    """

    reset_password_token_secret = settings.SECRET_KEY
    verification_token_secret = settings.SECRET_KEY

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        """
        Hook called after successful user registration.

        Creates:
        1. Empty UserProfile (user fills it later via PATCH /profiles/me)
        2. Initial UserProfileSnapshot (version 1, all fields empty)

        Both created in same transaction for atomicity.
        """
        print(f"User {user.id} has registered.")

        # Get DB session from the user_db
        from sqlalchemy.ext.asyncio import AsyncSession

        # Access the session from the user database
        db: AsyncSession = self.user_db.session

        # Create empty UserProfile
        profile = UserProfile(
            user_id=user.id,
            learning_goal=None,
            current_level=None,
            time_commitment=None,
            version=1,
        )

        db.add(profile)
        await db.flush()  # Get profile.id

        # Create initial snapshot (version 1, all fields empty)
        snapshot = UserProfileSnapshot(
            user_profile_id=profile.id,
            version=1,
            learning_goal=None,
            current_level=None,
            time_commitment=None,
            interests_snapshot=[],  # Empty list
        )

        db.add(snapshot)
        await db.commit()

        print(f"Created empty profile {profile.id} and initial snapshot for user {user.id}")

        # Log registration event (non-blocking)
        try:
            from models.activity_log import ActivityLog, ActivityEventType

            activity_log = ActivityLog(
                event_type=ActivityEventType.REGISTRATION,
                user_id=user.id,
                user_email=user.email,
                description="registered",
            )
            db.add(activity_log)
            await db.commit()
        except Exception as e:
            print(f"Failed to log registration activity: {e}")


async def get_user_manager(session: AsyncSession = Depends(get_async_session)):
    """Dependency to get UserManager instance."""
    from fastapi_users.db import SQLAlchemyUserDatabase
    from models.user import User

    yield UserManager(SQLAlchemyUserDatabase(session, User))
