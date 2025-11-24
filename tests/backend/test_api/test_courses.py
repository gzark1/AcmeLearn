"""
Tests for course browsing endpoints.

Tests course listing, filtering, and tag categorization.
"""
import pytest
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))

from models.enums import DifficultyLevel


async def test_list_courses(client, auth_headers):
    """Test listing all courses with authentication."""
    response = await client.get("/api/courses", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0  # We have 48 seeded courses
    assert len(data) <= 50  # Default limit

    # Check course structure
    first_course = data[0]
    assert "id" in first_course
    assert "title" in first_course
    assert "difficulty" in first_course
    assert "tags" in first_course


async def test_filter_courses_by_difficulty(client, auth_headers):
    """Test filtering courses by difficulty level."""
    response = await client.get(
        "/api/courses",
        headers=auth_headers,
        params={"difficulty": "beginner"}
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

    # All returned courses should be beginner level
    for course in data:
        assert course["difficulty"] == "beginner"


async def test_filter_courses_by_tags(client, auth_headers, test_db):
    """Test filtering courses by tag IDs."""
    # Get a tag ID
    from models.course import Tag
    from sqlalchemy import select
    result = await test_db.execute(select(Tag).where(Tag.name == "python"))
    python_tag = result.scalar_one_or_none()

    if python_tag:
        response = await client.get(
            "/api/courses",
            headers=auth_headers,
            params={"tag_ids": [str(python_tag.id)]}
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0

        # Check that returned courses have the python tag
        for course in data:
            tag_names = [tag["name"] for tag in course["tags"]]
            assert "python" in tag_names


async def test_get_tag_categories_grouped(client, auth_headers):
    """Test tag-categories endpoint returns grouped tags."""
    response = await client.get("/api/tag-categories", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()

    # Should be a dict with category names as keys
    assert isinstance(data, dict)
    assert len(data) > 0

    # Should have known categories
    assert "Programming" in data
    assert "Business" in data

    # Each category should have a list of tags
    programming_tags = data["Programming"]
    assert isinstance(programming_tags, list)
    assert len(programming_tags) > 0

    # Each tag should have id, name, category
    first_tag = programming_tags[0]
    assert "id" in first_tag
    assert "name" in first_tag
    assert "category" in first_tag
    assert first_tag["category"] == "Programming"


async def test_get_single_course(client, auth_headers, test_db):
    """Test getting a single course by ID."""
    # Get a course ID from database
    from models.course import Course
    from sqlalchemy import select
    result = await test_db.execute(select(Course).limit(1))
    course = result.scalar_one()

    response = await client.get(
        f"/api/courses/{course.id}",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(course.id)
    assert data["title"] == course.title
    assert "tags" in data
    assert "skills" in data


async def test_get_nonexistent_course_returns_404(client, auth_headers):
    """Test getting non-existent course returns 404."""
    import uuid
    fake_id = uuid.uuid4()

    response = await client.get(
        f"/api/courses/{fake_id}",
        headers=auth_headers
    )

    assert response.status_code == 404
