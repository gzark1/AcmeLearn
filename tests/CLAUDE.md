# Backend Tests - pytest + httpx

## Test Location

**IMPORTANT**: Tests are at project root `tests/backend/`, **NOT inside the backend folder**.

```
tests/
├── conftest.py              # Root-level (reserved for cross-stack fixtures)
└── backend/
    ├── __init__.py
    ├── conftest.py          # Backend fixtures (test_db, client, test_user, auth_headers)
    ├── test_api/            # API endpoint tests
    │   ├── __init__.py
    │   ├── test_auth.py     # Registration, login, token validation
    │   ├── test_courses.py  # Course listing, filtering, tag categories
    │   ├── test_profiles.py # Profile CRUD operations
    │   ├── test_admin.py    # Admin endpoints (user management, analytics)
    │   └── test_recommendations.py  # Recommendation generation, quota, history
    │
    └── test_services/       # Service layer tests
        ├── __init__.py
        └── test_profile_service.py  # ProfileService unit tests
```

## Test Database

**Separate test database**: `acmelearn_test` (auto-created if missing)
- Configure via `TEST_DATABASE_URL` in `.env` (see `.env.example`)
- Default: `postgresql+asyncpg://acmelearn_user:acmelearn_pass@localhost:5432/acmelearn_test`
- Tables created fresh per test session
- Course data seeded once per session (static data)
- User data truncated between each test (clean state)

## Running Tests

**Via Docker** (recommended):
```bash
# Run all tests
docker compose exec -e PYTHONPATH=/app backend sh -c \
  'cd /tests/backend && /app/.venv/bin/pytest . -v --asyncio-mode=auto'

# Run specific test file
docker compose exec -e PYTHONPATH=/app backend sh -c \
  'cd /tests/backend && /app/.venv/bin/pytest test_api/test_auth.py -v --asyncio-mode=auto'

# Run specific test function
docker compose exec -e PYTHONPATH=/app backend sh -c \
  'cd /tests/backend && /app/.venv/bin/pytest test_api/test_auth.py::test_register_user -v --asyncio-mode=auto'

# Run with verbose output and show print statements
docker compose exec -e PYTHONPATH=/app backend sh -c \
  'cd /tests/backend && /app/.venv/bin/pytest . -vv -s --asyncio-mode=auto'
```

**Prerequisites**:
- All containers running: `docker compose up --build`
- Test database container (postgres_test) running

## Key Fixtures

Defined in `tests/backend/conftest.py`:

**test_db**:
- Async database session with clean user state per test
- Auto-rollback after each test
- Truncates user-related tables but keeps course data

**client**:
- httpx.AsyncClient for making API requests
- Database dependency override to use test_db
- Base URL: http://testserver

**test_user**:
- Creates a test user (email: test@example.com, password: TestPassword123)
- Returns User object with id
- Auto-creates empty profile via UserManager hook

**auth_headers**:
- JWT authentication headers for protected endpoints
- Format: `{"Authorization": "Bearer <token>"}`
- Used for authenticated requests

**test_user_profile**:
- The auto-created profile for test_user
- Fetched from database after user creation

## Testing Patterns

**API Tests**:
- Test HTTP endpoints using httpx client
- Verify status codes, response schemas, and data
- Test both success and error cases
- Use auth_headers fixture for protected endpoints

Example:
```python
async def test_get_profile(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/profiles/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "learning_goal" in data
```

**Service Tests**:
- Test business logic in isolation
- Use test_db for database operations
- Verify side effects (e.g., snapshots created)

Example:
```python
async def test_update_profile_creates_snapshot(test_db, test_user):
    service = ProfileService(test_db)
    await service.update_profile(test_user.id, {"learning_goal": "New goal"})

    snapshots = await get_snapshots(test_db, test_user.id)
    assert len(snapshots) == 1
```

## Test Coverage

**API Tests** (`test_api/`):
- test_auth.py: Registration, login, password reset, token validation
- test_courses.py: Course listing, filtering by difficulty/tags, tag categories
- test_profiles.py: Profile CRUD, snapshot creation on updates
- test_admin.py: Admin user management, analytics endpoints
- test_recommendations.py: Recommendation generation, quota, history endpoints

**Service Tests** (`test_services/`):
- test_profile_service.py: ProfileService business logic, snapshot creation

## Testing Best Practices

- Use async/await for all database operations
- Test with actual data, not just HTTP status codes
- Verify both success cases AND error handling
- Check database consistency (e.g., snapshots match versions)
- Use PostgreSQL MCP queries to verify database state
- Clean up test data between tests (handled by fixtures)
