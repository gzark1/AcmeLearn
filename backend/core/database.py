"""
Database engine and session management.

This module provides the SQLAlchemy engine, session factory,
and FastAPI dependency injection for database sessions.
"""
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from .config import settings
from models.base import Base


# Create SQLAlchemy engine
# echo=False: Set to True for SQL query logging during development
# pool_pre_ping=True: Verify connections before using (prevents stale connections)
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True to see SQL queries
    pool_pre_ping=True,  # Verify connections before use
    pool_size=10,        # Connection pool size
    max_overflow=20      # Allow up to 30 total connections
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def init_db() -> None:
    """
    Initialize database by creating all tables.

    Uses Base.metadata.create_all() - no Alembic migrations for MVP.
    This is idempotent - safe to call multiple times.
    """
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database sessions.

    Yields a SQLAlchemy session that is automatically closed
    after the request completes. Rollback on exception.

    Usage in FastAPI route:
        @app.get("/courses")
        def get_courses(db: Session = Depends(get_db)):
            return db.query(Course).all()
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
