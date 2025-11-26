"""
AcmeLearn FastAPI Application Entry Point

This is the main entry point for the AcmeLearn backend API.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from core.database import init_db, async_session_maker
from core.config import settings
from scripts.seed_courses import seed_courses
from scripts.seed_demo_users import seed_demo_users
from api import auth, users, profiles, courses, admin


async def create_or_promote_superuser(db):
    """
    Create superuser from environment variables on startup.

    - If SUPERUSER_EMAIL is set and user doesn't exist, create as superuser
    - If user exists but not superuser, promote to superuser
    """
    if not settings.SUPERUSER_EMAIL or not settings.SUPERUSER_PASSWORD:
        return

    from models.user import User
    from core.user_manager import UserManager
    from fastapi_users.db import SQLAlchemyUserDatabase
    from fastapi_users.password import PasswordHelper

    print(f"Checking for superuser: {settings.SUPERUSER_EMAIL}")

    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == settings.SUPERUSER_EMAIL)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        if not existing_user.is_superuser:
            # Promote existing user to superuser
            existing_user.is_superuser = True
            await db.commit()
            print(f"Promoted user {settings.SUPERUSER_EMAIL} to superuser")
        else:
            print(f"Superuser {settings.SUPERUSER_EMAIL} already exists")
    else:
        # Create new superuser using UserManager
        user_db = SQLAlchemyUserDatabase(db, User)
        user_manager = UserManager(user_db)

        password_helper = PasswordHelper()
        hashed_password = password_helper.hash(settings.SUPERUSER_PASSWORD)

        superuser = User(
            email=settings.SUPERUSER_EMAIL,
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=True,
            is_verified=True,
        )

        db.add(superuser)
        await db.flush()

        # Trigger on_after_register to create profile
        await user_manager.on_after_register(superuser)

        print(f"Created superuser: {settings.SUPERUSER_EMAIL}")


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

    # Create superuser if configured
    async with async_session_maker() as db:
        try:
            await create_or_promote_superuser(db)
        except Exception as e:
            print(f"Error creating superuser: {e}")
            await db.rollback()

    # Seed demo users if configured (for assessment/demos)
    async with async_session_maker() as db:
        try:
            await seed_demo_users(db)
        except Exception as e:
            print(f"Error seeding demo users: {e}")
            await db.rollback()

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

# CORS middleware - allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(admin.router, prefix="/admin", tags=["admin"])
