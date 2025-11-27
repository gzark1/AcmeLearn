"""
Database models package.

Exports all models for convenient importing.
Import order matters for SQLAlchemy relationships!
"""
from .base import Base
from .enums import DifficultyLevel, TimeCommitment, TagCategory
from .user import User
from .user_profile import UserProfile, UserInterest
from .user_profile_snapshot import UserProfileSnapshot
from .recommendation import Recommendation
from .course import Course, Tag, Skill, CourseTag, CourseSkill
from .activity_log import ActivityLog, ActivityEventType

__all__ = [
    # Base
    "Base",
    # Enums
    "DifficultyLevel",
    "TimeCommitment",
    "TagCategory",
    # Models
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
    "ActivityLog",
    "ActivityEventType",
]
