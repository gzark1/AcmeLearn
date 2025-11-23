"""
Course data seeding script.

Imports courses from courses.json into the database,
creating Tag and Skill entities and establishing relationships.
"""
import json
from pathlib import Path
from typing import Dict, Set

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Import all models to ensure SQLAlchemy can resolve relationships
import models  # noqa: F401
from models.course import Course, Tag, Skill
from models.base import DifficultyLevel


async def seed_courses(db: AsyncSession) -> None:
    """
    Seed the database with courses from courses.json asynchronously.

    Strategy:
    1. Check if courses already exist (skip if not empty)
    2. Extract unique tags and skills
    3. Create Tag and Skill records
    4. Create Course records with relationships

    Args:
        db: Async SQLAlchemy session
    """
    # Check if courses already exist
    result = await db.execute(select(Course))
    existing_count = len(result.scalars().all())
    if existing_count > 0:
        print(f"Database already contains {existing_count} courses. Skipping seed.")
        return

    # Load courses.json
    courses_file = Path(__file__).parent.parent.parent / "courses.json"
    with open(courses_file, "r") as f:
        courses_data = json.load(f)

    print(f"Loading {len(courses_data)} courses from {courses_file}")

    # Step 1: Extract unique tags and skills
    unique_tags: Set[str] = set()
    unique_skills: Set[str] = set()

    for course in courses_data:
        unique_tags.update(course.get("tags", []))
        unique_skills.update(course.get("skills_covered", []))

    print(f"Found {len(unique_tags)} unique tags")
    print(f"Found {len(unique_skills)} unique skills")

    # Step 2: Create Tag records
    tag_map: Dict[str, Tag] = {}
    for tag_name in unique_tags:
        tag = Tag(name=tag_name)
        db.add(tag)
        tag_map[tag_name] = tag

    await db.flush()  # Get IDs without committing
    print(f"Created {len(tag_map)} tag records")

    # Step 3: Create Skill records
    skill_map: Dict[str, Skill] = {}
    for skill_name in unique_skills:
        skill = Skill(name=skill_name)
        db.add(skill)
        skill_map[skill_name] = skill

    await db.flush()
    print(f"Created {len(skill_map)} skill records")

    # Step 4: Create Course records with relationships
    for course_data in courses_data:
        # Map difficulty string to enum
        difficulty = DifficultyLevel(course_data["difficulty"])

        # Create course
        course = Course(
            title=course_data["title"],
            description=course_data["description"],
            difficulty=difficulty,
            duration=course_data["duration"],
            contents=course_data["contents"]
        )

        # Add tag relationships
        for tag_name in course_data.get("tags", []):
            if tag_name in tag_map:
                course.tags.append(tag_map[tag_name])

        # Add skill relationships
        for skill_name in course_data.get("skills_covered", []):
            if skill_name in skill_map:
                course.skills.append(skill_map[skill_name])

        db.add(course)

    # Commit all changes atomically
    await db.commit()
    print(f"Successfully seeded {len(courses_data)} courses")

    # Print summary
    result = await db.execute(select(Course))
    final_course_count = len(result.scalars().all())
    result = await db.execute(select(Tag))
    final_tag_count = len(result.scalars().all())
    result = await db.execute(select(Skill))
    final_skill_count = len(result.scalars().all())

    print("\n=== Seeding Summary ===")
    print(f"Courses: {final_course_count}")
    print(f"Tags: {final_tag_count}")
    print(f"Skills: {final_skill_count}")
