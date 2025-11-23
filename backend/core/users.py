"""
FastAPI Users instance and dependencies.

Provides:
- fastapi_users instance
- current_active_user dependency for route protection
"""
import uuid
from fastapi import Depends
from fastapi_users import FastAPIUsers
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from core.auth import auth_backend
from core.user_manager import get_user_manager
from core.database import get_async_session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    """
    Dependency to get user database adapter.

    Used by fastapi-users for user CRUD operations.
    """
    yield SQLAlchemyUserDatabase(session, User)


fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager=get_user_manager,
    auth_backends=[auth_backend],
)

# Dependency for route protection
current_active_user = fastapi_users.current_user(active=True)
