"""
Demo user seeding for startup.

Creates demo users with varied profile states for assessment/demos.
Runs on startup when SEED_DEMO_USERS=true.

User distribution (25 users):
- 4 users: Never touched profile (registered but inactive)
- 5 users: Incomplete profile (only some fields filled)
- 10 users: Complete profile, 1-2 updates
- 6 users: Active users with 3-5 profile updates
"""
import random
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_users.password import PasswordHelper

from models.user import User
from models.user_profile import UserProfile
from models.user_profile_snapshot import UserProfileSnapshot
from models.course import Tag
from models.enums import DifficultyLevel, TimeCommitment
from core.config import settings


# Demo user password
PASSWORD = settings.DEMO_USER_PASSWORD or "123123123"

# Learning goals for different user types
LEARNING_GOALS = [
    "I want to start learning programming from scratch",
    "Looking to understand the basics of web development",
    "Interested in getting into tech as a career changer",
    "Want to learn Python for data analysis at work",
    "Starting my coding journey, need beginner-friendly courses",
    "Transitioning from marketing to data science",
    "Moving from finance to software development",
    "Want to become a full-stack developer within a year",
    "Looking to pivot into machine learning and AI",
    "Switching from project management to technical product role",
    "Need to level up my Python skills for a promotion",
    "Want to learn cloud technologies for my current role",
    "Looking to add data visualization to my skillset",
    "Expanding from frontend to backend development",
    "Improving my DevOps knowledge for better deployments",
    "Mastering system design for senior engineering roles",
    "Deep diving into machine learning architectures",
    "Learning advanced cloud infrastructure patterns",
    "Preparing for technical leadership responsibilities",
    None,  # Some users don't fill this
    None,
]

# Timestamp ranges (days ago)
TIME_RANGES = {
    "old": (60, 90),      # 2-3 months ago
    "recent": (14, 30),   # 2-4 weeks ago
    "this_week": (1, 7),  # This week
    "today": (0, 0),      # Today
}


async def seed_demo_users(db: AsyncSession) -> None:
    """
    Seed demo users with varied profile states.

    Only runs if:
    1. SEED_DEMO_USERS is true
    2. No demo users exist yet (idempotent)
    """
    if not settings.SEED_DEMO_USERS:
        print("Demo user seeding disabled (SEED_DEMO_USERS=false)")
        return

    # Check if demo users already exist
    result = await db.execute(
        select(User).where(User.email.like("demo%@example.com"))
    )
    existing = result.scalars().all()
    if existing:
        print(f"Demo users already exist ({len(existing)} users). Skipping seed.")
        return

    print("Seeding demo users...")

    # Get all tags for interests
    result = await db.execute(select(Tag))
    all_tags = result.scalars().all()

    if not all_tags:
        print("Warning: No tags found. Seed courses first.")
        return

    password_helper = PasswordHelper()
    hashed_password = password_helper.hash(PASSWORD)
    now = datetime.utcnow()

    # Define user personas
    personas = _generate_personas()

    created_count = 0
    snapshot_count = 0

    for i, persona in enumerate(personas, start=1):
        email = f"demo{i:02d}@example.com"

        # Calculate creation date
        time_range = TIME_RANGES[persona["age"]]
        days_ago = random.randint(time_range[0], time_range[1])
        created_at = now - timedelta(days=days_ago)

        # Create user
        user = User(
            email=email,
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=False,
            is_verified=False,
        )
        db.add(user)
        await db.flush()

        # Create profile based on persona type
        profile, snapshots = await _create_profile_for_persona(
            db, user.id, persona, all_tags, created_at, now
        )

        db.add(profile)
        await db.flush()

        for snapshot in snapshots:
            snapshot.user_profile_id = profile.id
            db.add(snapshot)

        created_count += 1
        snapshot_count += len(snapshots)

    await db.commit()

    print(f"Created {created_count} demo users with {snapshot_count} profile snapshots")
    print(f"Password for all demo users: {PASSWORD}")
    print("Demo user emails: demo01@example.com through demo25@example.com")


def _generate_personas() -> List[dict]:
    """Generate 25 user personas with varied characteristics."""
    personas = []

    # 4 users: Never touched profile (inactive/abandoned)
    for _ in range(4):
        personas.append({
            "type": "inactive",
            "age": random.choice(["old", "recent"]),
            "updates": 0,
        })

    # 5 users: Incomplete profile (partial data)
    for _ in range(5):
        personas.append({
            "type": "incomplete",
            "age": random.choice(["recent", "this_week"]),
            "updates": 1,
        })

    # 10 users: Complete profile, minimal activity
    for _ in range(10):
        personas.append({
            "type": "complete",
            "age": random.choice(["old", "recent", "this_week"]),
            "updates": random.randint(1, 2),
        })

    # 6 users: Active users with multiple updates
    for _ in range(6):
        personas.append({
            "type": "active",
            "age": random.choice(["old", "recent"]),
            "updates": random.randint(3, 5),
        })

    # Shuffle to mix user types
    random.shuffle(personas)
    return personas


async def _create_profile_for_persona(
    db: AsyncSession,
    user_id,
    persona: dict,
    all_tags: List[Tag],
    created_at: datetime,
    now: datetime,
) -> tuple[UserProfile, List[UserProfileSnapshot]]:
    """Create profile and snapshots based on persona type."""

    snapshots = []
    persona_type = persona["type"]
    num_updates = persona["updates"]

    # Initial empty snapshot (version 1)
    initial_snapshot = UserProfileSnapshot(
        version=1,
        learning_goal=None,
        current_level=None,
        time_commitment=None,
        interests_snapshot=[],
        created_at=created_at,
    )
    snapshots.append(initial_snapshot)

    if persona_type == "inactive":
        # User never filled profile
        profile = UserProfile(
            user_id=user_id,
            learning_goal=None,
            current_level=None,
            time_commitment=None,
            version=1,
            created_at=created_at,
            updated_at=created_at,
        )
        return profile, snapshots

    # Generate profile data based on type
    if persona_type == "incomplete":
        # Only fill 1-2 fields randomly
        fields_to_fill = random.randint(1, 2)
        learning_goal = random.choice(LEARNING_GOALS) if fields_to_fill >= 1 and random.random() > 0.3 else None
        current_level = random.choice(list(DifficultyLevel)) if fields_to_fill >= 2 or (fields_to_fill == 1 and not learning_goal) else None
        time_commitment = None
        interest_tags = []

    elif persona_type == "complete":
        # All fields filled
        learning_goal = random.choice([g for g in LEARNING_GOALS if g])
        current_level = random.choice(list(DifficultyLevel))
        time_commitment = random.choice(list(TimeCommitment))
        num_interests = random.randint(2, 5)
        interest_tags = random.sample(all_tags, min(num_interests, len(all_tags)))

    else:  # active
        # All fields filled, will have multiple updates
        learning_goal = random.choice([g for g in LEARNING_GOALS if g])
        current_level = random.choice(list(DifficultyLevel))
        time_commitment = random.choice(list(TimeCommitment))
        num_interests = random.randint(3, 6)
        interest_tags = random.sample(all_tags, min(num_interests, len(all_tags)))

    # Create update snapshots
    current_version = 1
    days_between_updates = (now - created_at).days // max(num_updates, 1)

    for update_num in range(num_updates):
        current_version += 1
        update_time = created_at + timedelta(days=days_between_updates * (update_num + 1))
        if update_time > now:
            update_time = now - timedelta(hours=random.randint(1, 24))

        # Snapshot captures state BEFORE update
        snapshot = UserProfileSnapshot(
            version=current_version,
            learning_goal=learning_goal if update_num > 0 else None,
            current_level=current_level if update_num > 0 else None,
            time_commitment=time_commitment if update_num > 0 else None,
            interests_snapshot=[t.name for t in interest_tags] if update_num > 0 else [],
            created_at=update_time,
        )
        snapshots.append(snapshot)

        # Randomly modify some fields for next iteration (simulates profile evolution)
        if persona_type == "active" and update_num < num_updates - 1:
            if random.random() < 0.3:
                learning_goal = random.choice([g for g in LEARNING_GOALS if g])
            if random.random() < 0.2:
                num_interests = random.randint(2, 7)
                interest_tags = random.sample(all_tags, min(num_interests, len(all_tags)))
            if random.random() < 0.15:
                time_commitment = random.choice(list(TimeCommitment))

    # Create final profile state
    profile = UserProfile(
        user_id=user_id,
        learning_goal=learning_goal,
        current_level=current_level,
        time_commitment=time_commitment,
        version=current_version,
        created_at=created_at,
        updated_at=now - timedelta(hours=random.randint(0, 48)) if num_updates > 0 else created_at,
    )

    # Add interests to profile
    profile.interests = interest_tags

    return profile, snapshots
