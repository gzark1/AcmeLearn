"""
Backend test fixtures.

Provides shared fixtures for testing the FastAPI backend:
- test_db: Async database session with transaction rollback
- client: httpx.AsyncClient with dependency overrides
- test_user: Creates a test user in the database
- auth_headers: JWT authentication headers for protected endpoints
"""
import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

# Set test environment variables before importing app
os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://acmelearn_user:acmelearn_pass@localhost:5432/acmelearn_test"
)
os.environ["SECRET_KEY"] = os.getenv("SECRET_KEY", "test-secret-key-for-testing-only-not-secure")
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from main import app
from core.database import get_async_session
from models.base import Base
from models.user import User
from models.user_profile import UserProfile
from scripts.seed_courses import seed_courses
from fastapi_users.db import SQLAlchemyUserDatabase


# Test database engine
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://acmelearn_user:acmelearn_pass@localhost:5432/acmelearn_test"
)

# Use NullPool for testing to avoid connection conflicts
from sqlalchemy.pool import NullPool
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def ensure_test_database_exists():
    """
    Create test database if it doesn't exist.

    Connects to the default 'postgres' database to create acmelearn_test.
    Works both locally (localhost) and in Docker (postgres_test hostname).
    """
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine
    from urllib.parse import urlparse

    # Extract host from TEST_DATABASE_URL to support both local and Docker
    parsed = urlparse(TEST_DATABASE_URL.replace("+asyncpg", ""))
    db_host = parsed.hostname or "localhost"
    db_port = parsed.port or 5432
    db_user = parsed.username or "acmelearn_user"
    db_pass = parsed.password or "acmelearn_pass"

    # Connect to default postgres database on same host
    admin_url = f"postgresql+asyncpg://{db_user}:{db_pass}@{db_host}:{db_port}/postgres"
    admin_engine = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")

    async with admin_engine.connect() as conn:
        # Check if database exists
        result = await conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = 'acmelearn_test'")
        )
        exists = result.scalar() is not None

        if not exists:
            await conn.execute(text("CREATE DATABASE acmelearn_test"))
            print("Created test database: acmelearn_test")

    await admin_engine.dispose()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database():
    """
    Setup test database once per test session.

    Creates all tables and seeds course data (static data).
    Runs once at the start of test session, not per test.
    """
    # Ensure test database exists
    await ensure_test_database_exists()

    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Seed course data (static, shared across tests)
    async with TestSessionLocal() as session:
        await seed_courses(session)

    yield

    # Cleanup after all tests
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def test_db(setup_test_database):
    """
    Provide async database session for each test.

    Cleans user data before and after each test:
    - Courses persist (seeded once, static data)
    - Users/profiles deleted per test (clean state)
    - No transaction rollback (avoids async conflicts)
    """
    from sqlalchemy import text

    # Use a fresh session for cleanup
    async with TestSessionLocal() as cleanup_session:
        # Clean user data before test (raw SQL to avoid relation issues)
        await cleanup_session.execute(text("TRUNCATE user_profile_snapshots, user_profiles, \"user\" CASCADE"))
        await cleanup_session.commit()

    # Create new session for the test
    async with TestSessionLocal() as session:
        yield session
        # Close session after test
        await session.close()

    # Clean after test
    async with TestSessionLocal() as cleanup_session:
        await cleanup_session.execute(text("TRUNCATE user_profile_snapshots, user_profiles, \"user\" CASCADE"))
        await cleanup_session.commit()


@pytest_asyncio.fixture
async def client(test_db):
    """
    Provide httpx.AsyncClient with overridden database dependency.

    The client uses the test database session, ensuring all API
    requests in tests use the same transactional session.
    """
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_async_session] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    # Clear overrides after test
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(client, test_db):
    """
    Create a test user via the registration endpoint.

    Returns:
        User model with known credentials:
        - email: test@example.com
        - password: TestPassword123
    """
    # Register user via API
    response = await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "TestPassword123"
        }
    )

    if response.status_code != 201:
        raise Exception(f"Failed to create test user: {response.text}")

    user_data = response.json()
    user_id = user_data["id"]

    # Fetch the user from database
    result = await test_db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one()
    return user


@pytest_asyncio.fixture
async def auth_headers(client, test_user):
    """
    Provide authentication headers with valid JWT token.

    Returns:
        dict: Headers with "Authorization: Bearer <token>"
    """
    # Login to get token
    response = await client.post(
        "/auth/jwt/login",
        data={
            "username": "test@example.com",
            "password": "TestPassword123"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 200, f"Login failed: {response.text}"
    token_data = response.json()
    token = token_data["access_token"]

    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_user_profile(test_db, test_user):
    """
    Get the auto-created profile for test_user.

    The profile is automatically created by the on_after_register hook.
    """
    result = await test_db.execute(
        select(UserProfile).where(UserProfile.user_id == test_user.id)
    )
    profile = result.scalar_one()
    await test_db.refresh(profile)
    return profile
