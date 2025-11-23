"""
AcmeLearn FastAPI Application Entry Point

This is the main entry point for the AcmeLearn backend API.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.database import init_db, async_session_maker
from scripts.seed_courses import seed_courses
from api import auth, users, profiles, courses


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan event handler.

    Manages startup and shutdown events using modern context manager pattern.
    Runs once when uvicorn starts (or reloads).
    """
    # Startup
    print("Starting up AcmeLearn API...")

    # Create tables
    await init_db()

    # Seed courses (only if empty)
    async with async_session_maker() as db:
        try:
            await seed_courses(db)
        except Exception as e:
            print(f"Error seeding database: {e}")
            await db.rollback()
            raise

    print("Startup complete!")

    yield  # Application runs here

    # Shutdown (runs after yield when app stops)
    print("Shutting down AcmeLearn API...")


app = FastAPI(
    title="AcmeLearn API",
    description="AI-powered learning recommendation system",
    version="0.1.0",
    lifespan=lifespan
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AcmeLearn API is running"}


@app.get("/health")
async def health():
    """Health check for monitoring"""
    return {"status": "healthy"}


# Include API routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
app.include_router(courses.router, prefix="/api", tags=["courses"])
