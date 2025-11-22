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
# check_same_thread=False: Allow SQLite to be used with multiple threads (FastAPI)
# echo=False: Set to True for SQL query logging during development
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=False  # Set to True to see SQL queries
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
