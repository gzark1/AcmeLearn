"""
Course-related database models.

This module defines the Course, Tag, and Skill models along with
their many-to-many relationship junction tables.
"""
import uuid
from datetime import datetime
from typing import List

from sqlalchemy import String, Text, Integer, Enum as SQLEnum, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, DifficultyLevel


# Junction Tables (many-to-many)

class CourseTag(Base):
    """
    Junction table linking courses to tags.

    Composite primary key ensures no duplicate course-tag pairs.
    CASCADE delete ensures orphaned relationships are cleaned up.
    """
    __tablename__ = "course_tags"

    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("courses.id", ondelete="CASCADE"),
        primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True
    )


class CourseSkill(Base):
    """
    Junction table linking courses to skills.

    Composite primary key ensures no duplicate course-skill pairs.
    CASCADE delete ensures orphaned relationships are cleaned up.
    """
    __tablename__ = "course_skills"

    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("courses.id", ondelete="CASCADE"),
        primary_key=True
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("skills.id", ondelete="CASCADE"),
        primary_key=True
    )


class Course(Base):
    """
    Course model representing a learning course.

    Courses are read-only and seeded from courses.json.
    Many-to-many relationships with Tag and Skill models.
    """
    __tablename__ = "courses"

    # Primary key - Native UUID type (16 bytes in PostgreSQL)
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4
    )

    # Required fields from courses.json
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        SQLEnum(DifficultyLevel, native_enum=False, length=20),
        nullable=False,
        index=True  # For filtering by difficulty
    )
    duration: Mapped[int] = mapped_column(Integer, nullable=False)  # Hours
    contents: Mapped[str] = mapped_column(Text, nullable=False)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False
    )

    # Relationships (many-to-many)
    tags: Mapped[List["Tag"]] = relationship(
        "Tag",
        secondary="course_tags",
        back_populates="courses",
        lazy="selectin"  # Eager load to avoid N+1 queries
    )
    skills: Mapped[List["Skill"]] = relationship(
        "Skill",
        secondary="course_skills",
        back_populates="courses",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Course(id={self.id}, title='{self.title}', difficulty={self.difficulty})>"


class Tag(Base):
    """
    Tag model for course categorization.

    Normalized taxonomy extracted from courses.json.
    Many-to-many relationship with courses.
    """
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True  # For fast lookups and autocomplete
    )
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False
    )

    # Relationships
    courses: Mapped[List["Course"]] = relationship(
        "Course",
        secondary="course_tags",
        back_populates="tags"
    )
    interested_users: Mapped[List["UserProfile"]] = relationship(
        "UserProfile",
        secondary="user_interests",
        back_populates="interests"
    )

    def __repr__(self) -> str:
        return f"<Tag(id={self.id}, name='{self.name}')>"


class Skill(Base):
    """
    Skill model for learning outcomes.

    Normalized taxonomy extracted from courses.json.
    Many-to-many relationship with courses.
    """
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(
        String(200),
        unique=True,
        nullable=False,
        index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False
    )

    # Relationships
    courses: Mapped[List["Course"]] = relationship(
        "Course",
        secondary="course_skills",
        back_populates="skills"
    )

    def __repr__(self) -> str:
        return f"<Skill(id={self.id}, name='{self.name}')>"
