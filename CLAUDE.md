# AcmeLearn - AI-Powered Learning Platform

## Project Overview

AcmeLearn is an AI-driven learning recommendation system built with FastAPI (backend) and React + TypeScript (frontend). Full Docker containerization with PostgreSQL 16, JWT authentication, and feature-based frontend architecture following bulletproof-react patterns.

**Current State**: Backend fully functional with auth, profiles, courses, and admin APIs. Frontend complete with auth, courses, profile, dashboard, and full admin features (dashboard, user management, analytics). Recommendations feature ready for LLM integration. Tests cover backend API and service layers.

## Quick Navigation

- **Backend development**: See `backend/CLAUDE.md`
- **Frontend development**: See `frontend/CLAUDE.md`
- **Testing**: See `tests/CLAUDE.md`
- **Documentation**: See `docs/CLAUDE.md`

## Git Commit Rules

**ALWAYS ask before committing**:
- Say: "Ready to commit: '[suggested message]'. Proceed?"
- Use clear, meaningful commit messages written as if from a human developer
- **Never mention Claude, AI assistance, or "best practices" in commit messages**
- Keep commits focused and professional
- Commit at logical completion points (feature done, milestone reached)

## Clarifying Questions

Before starting any significant feature or system implementation, **ASK clarifying questions** to ensure we're building exactly what's needed. Don't assume you know the requirements - surface hidden assumptions early.

Examples of good clarifying questions:
- "For the LLM integration, should we use OpenAI, Claude, or support both? What's your preference for cost vs quality tradeoffs?"
- "For the recommendation system, should users be able to provide a free-text query, or just rely on their profile data?"
- "How many recommendations should we return per request? Should they be ranked by confidence?"
- "Should we store recommendation history, or is each request independent?"

This approach reveals assumptions you might not realize you're making and ensures we build the right thing the first time.

## Docker Setup

```bash
# 1. Setup environment
cp .env.example .env       # Copy and edit with your credentials

# 2. Start all services (postgres, postgres_test, backend, frontend)
docker compose up --build  # Builds and starts all 4 containers

# 3. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Common Docker commands**:
```bash
docker compose up --build   # Start all services (rebuild if needed)
docker compose down         # Stop all services
docker compose logs -f      # View all logs
docker compose logs backend # View backend logs only
docker compose ps           # Check container status
```

**See `docs/DOCKER.md`** for complete Docker documentation including running tests, database access, volume mounts, and troubleshooting.

## Database Access (MCP PostgreSQL)

A PostgreSQL MCP server is available: `mcp__acmelearn-postgres__query`

**ALWAYS prefer using the MCP tool** for database queries over `docker exec` or `psql` commands:
- The MCP tool accepts a `sql` parameter with read-only SQL queries
- Use it for: checking table data, verifying database state, exploring schema, debugging
- Fall back to Bash/psql only when you need write operations (INSERT, UPDATE, DELETE)

Examples:
```
# Good - use MCP for queries
mcp__acmelearn-postgres__query with sql: "SELECT COUNT(*) FROM courses"
mcp__acmelearn-postgres__query with sql: "SELECT * FROM user_profiles WHERE user_id = '...'"

# Fall back to Bash only when necessary (writes, admin commands)
docker exec acmelearn_postgres psql -U acmelearn_user -d acmelearn_db -c "TRUNCATE TABLE..."
```

## Browser Automation (MCP Puppeteer)

A Puppeteer MCP server is available for frontend visual testing and browser automation.
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

## Testing Best Practices

- Use `curl` to test API endpoints (examples in `docs/AUTHENTICATION.md`)
- Verify database state with PostgreSQL MCP queries after operations
- Use Puppeteer MCP tools to visually verify frontend implementations
- Use FastAPI's `/docs` endpoint for interactive API testing
- Test with actual data, not just HTTP status codes
- Verify both success cases AND error handling
- Check database consistency (e.g., profile snapshots match versions)

## Technology Stack Summary

**Backend**: FastAPI (Python 3.12) + PostgreSQL 16 + SQLAlchemy + fastapi-users (JWT auth)
**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query
**Testing**: pytest (backend) + httpx (async client)
**Deployment**: Docker Compose (4 containers)

## OpenAI API Keys

Two OpenAI API keys are available in `.env`: `OPENAI_API_KEY` and `OPENAI_API_KEY2`

## Key Documentation

- **`docs/ARCHITECTURE.md`**: Backend architecture decisions, layer responsibilities, design patterns
- **`docs/FRONTEND_ARCHITECTURE.md`**: Frontend architecture and patterns
- **`docs/UI_DESIGN_SYSTEM.md`**: Visual design system
- **`docs/AUTHENTICATION.md`**: Authentication implementation and design choices
- **`docs/PRODUCT_DATA_STRATEGY.md`**: Database schema, data modeling, analytics strategy
- **`docs/BUSINESS_REQUIREMENTS.md`**: Business rules and access control
- **`docs/DOCKER.md`**: Docker setup, commands, and troubleshooting

**When making technical decisions, ALWAYS consult these documents first.**
