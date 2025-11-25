# AcmeLearn Frontend Architecture

## Document Overview

This document provides the architectural blueprint for the AcmeLearn React frontend. It serves as both a specification and implementation guide, based on bulletproof-react patterns adapted for AcmeLearn's specific needs.

**Related Documentation**:
- `docs/UI_DESIGN_SYSTEM.md` - Visual design system, component specifications, page layouts
- `docs/ARCHITECTURE.md` - Backend API structure
- `docs/AUTHENTICATION.md` - Authentication implementation details

**Last Updated**: 2025-11-25

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Application Layer](#4-application-layer)
5. [State Management](#5-state-management)
6. [API Layer](#6-api-layer)
7. [Component Architecture](#7-component-architecture)
8. [Routing Strategy](#8-routing-strategy)
9. [Error Handling](#9-error-handling)
10. [Testing Strategy](#10-testing-strategy)
11. [Performance Considerations](#11-performance-considerations)
12. [Security](#12-security)
13. [Project Standards](#13-project-standards)
14. [Implementation Checklist](#14-implementation-checklist)

---

## 1. Architecture Overview

### 1.1 Core Principles

AcmeLearn's frontend architecture follows these guiding principles, adapted from bulletproof-react:

1. **Feature-Based Organization**: Code is organized by feature (courses, recommendations, admin) rather than by type (components, hooks, services). This keeps related code together and makes the codebase easier to navigate.

2. **Unidirectional Data Flow**: Data flows in one direction: `shared -> features -> app`. Features cannot import from each other; they are composed at the application level.

3. **Server State vs. Client State**: Clear separation between server-cached data (TanStack Query) and client-only state (React Context/local state).

4. **Colocation**: Keep things close to where they're used. A hook used only by one feature lives in that feature's folder, not in a global hooks folder.

5. **Type Safety**: TypeScript everywhere, with strict typing for API responses and component props.

6. **Accessibility First**: WCAG 2.1 AA compliance built in from the start, not bolted on later.

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           App Entry Point                           │
│                          (main.tsx, App.tsx)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      App Provider Layer                        │  │
│  │  (QueryClientProvider, AuthLoader, ErrorBoundary, Toasts)      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                 │                                   │
│  ┌──────────────────────────────┴────────────────────────────────┐  │
│  │                         Router Layer                           │  │
│  │  (React Router v7 with lazy loading, route guards)             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                 │                                   │
│  ┌──────────────────────────────┴────────────────────────────────┐  │
│  │                        Routes/Pages                            │  │
│  │  (Landing, Login, Dashboard, Courses, Recommendations, etc.)   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                 │                                   │
│         ┌───────────────────────┼───────────────────────┐          │
│         │                       │                       │          │
│  ┌──────┴──────┐    ┌───────────┴────────┐    ┌────────┴───────┐  │
│  │  Features   │    │   Shared Components │    │    Libraries   │  │
│  │             │    │                     │    │                │  │
│  │ - auth      │    │ - ui/Button         │    │ - api-client   │  │
│  │ - courses   │    │ - ui/Input          │    │ - auth         │  │
│  │ - profile   │    │ - ui/Modal          │    │ - react-query  │  │
│  │ - recommend │    │ - layouts           │    │                │  │
│  │ - admin     │    │                     │    │                │  │
│  └─────────────┘    └─────────────────────┘    └────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      FastAPI Backend      │
                    │  (REST API on :8000)      │
                    └───────────────────────────┘
```

### 1.3 Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Meta Framework | Vite (no Next.js) | Simple SPA, no SSR needed, faster dev experience |
| Styling | Tailwind CSS + Headless UI | Matches design system, utility-first, accessible |
| State Management | TanStack Query + React Context | Server state separation, caching, minimal client state |
| Routing | React Router v7 | Industry standard, code splitting, data loading |
| Forms | React Hook Form + Zod | Type-safe validation, minimal re-renders |
| HTTP Client | Axios | Interceptors, request/response transforms |
| Testing | Vitest + Testing Library + Playwright | Modern, fast, behavior-focused |

---

## 2. Technology Stack

### 2.1 Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router": "^7.0.0",
    "@tanstack/react-query": "^5.59.0",
    "@tanstack/react-query-devtools": "^5.59.0",
    "axios": "^1.7.7",
    "zod": "^3.23.8",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "react-error-boundary": "^4.0.13",
    "react-helmet-async": "^2.0.5",
    "@headlessui/react": "^2.1.8",
    "@heroicons/react": "^2.1.5",
    "js-cookie": "^3.0.5",
    "date-fns": "^3.6.0",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react-swc": "^3.7.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.8",
    "tailwindcss": "^3.4.13",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",
    "@types/react": "^18.3.10",
    "@types/react-dom": "^18.3.0",
    "@types/js-cookie": "^3.0.6",
    "vitest": "^2.1.1",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/user-event": "^14.5.2",
    "msw": "^2.4.9",
    "@playwright/test": "^1.47.2",
    "eslint": "^8.57.1",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-import": "^2.30.0",
    "eslint-plugin-check-file": "^2.8.0",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.6",
    "husky": "^9.1.6",
    "lint-staged": "^15.2.10"
  }
}
```

### 2.2 Why These Choices?

**TanStack Query over Redux**:
- AcmeLearn's state is 90% server state (courses, profile, recommendations)
- Built-in caching, background refetching, optimistic updates
- Dramatically less boilerplate than Redux
- DevTools for debugging cache state

**React Router v7 over TanStack Router**:
- More mature ecosystem, better documentation
- Familiar to most React developers
- Route loaders for data fetching at route level
- Easy lazy loading with code splitting

**Tailwind CSS + Headless UI**:
- Design system already defined in Tailwind tokens
- Headless UI provides accessible primitives (Dialog, Menu, Listbox)
- No runtime CSS-in-JS overhead
- Excellent VS Code integration

**Zustand for Client State**:
- Simpler than Redux, more powerful than Context
- Used only for truly global client state (notifications, UI preferences)
- Minimal boilerplate, TypeScript-first

**Zod for Validation**:
- Runtime type checking for API responses
- Form validation that matches backend expectations
- TypeScript inference from schemas

---

## 3. Project Structure

### 3.1 Complete Directory Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── app/                           # Application layer
│   │   ├── routes/                    # Route components (pages)
│   │   │   ├── landing.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   └── register.tsx
│   │   │   ├── app/                   # Protected routes
│   │   │   │   ├── root.tsx           # Layout wrapper
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── courses/
│   │   │   │   │   ├── courses.tsx
│   │   │   │   │   └── course-detail.tsx
│   │   │   │   ├── recommendations.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   ├── profile.tsx
│   │   │   │   │   └── profile-history.tsx
│   │   │   │   └── settings.tsx
│   │   │   └── admin/                 # Admin routes (superuser only)
│   │   │       ├── root.tsx           # Admin layout wrapper
│   │   │       ├── dashboard.tsx
│   │   │       ├── users/
│   │   │       │   ├── users.tsx
│   │   │       │   └── user-detail.tsx
│   │   │       └── analytics.tsx
│   │   ├── router.tsx                 # Route configuration
│   │   ├── provider.tsx               # App providers (Query, Auth, etc.)
│   │   └── index.tsx                  # App entry component
│   │
│   ├── features/                      # Feature-based modules
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── login.ts
│   │   │   │   ├── register.ts
│   │   │   │   └── get-user.ts
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── register-form.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   ├── courses/
│   │   │   ├── api/
│   │   │   │   ├── get-courses.ts
│   │   │   │   ├── get-course.ts
│   │   │   │   ├── get-tags.ts
│   │   │   │   └── get-skills.ts
│   │   │   ├── components/
│   │   │   │   ├── course-card.tsx
│   │   │   │   ├── course-grid.tsx
│   │   │   │   ├── course-filters.tsx
│   │   │   │   ├── course-detail.tsx
│   │   │   │   ├── difficulty-badge.tsx
│   │   │   │   ├── tag-badge.tsx
│   │   │   │   └── course-skeleton.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── api/
│   │   │   │   ├── get-profile.ts
│   │   │   │   ├── update-profile.ts
│   │   │   │   └── get-profile-history.ts
│   │   │   ├── components/
│   │   │   │   ├── profile-form.tsx
│   │   │   │   ├── profile-view.tsx
│   │   │   │   ├── interest-selector.tsx
│   │   │   │   ├── tag-browser-modal.tsx
│   │   │   │   ├── level-selector.tsx
│   │   │   │   ├── time-commitment-slider.tsx
│   │   │   │   └── profile-history-timeline.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   ├── recommendations/
│   │   │   ├── api/
│   │   │   │   ├── generate-recommendations.ts
│   │   │   │   └── get-quota.ts
│   │   │   ├── components/
│   │   │   │   ├── recommendation-form.tsx
│   │   │   │   ├── recommendation-card.tsx
│   │   │   │   ├── recommendation-list.tsx
│   │   │   │   ├── ai-loading-state.tsx
│   │   │   │   └── rate-limit-indicator.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   └── admin/
│   │       ├── api/
│   │       │   ├── get-users.ts
│   │       │   ├── get-user-detail.ts
│   │       │   ├── get-user-profile-history.ts
│   │       │   ├── deactivate-user.ts
│   │       │   ├── get-analytics-overview.ts
│   │       │   └── get-popular-tags.ts
│   │       ├── components/
│   │       │   ├── admin-sidebar.tsx
│   │       │   ├── stats-card.tsx
│   │       │   ├── user-table.tsx
│   │       │   ├── user-table-row.tsx
│   │       │   ├── search-and-filters.tsx
│   │       │   ├── status-badge.tsx
│   │       │   ├── profile-completeness.tsx
│   │       │   ├── profile-history-modal.tsx
│   │       │   ├── popular-tags-chart.tsx
│   │       │   ├── category-breakdown.tsx
│   │       │   └── deactivate-user-modal.tsx
│   │       └── types/
│   │           └── index.ts
│   │
│   ├── components/                    # Shared components
│   │   ├── ui/                        # Design system primitives
│   │   │   ├── button/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── button.stories.tsx (optional)
│   │   │   │   └── index.ts
│   │   │   ├── input/
│   │   │   │   ├── input.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── password-input.tsx
│   │   │   │   └── index.ts
│   │   │   ├── form/
│   │   │   │   ├── form.tsx
│   │   │   │   ├── field-wrapper.tsx
│   │   │   │   └── index.ts
│   │   │   ├── modal/
│   │   │   │   ├── modal.tsx
│   │   │   │   ├── confirmation-modal.tsx
│   │   │   │   └── index.ts
│   │   │   ├── card/
│   │   │   │   ├── card.tsx
│   │   │   │   └── index.ts
│   │   │   ├── badge/
│   │   │   │   ├── badge.tsx
│   │   │   │   └── index.ts
│   │   │   ├── spinner/
│   │   │   │   ├── spinner.tsx
│   │   │   │   └── index.ts
│   │   │   ├── dropdown/
│   │   │   │   ├── dropdown.tsx
│   │   │   │   └── index.ts
│   │   │   ├── table/
│   │   │   │   ├── table.tsx
│   │   │   │   └── index.ts
│   │   │   ├── toast/
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── toaster.tsx
│   │   │   │   ├── toast-store.ts
│   │   │   │   └── index.ts
│   │   │   ├── skeleton/
│   │   │   │   ├── skeleton.tsx
│   │   │   │   └── index.ts
│   │   │   └── link/
│   │   │       ├── link.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── layouts/
│   │   │   ├── main-layout.tsx        # Navbar + content for authenticated users
│   │   │   ├── auth-layout.tsx        # Centered layout for auth pages
│   │   │   ├── admin-layout.tsx       # Sidebar + content for admin
│   │   │   ├── navbar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── user-menu.tsx
│   │   │   ├── footer.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── errors/
│   │   │   ├── main-error-fallback.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── seo/
│   │       ├── head.tsx
│   │       └── index.ts
│   │
│   ├── lib/                           # Preconfigured libraries
│   │   ├── api-client.ts              # Axios instance with interceptors
│   │   ├── react-query.ts             # Query client config, types
│   │   ├── auth.tsx                   # Auth context, hooks, guards
│   │   └── authorization.tsx          # RBAC helpers
│   │
│   ├── config/                        # Configuration
│   │   ├── env.ts                     # Environment variables
│   │   └── paths.ts                   # Route paths
│   │
│   ├── hooks/                         # Shared hooks
│   │   ├── use-disclosure.ts
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   │
│   ├── stores/                        # Global client state (Zustand)
│   │   └── notifications.ts
│   │
│   ├── types/                         # Shared types
│   │   └── api.ts                     # Common API types (Meta, etc.)
│   │
│   ├── utils/                         # Utility functions
│   │   ├── cn.ts                      # Class name merge utility
│   │   ├── format.ts                  # Date, number formatters
│   │   └── storage.ts                 # LocalStorage helpers
│   │
│   ├── testing/                       # Test utilities
│   │   ├── mocks/
│   │   │   ├── handlers/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── courses.ts
│   │   │   │   ├── profile.ts
│   │   │   │   └── index.ts
│   │   │   ├── db.ts                  # Mock database
│   │   │   ├── browser.ts             # MSW browser setup
│   │   │   └── server.ts              # MSW server setup
│   │   ├── data-generators.ts         # Factory functions
│   │   ├── setup-tests.ts
│   │   └── test-utils.tsx             # Custom render with providers
│   │
│   ├── styles/
│   │   └── globals.css                # Tailwind imports, custom styles
│   │
│   ├── main.tsx                       # Application entry point
│   └── vite-env.d.ts
│
├── e2e/                               # E2E tests (Playwright)
│   ├── tests/
│   │   ├── auth.spec.ts
│   │   ├── courses.spec.ts
│   │   └── profile.spec.ts
│   └── playwright.config.ts
│
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### 3.2 Structure Rationale

**Why Feature-Based Organization?**

Instead of grouping by type (all components together, all hooks together), we group by feature. Benefits:

1. **Locality**: Everything related to "courses" is in one folder
2. **Scalability**: Adding a new feature doesn't pollute shared folders
3. **Team Collaboration**: Teams can own features without conflicts
4. **Deletion**: Removing a feature means deleting one folder
5. **Understanding**: New developers can understand one feature at a time

**Feature Folder Structure**

Each feature follows a consistent internal structure:

```
features/courses/
├── api/              # API declarations (fetchers + hooks)
├── components/       # Feature-specific components
├── types/            # TypeScript types for this feature
├── hooks/            # Feature-specific hooks (if needed beyond api/)
├── utils/            # Feature-specific utilities (if needed)
└── stores/           # Feature-specific stores (rarely needed)
```

**Not Every Feature Needs Every Folder**: Only include folders that have content.

---

## 4. Application Layer

### 4.1 App Provider

The `AppProvider` wraps the entire application with necessary providers:

```typescript
// src/app/provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { MainErrorFallback } from '@/components/errors/main-error-fallback';
import { Toaster } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { AuthLoader } from '@/lib/auth';
import { queryConfig } from '@/lib/react-query';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = React.useState(
    () => new QueryClient({ defaultOptions: queryConfig })
  );

  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="xl" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            {import.meta.env.DEV && <ReactQueryDevtools />}
            <Toaster />
            <AuthLoader
              renderLoading={() => (
                <div className="flex h-screen w-screen items-center justify-center">
                  <Spinner size="xl" />
                </div>
              )}
            >
              {children}
            </AuthLoader>
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
```

**Provider Order** (from outermost to innermost):
1. `Suspense` - Handles lazy loading fallback
2. `ErrorBoundary` - Catches unhandled errors
3. `HelmetProvider` - SEO/meta tags
4. `QueryClientProvider` - Server state
5. `Toaster` - Notification system
6. `AuthLoader` - Loads and validates user session

### 4.2 App Entry

```typescript
// src/app/index.tsx
import { AppProvider } from './provider';
import { AppRouter } from './router';

export const App = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};
```

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 5. State Management

### 5.1 State Categories

AcmeLearn has four categories of state:

| Category | Examples | Solution |
|----------|----------|----------|
| **Server State** | Courses, Profile, Tags, Admin data | TanStack Query |
| **Application State** | Toast notifications, UI preferences | Zustand |
| **Form State** | Login form, Profile form | React Hook Form |
| **URL State** | Course filters, pagination | React Router |

### 5.2 Server State (TanStack Query)

Server state is data that exists on the server and is synchronized with the client.

**Query Configuration**:

```typescript
// src/lib/react-query.ts
import { DefaultOptions, UseMutationOptions } from '@tanstack/react-query';

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  },
} satisfies DefaultOptions;

// Type helpers for consistent typing
export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>;

export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;
```

**Query Example (Fetching Courses)**:

```typescript
// src/features/courses/api/get-courses.ts
import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Course } from '../types';

export type CoursesFilters = {
  difficulty?: string;
  tag_ids?: string[];
  search?: string;
  skip?: number;
  limit?: number;
};

export type CoursesResponse = {
  courses: Course[];
  total: number;
};

export const getCourses = (filters: CoursesFilters = {}): Promise<CoursesResponse> => {
  return api.get('/api/v1/courses', { params: filters });
};

export const getCoursesQueryOptions = (filters: CoursesFilters = {}) => {
  return queryOptions({
    queryKey: ['courses', filters],
    queryFn: () => getCourses(filters),
  });
};

type UseCoursesOptions = {
  filters?: CoursesFilters;
  queryConfig?: QueryConfig<typeof getCoursesQueryOptions>;
};

export const useCourses = ({ filters = {}, queryConfig }: UseCoursesOptions = {}) => {
  return useQuery({
    ...getCoursesQueryOptions(filters),
    ...queryConfig,
  });
};
```

**Mutation Example (Updating Profile)**:

```typescript
// src/features/profile/api/update-profile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getProfileQueryOptions } from './get-profile';

export const updateProfileInputSchema = z.object({
  learning_goal: z.string().optional(),
  current_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  time_commitment: z.number().min(1).max(168).optional(),
  interest_tag_ids: z.array(z.string()).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const updateProfile = (data: UpdateProfileInput): Promise<void> => {
  return api.patch('/api/v1/profiles/me', data);
};

type UseUpdateProfileOptions = {
  mutationConfig?: MutationConfig<typeof updateProfile>;
};

export const useUpdateProfile = ({ mutationConfig }: UseUpdateProfileOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getProfileQueryOptions().queryKey });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateProfile,
  });
};
```

### 5.3 Application State (Zustand)

For truly global client state like notifications:

```typescript
// src/stores/notifications.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
};

type NotificationsStore = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
};

export const useNotifications = create<NotificationsStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: nanoid(), ...notification },
      ],
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
```

### 5.4 Form State (React Hook Form)

Forms use React Hook Form with Zod validation:

```typescript
// src/features/auth/components/login-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FieldWrapper } from '@/components/ui/form';
import { useLogin } from '../api/login';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values);
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldWrapper label="Email" error={form.formState.errors.email}>
        <Input
          type="email"
          {...form.register('email')}
          error={!!form.formState.errors.email}
        />
      </FieldWrapper>

      <FieldWrapper label="Password" error={form.formState.errors.password}>
        <Input
          type="password"
          {...form.register('password')}
          error={!!form.formState.errors.password}
        />
      </FieldWrapper>

      <Button type="submit" isLoading={login.isPending}>
        Sign In
      </Button>
    </Form>
  );
};
```

### 5.5 URL State (React Router)

Filter state lives in the URL for shareability:

```typescript
// src/app/routes/app/courses/courses.tsx
import { useSearchParams } from 'react-router';

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    difficulty: searchParams.get('difficulty') || undefined,
    search: searchParams.get('search') || undefined,
    tag_ids: searchParams.getAll('tag'),
  };

  const { data, isLoading } = useCourses({ filters });

  const updateFilter = (key: string, value: string | string[] | null) => {
    setSearchParams((prev) => {
      if (value === null || value === '') {
        prev.delete(key);
      } else if (Array.isArray(value)) {
        prev.delete(key);
        value.forEach((v) => prev.append(key, v));
      } else {
        prev.set(key, value);
      }
      return prev;
    });
  };

  // Component render...
}
```

---

## 6. API Layer

### 6.1 API Client

A single, preconfigured Axios instance:

```typescript
// src/lib/api-client.ts
import Axios, { InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { paths } from '@/config/paths';
import { useNotifications } from '@/stores/notifications';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers.Accept = 'application/json';
  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message;

    useNotifications.getState().addNotification({
      type: 'error',
      title: 'Error',
      message,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      const redirectTo = window.location.pathname;
      window.location.href = paths.auth.login.getHref(redirectTo);
    }

    return Promise.reject(error);
  }
);
```

### 6.2 API Declaration Pattern

Every API request declaration consists of:

1. **Types/Schemas**: Request/response types, Zod validation
2. **Fetcher Function**: Calls the API using the client
3. **React Hook**: Wraps the fetcher in TanStack Query

```typescript
// Pattern: features/{feature}/api/{action}.ts

// 1. Types and validation
export const createEntityInputSchema = z.object({
  name: z.string().min(1),
});
export type CreateEntityInput = z.infer<typeof createEntityInputSchema>;

// 2. Fetcher function
export const createEntity = (data: CreateEntityInput): Promise<Entity> => {
  return api.post('/api/v1/entities', data);
};

// 3. React hook
export const useCreateEntity = (config?: MutationConfig<typeof createEntity>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
    ...config,
  });
};
```

### 6.3 API Endpoints

Backend API endpoints (from `docs/ARCHITECTURE.md`):

| Feature | Endpoints |
|---------|-----------|
| **Auth** | POST `/auth/register`, POST `/auth/jwt/login` |
| **Profile** | GET `/api/v1/profiles/me`, PATCH `/api/v1/profiles/me`, GET `/api/v1/profiles/me/history` |
| **Courses** | GET `/api/v1/courses`, GET `/api/v1/courses/{id}`, GET `/api/v1/tags`, GET `/api/v1/skills` |
| **Recommendations** | POST `/api/v1/recommendations/generate`, GET `/api/v1/recommendations/quota` |
| **Admin** | GET `/admin/users`, GET `/admin/users/{id}`, PATCH `/admin/users/{id}/deactivate`, GET `/admin/users/{id}/profile-history`, GET `/admin/analytics/overview`, GET `/admin/analytics/tags/popular` |

---

## 7. Component Architecture

### 7.1 Component Organization

Components are organized into three tiers:

1. **UI Components** (`src/components/ui/`): Design system primitives
2. **Feature Components** (`src/features/{feature}/components/`): Feature-specific
3. **Layout Components** (`src/components/layouts/`): Page structure

### 7.2 UI Component Guidelines

Based on bulletproof-react and `UI_DESIGN_SYSTEM.md`:

**Component Structure**:

```typescript
// src/components/ui/button/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Spinner } from '../spinner';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
        ghost: 'text-blue-600 hover:bg-blue-50',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    icon?: React.ReactNode;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" className="mr-2" />
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 7.3 Feature Component Guidelines

Feature components compose UI components for specific use cases:

```typescript
// src/features/courses/components/course-card.tsx
import { Link } from 'react-router';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClockIcon } from '@heroicons/react/24/outline';
import { DifficultyBadge } from './difficulty-badge';
import { TagBadge } from './tag-badge';
import type { Course } from '../types';

type CourseCardProps = {
  course: Course;
};

export const CourseCard = ({ course }: CourseCardProps) => {
  const visibleTags = course.tags.slice(0, 3);
  const remainingTags = course.tags.length - visibleTags.length;

  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
        {/* Difficulty color bar */}
        <div className={cn('h-1', getDifficultyColor(course.difficulty))} />

        <div className="p-6">
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
            {course.title}
          </h3>

          <p className="mt-2 line-clamp-3 text-sm text-slate-600">
            {course.description}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <DifficultyBadge level={course.difficulty} />
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <ClockIcon className="h-4 w-4" />
              {course.duration}h
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} />
            ))}
            {remainingTags > 0 && (
              <Badge variant="outline">+{remainingTags}</Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
```

### 7.4 Layout Components

```typescript
// src/components/layouts/main-layout.tsx
import { Outlet } from 'react-router';
import { Navbar } from './navbar';
import { Footer } from './footer';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

// src/components/layouts/admin-layout.tsx
import { Outlet, Navigate } from 'react-router';
import { useUser } from '@/lib/auth';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';

export const AdminLayout = () => {
  const user = useUser();

  if (!user.data?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-slate-50">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
```

---

## 8. Routing Strategy

### 8.1 Route Configuration

```typescript
// src/config/paths.ts
export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  auth: {
    login: {
      path: '/login',
      getHref: (redirectTo?: string) =>
        redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login',
    },
    register: {
      path: '/register',
      getHref: () => '/register',
    },
  },
  app: {
    root: {
      path: '/app',
      getHref: () => '/app',
    },
    dashboard: {
      path: '/app/dashboard',
      getHref: () => '/app/dashboard',
    },
    courses: {
      path: '/app/courses',
      getHref: () => '/app/courses',
    },
    course: {
      path: '/app/courses/:courseId',
      getHref: (courseId: string) => `/app/courses/${courseId}`,
    },
    recommendations: {
      path: '/app/recommendations',
      getHref: () => '/app/recommendations',
    },
    profile: {
      path: '/app/profile',
      getHref: () => '/app/profile',
    },
    profileHistory: {
      path: '/app/profile/history',
      getHref: () => '/app/profile/history',
    },
    settings: {
      path: '/app/settings',
      getHref: () => '/app/settings',
    },
  },
  admin: {
    root: {
      path: '/admin',
      getHref: () => '/admin',
    },
    dashboard: {
      path: '/admin/dashboard',
      getHref: () => '/admin/dashboard',
    },
    users: {
      path: '/admin/users',
      getHref: () => '/admin/users',
    },
    user: {
      path: '/admin/users/:userId',
      getHref: (userId: string) => `/admin/users/${userId}`,
    },
    analytics: {
      path: '/admin/analytics',
      getHref: () => '/admin/analytics',
    },
  },
} as const;
```

### 8.2 Router Implementation

```typescript
// src/app/router.tsx
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { paths } from '@/config/paths';
import { ProtectedRoute } from '@/lib/auth';
import { MainLayout } from '@/components/layouts/main-layout';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { ErrorBoundary as AppErrorBoundary } from '@/components/errors';

const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  };
};

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    // Public routes
    {
      path: paths.home.path,
      lazy: () => import('./routes/landing').then(convert(queryClient)),
    },
    {
      path: paths.auth.login.path,
      lazy: () => import('./routes/auth/login').then(convert(queryClient)),
    },
    {
      path: paths.auth.register.path,
      lazy: () => import('./routes/auth/register').then(convert(queryClient)),
    },

    // Protected app routes
    {
      path: paths.app.root.path,
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      ErrorBoundary: AppErrorBoundary,
      children: [
        {
          path: paths.app.dashboard.path,
          lazy: () => import('./routes/app/dashboard').then(convert(queryClient)),
        },
        {
          path: paths.app.courses.path,
          lazy: () => import('./routes/app/courses/courses').then(convert(queryClient)),
        },
        {
          path: paths.app.course.path,
          lazy: () => import('./routes/app/courses/course-detail').then(convert(queryClient)),
        },
        {
          path: paths.app.recommendations.path,
          lazy: () => import('./routes/app/recommendations').then(convert(queryClient)),
        },
        {
          path: paths.app.profile.path,
          lazy: () => import('./routes/app/profile/profile').then(convert(queryClient)),
        },
        {
          path: paths.app.profileHistory.path,
          lazy: () => import('./routes/app/profile/profile-history').then(convert(queryClient)),
        },
        {
          path: paths.app.settings.path,
          lazy: () => import('./routes/app/settings').then(convert(queryClient)),
        },
      ],
    },

    // Admin routes (superuser only)
    {
      path: paths.admin.root.path,
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
      ErrorBoundary: AppErrorBoundary,
      children: [
        {
          index: true,
          lazy: () => import('./routes/admin/dashboard').then(convert(queryClient)),
        },
        {
          path: paths.admin.users.path,
          lazy: () => import('./routes/admin/users/users').then(convert(queryClient)),
        },
        {
          path: paths.admin.user.path,
          lazy: () => import('./routes/admin/users/user-detail').then(convert(queryClient)),
        },
        {
          path: paths.admin.analytics.path,
          lazy: () => import('./routes/admin/analytics').then(convert(queryClient)),
        },
      ],
    },

    // 404
    {
      path: '*',
      lazy: () => import('./routes/not-found').then(convert(queryClient)),
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
};
```

### 8.3 Route Guards

```typescript
// src/lib/auth.tsx (relevant section)
import { Navigate, useLocation } from 'react-router';
import { paths } from '@/config/paths';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const location = useLocation();

  if (user.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user.data) {
    return (
      <Navigate
        to={paths.auth.login.getHref(location.pathname)}
        replace
      />
    );
  }

  return <>{children}</>;
};
```

---

## 9. Error Handling

### 9.1 Error Boundary Strategy

Multiple error boundaries at different levels:

1. **App-Level**: Catches catastrophic errors
2. **Route-Level**: Catches errors in specific routes
3. **Component-Level**: For critical components like forms

```typescript
// src/components/errors/main-error-fallback.tsx
import { Button } from '@/components/ui/button';

type MainErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

export const MainErrorFallback = ({
  error,
  resetErrorBoundary,
}: MainErrorFallbackProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-slate-900">
        Something went wrong
      </h2>
      <p className="mt-2 text-slate-600">
        {error.message || 'An unexpected error occurred'}
      </p>
      <div className="mt-6 flex gap-4">
        <Button onClick={() => window.location.assign(window.location.origin)}>
          Go Home
        </Button>
        <Button variant="secondary" onClick={resetErrorBoundary}>
          Try Again
        </Button>
      </div>
    </div>
  );
};
```

### 9.2 API Error Handling

Handled in the API client interceptor (see Section 6.1).

### 9.3 Form Validation Errors

```typescript
// src/components/ui/form/field-wrapper.tsx
import { FieldError } from 'react-hook-form';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

type FieldWrapperProps = {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  description?: string;
};

export const FieldWrapper = ({
  label,
  error,
  children,
  description,
}: FieldWrapperProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {description && !error && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600" role="alert">
          <ExclamationCircleIcon className="h-4 w-4" />
          {error.message}
        </p>
      )}
    </div>
  );
};
```

---

## 10. Testing Strategy

### 10.1 Test Types

| Type | Tool | Purpose |
|------|------|---------|
| Unit | Vitest | Individual functions, utilities |
| Component | Testing Library | Component behavior, accessibility |
| Integration | Testing Library + MSW | Feature flows with mocked API |
| E2E | Playwright | Critical user journeys |

### 10.2 Testing Philosophy

From bulletproof-react:

> "The efficacy of testing lies in the comprehensive coverage provided by integration and end-to-end tests."

Focus on **behavior, not implementation**:
- Test what users see and do
- Don't test internal state
- If you refactor, tests should still pass

### 10.3 MSW for API Mocking

```typescript
// src/testing/mocks/handlers/courses.ts
import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { env } from '@/config/env';

export const coursesHandlers = [
  http.get(`${env.API_URL}/api/v1/courses`, ({ request }) => {
    const url = new URL(request.url);
    const difficulty = url.searchParams.get('difficulty');

    let courses = db.course.getAll();

    if (difficulty) {
      courses = courses.filter((c) => c.difficulty === difficulty);
    }

    return HttpResponse.json({
      courses,
      total: courses.length,
    });
  }),
];
```

### 10.4 Test Utilities

```typescript
// src/testing/test-utils.tsx
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

type WrapperProps = {
  children: React.ReactNode;
};

export const createWrapper = () => {
  const queryClient = createTestQueryClient();

  return ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

export const render = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return rtlRender(ui, { wrapper: createWrapper(), ...options });
};

export * from '@testing-library/react';
```

---

## 11. Performance Considerations

### 11.1 Code Splitting

All routes are lazy-loaded:

```typescript
lazy: () => import('./routes/app/courses/courses')
```

### 11.2 Query Optimization

- Use `staleTime` to prevent unnecessary refetches
- Use `select` to transform data and prevent re-renders
- Prefetch data on hover for instant navigation

```typescript
// Prefetch course detail on hover
const queryClient = useQueryClient();

const prefetchCourse = (courseId: string) => {
  queryClient.prefetchQuery(getCourseQueryOptions(courseId));
};
```

### 11.3 Component Optimization

- Use `React.memo` for expensive list items
- Virtualize long lists with `@tanstack/react-virtual`
- Avoid inline objects/functions in props when performance matters

### 11.4 Bundle Size

- Analyze with `vite-bundle-visualizer`
- Tree-shake unused code (no barrel files that break tree-shaking)
- Import only needed icons: `import { HomeIcon } from '@heroicons/react/24/outline'`

---

## 12. Security

### 12.1 Authentication

- JWT tokens stored in localStorage (with HttpOnly cookie for production)
- Tokens sent via Authorization header
- 401 responses trigger logout and redirect

### 12.2 Authorization

```typescript
// src/lib/authorization.tsx
import { useUser } from './auth';

type RBACProps = {
  allowedRoles: ('user' | 'superuser')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const RBAC = ({ allowedRoles, children, fallback = null }: RBACProps) => {
  const user = useUser();

  if (!user.data) return null;

  const userRole = user.data.is_superuser ? 'superuser' : 'user';

  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

### 12.3 XSS Prevention

- React escapes by default
- Avoid `dangerouslySetInnerHTML`
- Sanitize any user-generated content displayed as HTML

---

## 13. Project Standards

### 13.1 ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'import', 'check-file'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    // Enforce kebab-case file naming
    'check-file/filename-naming-convention': [
      'error',
      { '**/*.{ts,tsx}': 'KEBAB_CASE' },
      { ignoreMiddleExtensions: true },
    ],
    'check-file/folder-naming-convention': [
      'error',
      { 'src/**/!(__tests__)': 'KEBAB_CASE' },
    ],

    // Enforce unidirectional imports
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // features cannot import from app
          { target: './src/features', from: './src/app' },
          // shared cannot import from features or app
          {
            target: ['./src/components', './src/hooks', './src/lib', './src/utils'],
            from: ['./src/features', './src/app'],
          },
          // features cannot import from each other
          { target: './src/features/auth', from: './src/features', except: ['./auth'] },
          { target: './src/features/courses', from: './src/features', except: ['./courses'] },
          { target: './src/features/profile', from: './src/features', except: ['./profile'] },
          { target: './src/features/recommendations', from: './src/features', except: ['./recommendations'] },
          { target: './src/features/admin', from: './src/features', except: ['./admin'] },
        ],
      },
    ],
  },
};
```

### 13.2 Prettier Configuration

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 13.3 TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 13.4 Absolute Imports

Use `@/` prefix for all imports from `src/`:

```typescript
// Good
import { Button } from '@/components/ui/button';
import { useCourses } from '@/features/courses/api/get-courses';

// Bad
import { Button } from '../../../components/ui/button';
```

---

## 14. Implementation Checklist

This checklist is ordered by dependency and priority. Each item is a discrete, implementable unit.

### Phase 1: Project Setup (Foundation) ✅ COMPLETE

- [x] **1.1** Initialize Vite project with React + TypeScript template
- [x] **1.2** Configure Tailwind CSS with design system tokens from `UI_DESIGN_SYSTEM.md`
- [x] **1.3** Set up absolute imports (`@/` alias) in `tsconfig.json` and `vite.config.ts`
- [x] **1.4** Configure ESLint with file naming and import restrictions
- [x] **1.5** Configure Prettier with Tailwind plugin
- [x] **1.6** Set up Husky + lint-staged for pre-commit hooks
- [x] **1.7** Create initial folder structure (empty folders for all features)
- [x] **1.8** Add environment configuration (`src/config/env.ts`)
- [x] **1.9** Add path configuration (`src/config/paths.ts`)

### Phase 2: Core Libraries ✅ COMPLETE

- [x] **2.1** Create API client with Axios (`src/lib/api-client.ts`)
- [x] **2.2** Configure TanStack Query (`src/lib/react-query.ts`)
- [x] **2.3** Create notification store with Zustand (`src/stores/notifications.ts`)
- [x] **2.4** Create utility functions (`cn.ts`, `format.ts`, `storage.ts`)

### Phase 3: UI Component Library ✅ COMPLETE

- [x] **3.1** Create Spinner component
- [x] **3.2** Create Button component (all variants from design system)
- [x] **3.3** Create Input component (text, email, password with show/hide)
- [x] **3.4** Create Textarea component
- [x] **3.5** Create Form and FieldWrapper components
- [x] **3.6** Create Card component
- [x] **3.7** Create Badge component
- [x] **3.8** Create Modal component (using Headless UI Dialog)
- [x] **3.9** Create ConfirmationModal component
- [x] **3.10** Create Dropdown component (using Headless UI Menu)
- [x] **3.11** Create Toast and Toaster components
- [x] **3.12** Create Skeleton component
- [x] **3.13** Create Link component (wraps React Router Link)
- [x] **3.14** Create Table component (for admin)

### Phase 4: Layout Components ✅ COMPLETE

- [x] **4.1** Create AuthLayout (centered card for login/register)
- [x] **4.2** Create MainLayout (navbar + content + footer)
- [x] **4.3** Create AdminLayout (sidebar + content)
- [x] **4.4** Create Navbar component
- [x] **4.5** Create MobileNav component (slide-out drawer)
- [x] **4.6** Create UserMenu dropdown
- [x] **4.7** Create Footer component
- [x] **4.8** Create error fallback components

### Phase 5: App Provider and Router ✅ COMPLETE

- [x] **5.1** Create AppProvider with all providers
- [x] **5.2** Create router configuration with all routes (lazy loaded)
- [x] **5.3** Create App entry component
- [x] **5.4** Update main.tsx
- [x] **5.5** Create paths config (src/config/paths.ts)
- [x] **5.6** Create placeholder pages for all routes

### Phase 6: Authentication Feature ✅ COMPLETE

- [x] **6.1** Create auth types (`features/auth/types/index.ts`)
- [x] **6.2** Create login API hook (`features/auth/api/login.ts`)
- [x] **6.3** Create register API hook (`features/auth/api/register.ts`)
- [x] **6.4** Create get-user API hook (`features/auth/api/get-user.ts`)
- [x] **6.5** Create auth library (`lib/auth.tsx`) with AuthLoader, ProtectedRoute, AdminRoute
- [x] **6.6** Create LoginForm component (`features/auth/components/login-form.tsx`)
- [x] **6.7** Create RegisterForm component (`features/auth/components/register-form.tsx`)
- [x] **6.8** Update Login page to use LoginForm
- [x] **6.9** Update Register page to use RegisterForm
- [x] **6.10** Update Landing page with auth-aware redirect (logged-in users → dashboard)
- [x] **6.11** Wire ProtectedRoute/AdminRoute into router
- [x] **6.12** Add CORS middleware to backend (allows localhost:5173)

**Auth Flow Notes**:
- Login: POST `/auth/jwt/login` (form-urlencoded with `username` field)
- Register: POST `/auth/register` (JSON) → auto-login after success
- JWT token stored in localStorage via `utils/storage.ts`
- AuthLoader in AppProvider fetches user on app startup
- Landing page (`/`) redirects logged-in users to `/dashboard`

### Phase 7: Courses Feature (COMPLETED 2025-11-25)

- [x] **7.1** Create course types (`features/courses/types/index.ts`)
- [x] **7.2** Create get-courses API hook (`features/courses/api/get-courses.ts`)
- [x] **7.3** Create get-course API hook (`features/courses/api/get-course.ts`)
- [x] **7.4** Create get-tags API hook (`features/courses/api/get-tags.ts`)
- [x] **7.5** Create DifficultyBadge component (success/warning/error variants)
- [x] **7.6** Create TagBadge component (outline variant with click support)
- [x] **7.7** Create CourseSkeleton component (card + detail skeletons)
- [x] **7.8** Create CourseCard component (responsive, clickable)
- [x] **7.9** Create CourseGrid component (1→2→3→4 col responsive)
- [x] **7.10** Create CourseFilters component (difficulty filter, search, URL sync)
- [x] **7.11** Create CourseDetail component (full course view with skills/tags)
- [x] **7.12** Create Courses page (`app/routes/app/courses.tsx`)
- [x] **7.13** Create Course detail page (`app/routes/app/course.tsx`)

**Implementation Notes:**
- Filters sync with URL via `useSearchParams` for shareable URLs
- Search input debounced at 300ms
- Course grid: 1 col (mobile) → 2 col (sm) → 3 col (lg) → 4 col (xl)
- Course cards show 3 tags max with "+N" badge for overflow

### Phase 8: Profile Feature

- [ ] **8.1** Create profile types (`features/profile/types/index.ts`)
- [ ] **8.2** Create get-profile API hook
- [ ] **8.3** Create update-profile API hook
- [ ] **8.4** Create get-profile-history API hook
- [ ] **8.5** Create LevelSelector component (radio group)
- [ ] **8.6** Create TimeCommitmentSlider component
- [ ] **8.7** Create InterestSelector component
- [ ] **8.8** Create TagBrowserModal component
- [ ] **8.9** Create ProfileView component
- [ ] **8.10** Create ProfileForm component
- [ ] **8.11** Create ProfileHistoryTimeline component
- [ ] **8.12** Create Profile page (`app/routes/app/profile/profile.tsx`)
- [ ] **8.13** Create ProfileHistory page (`app/routes/app/profile/profile-history.tsx`)

### Phase 9: Recommendations Feature

- [ ] **9.1** Create recommendation types (`features/recommendations/types/index.ts`)
- [ ] **9.2** Create generate-recommendations API hook
- [ ] **9.3** Create get-quota API hook
- [ ] **9.4** Create RateLimitIndicator component
- [ ] **9.5** Create AILoadingState component (animated)
- [ ] **9.6** Create RecommendationCard component
- [ ] **9.7** Create RecommendationList component
- [ ] **9.8** Create RecommendationForm component
- [ ] **9.9** Create Recommendations page (`app/routes/app/recommendations.tsx`)

### Phase 10: Dashboard and Settings

- [ ] **10.1** Create Dashboard page with profile status, quick actions
- [ ] **10.2** Create Settings page with password change, account deletion

### Phase 11: Admin Feature

- [ ] **11.1** Create admin types (`features/admin/types/index.ts`)
- [ ] **11.2** Create get-users API hook (with filters)
- [ ] **11.3** Create get-user-detail API hook
- [ ] **11.4** Create get-user-profile-history API hook
- [ ] **11.5** Create deactivate-user API hook
- [ ] **11.6** Create get-analytics-overview API hook
- [ ] **11.7** Create get-popular-tags API hook
- [ ] **11.8** Create AdminSidebar component
- [ ] **11.9** Create StatsCard component
- [ ] **11.10** Create StatusBadge component
- [ ] **11.11** Create ProfileCompletenessIndicator component
- [ ] **11.12** Create SearchAndFilters component
- [ ] **11.13** Create UserTableRow component
- [ ] **11.14** Create UserTable component
- [ ] **11.15** Create ProfileHistoryModal component
- [ ] **11.16** Create DeactivateUserModal component
- [ ] **11.17** Create PopularTagsChart component
- [ ] **11.18** Create CategoryBreakdownChart component
- [ ] **11.19** Create AdminDashboard page
- [ ] **11.20** Create AdminUsers page
- [ ] **11.21** Create AdminUserDetail page
- [ ] **11.22** Create AdminAnalytics page

### Phase 12: Testing Setup

- [ ] **12.1** Configure Vitest
- [ ] **12.2** Set up MSW with handlers for all features
- [ ] **12.3** Create test utilities and custom render
- [ ] **12.4** Write tests for auth flow
- [ ] **12.5** Write tests for courses feature
- [ ] **12.6** Write tests for profile feature
- [ ] **12.7** Configure Playwright
- [ ] **12.8** Write E2E tests for critical paths

### Phase 13: Polish

- [ ] **13.1** Add loading states to all pages
- [ ] **13.2** Add empty states to all lists
- [ ] **13.3** Verify accessibility (keyboard navigation, screen reader)
- [ ] **13.4** Add responsive design for mobile
- [ ] **13.5** Add page titles and meta tags
- [ ] **13.6** Performance audit and optimization
- [ ] **13.7** Final review and cleanup

---

## Appendix: Quick Reference

### File Naming Conventions

- Components: `kebab-case.tsx` (e.g., `course-card.tsx`)
- Types: `index.ts` in types folder
- API hooks: `get-courses.ts`, `update-profile.ts`, `create-recommendation.ts`
- Test files: `*.test.tsx` in `__tests__` folder

### Import Order

1. React
2. Third-party libraries
3. `@/` imports (alphabetically)
4. Relative imports
5. Types

### Component File Structure

```typescript
// 1. Imports
import * as React from 'react';
// ...

// 2. Types
type MyComponentProps = {
  // ...
};

// 3. Component
export const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
  // hooks
  // handlers
  // render
};
```

### Query Key Conventions

```typescript
// List: ['resource']
['courses']

// List with filters: ['resource', filters]
['courses', { difficulty: 'beginner' }]

// Detail: ['resource', id]
['course', courseId]

// Nested: ['parent', parentId, 'child']
['user', userId, 'profile']

// Admin: ['admin', 'resource']
['admin', 'users']
```

---

**Document Version**: 1.0
**Created**: 2025-11-25
**Author**: Claude (React Specialist)
