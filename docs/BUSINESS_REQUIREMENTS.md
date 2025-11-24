# AcmeLearn - Business Requirements & Access Control Rules

## 1. Public Access (Unauthenticated Users)

### Allowed
- ✅ View landing page with high-level info ("50 courses available")
- ✅ Register (email + password + profile fields, some can be blank)
- ✅ Login

### Denied
- ❌ Browse course catalog
- ❌ View tags/skills list
- ❌ View any course details
- ❌ Access any user data
- ❌ Get AI recommendations

### Redirect Behavior
Any attempt to access protected resources → redirect to home/landing page prompting register/login

---

## 2. Authenticated Users (Logged In)

### Course Catalog Access
- ✅ Browse all courses (with filters)
- ✅ View any course details
- ✅ View all tags
- ✅ View all skills
- ❌ Cannot modify courses (read-only catalog)

### Own Account Access (User X accessing their own data)
- ✅ View own user record (email, created_at, etc.)
- ✅ Update own user fields (only fields that make sense - NOT email for now, NOT password_hash directly)
- ✅ Change own password (with old password verification)
- ✅ Soft delete own account (marks as inactive via `is_active: bool`, data retained)
- ❌ Cannot hard delete account
- ❌ Cannot change email (future feature)

### Own Profile Access
- ✅ View own profile (learning_goal, current_level, time_commitment, interests)
- ✅ Create profile at registration (with user creation, some fields optional)
- ✅ Update own profile (triggers automatic snapshot creation)
- ✅ Soft delete profile (cascades from user soft delete)
- ❌ Cannot view profile snapshots via API (internal only for now)

### Profile Snapshots (System-managed)
- ✅ System automatically creates snapshot on every profile update
- ❌ Users cannot view snapshots (not exposed in API yet)
- ❌ Users cannot delete snapshots (permanent history)
- ❌ Users cannot manually create snapshots

### AI Recommendations Access
- ✅ Request AI recommendations (even with empty profile)
- ✅ View own recommendation history
- ✅ Re-run same query (calls AI again, not cached)
- ❌ Cannot delete recommendation history (permanent)
- ❌ Rate limited: **10 recommendations per user per 24 hours**

### Other Users' Data
- ❌ Cannot view other users' emails, profiles, recommendations
- ❌ No public profile information
- ❌ **100% privacy** - all user data is private

---

## 3. System/Internal Operations

### Automatic Operations
- ✅ Create UserProfileSnapshot on every UserProfile update
- ✅ Seed courses from courses.json (one-time on init)
- ✅ Enforce rate limits on AI recommendations

### Not Implemented (Future Features)
- ❌ Admin role (no special permissions yet)
- ❌ Email verification on signup
- ❌ Forgot password flow
- ❌ Email change functionality
- ❌ Aggregate analytics (e.g., popular courses)
- ❌ Registration rate limiting
- ❌ Exposing snapshots via API

---

## 4. Key Implementation Details

### Registration Flow
1. User submits: email, password, profile fields (learning_goal, current_level, time_commitment, interests)
2. Profile fields are **optional** (can be blank)
3. System creates **both** User and UserProfile records atomically
4. User can immediately login and browse courses
5. **No email verification** (for now)

### Soft Delete Strategy
- User has `is_active: bool` field (default: `True`)
- Soft deleted users (`is_active = False`):
  - Cannot login
  - Data retained in database
  - Profile/recommendations preserved
- **No hard delete** (permanent data retention)

### Profile Snapshot Trigger
- **Every** UserProfile UPDATE operation → create snapshot before update
- Snapshot stores: full profile state at that moment
- Snapshots are **internal only** (not exposed in API)
- Users cannot delete snapshots (audit trail)

### Rate Limiting - AI Recommendations
- **Limit**: 10 recommendations per user per 24 hours
- **Enforcement**: Check count of user's recommendations created in last 24h before AI call
- **Error**: Return 429 Too Many Requests if limit exceeded
- **Rationale**: Control OpenAI API costs

### Recommendation Re-runs
- Same query asked twice → **always call AI again** (no caching)
- Allows users to get updated recommendations as catalog or profile changes
- Each call creates new recommendation record

### Password Management
- ✅ Users can change password
- ✅ Requires old password verification before changing
- ❌ No "forgot password" flow (for now)

---

## 5. Access Control Matrix

| Resource | Unauthenticated | Own Data | Other User's Data |
|----------|----------------|----------|-------------------|
| **Courses** | ❌ Denied | ✅ Read All | ✅ Read All |
| **Tags/Skills** | ❌ Denied | ✅ Read All | ✅ Read All |
| **User Account** | ❌ Denied | ✅ Read, Update, Soft Delete, Change Password | ❌ Denied |
| **User Profile** | ❌ Denied | ✅ Read, Update (creates snapshot) | ❌ Denied |
| **Profile Snapshots** | ❌ Denied | ❌ Not exposed | ❌ Denied |
| **Recommendations** | ❌ Denied | ✅ Create (10/24h limit), Read | ❌ Denied |
| **Landing Page** | ✅ Read | ✅ Read | ✅ Read |

---

## 6. MVP Scope (What We're Building)

### In Scope
- ✅ Registration with optional profile fields
- ✅ Login with JWT tokens
- ✅ Auth-protected Course API
- ✅ User/Profile CRUD (own data only)
- ✅ Automatic profile snapshots (internal)
- ✅ AI recommendations with rate limiting (10/24h)
- ✅ Soft delete for users (`is_active` field)
- ✅ Password change with old password verification

### Out of Scope (Future)
- ❌ Email verification
- ❌ Forgot password
- ❌ Email change
- ❌ Admin role
- ❌ Exposing snapshots via API
- ❌ Aggregate analytics
- ❌ Registration rate limiting
- ❌ Hard delete

---

## 7. Database Schema Requirements

### users table
- `id`: UUID (primary key)
- `email`: String (unique, indexed)
- `password_hash`: String
- `is_active`: Boolean (default: True) - for soft delete
- `created_at`: DateTime
- `updated_at`: DateTime

### user_profiles table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to users, unique, cascade delete)
- `learning_goal`: Text (optional)
- `current_level`: DifficultyLevel enum (optional)
- `time_commitment`: Integer (optional, hours per week)
- `interests`: Many-to-many with tags
- `created_at`: DateTime
- `updated_at`: DateTime

### user_profile_snapshots table
- `id`: UUID (primary key)
- `user_profile_id`: UUID (foreign key to user_profiles)
- `learning_goal`: Text (snapshot of value)
- `current_level`: DifficultyLevel enum (snapshot)
- `time_commitment`: Integer (snapshot)
- `interests_snapshot`: JSONB (snapshot of tag relationships)
- `created_at`: DateTime (when snapshot was taken)

### recommendations table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to users)
- `query`: Text (user's question/request)
- `recommended_course_ids`: JSONB (array of course UUIDs)
- `explanation`: Text (AI reasoning)
- `created_at`: DateTime (for rate limiting check)

---

## 8. API Functionality Requirements

**Note**: We will use `fastapi-users` for authentication/user management, so exact endpoint paths will follow that library's conventions. The functionality requirements are:

### Public (Unauthenticated)
- Register with email + password + profile fields
- Login and receive JWT token
- Access landing page

### Protected (Authenticated)
- List/filter courses
- View course details
- List all tags
- List all skills
- View own user info
- Update own user (limited fields)
- Soft delete own account
- Change password (with old password verification)
- View own profile
- Update own profile (triggers snapshot creation)
- Request AI recommendations (rate limited: 10/24h)
- View own recommendation history

---

## 9. Security & Privacy Principles

1. **Privacy First**: All user data (profiles, recommendations) is 100% private
2. **No Cross-User Access**: Users can only access their own data
3. **Soft Delete Only**: User data is never permanently deleted (audit trail)
4. **Rate Limiting**: AI recommendations limited to control costs
5. **Password Security**: Bcrypt hashing, old password required for changes
6. **JWT Authentication**: Stateless token-based auth
7. **Course Catalog Protection**: Only authenticated users can browse courses
8. **Automatic Audit Trail**: Profile snapshots track all changes
