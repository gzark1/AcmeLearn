# Docker Setup

## Quick Start

```bash
# Start all services
docker compose up --build

# Stop all services
docker compose down

# View logs
docker compose logs -f
```

## Services

| Container | Port | Description |
|-----------|------|-------------|
| `acmelearn_postgres` | 5432 | Development database (persistent) |
| `acmelearn_postgres_test` | 5433 | Test database (in-memory) |
| `acmelearn_backend` | 8000 | FastAPI backend |
| `acmelearn_frontend` | 5173 | React/Vite frontend |

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Project Structure

```
AcmeLearn/
├── docker-compose.yml          # All 4 services
├── backend/
│   ├── Dockerfile              # Python 3.12-slim + uv
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Node 20-alpine
│   └── .dockerignore
├── tests/                      # Mounted at /tests in backend container
└── courses.json                # Mounted at /courses.json in backend container
```

## Running Tests

```bash
# Run all tests
docker compose exec -e PYTHONPATH=/app backend sh -c \
  'cd /tests/backend && /app/.venv/bin/pytest . -v --asyncio-mode=auto'

# Run specific test file
docker compose exec -e PYTHONPATH=/app backend sh -c \
  'cd /tests/backend && /app/.venv/bin/pytest test_api/test_auth.py -v --asyncio-mode=auto'
```

## Environment Variables

The backend container uses these environment overrides:

```yaml
environment:
  DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
  TEST_DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres_test:5432/acmelearn_test
```

Note: Inside Docker, database hostnames are `postgres` and `postgres_test` (not `localhost`).

## Volume Mounts

Backend container mounts:
- `./backend:/app` - Source code (hot reload)
- `./tests:/tests` - Test files
- `./courses.json:/courses.json` - Course data for seeding
- `/app/.venv` - Anonymous volume (preserves container's venv)

Frontend container mounts:
- `./frontend:/app` - Source code (hot reload)
- `/app/node_modules` - Anonymous volume (preserves container's node_modules)

## Common Commands

```bash
# Rebuild after Dockerfile changes
docker compose up --build

# Restart specific service
docker compose restart backend

# Shell into backend container
docker compose exec backend sh

# Check container status
docker compose ps

# View backend logs only
docker compose logs -f backend

# Clean up everything (including volumes)
docker compose down -v
```

## Database Access

```bash
# Connect to dev database
docker exec acmelearn_postgres psql -U acmelearn_user -d acmelearn_db

# Connect to test database
docker exec acmelearn_postgres_test psql -U acmelearn_user -d acmelearn_test

# Run SQL query
docker exec acmelearn_postgres psql -U acmelearn_user -d acmelearn_db -c "SELECT COUNT(*) FROM courses;"
```

## Troubleshooting

**Backend not starting?**
- Check logs: `docker compose logs backend`
- Ensure postgres is healthy: `docker compose ps`

**Tests failing with connection errors?**
- Ensure `postgres_test` is running: `docker compose ps`
- Check TEST_DATABASE_URL uses `postgres_test` hostname (not `localhost`)

**Hot reload not working?**
- Frontend: Check `CHOKIDAR_USEPOLLING=true` is set
- Backend: Ensure volume mount is correct

**Dependencies not found?**
- Backend: Run `docker compose exec backend uv sync --extra test`
- Frontend: Rebuild with `docker compose up --build frontend`
