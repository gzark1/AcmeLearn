"""
Database engine and session management.

This module provides the async SQLAlchemy engine, session factory,
and FastAPI dependency injection for database sessions.
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .config import settings
from models.base import Base


# Create async SQLAlchemy engine
# echo=False: Set to True for SQL query logging during development
# pool_pre_ping=True: Verify connections before using (prevents stale connections)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True to see SQL queries
    pool_pre_ping=True,  # Verify connections before use
    pool_size=10,        # Connection pool size
    max_overflow=20      # Allow up to 30 total connections
)

# Async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_db() -> None:
    """
    Initialize database by creating all tables asynchronously.

    Uses Base.metadata.create_all() - no Alembic migrations for MVP.
    This is idempotent - safe to call multiple times.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully")


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for async database sessions.

    Yields an async SQLAlchemy session that is automatically closed
    after the request completes.

    Usage in FastAPI route:
        @app.get("/courses")
        async def get_courses(db: AsyncSession = Depends(get_async_session)):
            result = await db.execute(select(Course))
            return result.scalars().all()
    """
    async with async_session_maker() as session:
        yield session
