"""
Course browsing routes (authentication required).

Provides:
- GET /courses (list all courses with filtering)
- GET /courses/{course_id} (get single course)
- GET /tags (list all tags)
- GET /skills (list all skills)
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database import get_async_session
from core.users import current_active_user
from models.user import User
from models.course import Course, Tag, Skill
from models.enums import DifficultyLevel


router = APIRouter()


@router.get("/courses")
async def list_courses(
    difficulty: Optional[DifficultyLevel] = Query(None, description="Filter by difficulty"),
    tag_ids: Optional[List[uuid.UUID]] = Query(None, description="Filter by tag IDs"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    List courses with optional filtering.

    Authentication required.

    Args:
        difficulty: Filter by difficulty level
        tag_ids: Filter by tag IDs (courses must have at least one)
        limit: Maximum courses to return (1-100)
        offset: Number of courses to skip
        user: Current authenticated user
        db: Database session

    Returns:
        List of courses with tags and skills
    """
    query = select(Course).options(
        selectinload(Course.tags),
        selectinload(Course.skills)
    )

    # Filter by difficulty
    if difficulty:
        query = query.where(Course.difficulty == difficulty)

    # Filter by tags (courses with at least one matching tag)
    if tag_ids:
        query = query.join(Course.tags).where(Tag.id.in_(tag_ids))

    # Apply pagination
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    courses = result.scalars().unique().all()

    return courses


@router.get("/courses/{course_id}")
async def get_course(
    course_id: uuid.UUID,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get single course by ID.

    Authentication required.

    Args:
        course_id: Course UUID
        user: Current authenticated user
        db: Database session

    Returns:
        Course with tags and skills

    Raises:
        HTTPException: 404 if course not found
    """
    result = await db.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(
            selectinload(Course.tags),
            selectinload(Course.skills)
        )
    )

    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course


@router.get("/tags")
async def list_tags(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    List all tags with categories.

    Authentication required.

    Args:
        user: Current authenticated user
        db: Database session

    Returns:
        List of all tags (flat list with category field)
    """
    result = await db.execute(select(Tag).order_by(Tag.name))
    tags = result.scalars().all()

    return tags


@router.get("/tag-categories")
async def list_tag_categories(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    List tags grouped by category.

    Authentication required. Optimized for frontend multi-select UI.

    Args:
        user: Current authenticated user
        db: Database session

    Returns:
        Dict of category → list of tags
        Example: {"Programming": [{"id": "...", "name": "python"}, ...], ...}
    """
    result = await db.execute(select(Tag).order_by(Tag.category, Tag.name))
    tags = result.scalars().all()

    # Group tags by category
    categories = {}
    for tag in tags:
        category = tag.category or "Other"
        if category not in categories:
            categories[category] = []
        categories[category].append({
            "id": str(tag.id),
            "name": tag.name,
            "category": tag.category
        })

    return categories


@router.get("/skills")
async def list_skills(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    List all skills.

    Authentication required.

    Args:
        user: Current authenticated user
        db: Database session

    Returns:
        List of all skills
    """
    result = await db.execute(select(Skill).order_by(Skill.name))
    skills = result.scalars().all()

    return skills
