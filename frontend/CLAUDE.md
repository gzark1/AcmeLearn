# Frontend - React + TypeScript + Vite

## Architecture Overview

**Feature-based architecture** following bulletproof-react patterns:
- Feature folders contain all related code (components, API, types, hooks)
- Shared UI components in `components/ui/`
- Layouts in `layouts/`
- Routes in `app/routes/`
- TanStack Query for data fetching and caching

## Frontend Development Workflow

**IMPORTANT - Standard workflow for frontend development**:

1. **UI Designer** updates `docs/UI_DESIGN_SYSTEM.md` with visual specs
2. **React Specialist** reads UI_DESIGN_SYSTEM.md and updates `docs/FRONTEND_ARCHITECTURE.md`
3. **Implementation** follows FRONTEND_ARCHITECTURE.md

This is the standard flow: **create/update doc first, then implement based on doc**.

## File Structure

```
frontend/src/
├── main.tsx                # React entry point
├── app/
│   ├── index.tsx           # App component with providers
│   ├── provider.tsx        # React Query provider
│   ├── router.tsx          # React Router setup
│   └── routes/             # Route components
│       ├── landing.tsx     # Landing page
│       ├── not-found.tsx   # 404 page
│       ├── auth/           # Auth routes (login, register)
│       ├── app/            # Authenticated routes (courses, profile, etc.)
│       └── admin/          # Admin routes (dashboard, users, analytics)
│
├── features/               # Feature modules
│   ├── auth/
│   │   ├── api/            # login.ts, register.ts, get-user.ts, change-password.ts
│   │   ├── components/     # LoginForm, RegisterForm
│   │   └── types/          # Auth types
│   │
│   ├── courses/
│   │   ├── api/            # get-courses.ts, get-course.ts, get-tags.ts
│   │   ├── components/     # CourseCard, CourseGrid, CourseFilters, DifficultyBadge, etc.
│   │   └── types/          # Course types
│   │
│   ├── profile/
│   │   ├── api/            # get-profile.ts, update-profile.ts, get-profile-history.ts
│   │   ├── components/     # ProfileForm, ProfileView, ProfileHistoryTimeline
│   │   └── types/          # Profile types
│   │
│   ├── recommendations/
│   │   ├── api/            # generate-recommendations.ts, get-quota.ts, get-recommendations.ts
│   │   ├── components/     # RecommendationChat, RecommendationHistory, RecommendationCard, etc.
│   │   ├── context/        # RecommendationsProvider (session persistence)
│   │   └── types/          # Recommendation types, ChatMessage, ExpandedState
│   │
│   └── admin/
│       ├── api/            # get-analytics.ts, get-users.ts, etc.
│       ├── components/     # UserTable, AnalyticsCharts, etc.
│       └── types/          # Admin types
│
├── components/             # Shared UI components
│   ├── ui/                 # Base UI components
│   │   ├── button/         # Button component
│   │   ├── input/          # Input, PasswordInput, Textarea
│   │   ├── form/           # Form, FieldWrapper
│   │   ├── card/           # Card component
│   │   ├── badge/          # Badge component
│   │   ├── modal/          # Modal, ConfirmationModal
│   │   ├── dropdown/       # Dropdown component
│   │   ├── toast/          # Toast, Toaster
│   │   ├── skeleton/       # Skeleton loading
│   │   ├── link/           # Link component
│   │   ├── table/          # Table component
│   │   └── tooltip/        # Tooltip component
│   │
│   └── errors/             # Error components
│       └── main-error-fallback.tsx
│
├── layouts/                # Layout components
│   ├── main-layout.tsx     # Main authenticated layout
│   ├── auth-layout.tsx     # Auth pages layout
│   ├── admin-layout.tsx    # Admin pages layout
│   ├── navbar.tsx          # Navigation bar
│   ├── footer.tsx          # Footer
│   ├── user-menu.tsx       # User dropdown menu
│   └── mobile-nav.tsx      # Mobile navigation
│
├── lib/                    # Library configurations
│   ├── api-client.ts       # Axios client with auth interceptors
│   ├── auth.tsx            # Auth context and hooks
│   └── react-query.ts      # React Query configuration
│
├── stores/                 # State management
│   └── notifications.ts    # Toast notifications
│
├── utils/                  # Utility functions
│   ├── storage.ts          # localStorage helpers
│   ├── cn.ts               # classNames utility
│   └── format.ts           # Formatting utilities
│
└── config/                 # Configuration
    ├── env.ts              # Environment variables
    └── paths.ts            # Route paths constants
```

## Current Features

**Auth**:
- Login/Register forms with validation
- JWT token management in localStorage
- Protected routes with auth context
- Password change functionality

**Dashboard**:
- Welcome message with user email
- Profile completion progress bar (0-100%)
- Stats cards: Courses Available, Profile Version, Interests Selected
- Quick Actions: Browse Courses, Edit Profile, Get Recommendations

**Courses**:
- Course catalog with search, filtering (difficulty, tags, duration), sorting
- Course detail view with skills, tags, and description
- Responsive course grid (1-4 columns based on screen size)
- Course cards with difficulty badges and tag pills

**Profile**:
- Profile view with learning goal, experience level, time commitment, interests
- Profile edit form with tag browser modal
- Profile version history with "View History" link
- Interest selector with tag categories

**Recommendations**:
- AI-powered course recommendations with natural language queries
- Profile-based recommendations (no query needed)
- Collapsible history sidebar showing past recommendations from database
- Session persistence via React context (chat state survives navigation)
- Profile analysis summary with skill level and skill gaps
- Learning path with ordered course sequence
- Recommendation cards with match scores, explanations, and skill gaps addressed
- Rate limit indicator (10 recommendations per 24 hours)
- Loading states with progressive messages (takes 1-2 minutes)

**Admin** (for superusers):
- **Dashboard**: Stats cards (Total Users, Profiles Complete, Avg Profile Updates, AI Recs Today, Signups This Week, Active Users), Quick Insights panel, Recent Activity feed
- **User Management**: Search by email, status/profile filters, user table with Level column and profile completeness dots (5-dot visualization), Export CSV, user detail with profile history modal, deactivate user functionality
- **Analytics**: User Growth chart (30 days), Profile Completion Breakdown (stacked bar), Experience Level distribution, Time Commitment distribution, Popular Tags by Category, Category Interest Distribution, Course Catalog Summary (difficulty distribution, total hours, avg hours)

## API Integration

**API Client** (`lib/api-client.ts`):
- Axios client with base URL from env
- Request interceptor: adds JWT token from localStorage
- Response interceptor: handles 401 errors (redirect to login)

**React Query Patterns**:
- Queries: `useQuery` for data fetching with automatic caching
- Mutations: `useMutation` for data updates with optimistic updates
- Query invalidation on successful mutations

Example:
```typescript
// In features/courses/api/get-courses.ts
export const useCourses = (filters) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => api.get('/api/courses', { params: filters }),
  });
};
```

## UI Component Library

All components in `components/ui/` follow consistent patterns:
- TypeScript with strict typing
- Tailwind CSS for styling
- Composable and accessible
- Barrel exports via index.ts

See `docs/UI_DESIGN_SYSTEM.md` for:
- Color palette (Indigo primary, custom grays)
- Typography scale
- Spacing system
- Component variants
- Accessibility guidelines

## Architecture Documentation

See `docs/FRONTEND_ARCHITECTURE.md` for:
- Feature module structure
- Component organization
- State management patterns
- Routing strategies
- Type safety patterns

See `docs/bulletproof-react-master/` for:
- **READ-ONLY** reference architecture
- Project structure patterns
- Best practices
- Testing strategies
