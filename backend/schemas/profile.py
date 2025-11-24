"""
User profile schemas.
"""
import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from models.enums import DifficultyLevel, TimeCommitment, TagCategory


class TagResponse(BaseModel):
    """Tag reference in profile responses."""
    id: uuid.UUID
    name: str
    category: Optional[TagCategory] = None

    class Config:
        from_attributes = True


class ProfileRead(BaseModel):
    """
    User profile response schema.

    Returns current profile state with interests as Tag objects.
    """
    id: uuid.UUID
    user_id: uuid.UUID
    learning_goal: Optional[str] = None
    current_level: Optional[DifficultyLevel] = None
    time_commitment: Optional[TimeCommitment] = None
    version: int
    interests: List[TagResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileCreate(BaseModel):
    """
    Profile creation schema (used in registration).

    All fields optional for initial registration.
    """
    learning_goal: Optional[str] = Field(None, max_length=1000)
    current_level: Optional[DifficultyLevel] = None
    time_commitment: Optional[TimeCommitment] = None
    interest_tag_ids: List[uuid.UUID] = Field(default_factory=list)


class ProfileUpdate(BaseModel):
    """
    Profile update schema.

    All fields optional. Only provided fields will be updated.
    interest_tag_ids replaces all interests (not append).
    """
    learning_goal: Optional[str] = Field(None, max_length=1000)
    current_level: Optional[DifficultyLevel] = None
    time_commitment: Optional[TimeCommitment] = None
    interest_tag_ids: Optional[List[uuid.UUID]] = None
