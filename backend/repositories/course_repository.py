"""
Course repository for data access.

Provides course queries with eager-loaded relationships.
"""

from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.course import Course


class CourseRepository:
    """Repository for Course data access."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_with_relationships(self) -> List[Course]:
        """
        Get all courses with tags and skills eagerly loaded.

        Used by pre-filtering to avoid N+1 queries.

        Returns:
            List of Course objects with populated relationships
        """
        result = await self.db.execute(
            select(Course).options(
                selectinload(Course.tags),
                selectinload(Course.skills),
            )
        )
        return list(result.scalars().all())

    async def get_by_id(self, course_id) -> Course | None:
        """
        Get a single course by ID with relationships.

        Args:
            course_id: UUID of the course

        Returns:
            Course object or None if not found
        """
        result = await self.db.execute(
            select(Course)
            .where(Course.id == course_id)
            .options(
                selectinload(Course.tags),
                selectinload(Course.skills),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_ids(self, course_ids: List) -> List[Course]:
        """
        Get multiple courses by their IDs.

        Args:
            course_ids: List of course UUIDs

        Returns:
            List of Course objects (may be fewer than requested if some IDs don't exist)
        """
        if not course_ids:
            return []

        result = await self.db.execute(
            select(Course)
            .where(Course.id.in_(course_ids))
            .options(
                selectinload(Course.tags),
                selectinload(Course.skills),
            )
        )
        return list(result.scalars().all())
