# Backend - FastAPI with Layered Architecture

## Architecture Overview

**Layered Architecture (3-tier)**:
```
API Layer (api/)          → Presentation (HTTP routes, request/response)
   ↓
Service Layer (services/) → Business logic (orchestration, validation)
   ↓
Repository Layer (repositories/) → Data access (database queries)
   ↓
Models Layer (models/)    → Domain entities (SQLAlchemy ORM)
```

## Critical Rules

**NEVER put business logic in API routes** - always delegate to services
**NEVER access database directly from API routes** - always use repositories

The API layer should only:
- Handle HTTP concerns (request parsing, response formatting)
- Call services for business logic
- Return appropriate HTTP status codes

## File Structure

```
backend/
├── main.py                 # FastAPI app, CORS, router mounting, lifespan events
├── pyproject.toml          # uv dependencies (includes test extras)
├── Dockerfile              # Python 3.12-slim + uv
├── alembic.ini             # Alembic migration config
│
├── alembic/                # Database Migrations
│   ├── env.py              # Async PostgreSQL migration environment
│   └── versions/           # Migration scripts
│
├── api/                    # API Layer (Presentation)
│   ├── auth.py             # Registration, login, password reset
│   ├── users.py            # User management + recommendations endpoints
│   │                       # POST /me/recommendations - Generate AI recommendations
│   │                       # GET /me/recommendations - Get recommendation history
│   │                       # GET /me/recommendation-quota - Get rate limit status
│   ├── profiles.py         # Profile CRUD (GET/PATCH /profiles/me)
│   ├── courses.py          # Course browsing, tags, skills
│   └── admin.py            # Admin endpoints (user management, analytics)
│
├── services/               # Service Layer (Business Logic)
│   ├── profile_service.py  # Profile updates with automatic snapshots
│   └── recommendation_service.py # 2-agent LLM recommendation pipeline
│
├── repositories/           # Repository Layer (Data Access)
│   ├── user_profile_repository.py # Profile data access
│   ├── user_repository.py         # User data access
│   └── recommendation_repository.py # Recommendation data access
│
├── models/                 # Models Layer (Domain Entities)
│   ├── base.py             # SQLAlchemy Base class
│   ├── enums.py            # DifficultyLevel, TimeCommitment, TagCategory
│   ├── course.py           # Course, Tag, Skill, junction tables
│   ├── user.py             # User (fastapi-users)
│   ├── user_profile.py     # UserProfile, UserInterest
│   ├── user_profile_snapshot.py # UserProfileSnapshot
│   └── recommendation.py   # Recommendation
│
├── llm/                    # LLM Integration (Multi-Agent System)
│   ├── config.py           # LangChain LLM configuration (singleton)
│   ├── exceptions.py       # LLM-specific exceptions
│   ├── filters.py          # Course pre-filtering logic
│   ├── schemas.py          # Structured output schemas (Pydantic)
│   ├── agents/             # Agent implementations
│   │   ├── profile_analyzer.py   # Agent 1: Analyzes user profile
│   │   └── course_recommender.py # Agent 2: Generates recommendations
│   └── prompts/            # Prompt templates
│       ├── profile_analyzer.py
│       └── course_recommender.py
│
├── schemas/                # Pydantic DTOs (Request/Response)
│   ├── user.py             # UserRead, UserCreate, UserUpdate
│   ├── profile.py          # ProfileRead, ProfileUpdate
│   └── auth.py             # Token, PasswordChangeRequest
│
├── core/                   # Configuration and Core Services
│   ├── config.py           # Pydantic settings (DATABASE_URL, OpenAI, etc.)
│   ├── database.py         # PostgreSQL connection, init_db()
│   ├── auth.py             # JWT strategy and bearer transport
│   ├── users.py            # FastAPIUsers instance
│   └── user_manager.py     # UserManager with on_after_register hook
│
└── scripts/                # Utility Scripts
    ├── seed_courses.py     # Import courses.json → extract tags/skills
    └── seed_demo_users.py  # Create demo users on startup
```

## Key Models

**User** (fastapi-users base classes):
- Authentication identity (email, hashed_password)
- Managed by fastapi-users library

**UserProfile**:
- Learning preferences (learning_goal, current_level, time_commitment)
- Many-to-many with tags (interests via user_interests junction table)
- Versioning (version field, updated_at timestamp)

**UserProfileSnapshot**:
- Historical record of profile changes
- Automatically created on profile updates (via ProfileService)

**Course**:
- Course catalog (title, description, difficulty, duration, contents)
- Many-to-many with tags and skills

**Tag**:
- Categorized tags (category: career_goals, technologies, industries, etc.)
- Used for course metadata and user interests

**Skill**:
- Skills taught by courses

**Recommendation**:
- Recommendation history (user_id, query, recommended_courses, explanation)

## Key Services

**ProfileService**:
- Updates user profiles with automatic snapshot creation
- Atomic transaction (profile update + snapshot creation)
- Business logic for profile versioning

**RecommendationService**:
- 2-agent LLM pipeline for course recommendations
- Rate limiting (10 recommendations per 24 hours)
- Performance logging with `[PERF]` prefix for timing analysis
- Recommendation history with course title enrichment (titles fetched from courses table)
- Stores full recommendation details in JSONB for history retrieval

## Key Repositories

**UserProfileRepository**:
- Data access for user profiles
- Query methods: get_by_user_id, update, get_snapshots

**UserRepository**:
- Data access for users
- Query methods: get_by_id, get_by_email, list_all (admin)

**RecommendationRepository**:
- Data access for recommendations
- Query methods: create, get_by_user_id, get_user_recommendations (with limit)
- Stores recommendation_details JSONB with full LLM response

## Authentication

JWT authentication via fastapi-users:
- Registration: POST /auth/register
- Login: POST /auth/jwt/login
- Password reset: POST /auth/forgot-password (no email sending - stub only)
- Token expiration: 1 hour
- Auto-create empty profile on registration (via UserManager.on_after_register hook)

See `docs/AUTHENTICATION.md` for complete details.

## Database

PostgreSQL 16 via Docker Compose:
- 10 tables: users, user_profiles, user_profile_snapshots, user_interests, courses, tags, skills, course_tags, course_skills, recommendations
- Native UUID types (16 bytes, not VARCHAR)
- Connection pooling: pool_size=10, max_overflow=20
- Auto-seeding from courses.json on startup

See `docs/PRODUCT_DATA_STRATEGY.md` for complete schema.

## Database Migrations (Alembic)

**Alembic is configured for async PostgreSQL migrations.**

Migration files: `backend/alembic/versions/`

**Auto-migrate on startup**: Migrations run automatically when the backend starts (in `main.py` lifespan handler). No manual migration commands needed for normal development.

**Manual commands** (run inside backend container):
```bash
# Check current migration
uv run alembic current

# Create new migration after model changes
uv run alembic revision --autogenerate -m "description"

# Apply migrations manually
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1
```

**When to create migrations**:
- After adding/removing columns in models
- After adding/removing tables
- After changing column types or constraints

**Important**: Always review autogenerated migrations before applying - Alembic may detect spurious changes.

## Admin API

Admin endpoints in `api/admin.py`:
- GET /admin/users - List all users
- GET /admin/users/{user_id} - Get user details
- PATCH /admin/users/{user_id} - Update user (change is_superuser, is_active)
- GET /admin/analytics - User analytics (total users, active users, etc.)

Admin access requires `is_superuser=True` on User model.

## API Documentation

FastAPI generates interactive docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

Use these for manual API testing.

## LLM Integration

The `llm/` module contains a 2-agent recommendation pipeline:

1. **ProfileAnalyzerAgent**: Analyzes user profile, interests, and learning history
2. **CourseRecommenderAgent**: Generates ranked course recommendations

**Key components**:
- `config.py`: LangChain ChatOpenAI singleton (uses `OPENAI_MODEL` from `.env`)
- `filters.py`: Pre-filters courses before LLM to reduce token usage
- `schemas.py`: Pydantic models for structured LLM outputs
- `exceptions.py`: Custom exceptions (LLMTimeoutError, LLMEmptyProfileError, etc.)

**Environment variables**:
```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # or gpt-4o
OPENAI_TEMPERATURE=0.3
OPENAI_TIMEOUT_SECONDS=30
LLM_DEBUG_MODE=false
```

## Performance Logging

The recommendation service logs timing for each pipeline stage with `[PERF]` prefix:

```
[PERF] Starting recommendation for user abc123
[PERF] Rate limit check: 0.01s
[PERF] Profile loaded: 0.05s
[PERF] Courses loaded/filtered: 0.08s (32 of 48 courses)
[PERF] Agent 1 (Profile Analysis): 3.42s
[PERF] Agent 2 (Course Recommendations): 5.18s
[PERF] Database store: 0.02s
[PERF] Total recommendation time: 8.76s
```

View logs with: `docker compose logs backend | grep "\[PERF\]"`

## Architecture Documentation

See `docs/ARCHITECTURE.md` for:
- Why we chose layered architecture
- Alternatives considered (DDD, Hexagonal)
- Layer responsibilities and boundaries
- LLM module structure and design decisions
