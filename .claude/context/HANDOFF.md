# Frontend Development Handoff

## Overview

This document provides a summary for the ui-designer agent to begin implementing the AcmeLearn frontend. The backend is fully functional with authentication, course browsing, and profile management APIs. The frontend needs to be built from scratch using React + Vite + Tailwind CSS.

## Project Context

**AcmeLearn** is an AI-powered learning recommendation platform with:
- 48 courses in a curated catalog
- 169 tags organized by category
- 230 skills
- User profiles with learning goals, experience level, and interests

## Current State

### Backend (COMPLETED)
- FastAPI backend running at `http://localhost:8000`
- JWT authentication (1-hour token expiration)
- All core APIs implemented and tested
- Interactive API docs at `/docs`

### Frontend (NOT STARTED)
- Directory `frontend/` does not exist yet
- Comprehensive UI design system documented in `docs/UI_DESIGN_SYSTEM.md`
- Design context extracted to `.claude/context/design-context.json`

## Key Files to Reference

| File | Purpose |
|------|---------|
| `.claude/context/project-state.json` | Complete API documentation, data models, enums |
| `.claude/context/design-context.json` | Full design system specs, components, pages |
| `docs/UI_DESIGN_SYSTEM.md` | Source design document with wireframes |
| `docs/AUTHENTICATION.md` | Auth implementation details and curl examples |

## API Quick Reference

### Authentication
```
POST /auth/register          - Register new user
POST /auth/jwt/login         - Login (form data: username, password)
GET  /users/me               - Get current user (protected)
```

### Profiles
```
GET   /profiles/me           - Get learning profile (protected)
PATCH /profiles/me           - Update profile (protected)
```

### Courses
```
GET /api/courses             - List courses with filtering (protected)
GET /api/courses/{id}        - Get single course (protected)
GET /api/tags                - List all tags (protected)
GET /api/tag-categories      - Tags grouped by category (protected)
GET /api/skills              - List all skills (protected)
```

## Data Types

### Difficulty Levels (Enum)
- `beginner`
- `intermediate`
- `advanced`

### Time Commitment (Enum)
- `1-5` (1-5 hours/week)
- `5-10` (5-10 hours/week)
- `10-20` (10-20 hours/week)
- `20+` (20+ hours/week)

### Tag Categories (Enum)
- Programming, Data Science, DevOps, Business, Marketing, Design, Soft Skills, HR & Talent, Security, Sustainability, Other

## Technology Stack (Frontend)

| Category | Choice |
|----------|--------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (recommended) |
| Data Fetching | TanStack Query |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | Sonner |

## Pages to Implement

### Public (Unauthenticated)
1. **Landing** (`/`) - Hero, value proposition, CTAs
2. **Login** (`/login`) - Email/password form
3. **Register** (`/register`) - Registration form

### Protected (Authenticated)
4. **Dashboard** (`/dashboard`) - Personalized home
5. **Courses** (`/courses`) - Filterable course catalog
6. **Course Detail** (`/courses/:id`) - Full course info
7. **Recommendations** (`/recommendations`) - AI recommendations (UI only - API not implemented yet)
8. **Profile** (`/profile`) - View/edit learning profile
9. **Settings** (`/settings`) - Account settings

## Component Priorities

### Phase 1: Foundation
1. Design system components (Button, Input, Card, Badge)
2. Auth components (LoginForm, RegisterForm, ProtectedRoute)
3. Layout (Navbar, PageContainer)
4. Auth context

### Phase 2: Core Features
5. CourseCard, CourseGrid, CourseFilters
6. CourseDetail page
7. ProfileView, ProfileForm
8. InterestSelector (tag multi-select)

### Phase 3: AI Integration
9. RecommendationRequest component
10. AILoadingState animation
11. RecommendationCard

### Phase 4: Polish
12. Dashboard
13. Settings page
14. Skeletons and loading states
15. Empty states
16. Error handling

## Design Highlights

### Color Palette
- Primary: `#3B82F6` (blue-500)
- Success/Beginner: `#10B981` (emerald-500)
- Warning/Intermediate: `#F59E0B` (amber-500)
- Error/Advanced: `#EF4444` (red-500)

### Difficulty Badge Colors
| Level | Background | Text |
|-------|------------|------|
| Beginner | emerald-100 | emerald-700 |
| Intermediate | amber-100 | amber-700 |
| Advanced | red-100 | red-700 |

### Typography
- Font: Inter
- Body: 16px
- Headings: 20-48px

## Authentication Flow

1. User registers at `/register`
2. Empty profile auto-created (backend hook)
3. User logs in at `/login`
4. JWT token stored in localStorage
5. Token sent via `Authorization: Bearer {token}` header
6. Protected routes check auth context
7. 401 responses redirect to `/login`

## Key UX Considerations

1. **Profile is optional at registration** - Don't block users, let them fill profile later
2. **Tag selection is complex** - 169 tags need good UX (search, categories, popular tags)
3. **AI loading state matters** - Users wait 3-5 seconds, make it engaging
4. **Rate limiting** - 10 AI recommendations per day (show remaining count)
5. **Profile versioning** - Show version number, last updated timestamp

## Getting Started

```bash
# 1. Create frontend directory and initialize
mkdir frontend
cd frontend
npm create vite@latest . -- --template react-ts

# 2. Install dependencies
npm install
npm install tailwindcss postcss autoprefixer
npm install @tanstack/react-query react-router-dom axios
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react sonner

# 3. Initialize Tailwind
npx tailwindcss init -p

# 4. Add shadcn/ui (optional but recommended)
npx shadcn-ui@latest init

# 5. Start development server
npm run dev
```

## Environment Variables

Create `.env` in frontend:
```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=AcmeLearn
```

## Notes for Implementation

1. **Always check auth** - Most endpoints require authentication
2. **Use correct content types** - Login uses `application/x-www-form-urlencoded`, not JSON
3. **Handle 401s globally** - Axios interceptor should redirect to login
4. **Profile interests use tag IDs** - Send `interest_tag_ids` array of UUIDs
5. **Filters update URL** - Course catalog filters should be shareable via URL params
6. **Mobile-first** - Design system specifies responsive breakpoints

## Questions to Clarify

Before starting implementation, consider asking the user:

1. Should we implement dark mode?
2. What level of animation/polish is expected?
3. Should the landing page have more marketing content or stay minimal?
4. Are there any specific accessibility requirements beyond WCAG 2.1 AA?

---

**Generated by**: workflow-orchestrator agent
**Date**: 2025-11-25
**Context Files**: `project-state.json`, `design-context.json`
