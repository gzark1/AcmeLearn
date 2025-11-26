FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install uv package manager
RUN pip install --no-cache-dir uv

# Copy dependency files first (Docker layer caching)
COPY pyproject.toml uv.lock ./

# Install dependencies (production + test extras)
RUN uv sync --extra test

# Copy application code
COPY . .

EXPOSE 8000

# Default command with hot reload
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
