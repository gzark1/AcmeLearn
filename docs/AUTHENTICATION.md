# AcmeLearn - Authentication Implementation

## Overview

This document describes AcmeLearn's authentication implementation using **fastapi-users**, a batteries-included user management library for FastAPI. This is not a tutorial on fastapi-users—it documents our specific design choices, customizations, and integration strategy.

**Implementation Status**: ✅ **COMPLETED** (Phase 2)

---

## Technology Choice: Why fastapi-users?

### Decision Rationale

After evaluating authentication approaches, we chose **fastapi-users** because:

1. **Async-First Architecture**: Official async SQLAlchemy support matches our PostgreSQL + async FastAPI stack
2. **Batteries Included**: Registration, login, password reset, email verification out of the box
3. **Extensible Hooks**: `on_after_register` and other lifecycle hooks for custom business logic
4. **Type-Safe**: Full Pydantic schema support with validation
5. **JWT Support**: Built-in JWT bearer authentication (stateless tokens)
6. **Production-Ready**: Maintained library in use by many FastAPI projects
7. **Separation of Concerns**: User (authentication) vs UserProfile (preferences) separation

### Alternative Approaches Considered

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Custom JWT Auth** | Full control, learn internals | Time-consuming, security risks, reinventing wheel | ❌ Rejected |
| **Auth0/Clerk** | Hosted, zero maintenance | External dependency, cost, overkill for assessment | ❌ Rejected |
| **fastapi-users** | Fast implementation, proven, extensible | Less control than custom, learning curve | ✅ **Selected** |

---

## Architecture Overview

### Component Structure

```
backend/
├── models/
│   └── user.py                    # User model (authentication)
│   └── user_profile.py            # UserProfile model (preferences)
│   └── user_profile_snapshot.py   # Version history
│
├── core/
│   ├── auth.py           # JWT strategy and bearer transport
│   ├── users.py          # FastAPIUsers instance
│   └── user_manager.py   # UserManager with custom hooks
│
├── schemas/
│   ├── user.py           # UserRead, UserCreate, UserUpdate
│   ├── profile.py        # ProfileRead, ProfileUpdate
│   └── auth.py           # Token, PasswordChangeRequest
│
└── api/
    ├── auth.py           # Auth routes (register, login, password reset)
    ├── users.py          # User management routes
    └── profiles.py       # Profile CRUD (custom endpoints)
```

---

## Key Design Decisions

### 1. Separate User and UserProfile Models

**Decision**: Authentication data (User) separate from learning preferences (UserProfile)

**Rationale**:
- **User model**: Minimal, only auth-related fields (`email`, `hashed_password`, `is_active`, `is_superuser`, `is_verified`)
- **UserProfile model**: Rich domain data (`learning_goal`, `current_level`, `interests`, `time_commitment`)
- **Benefits**:
  - Clean separation of concerns (auth vs business logic)
  - Profile versioning/snapshots don't affect auth
  - Can query profiles without loading hashed passwords
  - Easier to implement profile-specific features (snapshots, analytics)

**Implementation**:
```python
# models/user.py - Authentication only
class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"
    # Inherits: id, email, hashed_password, is_active, is_superuser, is_verified
    # NO custom fields - keep it minimal

# models/user_profile.py - Business logic
class UserProfile(Base):
    __tablename__ = "user_profiles"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    learning_goal: Mapped[Optional[str]]
    current_level: Mapped[Optional[str]]
    time_commitment: Mapped[Optional[int]]
    version: Mapped[int] = mapped_column(Integer, default=1)
    # interests via user_interests junction table
```

---

### 2. Async SQLAlchemy with PostgreSQL

**Decision**: Use async SQLAlchemy with `asyncpg` driver

**Implementation**:
```python
# core/database.py
DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/acmelearn_db"

engine = create_async_engine(DATABASE_URL, pool_size=10, max_overflow=20)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
```

**Why Async**:
- FastAPI is async-first (performance benefits)
- fastapi-users officially supports async SQLAlchemy
- Handles concurrent requests efficiently
- No need for thread pool wrappers

---

### 3. JWT Bearer Authentication

**Decision**: Stateless JWT tokens with 1-hour expiration

**Configuration**:
```python
# core/auth.py
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)

SECRET = settings.SECRET_KEY  # From environment variable

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)  # 1 hour

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)
```

**Benefits**:
- Stateless (no session storage needed)
- Industry standard
- Works with mobile/SPA clients
- 1-hour expiration balances security and UX

---

### 4. Custom `on_after_register` Hook

**Decision**: Auto-create empty UserProfile on registration

**Why**:
- Users don't fill profile during registration (too much friction)
- Create empty profile automatically → user fills later via `PATCH /profiles/me`
- Also create initial snapshot (version 1, all fields empty/null)

**Implementation**:
```python
# core/user_manager.py
class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

        # Get DB session from user_db
        db: AsyncSession = self.user_db.session

        # 1. Create empty UserProfile
        profile = UserProfile(
            user_id=user.id,
            learning_goal=None,
            current_level=None,
            time_commitment=None,
            version=1,
        )
        db.add(profile)
        await db.flush()  # Get profile.id

        # 2. Create initial snapshot (version 1, empty)
        snapshot = UserProfileSnapshot(
            user_profile_id=profile.id,
            version=1,
            learning_goal=None,
            current_level=None,
            time_commitment=None,
            interests_snapshot=[],
        )
        db.add(snapshot)
        await db.commit()

        print(f"Created empty profile {profile.id} for user {user.id}")
```

**User Flow**:
1. `POST /auth/register` → User created
2. Hook triggers → Empty profile created (version 1)
3. Hook triggers → Initial snapshot created (version 1)
4. User logs in → `PATCH /profiles/me` → Profile filled (version 2)
5. Service layer → New snapshot created (version 2)

---

### 5. Profile Snapshot Strategy

**Decision**: Create snapshot AFTER each profile update (not before)

**Rationale**:
- Snapshots capture the state at a specific version
- When profile updates from v1 → v2, create snapshot with v2 data
- Initial registration creates v1 snapshot (empty state)

**Implementation** (in ProfileService):
```python
async def update_profile_with_snapshot(...) -> UserProfile:
    # 1. Get current profile
    profile = await self.repo.get_profile_by_user_id(user_id)

    # 2. Update profile (increments version)
    updated_profile = await self.repo.update_profile(profile, ...)

    # 3. Create snapshot of NEW state (AFTER update)
    snapshot = UserProfileSnapshot(
        user_profile_id=updated_profile.id,
        version=updated_profile.version,  # NEW version
        learning_goal=updated_profile.learning_goal,  # NEW data
        current_level=updated_profile.current_level,
        time_commitment=updated_profile.time_commitment,
        interests_snapshot=[tag.name for tag in updated_profile.interests],
    )
    self.db.add(snapshot)
    await self.db.commit()

    return updated_profile
```

**Snapshot Timing**:
- Version 1 snapshot: Created on registration (empty)
- Version 2 snapshot: Created after first profile update (filled)
- Version N snapshot: Captures state at version N

---

### 6. Normalized Interests with Junction Table

**Decision**: UserProfile interests use many-to-many relationship with tags table

**Schema**:
```python
# models/user_profile.py
class UserProfile(Base):
    interests: Mapped[List["Tag"]] = relationship(
        "Tag",
        secondary="user_interests",
        back_populates="interested_users",
        lazy="selectin"
    )

# Junction table
class UserInterest(Base):
    __tablename__ = "user_interests"
    user_profile_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("user_profiles.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    )
```

**Normalized vs Denormalized**:
- **Current profile**: Normalized (junction table) - referential integrity, easy updates
- **Snapshots**: Denormalized (JSONB array of tag names) - historical accuracy, self-contained

**Why Both**:
- If tags are renamed/deleted, snapshots preserve original names
- Current profile uses live tag references for active queries
- Snapshots are immutable historical records

---

## API Endpoints

### Authentication Routes (`/auth`)

Provided by fastapi-users `get_auth_router()`, `get_register_router()`, etc:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/jwt/login` | Login (returns JWT token) | No |
| POST | `/auth/jwt/logout` | Logout | Yes |
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/request-verify-token` | Request email verification | Yes |
| POST | `/auth/verify` | Verify email with token | No |

### User Management Routes (`/users`)

Provided by fastapi-users `get_users_router()`:

| Method | Endpoint | Description | Auth Required | Permission |
|--------|----------|-------------|---------------|------------|
| GET | `/users/me` | Get current user | Yes | Self |
| PATCH | `/users/me` | Update current user | Yes | Self |
| DELETE | `/users/me` | Delete current user | Yes | Superuser only |
| GET | `/users/{id}` | Get user by ID | Yes | Superuser only |
| PATCH | `/users/{id}` | Update user by ID | Yes | Superuser only |
| DELETE | `/users/{id}` | Delete user by ID | Yes | Superuser only |

### Profile Routes (`/profiles`) - Custom Endpoints

Custom implementation (not from fastapi-users):

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profiles/me` | Get current user's profile | Yes |
| PATCH | `/profiles/me` | Update current user's profile | Yes |

**Profile Update Flow**:
1. User sends `PATCH /profiles/me` with new data
2. ProfileService updates profile (increments version)
3. ProfileService creates snapshot with new data
4. Both committed atomically

---

## Testing Strategy

### Manual Testing with curl

**1. Register User**:
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!", "is_active": true, "is_superuser": false, "is_verified": false}'
```

**2. Login**:
```bash
curl -X POST "http://localhost:8000/auth/jwt/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=SecurePass123!"
```

**3. Get Profile** (with token):
```bash
TOKEN="your-jwt-token-here"
curl "http://localhost:8000/profiles/me" \
  -H "Authorization: Bearer $TOKEN"
```

**4. Update Profile**:
```bash
curl -X PATCH "http://localhost:8000/profiles/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "learning_goal": "Become a full-stack developer",
    "current_level": "Intermediate",
    "time_commitment": 15,
    "interest_tag_ids": ["tag-uuid-1", "tag-uuid-2"]
  }'
```

### Database Verification

**Check user was created**:
```bash
docker exec acmelearn_postgres psql -U acmelearn_user -d acmelearn_db -c \
  "SELECT id, email, is_active FROM users;"
```

**Check profile auto-created**:
```bash
docker exec acmelearn_postgres psql -U acmelearn_user -d acmelearn_db -c \
  "SELECT id, user_id, version, learning_goal FROM user_profiles;"
```

**Check snapshots**:
```bash
docker exec acmelearn_postgres psql -U acmelearn_user -d acmelearn_db -c \
  "SELECT version, learning_goal, time_commitment FROM user_profile_snapshots ORDER BY version;"
```

### Using FastAPI Interactive Docs

Visit `http://localhost:8000/docs`:

1. Click "Authorize" button (top right)
2. Login via `/auth/jwt/login` to get token
3. Paste token in authorization dialog
4. Try protected endpoints (profiles, courses, etc.)

---

## Security Considerations

### Password Storage
- Passwords hashed with `bcrypt` (via fastapi-users)
- Never store plaintext passwords
- Hashed password field: `hashed_password`

### JWT Secret
- Store in environment variable: `SECRET_KEY`
- Never commit to git
- Use strong random value (32+ characters)

### Token Expiration
- Current: 1 hour (`lifetime_seconds=3600`)
- Balance security (short expiry) vs UX (not too frequent re-login)
- Consider refresh tokens for longer sessions (future enhancement)

### Soft Delete
- Built-in `is_active` field for soft deletion
- Deleted users: `is_active = False`
- Cannot login when inactive
- Data preserved for analytics

---

## Common Operations

### Create Superuser (for testing)

```python
# Via Python script or shell
async def create_superuser():
    async with async_session_maker() as session:
        user_db = SQLAlchemyUserDatabase(session, User)
        user_manager = UserManager(user_db)

        user = await user_manager.create(
            UserCreate(
                email="admin@example.com",
                password="AdminPass123!",
                is_superuser=True,
                is_verified=True
            )
        )
        print(f"Superuser created: {user.id}")
```

### Check User Authorization

```python
# In any protected endpoint
from core.users import current_active_user

@router.get("/protected")
async def protected_route(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}"}
```

### Access Profile from User

```python
# Query profile by user_id
profile = await db.execute(
    select(UserProfile).where(UserProfile.user_id == user.id)
)
profile = profile.scalar_one_or_none()
```

---

## Future Enhancements

### Not Implemented (Nice-to-Have)

1. **Email Sending**: on_after_forgot_password, on_after_request_verify hooks need SMTP integration
2. **Refresh Tokens**: Long-lived sessions with token refresh
3. **OAuth Providers**: Google/GitHub login via fastapi-users OAuth routers
4. **Rate Limiting**: slowapi middleware for brute-force protection
5. **Password Strength Meter**: Frontend validation for password complexity
6. **Email Change Flow**: Verify both old and new email addresses
7. **Account Deletion Confirmation**: Require password confirmation before delete

---

## Key Takeaways

**What Makes This Implementation Unique**:

1. **Separation of Concerns**: User (auth) vs UserProfile (business) models
2. **Auto-Profile Creation**: Empty profile created on registration via hook
3. **Snapshot Versioning**: Historical tracking of profile changes (after updates)
4. **Normalized Interests**: Many-to-many with tags table (not JSON array in User)
5. **Async-First**: Fully async SQLAlchemy with PostgreSQL
6. **Layered Architecture**: Services and repositories handle business logic, not API routes

**Design Philosophy**:
- Use battle-tested libraries (fastapi-users) for standard features
- Customize via hooks and custom endpoints for specific needs
- Keep auth simple, make business logic rich
- Document decisions, not just implementation

---

## References

- [fastapi-users Documentation](https://fastapi-users.github.io/fastapi-users/)
- [fastapi-users GitHub](https://github.com/fastapi-users/fastapi-users)
- [SQLAlchemy Async Documentation](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- AcmeLearn `docs/ARCHITECTURE.md` - Layered architecture decisions
- AcmeLearn `docs/PRODUCT_DATA_STRATEGY.md` - Database schema and versioning strategy

---

**Last Updated**: 2025-11-24 (Phase 2 Complete)
**Implementation Status**: ✅ COMPLETED
