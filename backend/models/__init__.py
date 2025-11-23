"""
Database models package.

Exports all models for convenient importing.
Import order matters for SQLAlchemy relationships!
"""
from .base import Base, DifficultyLevel
from .user import User
from .user_profile import UserProfile, UserInterest
from .user_profile_snapshot import UserProfileSnapshot
from .recommendation import Recommendation
from .course import Course, Tag, Skill, CourseTag, CourseSkill

__all__ = [
    "Base",
    "DifficultyLevel",
    "User",
    "UserProfile",
    "UserInterest",
    "UserProfileSnapshot",
    "Recommendation",
    "Course",
    "Tag",
    "Skill",
    "CourseTag",
    "CourseSkill",
]
