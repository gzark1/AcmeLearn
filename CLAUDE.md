# AcmeLearn - AI-Powered Learning Platform

## Project Overview

AcmeLearn is an AI-driven learning recommendation system that helps users discover personalized courses from a curated catalog of 50 courses. This is a technical assessment project showcasing modern full-stack development with AI integration.

**Timeline**: 1 week
**Assessment Focus**: Demonstrating unique technical approach and strengths

## 🎯 Assessment Criteria

**What's Being Evaluated**:
1. **Code Quality**: Clean, maintainable, well-structured code
2. **Product Polish**: Professional UI/UX with attention to detail
3. **Git Hygiene**: Meaningful commits at logical checkpoints
4. **Technical Depth**: Showcase advanced techniques thoughtfully

## 🤖 Claude Instructions

**Documentation Reference**:
- **ALWAYS consult `docs/ARCHITECTURE.md`** for architecture decisions, layer responsibilities, and design patterns
- **ALWAYS consult `docs/PRODUCT_DATA_STRATEGY.md`** for database schema, data modeling strategy, and analytics considerations
- **ALWAYS consult `docs/AUTHENTICATION.md`** for authentication implementation details and design choices
- These documents are the **source of truth** for technical implementation
- When making architecture or data modeling decisions, refer to these docs first

**Git Commits**:
- When reaching a good commit point, **ASK before committing**
- Say: "Ready to commit: '[suggested message]'. Proceed?"
- Use clear, meaningful commit messages written as if from a human developer
- Never mention Claude, AI assistance, or "best practices" in commit messages
- Keep commits focused and professional
- Commit at logical completion points (feature done, milestone reached)

**Asking Clarifying Questions**:
Before starting any significant feature or system implementation, **ASK clarifying questions** to ensure we're building exactly what's needed. Don't assume you know the requirements - surface hidden assumptions early.

Examples of good clarifying questions:
- "For the LLM integration, should we use OpenAI, Claude, or support both? What's your preference for cost vs quality tradeoffs?"
- "For the recommendation system, should users be able to provide a free-text query, or just rely on their profile data?"
- "How many recommendations should we return per request? Should they be ranked by confidence?"
- "For the frontend, do you want a minimal functional UI or something more polished with animations?"
- "Should we store recommendation history, or is each request independent?"

This approach reveals assumptions you might not realize you're making and ensures we build the right thing the first time.

**Development Focus**:
- Prioritize clean code and polished UX
- Show technical sophistication beyond minimum requirements
- Document WHY we chose specific approaches
- Follow the layered architecture pattern strictly (API → Services → Repositories → Models)
- NEVER put business logic in API routes - always delegate to services
- NEVER access database directly from API routes - always use repositories

**Database Access (MCP PostgreSQL)**:
- A PostgreSQL MCP server is available: `mcp__acmelearn-postgres__query`
- **ALWAYS prefer using the MCP tool** for database queries over `docker exec` or `psql` commands
- The MCP tool accepts a `sql` parameter with read-only SQL queries
- Use it for: checking table data, verifying database state, exploring schema, debugging
- Fall back to Bash/psql only when you need write operations (INSERT, UPDATE, DELETE) or PostgreSQL-specific commands not supported by MCP

Examples:
```
# Good - use MCP for queries
mcp__acmelearn-postgres__query with sql: "SELECT COUNT(*) FROM courses"
mcp__acmelearn-postgres__query with sql: "SELECT * FROM user_profiles WHERE user_id = '...'"

# Fall back to Bash only when necessary (writes, admin commands)
docker exec acmelearn_postgres psql -U acmelearn_user -d acmelearn_db -c "TRUNCATE TABLE..."
```

**Browser Automation (MCP Puppeteer)**:
- A Puppeteer MCP server is available for frontend visual testing and browser automation
- Use it for: taking screenshots, testing interactions, verifying UI implementations
- The frontend dev server runs at `http://localhost:5173`

Available tools:
| Tool | Usage |
|------|-------|
| `mcp__puppeteer__puppeteer_navigate` | Navigate to URLs (e.g., `http://localhost:5173`) |
| `mcp__puppeteer__puppeteer_screenshot` | Capture screenshots to verify visual output |
| `mcp__puppeteer__puppeteer_click` | Click elements via CSS selector |
| `mcp__puppeteer__puppeteer_hover` | Hover over elements to test hover states |
| `mcp__puppeteer__puppeteer_fill` | Fill form inputs |
| `mcp__puppeteer__puppeteer_select` | Select dropdown options |
| `mcp__puppeteer__puppeteer_evaluate` | Execute JavaScript in browser context |

Examples:
```
# Navigate to frontend
mcp__puppeteer__puppeteer_navigate with url: "http://localhost:5173"

# Take a screenshot
mcp__puppeteer__puppeteer_screenshot with name: "homepage"

# Test form input
mcp__puppeteer__puppeteer_fill with selector: "#email" value: "test@example.com"

# Check DOM state
mcp__puppeteer__puppeteer_evaluate with script: "document.querySelector('.error-message')?.textContent"
```

**Testing Best Practices**:
- Use `curl` to test API endpoints (examples in `docs/AUTHENTICATION.md`)
- Verify database state with PostgreSQL MCP queries after operations
- Use Puppeteer MCP tools to visually verify frontend implementations
- Use FastAPI's `/docs` endpoint for interactive API testing
- Test with actual data, not just HTTP status codes
- Verify both success cases AND error handling
- Check database consistency (e.g., profile snapshots match versions)

## Technology Stack

### Backend

<!-- ✅ CURRENT STATE: Phase 1 Complete (Database Layer) -->

- **Framework**: FastAPI (Python)
  - High performance, modern async support
  - Automatic OpenAPI documentation
  - Type hints and validation with Pydantic

- **Architecture**: Layered Architecture (3-tier) ✅ **Implemented**
  - API Layer (presentation) - ✅ **Implemented** (auth, users, profiles, courses)
  - Service Layer (business logic) - ✅ **Implemented** (ProfileService)
  - Repository Layer (data access) - ✅ **Implemented** (UserProfileRepository)
  - Models Layer - ✅ **Implemented** (All core models)
  - **See `docs/ARCHITECTURE.md` for complete design decisions**

- **Database**: PostgreSQL 16 via Docker Compose ✅ **Implemented**
  - SQLAlchemy ORM with native UUID types
  - Connection pooling configured (pool_size=10, max_overflow=20)
  - Auto-seeding from courses.json on startup
  - 9 tables implemented (courses, tags, skills, users, profiles, snapshots, + junction tables)
  - **See `docs/PRODUCT_DATA_STRATEGY.md` for schema details**

- **Docker**: PostgreSQL 16 Alpine container ✅ **Implemented**
  - docker-compose.yml configured
  - Environment variables via .env (gitignored)
  - Backend runs locally for hot reload

- **Dependency Management**: uv ✅ **Implemented**
  - `pyproject.toml` for dependency management
  - Dependencies: FastAPI, SQLAlchemy, Pydantic, psycopg2-binary

- **Authentication**: JWT tokens via fastapi-users ✅ **Implemented**
  - Registration, login, password reset endpoints
  - JWT bearer authentication (1-hour expiration)
  - Separate User (auth) and UserProfile (preferences) models
  - Auto-create empty profile on registration
  - **See `docs/AUTHENTICATION.md` for implementation details**

### Frontend
- **Framework**: React with Vite
  - Modern hooks-based architecture
  - Component-driven development
  - Styling TBD (Tailwind CSS likely)
- **State Management**: Context API or React Query
- **API Integration**: Axios or Fetch API

### AI/LLM Integration
- **Provider**: OpenAI API (GPT-4 or GPT-3.5-turbo) or Claude
- **Implementation**: Direct API client in `recommendation_service.py`
  - LangChain considered for multi-agent systems (nice-to-have)
- **Strategy**: Dynamic context engineering
  - User profile → structured prompts
  - Course metadata extraction
  - Pre-filtering before LLM calls (cost/performance optimization)

### Deployment (Optional)
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, Fly.io
- **Priority**: Working local app > deployment

## Project Structure

**📋 See `docs/ARCHITECTURE.md` for complete architecture details**
**📊 See `docs/PRODUCT_DATA_STRATEGY.md` for database schema and data modeling**
**🔐 See `docs/AUTHENTICATION.md` for authentication implementation**

Current structure (Phases 1-3 Complete):

```
AcmeLearn/
├── docs/                   # 📚 Technical documentation
│   ├── ARCHITECTURE.md     # ✅ Architecture decisions and patterns
│   ├── PRODUCT_DATA_STRATEGY.md # ✅ Database schema and data modeling
│   └── AUTHENTICATION.md   # ✅ Authentication implementation details
│
├── backend/
│   ├── models/             # ✅ SQLAlchemy ORM models
│   │   ├── base.py         # ✅ Base class
│   │   ├── enums.py        # ✅ DifficultyLevel, TimeCommitment, TagCategory enums
│   │   ├── course.py       # ✅ Course, Tag, Skill, junction tables
│   │   ├── user.py         # ✅ User (fastapi-users)
│   │   ├── user_profile.py # ✅ UserProfile, UserInterest
│   │   ├── user_profile_snapshot.py # ✅ UserProfileSnapshot
│   │   └── recommendation.py # ✅ Recommendation (model only)
│   │
│   ├── core/               # ✅ Configuration and database
│   │   ├── config.py       # ✅ Pydantic settings (DATABASE_URL from .env)
│   │   ├── database.py     # ✅ PostgreSQL connection, init_db()
│   │   ├── auth.py         # ✅ JWT strategy and bearer transport
│   │   ├── users.py        # ✅ FastAPIUsers instance
│   │   └── user_manager.py # ✅ UserManager with on_after_register hook
│   │
│   ├── schemas/            # ✅ Pydantic DTOs
│   │   ├── user.py         # ✅ UserRead, UserCreate, UserUpdate
│   │   ├── profile.py      # ✅ ProfileRead, ProfileUpdate
│   │   └── auth.py         # ✅ Token, PasswordChangeRequest
│   │
│   ├── api/                # ✅ FastAPI routes
│   │   ├── auth.py         # ✅ Registration, login, password reset
│   │   ├── users.py        # ✅ User management
│   │   ├── profiles.py     # ✅ Profile CRUD
│   │   └── courses.py      # ✅ Course browsing, tags, skills
│   │
│   ├── services/           # ✅ Business logic layer
│   │   ├── profile_service.py # ✅ Profile updates with snapshots
│   │   └── recommendation_service.py # ✅ Recommendation logic (stub)
│   │
│   ├── repositories/       # ✅ Data access layer
│   │   ├── user_profile_repository.py # ✅ Profile data access
│   │   └── recommendation_repository.py # ✅ Recommendation data access (stub)
│   │
│   ├── scripts/            # ✅ Data seeding
│   │   └── seed_courses.py # ✅ Import courses.json → extract tags/skills
│   │
│   ├── main.py             # ✅ FastAPI app with all routers mounted
│   ├── pyproject.toml      # ✅ uv dependencies (includes test extras)
│   └── uv.lock             # ✅ Locked dependencies
│
├── tests/                  # ✅ Test suite (at project root)
│   ├── conftest.py         # Root-level (reserved for cross-stack fixtures)
│   └── backend/
│       ├── conftest.py     # ✅ Backend fixtures (test_db, client, auth_headers)
│       ├── test_api/
│       │   ├── test_auth.py     # ✅ Auth endpoint tests
│       │   ├── test_courses.py  # ✅ Course endpoint tests
│       │   └── test_profiles.py # ✅ Profile endpoint tests
│       └── test_services/
│           └── test_profile_service.py # ✅ Service layer tests
│
├── docker-compose.yml      # ✅ PostgreSQL 16 Alpine container
├── .env                    # ✅ Database credentials (gitignored)
├── .env.example            # ✅ Mock credentials template (includes TEST_DATABASE_URL)
├── courses.json            # ✅ Course catalog data (48 courses)
├── BUSINESS_REQUIREMENTS.md # ✅ Business rules and access control
├── assessment.md           # 📄 Original requirements
└── CLAUDE.md               # 🤖 This file (project overview)
```

## Key Technical Decisions

See `docs/ARCHITECTURE.md` for detailed rationale. Quick summary:

### 1. Layered Architecture
- **Why**: Right complexity for 5-day timeline, industry-standard, highly maintainable
- **Alternatives considered**: DDD (rejected - too complex), Hexagonal (rejected - overkill)
- Clear layer separation: API → Services → Repositories → Models

### 2. Database Implementation ✅ **COMPLETED**
- **Current**: PostgreSQL 16 via Docker with normalized schema
- **Schema**: 5 tables implemented (courses, tags, skills, course_tags, course_skills)
- **UUID Types**: Native PostgreSQL UUID (16 bytes, not VARCHAR(36))
- **Data**: 48 courses, 169 unique tags, 230 unique skills
- **See `PRODUCT_DATA_STRATEGY.md`** for complete schema documentation

### 3. LLM Integration Strategy
- **Placement**: Business logic in `services/recommendation_service.py`
- **Approach**: Direct OpenAI/Claude API client (not LangChain initially)
- **Context Engineering**: Dynamic prompts based on user profile + pre-filtered courses
- **Optimization**: Pre-filter courses by difficulty/tags before LLM (reduce cost/tokens)

### 4. Development Workflow
- **Current**: PostgreSQL in Docker, backend runs locally for hot reload
- **Setup**: `docker compose up -d` for database, `uvicorn main:app --reload` for backend
- **Priority**: Working features > infrastructure polish

## Development Phases

### Phase 1: Foundation (Day 1) ✅ **COMPLETED**
- ✅ Project structure setup
- ✅ Database models (Course, Tag, Skill, junction tables)
- ✅ PostgreSQL Docker Compose setup
- ✅ Native UUID type migration (16 bytes vs 32-byte strings)
- ✅ Course data seeding (48 courses, 169 tags, 230 skills)
- ✅ Normalized schema with many-to-many relationships
- ✅ FastAPI app with health endpoint and lifespan events

### Phase 2: Authentication & User Management (Days 2-3) ✅ **COMPLETED**
- ✅ User authentication (JWT via fastapi-users)
- ✅ User registration, login, password reset endpoints
- ✅ User model with fastapi-users base classes
- ✅ UserProfile model with versioning
- ✅ UserProfileSnapshot model for historical tracking
- ✅ Auto-create empty profile on registration (via hook)
- ✅ Profile service with atomic snapshot creation
- ✅ Normalized interests (user_interests junction table)

### Phase 3: API Layer & Core Features (Day 3) ✅ **COMPLETED**
- ✅ Course browsing API (filter by difficulty, tags)
- ✅ User profile CRUD (GET/PATCH /profiles/me)
- ✅ Tags and skills endpoints (GET /api/tags, /api/skills)
- ✅ Repository pattern implementation (UserProfileRepository)
- ✅ Service layer implementation (ProfileService)
- ✅ Layered architecture (API → Services → Repositories → Models)

### Phase 4: AI Integration (Days 4-5)
- LLM client setup (OpenAI or Claude)
- Recommendation engine implementation
- Context engineering and prompt optimization
- Recommendation endpoint (POST /recommendations/generate)

### Phase 5: Frontend & Polish (Days 5-7)
- React frontend setup
- Authentication UI (login/register)
- Course browsing interface
- Profile management UI
- Recommendation interface

### Phase 4: Polish & Deploy (Day 7)
- Testing and bug fixes
- Documentation (README.md)
- Code cleanup and refactoring
- Optional: Live deployment
- Submission preparation

## Key Features (MVP)

### Backend API
- [x] **Database Layer** (9 tables with native UUID types)
- [x] **Auto-seeding** (courses.json → PostgreSQL on startup)
- [x] **Health endpoint** (GET /health)
- [x] **User registration and authentication** (JWT via fastapi-users)
- [x] **Course catalog endpoints** (list, filter by difficulty/tags)
- [x] **User profile CRUD operations** (GET/PATCH /profiles/me)
- [x] **Tags and skills endpoints** (GET /api/tags, /api/skills)
- [x] **Profile version history** (automatic snapshots on updates)
- [ ] AI recommendation generation endpoint
- [ ] Course recommendations history

### Frontend
- [ ] Login/Register pages
- [ ] Course catalog browser with search/filter
- [ ] User profile management page
- [ ] AI recommendation interface
- [ ] Course detail view

### AI Capabilities
- [ ] Personalized course recommendations
- [ ] Explanation for each recommendation
- [ ] Query-based recommendations ("I want to learn web development")
- [ ] Profile-based automatic suggestions

## Nice-to-Have Features (If Time Permits)

- Conversational recommendation refinement
- Recommendation confidence scores
- User feedback on recommendations
- Recommendation history and tracking
- Multi-agent system (skill assessor + recommender)
- Real-time recommendations as user updates profile
- Course comparison feature
- Learning path generation (sequence of courses)

## Database Schema

**📊 See `PRODUCT_DATA_STRATEGY.md` for complete schema documentation**

### ✅ Implemented Tables (Phase 1)

**courses** (48 rows)
- id: UUID (native PostgreSQL type, 16 bytes)
- title, description, difficulty, duration, contents
- Relationships: many-to-many with tags and skills

**tags** (169 rows)
- id: UUID, name (unique, indexed)
- Extracted from courses.json

**skills** (230 rows)
- id: UUID, name (unique, indexed)
- Extracted from courses.json

**course_tags** (junction table)
- course_id: UUID, tag_id: UUID (composite PK)

**course_skills** (junction table)
- course_id: UUID, skill_id: UUID (composite PK)

### ❌ Planned Tables (Phase 2)

**users**
- id: UUID, email, password_hash, created_at, updated_at

**user_profiles**
- id: UUID, user_id, learning_goal, current_level, time_commitment
- interests: many-to-many with tags

**recommendations**
- id: UUID, user_id, query, recommended_course_ids (JSONB), explanation

## Environment Variables

**Current `.env` file** (gitignored):

```bash
# PostgreSQL Database (for Docker container)
POSTGRES_USER=acmelearn_user
POSTGRES_PASSWORD=acmelearn_pass
POSTGRES_DB=acmelearn_db

# Backend Connection
DATABASE_URL=postgresql://acmelearn_user:acmelearn_pass@localhost:5432/acmelearn_db
```

**Future environment variables** (when authentication/LLM added):

```bash
# Authentication (Phase 2)
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM Integration (Phase 3)
OPENAI_API_KEY=sk-...

# Frontend (Phase 4)
VITE_API_URL=http://localhost:8000
```

## Getting Started

**Current setup (Phase 1)**:

```bash
# 1. Setup environment
cp .env.example .env       # Copy and edit with your credentials

# 2. Start PostgreSQL (Docker)
docker compose up -d       # Starts PostgreSQL 16 container
docker ps                  # Verify container is running

# 3. Setup backend
cd backend
uv sync                    # Install dependencies from pyproject.toml
source .venv/bin/activate  # Activate virtual environment

# 4. Run backend (auto-seeds database on first run)
uvicorn main:app --reload  # Starts on http://localhost:8000
# Access health endpoint: http://localhost:8000/health

# 5. Verify database
docker exec acmelearn_postgres psql -U acmelearn_user -d acmelearn_db -c "SELECT COUNT(*) FROM courses;"
# Should return: 48

# Frontend setup (Phase 4 - not started yet)
cd frontend
npm install
npm run dev
```

**Docker commands**:
```bash
docker compose up -d       # Start PostgreSQL
docker compose down        # Stop PostgreSQL
docker compose logs -f     # View logs
docker exec acmelearn_postgres psql -U acmelearn_user -d acmelearn_db  # Connect to DB
```

## Testing Strategy

### Automated Testing (pytest) - IMPLEMENTED

**Test Location**: `tests/backend/` (at project root, not inside backend folder)

**Test Structure**:
```
tests/
├── __init__.py
├── conftest.py              # Root-level (reserved for cross-stack fixtures)
└── backend/
    ├── __init__.py
    ├── conftest.py          # Backend fixtures (test_db, client, test_user, auth_headers)
    ├── test_api/
    │   ├── test_auth.py     # Registration, login, token tests
    │   ├── test_courses.py  # Course listing, filtering, tag categories
    │   └── test_profiles.py # Profile CRUD tests
    └── test_services/
        └── test_profile_service.py  # Service layer unit tests
```

**Test Database**:
- Uses separate `acmelearn_test` database (auto-created if missing)
- Configure via `TEST_DATABASE_URL` in `.env` (see `.env.example`)
- Default: `postgresql+asyncpg://acmelearn_user:acmelearn_pass@localhost:5432/acmelearn_test`
- Tables are created fresh per test session
- Course data is seeded once per session (static data)
- User data is truncated between each test (clean state)

**Key Fixtures** (in `tests/backend/conftest.py`):
- `test_db`: Async database session with clean user state per test
- `client`: httpx.AsyncClient with database dependency override
- `test_user`: Creates a test user (email: test@example.com, password: TestPassword123)
- `auth_headers`: JWT authentication headers for protected endpoints
- `test_user_profile`: The auto-created profile for test_user

**Running Tests**:
```bash
# From backend directory
cd backend
source .venv/bin/activate

# Install test dependencies (if not already installed)
uv sync --extra test

# Run all backend tests
pytest ../tests/backend -v

# Run specific test file
pytest ../tests/backend/test_api/test_auth.py -v

# Run with coverage
pytest ../tests/backend --cov=. --cov-report=html
```

**Prerequisites**:
- PostgreSQL must be running (`docker compose up -d`)
- Test database is auto-created on first run

### Manual Testing
- API: Manual testing with FastAPI's built-in docs (`/docs`)
- Use `curl` for endpoint testing (examples in `docs/AUTHENTICATION.md`)
- Verify database state with PostgreSQL MCP queries
- E2E: Manual testing of critical user flows

## Success Criteria

1. Working authentication system
2. Course browsing with search and filters
3. User profile management with all required fields
4. AI-powered recommendations that make sense
5. Clean, documented code
6. Clear setup instructions that work
7. Demonstrates technical strengths and unique approach

## Technical Strengths Demonstrated

- Modern Python async programming with FastAPI
- Clean layered architecture with separation of concerns
- AI/LLM integration with dynamic context engineering
- Full-stack development capabilities (Python + React)
- Modern tooling (uv, pyproject.toml)
- API design and RESTful principles
- Type safety and validation (Pydantic, SQLAlchemy)
- Professional documentation and architecture decisions

## Current Status (Day 3 - 2025-11-24)

✅ **Phases 1-3 Complete - Backend Fully Functional**:
- PostgreSQL 16 via Docker Compose (9 tables implemented)
- Native UUID types (16 bytes, not strings)
- Normalized schema (courses, tags, skills, users, profiles, snapshots)
- Auto-seeding from courses.json (48 courses, 169 tags, 230 skills)
- JWT authentication via fastapi-users (registration, login, password reset)
- User profile management with automatic version snapshots
- Layered architecture (API/Service/Repository/Models)
- Course browsing endpoints with filtering
- Tags and skills endpoints
- Profile CRUD endpoints
- All core backend features working and tested

❌ **Not Implemented**:
- LLM integration (OpenAI/Claude)
- Recommendation generation endpoint
- Frontend (React app)
- Email sending (password reset, verification)

📋 **Next Steps**:
- Phase 4: LLM integration for course recommendations
- Phase 5: Frontend development (React + Vite)
- Polish and deployment (optional)

## Important Documentation

- **`docs/ARCHITECTURE.md`**: Architecture decisions, layer responsibilities, design patterns
- **`docs/PRODUCT_DATA_STRATEGY.md`**: Database schema, data modeling, analytics strategy
- **`docs/AUTHENTICATION.md`**: Authentication implementation and design choices
- **`BUSINESS_REQUIREMENTS.md`**: Business rules and access control
- **`assessment.md`**: Original project requirements

**When making technical decisions, ALWAYS consult these documents first.**

## Notes

- Course data is read-only (no course management needed)
- Focus on quality over quantity of features
- Code readability and maintainability are priorities
- Follow the layered architecture pattern strictly (no business logic in API routes!)
- Test thoroughly using curl, PostgreSQL queries, and FastAPI /docs
- Consult docs/ARCHITECTURE.md, docs/PRODUCT_DATA_STRATEGY.md, and docs/AUTHENTICATION.md and docs/BUSINESS_REQUIREMENTS.md for all design decisions
- never add "Generated with Claude Code" to commit messages