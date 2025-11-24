#!/usr/bin/env python3
"""
Test script for AcmeLearn user flow
Tests: login, profile, course browsing, filtering, and course details
"""

import requests
import json
from typing import Optional

BASE_URL = "http://localhost:8000"

class AcmeLearnClient:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.headers = {"Content-Type": "application/json"}

    def register(self, email: str, password: str) -> dict:
        """Register a new user"""
        response = requests.post(
            f"{self.base_url}/auth/register",
            json={"email": email, "password": password}
        )
        print(f"\n📝 REGISTER ({response.status_code})")
        if response.status_code == 201:
            data = response.json()
            print(f"✅ User created: {data['email']}")
            print(f"   User ID: {data['id']}")
            return data
        else:
            print(f"❌ Registration failed: {response.text}")
            return {}

    def login(self, email: str, password: str) -> bool:
        """Login and store JWT token"""
        response = requests.post(
            f"{self.base_url}/auth/jwt/login",
            data={"username": email, "password": password},  # form data
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        print(f"\n🔐 LOGIN ({response.status_code})")
        if response.status_code == 200:
            data = response.json()
            self.token = data["access_token"]
            self.headers["Authorization"] = f"Bearer {self.token}"
            print(f"✅ Logged in as: {email}")
            print(f"   Token: {self.token[:20]}...")
            return True
        else:
            print(f"❌ Login failed: {response.text}")
            return False

    def get_profile(self) -> dict:
        """Get current user's profile"""
        response = requests.get(
            f"{self.base_url}/profiles/me",
            headers=self.headers
        )
        print(f"\n👤 GET PROFILE ({response.status_code})")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profile retrieved:")
            print(f"   User ID: {data['user_id']}")
            print(f"   Learning Goal: {data['learning_goal'] or 'Not set'}")
            print(f"   Current Level: {data['current_level'] or 'Not set'}")
            print(f"   Time Commitment: {data['time_commitment'] or 'Not set'}")
            print(f"   Interests: {len(data['interests'])} interests")
            print(f"   Version: {data['version']}")
            return data
        else:
            print(f"❌ Failed to get profile: {response.text}")
            return {}

    def update_profile(self, interest_names: list = None, **kwargs) -> dict:
        """
        Update user profile

        Args:
            interest_names: List of tag names to convert to IDs
            **kwargs: Other profile fields (learning_goal, current_level, time_commitment)
        """
        # If interest_names provided, convert to tag IDs
        if interest_names:
            tags = self.get_tags()
            tag_id_map = {tag['name'].lower(): tag['id'] for tag in tags}

            interest_tag_ids = []
            for name in interest_names:
                tag_id = tag_id_map.get(name.lower())
                if tag_id:
                    interest_tag_ids.append(tag_id)
                else:
                    print(f"⚠️  Warning: Tag '{name}' not found, skipping")

            kwargs['interest_tag_ids'] = interest_tag_ids

        response = requests.patch(
            f"{self.base_url}/profiles/me",
            json=kwargs,
            headers=self.headers
        )
        print(f"\n✏️  UPDATE PROFILE ({response.status_code})")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profile updated:")
            print(f"   Learning Goal: {data['learning_goal']}")
            print(f"   Current Level: {data['current_level']}")
            print(f"   Time Commitment: {data['time_commitment']}")
            print(f"   Interests: {len(data['interests'])} tags")
            print(f"   Version: {data['version']}")
            return data
        else:
            print(f"❌ Failed to update profile: {response.text}")
            return {}

    def get_courses(self, difficulty: Optional[str] = None, tag_names: Optional[list] = None, limit: int = 5) -> list:
        """
        Get courses with optional filters

        Args:
            difficulty: Filter by difficulty level
            tag_names: List of tag names to filter by (will be converted to IDs)
            limit: Maximum courses to return
        """
        params = {"limit": limit}
        if difficulty:
            params["difficulty"] = difficulty

        # Convert tag names to IDs if provided
        if tag_names:
            all_tags = self.get_tags()
            tag_id_map = {tag['name'].lower(): tag['id'] for tag in all_tags}

            tag_ids = []
            for name in tag_names:
                tag_id = tag_id_map.get(name.lower())
                if tag_id:
                    tag_ids.append(tag_id)

            if tag_ids:
                # API expects tag_ids as multiple query params
                params["tag_ids"] = tag_ids

        response = requests.get(
            f"{self.base_url}/api/courses",
            params=params,
            headers=self.headers
        )

        filter_str = f"difficulty={difficulty}, tags={tag_names}" if (difficulty or tag_names) else "no filters"
        print(f"\n📚 GET COURSES ({filter_str}) - Status {response.status_code}")

        if response.status_code == 200:
            courses = response.json()  # Returns list directly
            print(f"✅ Found {len(courses)} courses")
            for i, course in enumerate(courses, 1):
                print(f"   {i}. {course['title']}")
                print(f"      Difficulty: {course['difficulty']} | Duration: {course['duration']}")
                tag_names_list = [tag['name'] for tag in course['tags']]
                print(f"      Tags: {', '.join(tag_names_list[:3])}{'...' if len(tag_names_list) > 3 else ''}")
            return courses
        else:
            print(f"❌ Failed to get courses: {response.text}")
            return []

    def get_course_by_id(self, course_id: str) -> dict:
        """Get a specific course by ID"""
        response = requests.get(
            f"{self.base_url}/api/courses/{course_id}",
            headers=self.headers
        )
        print(f"\n🎓 GET COURSE BY ID ({response.status_code})")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Course details:")
            print(f"   Title: {data['title']}")
            print(f"   Difficulty: {data['difficulty']}")
            print(f"   Duration: {data['duration']}")
            print(f"   Description: {data['description'][:100]}...")
            tag_names = [tag['name'] for tag in data['tags']]
            skill_names = [skill['name'] for skill in data['skills']]
            print(f"   Tags ({len(data['tags'])}): {', '.join(tag_names[:5])}{'...' if len(tag_names) > 5 else ''}")
            print(f"   Skills ({len(data['skills'])}): {', '.join(skill_names[:5])}{'...' if len(skill_names) > 5 else ''}")
            print(f"   Contents: {len(data['contents'])} modules")
            return data
        else:
            print(f"❌ Failed to get course: {response.text}")
            return {}

    def get_tags(self) -> list:
        """Get all available tags"""
        response = requests.get(
            f"{self.base_url}/api/tags",
            headers=self.headers
        )
        print(f"\n🏷️  GET TAGS ({response.status_code})")
        if response.status_code == 200:
            tags = response.json()  # Returns list directly
            tag_names = [tag['name'] for tag in tags]
            print(f"✅ Found {len(tags)} tags")
            print(f"   Sample: {', '.join(tag_names[:10])}...")
            return tags
        else:
            print(f"❌ Failed to get tags: {response.text}")
            return []

    def get_skills(self) -> list:
        """Get all available skills"""
        response = requests.get(
            f"{self.base_url}/api/skills",
            headers=self.headers
        )
        print(f"\n🎯 GET SKILLS ({response.status_code})")
        if response.status_code == 200:
            skills = response.json()  # Returns list directly
            skill_names = [skill['name'] for skill in skills]
            print(f"✅ Found {len(skills)} skills")
            print(f"   Sample: {', '.join(skill_names[:10])}...")
            return skills
        else:
            print(f"❌ Failed to get skills: {response.text}")
            return []


def main():
    print("=" * 80)
    print("🚀 AcmeLearn User Flow Test")
    print("=" * 80)

    client = AcmeLearnClient()

    # Test credentials - try to login with existing user or create new one
    test_email = "testuser@example.com"
    test_password = "testpass123"

    # Try to login first
    if not client.login(test_email, test_password):
        # If login fails, try to register
        print("\n⚠️  Login failed, attempting to register new user...")
        client.register(test_email, test_password)
        # Login again after registration
        if not client.login(test_email, test_password):
            print("\n❌ Could not login or register. Exiting.")
            return

    # Get and display profile
    profile = client.get_profile()

    # Update profile with some preferences
    client.update_profile(
        learning_goal="Master full-stack web development",
        current_level="Intermediate",  # Must be: Beginner, Intermediate, Advanced
        time_commitment="10-20",  # Must be: 1-5, 5-10, 10-20, 20+
        interest_names=["python", "javascript", "react", "web development"]  # Use lowercase tag names
    )

    # Get updated profile to verify changes
    client.get_profile()

    # Get all tags and skills
    tags = client.get_tags()
    skills = client.get_skills()

    # Browse courses without filters
    print("\n" + "=" * 80)
    print("📖 BROWSING COURSES")
    print("=" * 80)

    all_courses = client.get_courses(limit=3)

    # Filter by difficulty
    client.get_courses(difficulty="beginner", limit=3)
    client.get_courses(difficulty="intermediate", limit=3)
    client.get_courses(difficulty="advanced", limit=3)

    # Filter by tags
    client.get_courses(tag_names=["Python"], limit=3)
    client.get_courses(tag_names=["JavaScript", "React"], limit=3)
    client.get_courses(tag_names=["Machine Learning"], limit=3)

    # Get details for a specific course
    if all_courses:
        course_id = all_courses[0]['id']
        client.get_course_by_id(course_id)

    print("\n" + "=" * 80)
    print("✅ All tests completed!")
    print("=" * 80)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
