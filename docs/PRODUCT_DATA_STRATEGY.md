# AcmeLearn - Product Data Strategy

## Overview

This document captures the product-thinking and data strategy behind AcmeLearn's database schema design. While the assessment requires basic user profiles and course recommendations, we've designed the schema with real-world product analytics and business intelligence in mind.

**Last Updated**: 2025-11-24 (Day 3 - User Authentication & Profiles Complete)

---

## Product Vision: Why Track Historical Data?

### The Business Case

**Problem**: If we only store current user profiles, we lose visibility into:
- How users' learning goals evolve over time
- Which profile changes correlate with engagement vs churn
- Whether our recommendations drive profile refinement
- Patterns in successful learner journeys

**Real-World Product Questions**:
1. "What % of users upgrade from beginner to intermediate within 3 months?"
2. "Which interests are trending upward this quarter?"
3. "Do users who decrease time commitment churn within 30 days?"
4. "Do profile updates after recommendations indicate better personalization?"

### Key Insights We Want to Capture

**User Journey Analytics**:
- Learning goal evolution ("learn Python" → "become ML engineer")
- Skill level progression timeline (beginner → intermediate)
- Interest expansion vs specialization patterns
- Time commitment fluctuations (engagement signals)

**Recommendation Quality**:
- Which profile states produce highest-rated recommendations?
- Do users update profiles after bad recommendations?
- A/B testing different LLM models (GPT-4 vs Claude)
- Course popularity and recommendation frequency

**Churn Prediction Signals**:
- Decreased time commitment (>50% drop)
- Profile abandonment (no updates in 90 days)
- Negative recommendation ratings
- Interest narrowing (many topics → one topic)

---

## Database Schema Design

### Core Tables

#### 1. **users** - Authentication

<!-- ✅ IMPLEMENTED: Completed in Phase 2 (2025-11-24) -->

```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())
```

**Design Rationale**:
- **Native UUID type**: 16-byte binary storage (not 36-char string)
- Email indexed for fast login lookups
- `is_active` enables soft deletion (preserve data for analytics)
- UUIDs prevent user enumeration attacks

---

#### 2. **user_profiles** - Current State (Fast Reads)

<!-- ✅ IMPLEMENTED: Completed in Phase 2 (2025-11-24) -->

```python
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # Assessment-specified fields (all nullable - filled after registration)
    learning_goal: Mapped[Optional[str]] = mapped_column(Text)
    current_level: Mapped[Optional[str]] = mapped_column(String)
    time_commitment: Mapped[Optional[int]] = mapped_column(Integer)  # Hours/week (1-168)

    # Versioning for change tracking
    version: Mapped[int] = mapped_column(Integer, default=1)

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    interests: Mapped[List["Tag"]] = relationship(
        "Tag", secondary="user_interests", back_populates="interested_users"
    )
```

**Design Rationale**:
- **One row per user**: Current profile state for fast application queries
- **version field**: Increments with each update (1, 2, 3...), links to snapshots
- **Normalized interests**: Many-to-many relationship with tags table (proper relational design)
- **Updated in-place**: Standard UPDATE queries for user-facing operations

---

#### 3. **user_profile_snapshots** - Historical Changes (Analytics)

<!-- ✅ IMPLEMENTED: Completed in Phase 2 (2025-11-24) -->

```python
class UserProfileSnapshot(Base):
    __tablename__ = "user_profile_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_profile_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)

    # Snapshot of profile state at this version
    learning_goal: Mapped[Optional[str]] = mapped_column(Text)
    current_level: Mapped[Optional[str]] = mapped_column(String)
    time_commitment: Mapped[Optional[int]] = mapped_column(Integer)
    interests_snapshot: Mapped[list] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"), nullable=False, default=list
    )

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    __table_args__ = (Index('idx_profile_version', 'user_profile_id', 'version'),)
```

**Design Rationale**:
- **Insert-only**: Immutable audit trail (never UPDATE or DELETE)
- **Created AFTER update**: Captures NEW state after `user_profiles` changes
- **Version matching**: Snapshot v2 = user_profiles at version 2 (after second update)
- **Indexed**: Fast temporal queries by profile and version

**When Snapshots Are Created**:
1. **Initial profile creation**: Version 1 snapshot (empty profile)
2. **Every profile update**: Save NEW state after updating
3. **Service layer responsibility**: Not database triggers

**Update Flow** (Corrected):
```python
async def update_profile_with_snapshot(db: Session, user_id: uuid.UUID, new_data):
    # 1. Get current profile
    profile = await get_profile(db, user_id)

    # 2. Update profile (increments version)
    updated_profile = await repo.update_profile(profile, new_data)
    # Profile is now version 2 with new data

    # 3. Create snapshot of NEW state (AFTER update)
    snapshot = UserProfileSnapshot(
        user_profile_id=updated_profile.id,
        version=updated_profile.version,  # Version 2
        learning_goal=updated_profile.learning_goal,  # NEW data
        current_level=updated_profile.current_level,
        time_commitment=updated_profile.time_commitment,
        interests_snapshot=[tag.name for tag in updated_profile.interests]
    )
    db.add(snapshot)

    # 4. Commit atomically
    await db.commit()
    return updated_profile
```

**Snapshot Timeline Example**:
- Registration: Profile v1 (empty) → Snapshot v1 (empty)
- First update: Profile v2 (filled) → Snapshot v2 (filled)
- Second update: Profile v3 (modified) → Snapshot v3 (modified)

---

#### 4. **courses** - Read-Only Catalog (Normalized)

<!-- ✅ IMPLEMENTED: Completed with native UUID type (2025-11-22) -->

```python
class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        SQLEnum(DifficultyLevel, native_enum=False, length=20),
        nullable=False,
        index=True
    )
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    contents: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    # Relationships (many-to-many)
    tags: Mapped[List["Tag"]] = relationship(
        "Tag",
        secondary="course_tags",
        back_populates="courses",
        lazy="selectin"
    )
    skills: Mapped[List["Skill"]] = relationship(
        "Skill",
        secondary="course_skills",
        back_populates="courses",
        lazy="selectin"
    )
```

**Design Rationale**:
- **Native UUID type**: PostgreSQL UUID (16 bytes) instead of VARCHAR(36)
- **Immutable**: Auto-seeded from `courses.json` on startup (48 courses)
- **Indexed fields**: `title` and `difficulty` for fast filtering
- **Normalized tags/skills**: 169 tags, 230 skills in separate tables
- **Many-to-many relationships**: Junction tables (course_tags, course_skills)
- **Eager loading**: `lazy="selectin"` prevents N+1 query problems

**Why Normalized Instead of JSON**:
- ✅ Tag/skill metadata: Can add descriptions, categories later
- ✅ Referential integrity: FK constraints prevent orphaned data
- ✅ Easy analytics: Simple COUNT queries for tag popularity
- ✅ Tag management: Rename tags globally without touching courses
- ✅ Clean API: `GET /api/v1/tags` returns from tags table
- ✅ Future-proof: Supports tag-based features (browse by tag, trending tags)

**Filtering Examples**:
```sql
-- Find courses with "python" tag
SELECT c.* FROM courses c
JOIN course_tags ct ON c.id = ct.course_id
JOIN tags t ON ct.tag_id = t.id
WHERE t.name = 'python';

-- Filter by difficulty
SELECT * FROM courses WHERE difficulty = 'intermediate';

-- Courses with multiple tags (AND logic)
SELECT c.* FROM courses c
JOIN course_tags ct ON c.id = ct.course_id
JOIN tags t ON ct.tag_id = t.id
WHERE t.name IN ('python', 'web development')
GROUP BY c.id
HAVING COUNT(DISTINCT t.id) = 2;
```

---

#### 5. **recommendations** - AI Recommendation History
```python
class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    # Context at recommendation time
    profile_version = Column(Integer, nullable=False)
    query = Column(Text, nullable=True)  # User's specific request

    # LLM output
    recommended_course_ids = Column(JSON().with_variant(JSONB, "postgresql"), nullable=False)
    explanation = Column(Text, nullable=False)
    llm_model = Column(String, nullable=True)  # "gpt-4", "claude-3-sonnet"

    # User feedback (optional)
    user_rating = Column(Integer, nullable=True)  # 1-5 stars
    user_feedback_text = Column(Text, nullable=True)
    feedback_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index('idx_user_created', 'user_id', 'created_at'),)
```

**Design Rationale**:

**profile_version** - Links to Profile State:
- Captures WHICH profile version generated this recommendation
- Enables: "Did recommendations improve after profile update?"
- Query: "Show recommendations from beginner vs intermediate profiles"

**query** - User Intent:
- Distinguishes active search ("web development courses") from passive browsing
- Enables search query analytics
- Natural language data for future improvements

**recommended_course_ids** - Flexible Array:
- JSON array of UUIDs: `["course-1", "course-2", "course-3"]`
- Variable length (3-10 courses per recommendation)
- Alternative rejected: Many-to-many join table (overkill for read-only list)

**llm_model** - A/B Testing:
- Tracks which LLM generated recommendations
- Enables comparison: "Does GPT-4 get higher ratings than Claude?"
- Example analysis: Performance by user skill level × LLM model

**Feedback Fields** - Quality Measurement:
- `user_rating`: Quantitative signal (1-5 stars)
- `user_feedback_text`: Qualitative insights
- `feedback_at`: Time lag between recommendation and feedback

---

#### 6. **tags** - Course/User Interest Taxonomy

<!-- ✅ IMPLEMENTED: Completed with native UUID type (2025-11-22) -->

```python
class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    # Relationships
    courses: Mapped[List["Course"]] = relationship(
        "Course",
        secondary="course_tags",
        back_populates="tags"
    )
    # Future: interested_users relationship for user interests
```

**Design Rationale**:
- **Native UUID type**: PostgreSQL UUID (16 bytes)
- **Minimal schema**: Only essential fields (id, name) for MVP
- **Unique constraint**: Ensures no duplicate tags (169 unique tags)
- **Indexed name**: Fast lookups for filtering and autocomplete
- **Extracted from courses.json**: Auto-seeded on startup

**Future Extensions** (not implemented yet):
- `interested_users` relationship (user interests)
- `category`: "Technical", "Business", "Soft Skills"
- `description`: For UI tooltips
- `slug`: URL-friendly version ("web-development")

---

#### 7. **skills** - Course Learning Outcomes

<!-- ✅ IMPLEMENTED: Completed with native UUID type (2025-11-22) -->

```python
class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    # Relationship
    courses: Mapped[List["Course"]] = relationship(
        "Course",
        secondary="course_skills",
        back_populates="skills"
    )
```

**Design Rationale**:
- **Native UUID type**: PostgreSQL UUID (16 bytes)
- **Minimal schema**: Only essential fields for MVP (230 unique skills)
- **Separate from tags**: Tags = topics/categories, Skills = specific learnings
- **Not used for user interests**: Assessment specifies interests map to tags, not skills
- **Extracted from courses.json**: Auto-seeded on startup

---

#### 8-10. **Junction Tables** - Many-to-Many Relationships

<!-- ✅ IMPLEMENTED: course_tags, course_skills (2025-11-22) -->
<!-- ❌ NOT IMPLEMENTED: user_interests (deferred to Phase 2) -->

**course_tags**: Courses ↔ Tags
```python
class CourseTag(Base):
    __tablename__ = "course_tags"

    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("courses.id", ondelete="CASCADE"),
        primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True
    )
```

**course_skills**: Courses ↔ Skills
```python
class CourseSkill(Base):
    __tablename__ = "course_skills"

    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("courses.id", ondelete="CASCADE"),
        primary_key=True
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("skills.id", ondelete="CASCADE"),
        primary_key=True
    )
```

**user_interests**: UserProfiles ↔ Tags (planned for Phase 2)
```python
class UserInterest(Base):
    __tablename__ = "user_interests"

    user_profile_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("user_profiles.id", ondelete="CASCADE"),
        primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True
    )
```

**Design Rationale**:
- **Native UUID foreign keys**: 16-byte binary references
- **Composite PKs**: (entity_id, tag/skill_id) ensures uniqueness
- **Indexed**: Both columns indexed for fast joins
- **CASCADE delete**: Removing a course/profile automatically cleans up relationships
- **No timestamps**: Pure junction tables (can add later if needed for analytics)

---

## Data Model Decisions

### Final Schema: 10 Tables (9 Implemented, 1 Planned)

<!-- ✅ IMPLEMENTED (Phase 1 - 2025-11-22): 5 tables -->

**Course Tables** (Phase 1):
1. ✅ courses (48 rows, native UUID type)
2. ✅ tags (169 rows, native UUID type)
3. ✅ skills (230 rows, native UUID type)
4. ✅ course_tags (junction table, UUID foreign keys)
5. ✅ course_skills (junction table, UUID foreign keys)

<!-- ✅ IMPLEMENTED (Phase 2 - 2025-11-24): 4 tables -->

**User Tables** (Phase 2):
6. ✅ users (authentication layer)
7. ✅ user_profiles (user preferences)
8. ✅ user_profile_snapshots (historical tracking)
9. ✅ user_interests (junction table: user_profiles ↔ tags)

<!-- ❌ NOT IMPLEMENTED (Phase 4 - AI Integration): 1 table -->

**AI Tables** (Phase 4):
10. ❌ recommendations (AI recommendation history)

---

### Why Normalize Tags and Skills?

**Decision**: Normalize into separate tables with many-to-many relationships

**Alternatives Considered**:

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **JSON Arrays** | Simple, fast course queries, matches source data | No metadata, hard analytics, typos possible | ❌ Rejected |
| **Normalized Tables** | Referential integrity, tag metadata, clean APIs | More tables, joins required | ✅ **Selected** |
| **Hybrid** (tags table + JSON in courses) | Best of both? | Data duplication, sync issues | ❌ Rejected (over-engineering) |

**Benefits of Normalization**:
1. ✅ **Tag Management**: Add categories, descriptions later without schema changes
2. ✅ **Referential Integrity**: FK constraints prevent invalid data
3. ✅ **Clean APIs**: `GET /api/v1/tags` returns from tags table (no JSON processing)
4. ✅ **Analytics**: Simple COUNT queries for tag popularity
5. ✅ **Consistency**: No typos, case sensitivity issues ("Python" vs "python")
6. ✅ **Future Features**: Browse by tag, trending tags, tag suggestions

**Trade-offs Accepted**:
- ⚠️ More complex queries (requires joins)
- ⚠️ Slower course filtering (join overhead vs direct JSON query)
- ⚠️ More complex import script (extract unique tags first)

**Mitigation**:
- SQLAlchemy ORM handles joins elegantly
- Indexes on all FKs (fast join performance)
- Eager loading: `db.query(Course).options(joinedload(Course.tags))`
- Only 50 courses, 169 tags (trivial dataset size)

---

### Why JSON for Arrays?

**Use Cases**:
- User interests: `["python", "web development", "machine learning"]`
- Course tags: `["programming", "backend", "databases"]`
- Recommended course IDs: `["uuid-1", "uuid-2", "uuid-3"]`

**Why Not Normalized Tables?**

```sql
-- Traditional normalized approach (rejected)
CREATE TABLE user_interests (
    user_id UUID,
    interest VARCHAR,
    PRIMARY KEY (user_id, interest)
);
```

**Rejected Because**:
- ❌ Courses are read-only (no CRUD on tags)
- ❌ Interests change frequently (many INSERTs/DELETEs)
- ❌ Queries require joins: `JOIN user_interests ON ...`
- ❌ Source data already in JSON format

**JSON Approach Benefits**:
- ✅ Matches source data structure (`courses.json`)
- ✅ Single column, no joins needed
- ✅ PostgreSQL JSONB supports indexing and operators
- ✅ SQLite compatible (text-based JSON)
- ✅ Easy to add/remove interests (update array)

**Cross-Database Compatibility**:
```python
# Works with both SQLite and PostgreSQL
interests = Column(
    JSON().with_variant(JSONB, "postgresql"),
    nullable=False,
    default=list
)
```

---

## Analytics Capabilities

### User Journey Analysis

**Question**: "How do users progress through skill levels?"

```sql
SELECT
  s1.current_level as from_level,
  s2.current_level as to_level,
  COUNT(*) as user_count,
  AVG(s2.created_at - s1.created_at) as avg_time
FROM user_profile_snapshots s1
JOIN user_profile_snapshots s2
  ON s1.user_id = s2.user_id
  AND s2.version = s1.version + 1
WHERE s1.current_level != s2.current_level
GROUP BY s1.current_level, s2.current_level;
```

**Output**:
```
from_level    to_level       user_count  avg_time
beginner      intermediate   127         89 days
intermediate  advanced       43          156 days
```

---

### Interest Trend Analysis

**Question**: "Which topics are gaining popularity?"

```python
def analyze_interest_trends(db: Session, days: int = 30):
    """Find interests added most frequently in recent period."""
    cutoff = datetime.now() - timedelta(days=days)

    snapshots = db.query(UserProfileSnapshot)\
        .filter(UserProfileSnapshot.created_at >= cutoff)\
        .order_by(UserProfileSnapshot.user_id, UserProfileSnapshot.version)\
        .all()

    interest_additions = defaultdict(int)

    # Group by user, compare consecutive snapshots
    for user_id, user_snapshots in groupby(snapshots, key=lambda s: s.user_id):
        versions = sorted(user_snapshots, key=lambda s: s.version)
        for i in range(len(versions) - 1):
            old = set(versions[i].interests)
            new = set(versions[i+1].interests)
            added = new - old
            for interest in added:
                interest_additions[interest] += 1

    return sorted(interest_additions.items(), key=lambda x: -x[1])
```

**Output**:
```
[("Machine Learning", 347),
 ("Cloud Computing", 289),
 ("Data Science", 201),
 ("DevOps", 156)]
```

**Business Action**: Acquire or create courses for trending topics.

---

### Recommendation Quality Metrics

**Question**: "Which LLM model performs better?"

```sql
SELECT
  llm_model,
  AVG(user_rating) as avg_rating,
  COUNT(*) as total_recs,
  COUNT(user_rating) as rated_count,
  COUNT(user_rating)::float / COUNT(*) as feedback_rate
FROM recommendations
GROUP BY llm_model
ORDER BY avg_rating DESC;
```

**Output**:
```
llm_model          avg_rating  total_recs  rated_count  feedback_rate
gpt-4              4.3         1250        487          0.39
claude-3-sonnet    4.1         980         412          0.42
```

**Insight**: GPT-4 higher rated, Claude gets more feedback (better explanations?).

---

### Churn Prediction

**Question**: "Users who decreased time commitment - do they churn?"

```sql
-- Identify users with 50%+ time commitment decrease
WITH commitment_drops AS (
  SELECT
    s1.user_id,
    s1.time_commitment as old_hours,
    s2.time_commitment as new_hours,
    s2.created_at as change_date
  FROM user_profile_snapshots s1
  JOIN user_profile_snapshots s2
    ON s1.user_id = s2.user_id
    AND s2.version = s1.version + 1
  WHERE s2.time_commitment < s1.time_commitment * 0.5
)
SELECT
  cd.user_id,
  cd.change_date,
  MAX(u.updated_at) as last_activity,
  CASE
    WHEN MAX(u.updated_at) < cd.change_date + INTERVAL '30 days'
    THEN 'churned'
    ELSE 'active'
  END as status
FROM commitment_drops cd
JOIN users u ON cd.user_id = u.id
GROUP BY cd.user_id, cd.change_date;
```

**Business Action**: Email intervention for users with commitment drops.

---

## Product Use Cases

### 1. Personalization Feedback Loop

**Flow**:
1. User creates profile (version 1)
2. Gets recommendations based on v1
3. Recommendations don't match expectations
4. User updates interests (version 2)
5. Gets new recommendations based on v2
6. Rates them highly

**Data Captured**:
- Recommendation 1: `profile_version=1, user_rating=2`
- Recommendation 2: `profile_version=2, user_rating=5`

**Analysis**:
```sql
-- Do recommendations improve with profile refinement?
SELECT
  profile_version,
  AVG(user_rating) as avg_rating
FROM recommendations
WHERE user_rating IS NOT NULL
GROUP BY profile_version
ORDER BY profile_version;
```

**Expected Result**: Rating increases with version (personalization working).

---

### 2. Course Popularity Tracking

**Question**: "Which courses are recommended most often?"

```sql
SELECT
  c.title,
  c.difficulty,
  COUNT(*) as times_recommended,
  AVG(r.user_rating) as avg_rating
FROM recommendations r
CROSS JOIN LATERAL json_array_elements_text(r.recommended_course_ids::json) as course_id
JOIN courses c ON c.id = course_id::text
WHERE r.user_rating IS NOT NULL
GROUP BY c.id, c.title, c.difficulty
ORDER BY times_recommended DESC
LIMIT 10;
```

**Business Insight**: Popular courses → create similar content, expand topic coverage.

---

### 3. User Segmentation

**Example Segment**: "High-intent data science beginners"

```sql
SELECT u.email, p.created_at as signup_date
FROM users u
JOIN user_profiles p ON u.id = p.user_id
WHERE p.learning_goal ILIKE '%data science%'
  AND p.current_level = 'beginner'
  AND p.time_commitment >= 10
  AND p.created_at > NOW() - INTERVAL '30 days';
```

**Marketing Use Case**: Targeted email campaign with curated beginner DS courses.

---

## Implementation Strategy

### Phase 1: Core Tables (Day 1) ✅ COMPLETED

<!-- ✅ COMPLETED: 2025-11-22 -->

```python
# Models implemented
models/base.py           # Base, DifficultyLevel enum
models/course.py         # Course, Tag, Skill, CourseTag, CourseSkill

# Database setup
core/database.py         # PostgreSQL connection, init_db()
core/config.py           # Pydantic settings (DATABASE_URL from .env)

# Docker infrastructure
docker-compose.yml       # PostgreSQL 16 Alpine container
.env                     # Database credentials (gitignored)
.env.example             # Mock credentials template

# Auto-seeding
main.py                  # Lifespan event handler
scripts/seed_courses.py  # Load courses.json → extract tags/skills → seed DB

# Results
- 48 courses seeded
- 169 unique tags extracted
- 230 unique skills extracted
- Native UUID types (16 bytes vs 32-byte strings)
- Connection pooling configured
```

### Phase 2: User Authentication & Profiles (Day 2-3) ✅ COMPLETED
```python
# Models implemented
models/user.py                    # User (fastapi-users)
models/user_profile.py            # UserProfile, UserInterest
models/user_profile_snapshot.py   # UserProfileSnapshot

# Service/Repository layers
services/profile_service.py       # Profile business logic with snapshots
repositories/user_profile_repository.py  # Profile data access

# API routes
api/auth.py          # Registration, login, password reset
api/users.py         # User management
api/profiles.py      # Profile CRUD
api/courses.py       # Course browsing, tags, skills

# Results
- 4 new tables: users, user_profiles, user_profile_snapshots, user_interests
- JWT authentication with fastapi-users
- Profile versioning and snapshot system
- Layered architecture implemented
```

### Phase 4: AI Recommendations (Day 4-5)
```python
# Add model
models/recommendation.py  # Recommendation

# Service layer
services/recommendation_service.py  # LLM integration
```

### Phase 3: Analytics (Day 5 - Optional)
```python
# Dashboard queries
analytics/queries.py  # SQL queries for metrics
# OR: Simple notebook for ad-hoc analysis
notebooks/analytics.ipynb
```

---

## Data Flow Example

**User Journey Walkthrough**:

```
Day 1:
  - User registers → users table
  - Creates profile → user_profiles (v1) + user_profile_snapshots (v1)

Day 3:
  - Gets recommendations → recommendations (profile_version=1)

Day 7:
  - Updates interests (adds "cloud") →
      1. Snapshot v1 saved to user_profile_snapshots
      2. user_profiles updated to v2
  - Gets new recommendations → recommendations (profile_version=2)

Day 10:
  - Rates last recommendation 5 stars → recommendations.user_rating updated
```

**Database State After Day 10**:
- `users`: 1 row
- `user_profiles`: 1 row (version=2)
- `user_profile_snapshots`: 2 rows (v1, v2)
- `courses`: 50 rows
- `recommendations`: 2 rows

---

## Key Design Principles

### 1. Optimize for Reads
- Current state in `user_profiles` (no joins for app queries)
- Historical data in separate table (analytics workload isolated)

### 2. Preserve History
- Insert-only snapshots (never delete user data)
- Version linking (recommendations → profile state)

### 3. Flexible Schema
- JSON for variable-length arrays (interests, tags)
- Cross-database compatibility (SQLite → PostgreSQL)

### 4. Analytics-Ready
- Indexed for common queries (user_id, version, created_at)
- Temporal analysis enabled (user journey tracking)

### 5. Product-Driven
- Every field has business purpose
- Data enables specific product questions
- Balances MVP speed with future insights

---

## Conclusion

This schema demonstrates **product thinking through data design**:
- Not just "store user preferences" → **track learning journeys**
- Not just "save recommendations" → **measure and improve quality**
- Not just "current state" → **historical context for insights**

**Balance Achieved**:
- ✅ MVP requirements met (5 tables, straightforward implementation)
- ✅ Analytics capabilities built-in (temporal queries, metrics)
- ✅ Future-proof (supports ML, A/B testing, personalization)
- ✅ Implementable in 5-day timeline

The data model enables AcmeLearn to **learn from users** and **improve over time** - exactly what a real learning platform needs.
