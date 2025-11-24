#!/usr/bin/env python3
"""
Test unauthorized access to AcmeLearn endpoints
Tests that authentication is properly enforced on protected routes
"""

import requests

BASE_URL = "http://localhost:8000"


def test_unauthorized_access():
    """Test that protected endpoints reject unauthenticated requests"""

    print("=" * 80)
    print("🔒 Testing Unauthorized Access to Protected Endpoints")
    print("=" * 80)

    # Test endpoints without authentication token
    endpoints = [
        ("GET", "/profiles/me", "Get user profile"),
        ("PATCH", "/profiles/me", "Update user profile"),
        ("GET", "/api/courses", "List courses"),
        ("GET", "/api/courses/00000000-0000-0000-0000-000000000000", "Get course by ID"),
        ("GET", "/api/tags", "List tags"),
        ("GET", "/api/skills", "List skills"),
    ]

    results = []

    for method, endpoint, description in endpoints:
        url = f"{BASE_URL}{endpoint}"

        if method == "GET":
            response = requests.get(url)
        elif method == "PATCH":
            response = requests.patch(url, json={})
        else:
            response = requests.request(method, url)

        status = response.status_code
        is_protected = status == 401  # Unauthorized

        icon = "✅" if is_protected else "❌"
        protection_status = "PROTECTED" if is_protected else "EXPOSED"

        print(f"\n{icon} {method} {endpoint}")
        print(f"   Description: {description}")
        print(f"   Status: {status} - {protection_status}")

        if not is_protected:
            print(f"   ⚠️  WARNING: This endpoint is accessible without authentication!")
            print(f"   Response: {response.text[:100]}...")

        results.append({
            "endpoint": f"{method} {endpoint}",
            "description": description,
            "status": status,
            "protected": is_protected
        })

    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)

    protected_count = sum(1 for r in results if r["protected"])
    total_count = len(results)

    print(f"\nProtected endpoints: {protected_count}/{total_count}")

    if protected_count == total_count:
        print("✅ All endpoints properly protected - authentication required")
    else:
        print(f"❌ WARNING: {total_count - protected_count} endpoint(s) exposed without authentication!")
        print("\nExposed endpoints:")
        for r in results:
            if not r["protected"]:
                print(f"   - {r['endpoint']}: {r['description']}")

    print("\n" + "=" * 80)


def test_public_endpoints():
    """Test that public endpoints are accessible"""

    print("\n" + "=" * 80)
    print("🌐 Testing Public Endpoints (Should Work Without Auth)")
    print("=" * 80)

    public_endpoints = [
        ("GET", "/", "Root health check"),
        ("GET", "/health", "Health check"),
    ]

    for method, endpoint, description in public_endpoints:
        url = f"{BASE_URL}{endpoint}"
        response = requests.get(url)

        status = response.status_code
        is_accessible = status == 200

        icon = "✅" if is_accessible else "❌"

        print(f"\n{icon} {method} {endpoint}")
        print(f"   Description: {description}")
        print(f"   Status: {status}")

        if is_accessible:
            print(f"   Response: {response.json()}")


if __name__ == "__main__":
    try:
        test_unauthorized_access()
        test_public_endpoints()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
