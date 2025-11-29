# AcmeLearn

An AI-powered learning recommendation system that helps users discover courses from a curated catalog. Users can browse available courses, set their learning preferences, and receive personalized AI recommendations.

## Technology Choices

### Backend
- **FastAPI** (Python 3.12): Modern async Python framework with automatic OpenAPI docs, type hints, and excellent performance
- **PostgreSQL 16**: Robust relational database with native UUID support and async driver (asyncpg)
- **SQLAlchemy 2.0**: Async ORM with type-safe queries
- **Alembic**: Database migrations with auto-migrate on startup
- **fastapi-users**: Battle-tested JWT authentication with secure password hashing
- **LangChain + OpenAI**: Multi-agent LLM pipeline for personalized recommendations

### Frontend
- **React 18** + **TypeScript**: Type-safe UI with modern React features
- **Vite**: Fast build tool with hot module replacement
- **TanStack Query**: Data fetching with caching, background updates, and optimistic mutations
- **Tailwind CSS 4**: Utility-first styling with design system
- **React Router 7**: File-based routing with protected routes
- **Zod**: Runtime schema validation for forms

### Infrastructure
- **Docker Compose**: 4-container setup (postgres, postgres_test, backend, frontend)
- **uv**: Fast Python package manager with lockfile

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
- **Authentication**: Register, login, JWT-based sessions
- **Course Catalog**: Browse 48 courses with search, filtering (difficulty, tags, duration), and sorting
- **Profile Management**: Set learning goals, experience level, time commitment, and interests
- **AI Recommendations**: Get personalized course recommendations with explanations
  - Natural language queries ("I want to learn machine learning")
  - Profile-based recommendations
  - Match scores and reasoning for each suggestion
  - Learning path with course sequence
  - Recommendation history sidebar (view past recommendations)
  - Session persistence (chat state survives navigation)
  - Note: Recommendations take 1-2 minutes due to LLM processing

### Admin Features
- **Dashboard**: User stats, recent activity, quick insights
- **User Management**: Search, filter, view profiles, deactivate users
- **Analytics**: User growth charts, profile completion, experience distribution

### LLM Architecture
Two-agent recommendation pipeline:
1. **Profile Analyzer**: Analyzes user profile, interests, and learning history
2. **Course Recommender**: Generates ranked recommendations with explanations

Pre-filtering reduces 48 courses to ~20 before LLM processing for token efficiency.

## Trade-offs and Future Improvements

### Current Trade-offs

1. **Token Efficiency vs Context**: Course descriptions are truncated to 150 characters for LLM input. This reduces token usage but limits context for recommendations.

2. **Rate Limiting**: Users are limited to 10 recommendations per 24 hours to manage API costs. Could be made configurable per user tier.

3. **Synchronous LLM Calls**: Recommendations block until complete (~1-2 minutes). Streaming responses would improve UX but add complexity.

4. **Desktop-First**: Frontend optimized for desktop. Mobile experience functional but not prioritized.

### Future Improvements

1. **Recommendation Caching**: Cache similar queries to reduce LLM calls
2. **Streaming Responses**: Show recommendations as they generate
3. **Course Progress Tracking**: Track completion and update recommendations accordingly
4. **Course Comparison**: Side-by-side course comparison feature
5. **A/B Testing**: Compare recommendation quality across different prompts/models
6. **Analytics Dashboard**: Track recommendation engagement and success metrics

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
