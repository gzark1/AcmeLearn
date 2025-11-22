"""
SQLAlchemy Base and Common Types

This module provides the declarative base class and common enums
used across all database models.
"""
import enum
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.

    Using SQLAlchemy 2.0 DeclarativeBase instead of declarative_base()
    for better type safety and extensibility.
    """
    pass


class DifficultyLevel(str, enum.Enum):
    """
    Course difficulty levels.

    Inherits from str to ensure JSON serialization works smoothly.
    SQLite will store these as VARCHAR with CHECK constraint.
    """
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
