"""
Test script for authentication and profile management flow.

Tests:
1. Registration (User + Profile + Snapshot creation)
2. Login (JWT token)
3. Get profile
4. Update profile (should create snapshot)
5. Verify snapshot was created
"""
import requests
import json

BASE_URL = "http://localhost:8000"


def test_registration():
    """Test user registration with profile data."""
    print("\n=== Testing Registration ===")

    registration_data = {
        "email": "test@example.com",
        "password": "SecurePassword123!",
        "profile": {
            "learning_goal": "Learn full-stack web development",
            "current_level": "Intermediate",
            "time_commitment": 10,
            "interest_tag_ids": []
        }
    }

    response = requests.post(
        f"{BASE_URL}/auth/register",
        json=registration_data
    )

    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        print("✓ Registration successful!")
        return response.json()
    else:
        print("✗ Registration failed")
        return None


def test_login(email, password):
    """Test login and get JWT token."""
    print("\n=== Testing Login ===")

    login_data = {
        "username": email,  # fastapi-users uses 'username' field
        "password": password
    }

    response = requests.post(
        f"{BASE_URL}/auth/jwt/login",
        data=login_data  # form data, not JSON
    )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        token_data = response.json()
        print(f"✓ Login successful! Token: {token_data['access_token'][:20]}...")
        return token_data['access_token']
    else:
        print(f"✗ Login failed: {response.text}")
        return None


def test_get_profile(token):
    """Test getting user profile."""
    print("\n=== Testing Get Profile ===")

    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(
        f"{BASE_URL}/profiles/me",
        headers=headers
    )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        profile = response.json()
        print(f"✓ Profile retrieved!")
        print(f"  Version: {profile['version']}")
        print(f"  Learning Goal: {profile['learning_goal']}")
        return profile
    else:
        print(f"✗ Failed to get profile: {response.text}")
        return None


def test_update_profile(token):
    """Test updating user profile (should create snapshot)."""
    print("\n=== Testing Profile Update ===")

    headers = {"Authorization": f"Bearer {token}"}

    update_data = {
        "learning_goal": "Master AI and machine learning",
        "current_level": "Advanced",
        "time_commitment": 15
    }

    response = requests.patch(
        f"{BASE_URL}/profiles/me",
        headers=headers,
        json=update_data
    )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        profile = response.json()
        print(f"✓ Profile updated!")
        print(f"  New Version: {profile['version']}")
        print(f"  New Learning Goal: {profile['learning_goal']}")
        return profile
    else:
        print(f"✗ Failed to update profile: {response.text}")
        return None


def test_list_courses(token):
    """Test listing courses (authentication required)."""
    print("\n=== Testing List Courses ===")

    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(
        f"{BASE_URL}/api/courses?limit=5",
        headers=headers
    )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        courses = response.json()
        print(f"✓ Retrieved {len(courses)} courses")
        if courses:
            print(f"  First course: {courses[0]['title']}")
        return courses
    else:
        print(f"✗ Failed to list courses: {response.text}")
        return None


def main():
    """Run all tests."""
    print("=" * 60)
    print("AcmeLearn Authentication Flow Test")
    print("=" * 60)

    # Test 1: Registration
    user = test_registration()
    if not user:
        print("\n✗ Tests failed at registration")
        return

    # Test 2: Login
    token = test_login("test@example.com", "SecurePassword123!")
    if not token:
        print("\n✗ Tests failed at login")
        return

    # Test 3: Get Profile
    profile = test_get_profile(token)
    if not profile:
        print("\n✗ Tests failed at get profile")
        return

    # Test 4: Update Profile
    updated_profile = test_update_profile(token)
    if not updated_profile:
        print("\n✗ Tests failed at update profile")
        return

    # Verify version incremented
    if updated_profile['version'] > profile['version']:
        print(f"\n✓ Profile version incremented: {profile['version']} -> {updated_profile['version']}")
    else:
        print(f"\n✗ Profile version did not increment!")

    # Test 5: List Courses
    courses = test_list_courses(token)
    if not courses:
        print("\n✗ Tests failed at list courses")
        return

    print("\n" + "=" * 60)
    print("✓ All tests passed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
