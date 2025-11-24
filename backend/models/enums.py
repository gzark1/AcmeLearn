"""
Domain enums for AcmeLearn models.

All domain-specific enumerations are centralized here for:
- Single source of truth
- Easy discovery
- No circular import issues
- Clean imports across the codebase
"""
import enum


class DifficultyLevel(str, enum.Enum):
    """
    Course difficulty levels.

    Inherits from str to ensure JSON serialization works smoothly.
    PostgreSQL stores these as VARCHAR with CHECK constraint.
    """
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class TimeCommitment(str, enum.Enum):
    """
    User's weekly time commitment for learning.

    Represents hours per week available for courses.
    """
    HOURS_1_5 = "1-5"       # 1-5 hours/week
    HOURS_5_10 = "5-10"     # 5-10 hours/week
    HOURS_10_20 = "10-20"   # 10-20 hours/week
    HOURS_20_PLUS = "20+"   # 20+ hours/week


class TagCategory(str, enum.Enum):
    """
    Categories for organizing course tags.

    Used to group related tags for better UX in interest selection.
    """
    PROGRAMMING = "Programming"
    DATA_SCIENCE = "Data Science"
    DEVOPS = "DevOps"
    BUSINESS = "Business"
    MARKETING = "Marketing"
    DESIGN = "Design"
    SOFT_SKILLS = "Soft Skills"
    HR_TALENT = "HR & Talent"
    SECURITY = "Security"
    SUSTAINABILITY = "Sustainability"
    OTHER = "Other"
