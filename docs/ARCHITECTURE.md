# AcmeLearn Architecture Documentation

## Overview

AcmeLearn follows a **Layered Architecture** pattern (also known as N-tier architecture) to organize the backend codebase into distinct layers with clear separation of concerns. This document serves as the source of truth for architectural decisions, design principles, and implementation guidelines.

---

## Architecture Pattern: Layered Architecture

### Why Layered Architecture?

After evaluating multiple architecture patterns (MVC, Hexagonal, Onion, Clean Architecture, DDD), we chose **Layered Architecture** because:

1. **Right complexity level** - Not too simple (MVC), not over-engineered (DDD, Hexagonal)
2. **Industry standard** - Widely understood, easy for reviewers to evaluate
3. **Clear separation** - Distinct layers with well-defined responsibilities
4. **Fast to implement** - Can build working features quickly within 5-day timeline
5. **Testable** - Each layer can be tested independently
6. **Scalable** - Can evolve to more complex patterns if needed

### Core Principles

Based on research from software architecture best practices (2024-2025):

#### 1. Separation of Concerns
> "Each layer is responsible for a finite amount of work, and any work that cannot be done by a particular layer gets delegated to a layer more appropriate for handling the task."

- **Presentation Layer (API)**: HTTP concerns only - routing, request/response handling
- **Business Logic Layer (Services)**: Domain logic, orchestration, use cases
- **Data Access Layer (Repositories)**: Database operations, queries

#### 2. Top-Down Dependencies
> "These layers interact in a top-down manner, where higher layers depend on lower layers but not vice-versa."

```
API Layer
   ↓ (depends on)
Service Layer
   ↓ (depends on)
Repository Layer
   ↓ (depends on)
Models/Database
```

**No reverse dependencies allowed** - Services don't know about HTTP, Repositories don't know about business logic.

#### 3. Well-Defined Interfaces
> "Layers should be as independent as possible, with clear and well-defined interfaces."

- Each layer exposes clear contracts (method signatures)
- Changes in one layer minimize impact on others
- Use dependency injection to manage layer dependencies

#### 4. Depend on Abstractions
> "Depend on abstractions rather than concrete implementations to minimize tight coupling between layers."

- Services work with repository interfaces (abstract concepts)
- Can swap implementations (PostgreSQL → SQLite) without changing business logic

---

## Project Structure

```
backend/
├── api/                    # 🔵 PRESENTATION LAYER
│   ├── __init__.py
│   ├── deps.py            # Shared dependencies (get_db, get_current_user)
│   ├── auth.py            # Authentication endpoints
│   ├── courses.py         # Course browsing endpoints
│   ├── users.py           # User management & recommendations endpoints
│   ├── profiles.py        # User profile CRUD endpoints
│   ├── admin.py           # Admin user management & analytics (superuser only)
│   └── recommendations.py # AI recommendation endpoints (Phase 4)
│
├── services/              # 🟢 BUSINESS LOGIC LAYER
│   ├── __init__.py
│   ├── auth_service.py    # User registration, login, JWT generation
│   ├── course_service.py  # Course search/filter logic
│   ├── user_service.py    # Profile management business rules
│   └── recommendation_service.py  # AI recommendation engine
│
├── repositories/          # 🟡 DATA ACCESS LAYER
│   ├── __init__.py
│   ├── user_repository.py       # User queries & admin operations
│   ├── user_profile_repository.py # Profile CRUD operations
│   ├── course_repository.py     # Course queries
│   └── recommendation_repository.py  # Recommendation persistence (stub)
│
├── models/               # 📦 DATABASE MODELS
│   ├── __init__.py
│   ├── user.py          # User SQLAlchemy model
│   ├── course.py        # Course SQLAlchemy model
│   ├── user_profile.py  # UserProfile SQLAlchemy model
│   └── recommendation.py # Recommendation SQLAlchemy model
│
├── schemas/             # 📋 PYDANTIC DTOs
│   ├── __init__.py
│   ├── auth.py         # Auth request/response schemas
│   ├── user.py         # User schemas (UserRead, UserCreate, UserUpdate)
│   ├── profile.py      # Profile schemas (ProfileRead, ProfileUpdate)
│   ├── course.py       # Course schemas
│   ├── recommendation.py # Recommendation schemas
│   └── admin.py        # Admin schemas (user lists, analytics, snapshots)
│
├── core/               # ⚙️ CONFIGURATION
│   ├── __init__.py
│   ├── config.py       # Application settings
│   ├── security.py     # JWT, password hashing
│   └── database.py     # Database session management
│
├── main.py            # FastAPI application entry point
└── pyproject.toml     # uv dependency management
```

---

## Layer Responsibilities

### 1. API Layer (`api/`)

**Purpose**: Handle HTTP protocol concerns

**Responsibilities**:
- Define FastAPI routes and endpoints
- Receive HTTP requests, validate via Pydantic schemas
- Call appropriate service layer methods
- Return HTTP responses with proper status codes
- Handle request-level concerns (authentication, headers)

**What NOT to do**:
- ❌ No business logic (no calculations, decisions, orchestration)
- ❌ No direct database access (never import repositories)
- ❌ No LLM calls or external API integrations

**Example** (`api/recommendations.py`):
```python
@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(
    request: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # API layer just delegates to service
    return recommendation_service.generate(db, current_user, request)
```

### 2. Service Layer (`services/`)

**Purpose**: Implement business logic and use cases

**Responsibilities**:
- Orchestrate operations (call multiple repositories if needed)
- Implement business rules and validation
- Transform data between layers
- Handle external integrations (LLM APIs, third-party services)
- Coordinate transactions

**What NOT to do**:
- ❌ No HTTP-specific code (no request/response objects)
- ❌ No direct SQL queries (use repositories)
- ❌ No knowledge of database implementation details

**Example** (`services/recommendation_service.py`):
```python
def generate(db: Session, user: User, query: str) -> Recommendation:
    # 1. Get user profile (via repository)
    profile = user_repository.get_profile(db, user.id)

    # 2. Pre-filter courses (via repository)
    courses = course_repository.filter_by_difficulty(db, profile.level)

    # 3. Business logic: Build LLM context
    context = build_context(profile, courses, query)

    # 4. Call LLM (external integration)
    llm_response = llm_client.generate(context)

    # 5. Save result (via repository)
    return recommendation_repository.save(db, user.id, llm_response)
```

### 3. Repository Layer (`repositories/`)

**Purpose**: Abstract data access operations

**Responsibilities**:
- Execute database queries (SELECT, INSERT, UPDATE, DELETE)
- Construct complex queries with filters
- Handle database-specific operations
- Return domain objects (SQLAlchemy models)

**What NOT to do**:
- ❌ No business logic or calculations
- ❌ No knowledge of HTTP or API layer
- ❌ No LLM calls or external integrations

**Example** (`repositories/course_repository.py`):
```python
def filter_by_tags(db: Session, tags: list[str]) -> list[Course]:
    # Pure data access - no business logic
    return db.query(Course).filter(
        Course.tags.overlap(tags)
    ).all()
```

### 4. Models Layer (`models/`)

**Purpose**: Define database schema using SQLAlchemy ORM

**Not a layer** - these are data structures used by repositories.

**Responsibilities**:
- Define table schemas
- Define relationships between tables
- Provide ORM mapping

### 5. Schemas Layer (`schemas/`)

**Purpose**: Define API contracts using Pydantic

**Not a layer** - these are validation/serialization structures used by API layer.

**Responsibilities**:
- Request validation
- Response serialization
- Type safety for API
- Separation from database models (allows independent evolution)

### 6. Core Module (`core/`)

**Purpose**: Shared configuration and utilities

**Responsibilities**:
- Application settings (environment variables)
- Database connection setup
- Security utilities (JWT, password hashing)
- Dependency injection setup

---

## Key Design Decisions

### 1. LLM Integration Placement

**Decision**: LLM integration lives in `services/recommendation_service.py`

**Rationale**:
- LLM calls are business logic (context engineering, prompt construction)
- Not infrastructure (unlike database)
- Tightly coupled to recommendation use case
- For 5-day timeline, no need for separate `llm/` abstraction layer

**Alternative considered**: Separate `llm/` module with client abstractions
- **Rejected**: Over-engineering for single LLM use case
- **When to reconsider**: If adding multi-agent systems or multiple LLM providers

### 2. Database Choice: PostgreSQL with Docker

<!-- ✅ COMPLETED: Migrated from SQLite to PostgreSQL (2025-11-22) -->

**Decision**: PostgreSQL 16 via Docker Compose

**Rationale**:
- Native UUID type support (16 bytes vs 32-byte strings)
- Better connection pooling for concurrent requests
- JSONB for efficient array queries (future optimization)
- Industry-standard for web applications
- Docker provides consistent environment across developers

**Implementation**:
- PostgreSQL 16 Alpine in Docker container
- Backend runs locally (hot reload during development)
- Connection pooling configured (pool_size=10, max_overflow=20)
- Environment-based credentials (`.env` file, gitignored)

### 3. Course Data Persistence Strategy

<!-- ✅ COMPLETED: Normalized schema with tags/skills tables (2025-11-22) -->

**Context**: Assessment specifies courses are **read-only**

**Decision**: PostgreSQL with normalized schema (tags and skills in separate tables)

**Implementation**:
- Courses table with UUID primary keys (native type, not strings)
- Normalized tags table (169 unique tags extracted from courses.json)
- Normalized skills table (230 unique skills)
- Many-to-many junction tables (course_tags, course_skills)
- Auto-seeded on startup if database is empty
- Standard SQLAlchemy queries via `course_repository`

**Benefits**:
- Referential integrity via foreign keys
- Tag/skill metadata extensibility
- Clean API endpoints (`GET /api/v1/tags`)
- Simple analytics queries (tag popularity, etc.)

<!-- ❌ NOT IMPLEMENTED: Redis caching layer (deferred - MVP uses PostgreSQL only) -->

### 4. Authentication Strategy

<!-- ✅ IMPLEMENTED: Using fastapi-users (Phase 2 - 2025-11-24) -->

**Decision**: JWT tokens with fastapi-users library

**Rationale**:
- Industry standard, well-understood
- Stateless (no session storage needed)
- fastapi-users provides batteries-included auth (registration, login, password reset)
- Async SQLAlchemy support (matches our PostgreSQL setup)
- Extensible hooks for custom business logic (on_after_register)

**Implementation**:
- `fastapi-users` - User management library
- JWT bearer authentication with 1-hour token expiration
- Separate User (auth) and UserProfile (preferences) models
- Auto-create empty profile on registration via hook
- See `docs/AUTHENTICATION.md` for complete implementation details

### 5. Superuser & Admin System

<!-- ✅ IMPLEMENTED: Superuser system (Phase 3 - 2025-11-25) -->

**Decision**: Role-based access control with superuser flag

**Rationale**:
- Simple, effective access control for admin features
- Built-in fastapi-users support for `is_superuser` flag
- Single admin role sufficient for MVP (no complex RBAC needed)
- Environment-based superuser creation for secure deployment

**Implementation**:
- `is_superuser` boolean flag on User model
- `current_superuser` dependency for admin-only endpoints
- Auto-create/promote superuser from `SUPERUSER_EMAIL` and `SUPERUSER_PASSWORD` env vars on startup
- Admin routes mounted at `/admin/*` prefix

**Admin Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/users` | GET | List users with pagination and filters |
| `/admin/users/{id}` | GET | Get user detail with profile |
| `/admin/users/{id}/deactivate` | PATCH | Soft-delete user (set is_active=false) |
| `/admin/users/{id}/profile-history` | GET | Get user's profile snapshots |
| `/admin/analytics/overview` | GET | System stats (total users, active, completion rate) |
| `/admin/analytics/tags/popular` | GET | Tags sorted by user interest count |

**Security Measures**:
- All admin endpoints require `current_superuser` dependency (403 for non-superusers)
- Cannot deactivate yourself (prevents admin lockout)
- `is_superuser` cannot be self-set via user update endpoints
- Superuser creation only via environment variables (not API)

### 6. Dependency Management: uv vs pip

<!-- ✅ COMPLETED: Using uv with pyproject.toml (2025-11-22) -->

**Decision**: Use `uv` with `pyproject.toml`

**Rationale**:
- 10-100x faster than pip (written in Rust)
- Modern standard (2024-2025)
- `pyproject.toml` is Python's future (PEP 621)
- `uv.lock` for reproducible installs
- User already has `uv` installed

**Alternative**: pip with `requirements.txt`
- **Rejected**: Slower, older approach

---

## FastAPI Best Practices Applied

Based on research from FastAPI community best practices (2024):

### 1. API Versioning
```python
# main.py
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(courses_router, prefix="/api/v1/courses", tags=["courses"])
```

**Why**: Allows future API changes without breaking clients

### 2. Dependency Injection
```python
# api/deps.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # JWT validation
    return user
```

**Why**:
- Testable (can inject mock DB)
- Reusable across endpoints
- FastAPI's killer feature

### 3. Async Where Beneficial
```python
# Use async for I/O-bound operations
@router.get("/courses")
async def get_courses(db: Session = Depends(get_db)):
    # Database I/O
    return await course_service.get_all(db)

# Sync is fine for CPU-bound or trivial operations
def hash_password(password: str) -> str:
    return pwd_context.hash(password)
```

**Why**: Performance for I/O operations (DB, LLM API calls)

### 4. Pydantic Settings for Configuration
```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    OPENAI_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
```

**Why**: Type-safe environment variables with validation

### 5. Separate Schemas from Models
```python
# schemas/user.py (API contract)
class UserProfileResponse(BaseModel):
    learning_goal: str
    current_level: str

# models/user.py (Database structure)
class UserProfile(Base):
    __tablename__ = "user_profiles"
    learning_goal = Column(String)
    current_level = Column(String)
```

**Why**:
- API can evolve independently from database
- Response models can aggregate/transform data
- Better security (don't expose password_hash in responses)

---

## Database Schema Design

<!-- ✅ COMPLETED: Core tables implemented with UUID types (2025-11-22) -->
<!-- ❌ NOT IMPLEMENTED: user_profiles, recommendations (deferred to Phase 2) -->

### Implemented Tables (Phase 1)

#### courses
```sql
id: UUID (PK, native PostgreSQL type)
title: VARCHAR(255) (indexed)
description: TEXT
difficulty: VARCHAR(20) (enum: beginner/intermediate/advanced, indexed)
duration: INTEGER (hours)
contents: TEXT
created_at: TIMESTAMP
```

#### tags
```sql
id: UUID (PK, native type)
name: VARCHAR(100) (unique, indexed)
created_at: TIMESTAMP
```

#### skills
```sql
id: UUID (PK, native type)
name: VARCHAR(200) (unique, indexed)
created_at: TIMESTAMP
```

#### course_tags (junction table)
```sql
course_id: UUID (PK, FK → courses.id ON DELETE CASCADE)
tag_id: UUID (PK, FK → tags.id ON DELETE CASCADE)
```

#### course_skills (junction table)
```sql
course_id: UUID (PK, FK → courses.id ON DELETE CASCADE)
skill_id: UUID (PK, FK → skills.id ON DELETE CASCADE)
```

### Implemented Tables (Phase 2) ✅ COMPLETED

#### users
```sql
id: UUID (PK, native type)
email: String (unique, indexed)
hashed_password: String
is_active: Boolean (soft delete)
is_superuser: Boolean
is_verified: Boolean
created_at: DateTime
updated_at: DateTime
```

#### user_profiles
```sql
id: UUID (PK, native type)
user_id: UUID (FK → users.id ON DELETE CASCADE, unique)
learning_goal: Text (nullable)
current_level: String (nullable - "Beginner", "Intermediate", "Advanced")
time_commitment: Integer (nullable - hours per week, 1-168)
version: Integer (default 1, increments on update)
interests: Many-to-many with tags via user_interests junction table
created_at: DateTime
updated_at: DateTime
```

#### user_profile_snapshots
```sql
id: UUID (PK, native type)
user_profile_id: UUID (FK → user_profiles.id ON DELETE CASCADE, indexed)
version: Integer (matches profile version at time of snapshot)
learning_goal: Text (snapshot of profile data)
current_level: String
time_commitment: Integer
interests_snapshot: JSONB (denormalized tag names array)
created_at: DateTime
```

#### user_interests (junction table)
```sql
user_profile_id: UUID (PK, FK → user_profiles.id ON DELETE CASCADE)
tag_id: UUID (PK, FK → tags.id ON DELETE CASCADE)
```

### Planned Tables (Phase 4 - AI Integration)

#### recommendations
```sql
id: UUID (PK, native type)
user_id: UUID (FK → users.id)
profile_version: Integer (which profile version generated recommendation)
query: Text (user's query/request)
recommended_course_ids: JSONB (array of UUIDs)
explanation: Text (LLM-generated explanation)
llm_model: String (e.g., "gpt-4", "claude-3-sonnet")
created_at: DateTime
```

### Design Decisions

**UUIDs**:
<!-- ✅ COMPLETED: Native UUID type implemented (2025-11-22) -->
- **Decision**: Native PostgreSQL UUID type (16 bytes)
- **Benefits**: 50% storage reduction vs VARCHAR(36), faster indexing, better type safety
- **Implementation**: SQLAlchemy `Uuid` type with Python `uuid.uuid4` defaults

**Normalized tags/skills**:
<!-- ✅ COMPLETED: Normalized schema with junction tables (2025-11-22) -->
- **Decision**: Separate tables with many-to-many relationships
- **Benefits**: Referential integrity, metadata extensibility, clean APIs, simple analytics
- **Trade-off**: More complex queries (requires joins) vs simpler JSON arrays

---

## AI/LLM Integration Strategy

### Architecture Placement

**Location**: `services/recommendation_service.py`

**Components**:
1. **Context Builder**: Transforms user profile + courses into structured prompt
2. **LLM Client**: Calls OpenAI/Claude API
3. **Response Parser**: Extracts recommendations and explanations from LLM response

### Dynamic Context Engineering

Assessment requirement: "Dynamic context engineering (not just static prompts)"

**Implementation approach**:
```python
def build_context(user_profile, courses, query):
    """
    Dynamic context construction based on:
    - User's learning goal (personalization)
    - Current skill level (filter difficulty)
    - Areas of interest (match with course tags)
    - Time availability (course duration)
    - Specific query (user's current need)
    """
    context = {
        "user": {
            "goal": user_profile.learning_goal,
            "level": user_profile.current_level,
            "interests": user_profile.interests,
            "time_per_week": user_profile.time_commitment
        },
        "available_courses": [
            # Pre-filtered based on difficulty/interests
            {"title": c.title, "tags": c.tags, ...} for c in courses
        ],
        "query": query
    }

    # Construct prompt from context
    prompt = f"""
    You are a learning advisor. Recommend 3-5 courses for a user with:
    - Goal: {context['user']['goal']}
    - Level: {context['user']['level']}
    ...
    """
    return prompt
```

### LLM Provider Decision

**Options**:
- **OpenAI** (GPT-4 / GPT-3.5-turbo): Industry standard, reliable
- **Claude** (Anthropic): Better for structured outputs
- **LangChain**: Abstraction layer for prompt templates, chains

**Decision**: Start with direct OpenAI client
- Simple, well-documented
- Full control over prompts
- Can add LangChain later if needed for multi-agent systems

**When to add LangChain**:
- Multi-agent architecture (skill assessor + recommender)
- Conversational refinement (chat history management)
- Complex chains with multiple steps

---

## Development Workflow

### Phase 1: Foundation (Day 1) ✅ COMPLETED
- ✅ Project structure setup
- ✅ Database models (Course, Tag, Skill, junction tables)
- ✅ PostgreSQL Docker Compose setup
- ✅ UUID migration (native type, 16 bytes)
- ✅ Course data seeding (48 courses, 169 tags, 230 skills)
- ✅ Basic FastAPI app with health check
- ✅ Normalized schema with many-to-many relationships

### Phase 2: Authentication & User Management (Day 2-3) ✅ COMPLETED
- ✅ User registration and login (fastapi-users)
- ✅ JWT token generation/validation (1-hour expiration)
- ✅ Password hashing (bcrypt via fastapi-users)
- ✅ Protected endpoints (current_active_user dependency)
- ✅ User profile model with versioning
- ✅ Profile snapshot system (historical tracking)
- ✅ Auto-create empty profile on registration
- ✅ Superuser system (is_superuser flag, current_superuser dependency)
- ✅ Auto-create superuser from environment variables on startup

### Phase 3: Core Features (Day 3-4) ✅ COMPLETED
- ✅ Course browsing API (list, filter by difficulty/tags)
- ✅ User profile CRUD (GET/PATCH /profiles/me)
- ✅ Profile history endpoint (GET /profiles/me/history)
- ✅ Repository pattern implementation (UserProfileRepository, UserRepository)
- ✅ Service layer implementation (ProfileService with snapshots)
- ✅ Tags and skills endpoints (GET /api/tags, /api/skills)
- ✅ Admin user management (list, detail, deactivate users)
- ✅ Admin analytics (overview stats, popular tags)
- ✅ Comprehensive test suite (auth, courses, profiles, admin)

### Phase 4: AI Integration (Day 3-4)
- LLM client setup
- Context engineering
- Recommendation generation
- Explanation parsing

### Phase 5: Polish (Day 4-5)
- Error handling
- API documentation (auto-generated by FastAPI)
- Testing critical paths
- Docker setup (optional)
- README documentation

---

## Testing Strategy

### Unit Tests
- **Services**: Mock repositories, test business logic
- **Repositories**: Test database queries with test DB
- **Utilities**: Test JWT, password hashing

### Integration Tests
- **API endpoints**: Test full request/response cycle
- **Database operations**: Test migrations, constraints

### Manual Testing
- FastAPI interactive docs (`/docs`) for API testing
- Manual testing of recommendation quality

**Priority**: Manual testing for MVP (5-day timeline), automated tests if time permits

---

## Deployment Considerations

### Optional (If Time Permits)

**Docker Compose**:

<!-- ✅ COMPLETED: PostgreSQL via Docker Compose (2025-11-22) -->

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: acmelearn_postgres
    env_file:
      - .env
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
```

**Setup**:
- Copy `.env.example` to `.env` with your credentials
- Run `docker compose up -d` to start PostgreSQL
- Backend runs locally: `cd backend && uvicorn main:app --reload`

<!-- ❌ NOT IMPLEMENTED: Backend Dockerfile (not needed - runs locally for development) -->

**Deployment platforms** (assessment says optional):
- Backend: Railway, Render, Fly.io
- Frontend: Vercel, Netlify

---

## Common Pitfalls to Avoid

### 1. Business Logic in API Layer
❌ **Bad**:
```python
@router.post("/recommendations")
async def recommend(request: RecommendationRequest):
    # DON'T: LLM call in API layer
    llm_response = openai.chat.completions.create(...)
```

✅ **Good**:
```python
@router.post("/recommendations")
async def recommend(request: RecommendationRequest):
    # Delegate to service layer
    return recommendation_service.generate(db, user, request)
```

### 2. Repositories with Business Logic
❌ **Bad**:
```python
def get_recommended_courses(db, user):
    # DON'T: Business logic in repository
    if user.level == "beginner":
        return db.query(Course).filter(Course.difficulty == "beginner")
```

✅ **Good**:
```python
# Repository: pure data access
def get_courses_by_difficulty(db, difficulty):
    return db.query(Course).filter(Course.difficulty == difficulty)

# Service: business logic
def get_suitable_courses(db, user):
    difficulty = determine_suitable_difficulty(user)  # business rule
    return course_repository.get_courses_by_difficulty(db, difficulty)
```

### 3. Mixing Schemas and Models
❌ **Bad**: Using SQLAlchemy models as API response types
✅ **Good**: Separate Pydantic schemas for API, SQLAlchemy models for DB

### 4. Over-Engineering Too Early
- Don't create abstractions before you need them
- Don't add caching until you measure performance
- Don't implement all nice-to-have features before MVP works

---

## References

### Research Sources

**Layered Architecture Principles**:
- "Understanding the Layered Architecture Pattern: A Comprehensive Guide" (DEV Community, 2024)
- "Software Architecture Patterns" (O'Reilly, Chapter 1: Layered Architecture)
- "Layered Architecture: Building Scalable & Maintainable Software Systems" (Bitloops Docs)

**FastAPI Best Practices**:
- "FastAPI Best Practices and Conventions" (GitHub: zhanymkanov/fastapi-best-practices)
- "Layered Architecture & Dependency Injection" (DEV Community, 2024)
- "Write Robust APIs with Three Layer Architecture, FastAPI and Pydantic" (Medium, 2024)

**Architecture Patterns Comparison**:
- "Backend side architecture evolution (N-layered, DDD, Hexagon, Onion, Clean Architecture)" (Medium)
- "Hexagonal Architecture and Clean Architecture (with examples)" (DEV Community)
- "When to Use DDD: Is DDD Only Good for Complex Domains?" (Stack Overflow discussions)

---

## Appendix: Alternative Architectures Considered

### Hexagonal Architecture (Ports & Adapters)
**Why rejected**:
- Too complex for 5-day timeline
- Requires many interfaces/abstractions
- Overkill for straightforward CRUD + AI use case

**When to use**: Multiple external integrations, need to swap infrastructure frequently

### Domain-Driven Design (DDD)
**Why rejected**:
- Requires entities, value objects, aggregates, domain events
- High learning curve, easy to implement incorrectly
- Domain complexity doesn't justify it (mostly CRUD + AI service)

**When to use**: Complex business domains with rich invariants (banking, healthcare)

### Clean Architecture
**Why rejected**:
- Very high ceremony (entities, use cases, interface adapters, frameworks)
- Maximum abstraction, minimal pragmatism
- Better for long-term enterprise projects

**When to use**: Framework-independent core business logic required

### MVC Pattern
**Why rejected**:
- Too simple, controllers get bloated
- Poor separation of concerns
- No service layer for business logic

**When to use**: Small CRUD apps, rapid prototypes

---

**Last Updated**: Day 4 (2025-11-25)
**Status**: Phases 1-3 complete (database, authentication, profiles, admin, analytics, comprehensive tests)

<!--
✅ COMPLETED:
Phase 1 (2025-11-22):
- PostgreSQL 16 via Docker Compose
- Native UUID type migration (String(36) → Uuid)
- Normalized schema (courses, tags, skills, junction tables)
- Auto-seeding (48 courses, 169 tags, 230 skills)
- Connection pooling configuration

Phase 2-3 (2025-11-24):
- User authentication (JWT via fastapi-users)
- User profile management with version snapshots
- API layer (auth, users, profiles, courses endpoints)
- Layered architecture (API/Service/Repository)
- Profile snapshot system (historical tracking)

Phase 3 Extended (2025-11-25):
- Superuser system (is_superuser flag, current_superuser dependency)
- Admin user management endpoints (list, detail, deactivate)
- Admin analytics endpoints (overview stats, popular tags)
- User profile history endpoint (/profiles/me/history)
- UserRepository for admin data access
- Recommendation stub endpoints (quota, history)
- Comprehensive test suite (93% coverage on API endpoints)
- Auto-create superuser from environment variables

❌ NOT IMPLEMENTED:
- LLM integration (OpenAI/Claude)
- Recommendation engine
- Frontend application
- Email sending (password reset, verification)
-->
