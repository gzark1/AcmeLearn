# AcmeLearn

An AI-powered learning recommendation system that helps users discover courses from a curated catalog. Users can browse available courses, set their learning preferences, and receive personalized AI recommendations.

## Technology Choices

### Backend

- **FastAPI** (Python 3.12): Async-first framework with automatic OpenAPI documentation, Pydantic type validation, and built-in dependency injection. Chosen over Flask/Django for native async support and modern Python patterns.

- **PostgreSQL 16**: Selected for native UUID type (50% storage reduction vs VARCHAR), JSONB for flexible LLM output storage, and robust indexing. JSONB enables storing full recommendation details without schema changes.

- **SQLAlchemy 2.0 Async**: Non-blocking database I/O with asyncpg driver. Uses `selectinload()` to prevent N+1 query problems when loading course tags and skills.

- **fastapi-users**: Battle-tested JWT authentication with registration hooks. The `on_after_register` hook auto-creates an empty user profile, ensuring every user has a profile record from registration.

- **Layered Architecture**: Clear separation of concerns:
  - API layer: HTTP concerns only (routes, status codes, request parsing)
  - Service layer: Business logic and orchestration
  - Repository layer: Database queries (no business logic)
  - Models: SQLAlchemy ORM entities

### Frontend

- **Vite** (not Next.js): Pure SPA architecture - no server-side rendering needed. Vite provides faster dev startup (100-200ms) and simpler deployment to any static host. No Next.js runtime overhead.

- **React 18 + TypeScript**: Strict mode enabled for type safety across the entire codebase.

- **Feature-based Architecture**: Following bulletproof-react patterns with unidirectional imports. Each feature (auth, courses, profile, recommendations, admin) is self-contained with its own components, API hooks, and types. Features cannot import from each other.

- **TanStack Query**: Manages server state (90% of app state) with built-in caching, background refetch, and stale-time management. Dramatically less boilerplate than Redux for data fetching.

- **Zustand**: Simple store for client-only state (toast notifications, UI preferences) - the remaining 10% that isn't server state.

- **Tailwind CSS 4**: Utility-first styling with class-variance-authority for type-safe component variants.

### Database Design

The schema is designed for analytics and user journey tracking, not just storing data:

- **Separate `user_profiles` table**: Enables analytics about what KIND of users are in the system (skill levels, time commitments, interests). Powers the admin dashboard with profile completion rates and distribution charts.

- **Profile snapshots**: Insert-only audit trail (`user_profile_snapshots`) captures every profile change. Enables tracking user evolution over time - admins can see how users progress from beginner to intermediate, how learning goals evolve.

- **Normalized tags with categories**: 169 tags organized into 11 categories (Programming, Data Science, DevOps, etc.). Junction tables enable tag popularity analytics and category distribution charts.

- **Recommendations with full context**: Stores `profile_version` to link recommendations to profile state at that moment. JSONB fields store complete LLM output (`profile_analysis_data`, `recommendation_details`) for debugging and quality analysis. The `llm_model` field enables A/B testing across different models.

- **LLM metrics table**: Tracks token usage, duration, and errors per LLM call for cost monitoring and performance analysis.

### Infrastructure

- **Docker Compose**: 4-container setup (postgres, postgres_test, backend, frontend) with health checks and volume mounts for hot reload.
- **uv**: Fast Python package manager (10-100x faster than pip) with lockfile for reproducibility.

## Setup Instructions

### Prerequisites
- Docker and Docker Compose
- OpenAI API key

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd AcmeLearn

# 2. Create environment file
cp .env.example .env

# 3. Edit .env with your credentials:
#    - Generate SECRET_KEY: openssl rand -hex 32
#    - Add your OPENAI_API_KEY
#    - (Optional) Set SUPERUSER_EMAIL/PASSWORD for admin access

# 4. Start all services
docker compose up --build

# 5. Access the application
#    Frontend: http://localhost:5173
#    Backend API: http://localhost:8000
#    API Docs: http://localhost:8000/docs
```

### Demo Users

When `SEED_DEMO_USERS=true` (default), 25 demo users are created on startup:
- **Emails**: `demo01@example.com` through `demo25@example.com`
- **Password**: `123123123` (configurable via `DEMO_USER_PASSWORD`)
- **Variety**: Mix of empty, incomplete, and complete profiles for testing

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_USER` | Yes | Database username |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `POSTGRES_DB` | Yes | Database name |
| `SECRET_KEY` | Yes | JWT signing key (generate with `openssl rand -hex 32`) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for recommendations |
| `OPENAI_MODEL` | No | Model to use (default: `gpt-5-nano`) |
| `SEED_DEMO_USERS` | No | Create demo users on startup (default: `true`) |
| `SUPERUSER_EMAIL` | No | Auto-create admin user with this email |
| `SUPERUSER_PASSWORD` | No | Password for admin user |

## Features

### User Features

- **Authentication**: Register, login, JWT-based sessions with secure password hashing
- **Course Catalog**: Browse 48 courses with search, filtering (difficulty, tags, duration), and sorting
- **Profile Management**: Set learning goals, experience level, time commitment, and interests. View profile version history to track your own evolution.
- **AI Recommendations**: Get personalized course recommendations with detailed explanations
  - Natural language queries ("I want to learn machine learning")
  - Profile-based recommendations when no query provided
  - Match scores (0-100%) and reasoning for each suggestion
  - Learning path with recommended course sequence
  - Recommendation history sidebar
  - Session persistence (chat state survives navigation)

### Admin Features

The admin dashboard provides comprehensive platform analytics, powered by the database design:

- **Dashboard Overview**:
  - Total users, active users, profile completion rate
  - Recent activity feed (registrations, profile updates, deactivations)
  - Quick insight cards with actionable metrics

- **User Management**:
  - Search and filter users by email, status, profile completion
  - View detailed user profiles with recommendation history
  - Profile history modal showing version timeline
  - Deactivate users (soft delete)
  - Export user list to CSV

- **Analytics** (11 dedicated endpoints):
  - User growth chart (daily registrations over 30-90 days)
  - Profile completion breakdown (complete/partial/empty)
  - Experience level distribution (beginner/intermediate/advanced)
  - Time commitment distribution
  - Popular tags by category
  - Category interest distribution
  - Course catalog summary by difficulty

### LLM Architecture

Two-agent recommendation pipeline with full observability:

1. **Intent Classification**: Brief LLM call classifies query as SPECIFIC, VAGUE, or IRRELEVANT. Catches off-topic queries before full pipeline, saving tokens.

2. **Profile Analyzer** (Agent 1): Analyzes user profile, interests, and profile history (last 3 snapshots). Outputs skill level assessment, skill gaps, and learning style notes.

3. **Course Recommender** (Agent 2): Takes profile analysis and pre-filtered courses. Generates ranked recommendations with match scores, explanations, and a learning path.

**Token Optimization**:
- QUERY-FIRST pre-filtering scores courses by query relevance + profile fit
- Reduces 48 courses to ~20 before LLM processing (~40% token savings)
- Course descriptions truncated to 150 characters

**Observability**:
- `[PERF]` logging shows timing breakdown for each pipeline stage
- `llm_metrics` table tracks tokens, duration, and errors per call
- Full LLM output stored in JSONB for debugging

## Trade-offs and Future Improvements

### Current Trade-offs

1. **Token Efficiency vs Context**: Course descriptions truncated to 150 characters for LLM input. Reduces token usage but limits context.

2. **Synchronous LLM Calls**: Recommendations block for 8-10 seconds while both agents complete. No streaming to show partial results.

3. **Desktop-First**: Frontend optimized for desktop. Mobile experience functional but not prioritized.

4. **Testing Coverage**: 50 backend tests cover API and service layers. No frontend tests, no E2E tests, tests don't auto-run on container startup.

5. **Basic Error Messages**: API returns proper HTTP status codes (400, 401, 403, 404, 429, 500) with error details, but could have more structured error types.

### Future Improvements

1. **Streaming Responses**: Show recommendations as they generate for better UX during the 8-10 second wait.

2. **AI-Generated Course Summaries**: Pre-summarize course descriptions once with AI, store as a new field. Would provide richer context without token overhead per request.

3. **Faster Pre-filtering**: Leverage existing tag categories (11 categories) for initial filtering before scoring.

4. **A/B Testing Framework**: Schema already stores `llm_model` per recommendation. Add comparison dashboards to evaluate different prompts/models.

5. **Comprehensive Testing**: Add frontend component tests, E2E tests with Playwright, auto-run tests on container startup.

6. **Response Caching**: Cache recommendations for similar queries to reduce LLM calls and costs.

## Running Tests

**Note**: Tests are optional and not required to use the application. The steps below are for developers who want to run the test suite.

If you get "pytest not found", first install test dependencies:
```bash
docker compose exec backend uv sync --extra test
```

Then run tests:
```bash
# Run all backend tests
docker compose exec -e PYTHONPATH=/app backend sh -c \
  'cd /tests/backend && /app/.venv/bin/pytest . -v --asyncio-mode=auto'

# Run specific test file
docker compose exec -e PYTHONPATH=/app backend sh -c \
  'cd /tests/backend && /app/.venv/bin/pytest test_api/test_auth.py -v --asyncio-mode=auto'

# Run with verbose output
docker compose exec -e PYTHONPATH=/app backend sh -c \
  'cd /tests/backend && /app/.venv/bin/pytest . -vv -s --asyncio-mode=auto'
```

## Project Structure

```
AcmeLearn/
├── backend/           # FastAPI application
│   ├── api/           # Route handlers
│   ├── config/        # Configuration settings
│   ├── core/          # Core utilities (auth, database)
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── services/      # Business logic
│   ├── repositories/  # Data access layer
│   ├── llm/           # LLM agents and prompts
│   └── scripts/       # Seeding scripts
├── frontend/          # React application
│   └── src/
│       ├── app/       # Routes and providers
│       ├── features/  # Feature modules (auth, courses, profile, recommendations, admin)
│       ├── components/# Shared UI components
│       ├── layouts/   # Page layouts (main, auth, admin)
│       ├── lib/       # API client, auth context
│       ├── hooks/     # Custom React hooks
│       ├── stores/    # State management
│       ├── types/     # TypeScript type definitions
│       └── utils/     # Utility functions
├── tests/             # Backend tests
├── docs/              # Architecture documentation
└── courses.json       # Course catalog data
```
