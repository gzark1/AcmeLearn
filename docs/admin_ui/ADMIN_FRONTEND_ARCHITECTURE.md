# Admin Frontend Architecture

## Document Information

| Field | Value |
|-------|-------|
| Author | React Specialist |
| Date | 2025-11-26 |
| Status | Technical Specification |
| Version | 1.0 |
| Related Docs | `ADMIN_FEATURE_PROPOSAL.md`, `admin_ui/`, `FRONTEND_ARCHITECTURE.md` |

---

## Table of Contents

1. [Overview](#1-overview)
2. [File Structure](#2-file-structure)
3. [Type Definitions](#3-type-definitions)
4. [API Hooks](#4-api-hooks)
5. [Component Architecture](#5-component-architecture)
6. [Route Configuration](#6-route-configuration)
7. [State Management](#7-state-management)
8. [Backend Requirements](#8-backend-requirements)
9. [Implementation Roadmap](#9-implementation-roadmap)

---

## 1. Overview

### 1.1 Purpose

This document defines the frontend architecture for AcmeLearn's admin dashboard, a superuser-only interface for managing users, monitoring platform health, and analyzing engagement patterns.

### 1.2 Architecture Principles

Following the established AcmeLearn frontend patterns from `FRONTEND_ARCHITECTURE.md`:

1. **Feature-Based Organization**: All admin code lives in `features/admin/`
2. **TanStack Query for Server State**: All API interactions through React Query hooks
3. **URL State for Filters**: Search/filter state in URL params for shareability
4. **Component Composition**: Reuse existing UI components from `components/ui/`
5. **Violet Theme**: Visual differentiation from user-facing blue theme

### 1.3 Design References

All visual specifications are defined in:
- **`docs/admin_ui/OVERVIEW.md`** - Design principles, color palette, component inventory
- **`docs/admin_ui/DASHBOARD.md`** - Dashboard page specs
- **`docs/admin_ui/USER_MANAGEMENT.md`** - User list and detail specs
- **`docs/admin_ui/ANALYTICS.md`** - Analytics page specs (Phase 4)

### 1.4 Existing Backend API

The backend already provides these admin endpoints (from `/backend/api/admin.py`):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/users` | GET | List users with filters (email, is_active, pagination) |
| `/admin/users/:id` | GET | Get user detail with profile summary |
| `/admin/users/:id/deactivate` | PATCH | Soft-delete user (set is_active=false) |
| `/admin/users/:id/profile-history` | GET | Get profile snapshots (versions) |
| `/admin/analytics/overview` | GET | System-wide stats (total users, active users, completion rate) |
| `/admin/analytics/tags/popular` | GET | Most popular tags by interest count |

**Note**: All endpoints require `current_superuser` authentication (JWT + is_superuser=true).

---

## 2. File Structure

### 2.1 Complete Admin Feature Structure

```
frontend/src/features/admin/
├── api/
│   ├── get-dashboard-overview.ts         # Dashboard metrics
│   ├── get-users.ts                      # User list with filters
│   ├── get-user-detail.ts                # Single user + profile
│   ├── get-user-profile-history.ts       # Profile snapshots
│   ├── deactivate-user.ts                # Soft-delete mutation
│   ├── get-analytics-overview.ts         # Analytics stats
│   ├── get-popular-tags.ts               # Tag analytics
│   └── index.ts                          # Barrel export
│
├── components/
│   ├── admin-sidebar.tsx                 # Violet-themed navigation sidebar
│   ├── stats-card.tsx                    # Large number + label + trend
│   ├── activity-feed.tsx                 # Recent platform events
│   ├── quick-insights.tsx                # Platform health insights
│   ├── status-badge.tsx                  # Active/Inactive/Verified badges
│   ├── profile-completeness.tsx          # 5-dot indicator
│   ├── user-table.tsx                    # Sortable user list table
│   ├── user-table-row.tsx                # Single user row
│   ├── search-and-filters.tsx            # Search + status/profile filters
│   ├── profile-history-modal.tsx         # Timeline of profile versions
│   ├── deactivate-user-modal.tsx         # Confirmation modal
│   ├── user-growth-chart.tsx             # Line chart (Phase 4)
│   ├── profile-breakdown-chart.tsx       # Horizontal bar (Phase 4)
│   ├── popular-tags-chart.tsx            # Tag bar chart (Phase 4)
│   ├── category-breakdown.tsx            # Category distribution (Phase 4)
│   └── index.ts                          # Barrel export
│
├── types/
│   └── index.ts                          # All admin TypeScript types
│
└── hooks/                                # (Only if needed - none planned)
```

### 2.2 Route Files

Admin routes already exist as stubs in `src/app/routes/admin/`:
- **`dashboard.tsx`** - Admin dashboard (will be enhanced)
- **`users.tsx`** - User list page (needs implementation)
- **`analytics.tsx`** - Analytics page (Phase 4, currently stub)

**Missing Route**: Need to add `user-detail.tsx` for individual user detail page.

---

## 3. Type Definitions

### 3.1 Admin Types File

**Location**: `frontend/src/features/admin/types/index.ts`

```typescript
// ============================================================================
// User Management Types
// ============================================================================

export type UserStatus = 'active' | 'inactive' | 'verified'

export type ProfileCompletionStatus = 'complete' | 'partial' | 'empty'

export type AdminUserListItem = {
  id: string
  email: string
  is_active: boolean
  is_superuser: boolean
  is_verified: boolean
  has_learning_goal: boolean
  interest_count: number
}

export type AdminUserListResponse = {
  users: AdminUserListItem[]
  total: number
  skip: number
  limit: number
}

export type ProfileSummary = {
  id: string
  learning_goal: string | null
  current_level: 'beginner' | 'intermediate' | 'advanced' | null
  time_commitment: number | null
  version: number
  interest_count: number
  interests: string[] // tag names
  created_at: string
  updated_at: string
}

export type AdminUserDetail = {
  id: string
  email: string
  is_active: boolean
  is_superuser: boolean
  is_verified: boolean
  profile: ProfileSummary | null
}

export type ProfileSnapshot = {
  id: string
  version: number
  learning_goal: string | null
  current_level: 'beginner' | 'intermediate' | 'advanced' | null
  time_commitment: number | null
  interests_snapshot: string[] // JSON array of tag names
  created_at: string
}

export type ProfileHistoryResponse = {
  snapshots: ProfileSnapshot[]
  count: number
}

// ============================================================================
// Dashboard Types
// ============================================================================

export type ActivityEventType = 'registration' | 'profile_update' | 'recommendation' | 'deactivation'

export type ActivityEvent = {
  id: string
  type: ActivityEventType
  user_email: string
  description: string // e.g., "updated profile (v4)"
  timestamp: string
}

export type QuickInsight = {
  id: string
  icon: string // emoji
  text: string
  type: 'positive' | 'warning' | 'info'
}

export type DashboardOverview = {
  total_users: number
  profile_completion_rate: number
  avg_profile_updates: number
  ai_recs_today: number
  weekly_signups: number
  active_users_rate: number
  recent_activity: ActivityEvent[] // top 10
  insights: QuickInsight[] // top 3
}

// ============================================================================
// Analytics Types (Phase 4)
// ============================================================================

export type GrowthDataPoint = {
  date: string // ISO date
  count: number
}

export type ProfileBreakdown = {
  complete: number
  partial: number
  empty: number
}

export type LevelDistribution = {
  beginner: number
  intermediate: number
  advanced: number
}

export type TimeDistribution = {
  '1-5': number
  '5-10': number
  '10-20': number
  '20+': number
}

export type PopularTag = {
  tag_id: string
  tag_name: string
  user_count: number
}

export type PopularTagsResponse = {
  tags: PopularTag[]
  total_tags: number
}

export type CategoryDistribution = {
  category: string
  percentage: number
}

export type AnalyticsOverview = {
  total_users: number
  active_users: number
  superuser_count: number
  new_registrations_7d: number
  new_registrations_30d: number
  profile_completion_rate: number
}

export type AnalyticsData = {
  user_growth: GrowthDataPoint[]
  profile_breakdown: ProfileBreakdown
  level_distribution: LevelDistribution
  time_commitment_distribution: TimeDistribution
  popular_tags: PopularTag[]
  category_distribution: CategoryDistribution[]
}

// ============================================================================
// Filter Types
// ============================================================================

export type UserFilters = {
  email?: string // partial match search
  is_active?: boolean
  profile_status?: ProfileCompletionStatus
  skip?: number
  limit?: number
}
```

---

## 4. API Hooks

### 4.1 User Management API Hooks

#### 4.1.1 Get Users List

**File**: `frontend/src/features/admin/api/get-users.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { AdminUserListResponse, UserFilters } from '../types'

export const getUsers = async (filters: UserFilters = {}): Promise<AdminUserListResponse> => {
  const params = new URLSearchParams()

  if (filters.email) {
    params.append('email', filters.email)
  }

  if (filters.is_active !== undefined) {
    params.append('is_active', String(filters.is_active))
  }

  if (filters.skip !== undefined) {
    params.append('skip', String(filters.skip))
  }

  if (filters.limit !== undefined) {
    params.append('limit', String(filters.limit))
  }

  const queryString = params.toString()
  const url = queryString ? `/admin/users?${queryString}` : '/admin/users'

  return api.get(url) as Promise<AdminUserListResponse>
}

export const useAdminUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => getUsers(filters),
    // Cache for 5 minutes - admin data doesn't need real-time updates
    staleTime: 5 * 60 * 1000,
  })
}
```

#### 4.1.2 Get User Detail

**File**: `frontend/src/features/admin/api/get-user-detail.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { AdminUserDetail } from '../types'

export const getUserDetail = async (userId: string): Promise<AdminUserDetail> => {
  return api.get(`/admin/users/${userId}`) as Promise<AdminUserDetail>
}

export const useAdminUserDetail = (userId: string) => {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => getUserDetail(userId),
    staleTime: 5 * 60 * 1000,
  })
}
```

#### 4.1.3 Get User Profile History

**File**: `frontend/src/features/admin/api/get-user-profile-history.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { ProfileHistoryResponse } from '../types'

export const getUserProfileHistory = async (
  userId: string,
  limit: number = 50
): Promise<ProfileHistoryResponse> => {
  return api.get(`/admin/users/${userId}/profile-history?limit=${limit}`) as Promise<ProfileHistoryResponse>
}

export const useUserProfileHistory = (userId: string, limit?: number) => {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'profile-history', limit],
    queryFn: () => getUserProfileHistory(userId, limit),
    staleTime: 5 * 60 * 1000,
  })
}
```

#### 4.1.4 Deactivate User (Mutation)

**File**: `frontend/src/features/admin/api/deactivate-user.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { AdminUserDetail } from '../types'

type DeactivateUserInput = {
  userId: string
}

export const deactivateUser = async ({ userId }: DeactivateUserInput): Promise<AdminUserDetail> => {
  return api.patch(`/admin/users/${userId}/deactivate`) as Promise<AdminUserDetail>
}

export const useDeactivateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: (data, variables) => {
      // Invalidate user list and detail queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId] })
    },
  })
}
```

### 4.2 Dashboard API Hooks

#### 4.2.1 Get Dashboard Overview

**File**: `frontend/src/features/admin/api/get-dashboard-overview.ts`

**Note**: This endpoint needs to be implemented on the backend. The existing `/admin/analytics/overview` only returns basic stats, not recent activity or insights.

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { DashboardOverview, AnalyticsOverview } from '../types'

// Temporary: use existing analytics endpoint until dashboard endpoint is added
export const getDashboardOverview = async (): Promise<Partial<DashboardOverview>> => {
  const analytics = (await api.get('/admin/analytics/overview')) as AnalyticsOverview

  // Transform backend data to dashboard format
  return {
    total_users: analytics.total_users,
    profile_completion_rate: analytics.profile_completion_rate,
    avg_profile_updates: 0, // Not in current API
    ai_recs_today: 0, // Not in current API
    weekly_signups: analytics.new_registrations_7d,
    active_users_rate: analytics.active_users / analytics.total_users,
    recent_activity: [], // Not in current API - would need new endpoint
    insights: [], // Not in current API - would need computation
  }
}

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboardOverview,
    staleTime: 5 * 60 * 1000,
  })
}
```

### 4.3 Analytics API Hooks (Phase 4)

#### 4.3.1 Get Analytics Overview

**File**: `frontend/src/features/admin/api/get-analytics-overview.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { AnalyticsOverview } from '../types'

export const getAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  return api.get('/admin/analytics/overview') as Promise<AnalyticsOverview>
}

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: getAnalyticsOverview,
    staleTime: 15 * 60 * 1000, // 15 minutes - analytics can be stale
  })
}
```

#### 4.3.2 Get Popular Tags

**File**: `frontend/src/features/admin/api/get-popular-tags.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { PopularTagsResponse } from '../types'

export const getPopularTags = async (limit: number = 20): Promise<PopularTagsResponse> => {
  return api.get(`/admin/analytics/tags/popular?limit=${limit}`) as Promise<PopularTagsResponse>
}

export const usePopularTags = (limit?: number) => {
  return useQuery({
    queryKey: ['admin', 'analytics', 'tags', limit],
    queryFn: () => getPopularTags(limit),
    staleTime: 15 * 60 * 1000,
  })
}
```

### 4.4 API Barrel Export

**File**: `frontend/src/features/admin/api/index.ts`

```typescript
export * from './get-users'
export * from './get-user-detail'
export * from './get-user-profile-history'
export * from './deactivate-user'
export * from './get-dashboard-overview'
export * from './get-analytics-overview'
export * from './get-popular-tags'
```

---

## 5. Component Architecture

### 5.1 Core Admin Components

#### 5.1.1 AdminSidebar

**File**: `frontend/src/features/admin/components/admin-sidebar.tsx`

**Purpose**: Violet-themed navigation sidebar with admin routes

**Visual Specs** (from `admin_ui/OVERVIEW.md`):
- Width: 240px fixed
- Background: `violet-900` (dark theme)
- Text: `white` (high contrast)
- Hover: `violet-800`
- Active item: `violet-700` + left border accent

**Component Structure**:
```typescript
import { Link, useLocation } from 'react-router-dom'
import { paths } from '@/config/paths'
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'

type NavItem = {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: paths.admin.root.path, icon: HomeIcon },
  { name: 'Users', path: paths.admin.users.path, icon: UsersIcon },
  { name: 'Analytics', path: paths.admin.analytics.path, icon: ChartBarIcon },
]

export const AdminSidebar = () => {
  const location = useLocation()

  return (
    <div className="flex h-screen w-60 flex-col bg-violet-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">AcmeLearn Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-violet-700 text-white border-l-4 border-violet-400'
                  : 'text-violet-200 hover:bg-violet-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Exit Admin */}
      <div className="border-t border-violet-800 p-3">
        <Link
          to={paths.app.dashboard.path}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-800 hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Exit Admin
        </Link>
      </div>
    </div>
  )
}
```

#### 5.1.2 StatsCard

**File**: `frontend/src/features/admin/components/stats-card.tsx`

**Purpose**: Display single metric with large number, label, and optional trend

**Visual Specs** (from `admin_ui/DASHBOARD.md`):
- Container: white bg, border, 12px radius, 20px padding, min-height 140px
- Label: 12px uppercase, slate-500, medium weight
- Number: 48px bold, slate-900
- Description: 14px regular, slate-600
- Trend: 12px, emerald-600 (positive) or red-600 (negative)

**Component Structure**:
```typescript
import { cn } from '@/utils/cn'

type TrendDirection = 'up' | 'down' | 'neutral'

type StatsCardProps = {
  label: string
  value: number | string
  description: string
  trend?: {
    value: string
    direction: TrendDirection
  }
  icon?: React.ReactNode
}

export const StatsCard = ({ label, value, description, trend, icon }: StatsCardProps) => {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-slate-500',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <div className="min-h-[140px] rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {icon && <div className="mb-2">{icon}</div>}

      <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </h3>

      <p className="mt-2 text-5xl font-bold leading-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-600">{description}</p>

      {trend && (
        <p className={cn('mt-3 text-xs', trendColors[trend.direction])}>
          <span aria-hidden="true">{trendIcons[trend.direction]} </span>
          {trend.value}
        </p>
      )}
    </div>
  )
}
```

#### 5.1.3 StatusBadge

**File**: `frontend/src/features/admin/components/status-badge.tsx`

**Purpose**: Display user status with consistent styling

**Visual Specs** (from `admin_ui/USER_MANAGEMENT.md`):
- Active: emerald-100 bg, emerald-700 text, emerald-500 dot
- Inactive: gray-100 bg, gray-700 text, gray-400 dot
- Verified: blue-100 bg, blue-700 text, blue-500 dot

**Component Structure**:
```typescript
import { cn } from '@/utils/cn'
import type { UserStatus } from '../types'

type StatusBadgeProps = {
  status: UserStatus
}

const statusConfig = {
  active: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
    label: 'Inactive',
  },
  verified: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Verified',
  },
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
        config.bg,
        config.text
      )}
      role="status"
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
    </div>
  )
}
```

#### 5.1.4 ProfileCompleteness

**File**: `frontend/src/features/admin/components/profile-completeness.tsx`

**Purpose**: 5-dot visual indicator of profile completion

**Dot Criteria** (from `admin_ui/USER_MANAGEMENT.md`):
1. Dot 1: `learning_goal` is not null
2. Dot 2: `current_level` is not null
3. Dot 3: `time_commitment` is not null
4. Dot 4: User has 1+ interests
5. Dot 5: User has 5+ interests

**Component Structure**:
```typescript
import { cn } from '@/utils/cn'

type ProfileCompletenessProps = {
  hasGoal: boolean
  hasLevel: boolean
  hasTimeCommitment: boolean
  interestCount: number
  showTooltip?: boolean
}

export const ProfileCompleteness = ({
  hasGoal,
  hasLevel,
  hasTimeCommitment,
  interestCount,
  showTooltip = true,
}: ProfileCompletenessProps) => {
  const dots = [
    hasGoal,
    hasLevel,
    hasTimeCommitment,
    interestCount >= 1,
    interestCount >= 5,
  ]

  const filledCount = dots.filter(Boolean).length
  const percentage = (filledCount / 5) * 100

  const missing: string[] = []
  if (!hasGoal) missing.push('learning goal')
  if (!hasLevel) missing.push('level')
  if (!hasTimeCommitment) missing.push('time commitment')
  if (interestCount < 1) missing.push('1+ interests')
  else if (interestCount < 5) missing.push('5+ interests')

  const tooltipText = missing.length > 0
    ? `Profile ${percentage}% complete. Missing: ${missing.join(', ')}`
    : 'Profile 100% complete'

  return (
    <div className="flex items-center gap-1" title={showTooltip ? tooltipText : undefined}>
      {dots.map((filled, index) => (
        <div
          key={index}
          className={cn(
            'h-2 w-2 rounded-full',
            filled ? 'bg-violet-500' : 'bg-slate-300'
          )}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{tooltipText}</span>
    </div>
  )
}
```

#### 5.1.5 UserTable & UserTableRow

**File**: `frontend/src/features/admin/components/user-table.tsx`

**Purpose**: Sortable/filterable user list

**Visual Specs** (from `admin_ui/USER_MANAGEMENT.md`):
- Header row: slate-50 bg, 12px uppercase text
- Data rows: 72px height, hover bg-slate-50
- Columns: Email (35%), Status (15%), Level (15%), Profile (20%), Actions (15%)

**Component Structure**:
```typescript
import { AdminUserListItem } from '../types'
import { UserTableRow } from './user-table-row'

type UserTableProps = {
  users: AdminUserListItem[]
  isLoading?: boolean
}

export const UserTable = ({ users, isLoading }: UserTableProps) => {
  if (isLoading) {
    return <div>Loading skeleton...</div> // TODO: Add skeleton
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">No users found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full" role="table" aria-label="User list">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
              Email
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
              Profile
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserTableRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**File**: `frontend/src/features/admin/components/user-table-row.tsx`

```typescript
import { Link } from 'react-router-dom'
import { paths } from '@/config/paths'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './status-badge'
import { ProfileCompleteness } from './profile-completeness'
import type { AdminUserListItem } from '../types'

type UserTableRowProps = {
  user: AdminUserListItem
}

export const UserTableRow = ({ user }: UserTableRowProps) => {
  const status = user.is_active ? 'active' : 'inactive'
  const profileSummary = user.has_learning_goal
    ? `Has goal • ${user.interest_count} interests`
    : `No goal • ${user.interest_count} interests`

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{user.email}</span>
          <span className="text-xs text-slate-500">{profileSummary}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-3">
        <ProfileCompleteness
          hasGoal={user.has_learning_goal}
          hasLevel={false} // Not in list response
          hasTimeCommitment={false} // Not in list response
          interestCount={user.interest_count}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <Link to={paths.admin.userDetail.getHref(user.id)}>
          <Button variant="secondary" size="sm">
            View
          </Button>
        </Link>
      </td>
    </tr>
  )
}
```

#### 5.1.6 SearchAndFilters

**File**: `frontend/src/features/admin/components/search-and-filters.tsx`

**Purpose**: Search by email + status/profile filters

**Component Structure**:
```typescript
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

type SearchAndFiltersProps = {
  emailSearch: string
  onEmailSearchChange: (value: string) => void
  activeFilter: 'all' | 'active' | 'inactive'
  onActiveFilterChange: (value: 'all' | 'active' | 'inactive') => void
}

export const SearchAndFilters = ({
  emailSearch,
  onEmailSearchChange,
  activeFilter,
  onActiveFilterChange,
}: SearchAndFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <Input
          type="text"
          placeholder="Search by email..."
          value={emailSearch}
          onChange={(e) => onEmailSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Status:</span>
        <div className="inline-flex rounded-lg border border-slate-300">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onActiveFilterChange(filter)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                'first:rounded-l-lg last:rounded-r-lg',
                activeFilter === filter
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-violet-50'
              )}
            >
              {filter === 'all' ? 'All' : filter === 'active' ? '● Active' : '○ Inactive'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### 5.1.7 ProfileHistoryModal

**File**: `frontend/src/features/admin/components/profile-history-modal.tsx`

**Purpose**: Timeline of profile versions

**Visual Specs** (from `admin_ui/USER_MANAGEMENT.md`):
- Max width: 700px, max height 80vh (scrollable)
- Timeline: 2px violet-200 left border connecting nodes
- Current version: filled violet-600 dot (12px)
- Past versions: empty violet-400 circle (12px)

**Component Structure**:
```typescript
import { Modal } from '@/components/ui/modal'
import { format } from 'date-fns'
import { useUserProfileHistory } from '../api/get-user-profile-history'
import { Spinner } from '@/components/ui/spinner'

type ProfileHistoryModalProps = {
  userId: string
  userEmail: string
  isOpen: boolean
  onClose: () => void
}

export const ProfileHistoryModal = ({
  userId,
  userEmail,
  isOpen,
  onClose,
}: ProfileHistoryModalProps) => {
  const { data, isLoading } = useUserProfileHistory(userId)

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="700px" title={`Profile History - ${userEmail}`}>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : data?.snapshots.length === 0 ? (
        <div className="py-8 text-center text-slate-600">
          <p>No profile history available.</p>
          <p className="mt-1 text-sm">This user has not updated their profile yet.</p>
        </div>
      ) : (
        <div className="max-h-[60vh] space-y-6 overflow-y-auto py-4">
          {data?.snapshots.map((snapshot, index) => {
            const isCurrent = index === 0
            return (
              <div key={snapshot.id} className="relative pl-8">
                {/* Timeline line */}
                {index < (data?.snapshots.length ?? 0) - 1 && (
                  <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-violet-200" />
                )}

                {/* Version node */}
                <div
                  className={`absolute left-0 top-2 h-3 w-3 rounded-full ${
                    isCurrent
                      ? 'bg-violet-600'
                      : 'border-2 border-violet-400 bg-white'
                  }`}
                />

                {/* Version details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                      Version {snapshot.version} {isCurrent && '(Current)'}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {format(new Date(snapshot.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-sm text-slate-700">
                    <p>Goal: {snapshot.learning_goal || '(empty)'}</p>
                    <p>Level: {snapshot.current_level || '(empty)'}</p>
                    <p>Time: {snapshot.time_commitment ? `${snapshot.time_commitment} hrs/week` : '(empty)'}</p>
                    <p>Interests: {snapshot.interests_snapshot?.length || 0} tags</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
```

#### 5.1.8 DeactivateUserModal

**File**: `frontend/src/features/admin/components/deactivate-user-modal.tsx`

**Purpose**: Confirmation modal for user deactivation

**Component Structure**:
```typescript
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useDeactivateUser } from '../api/deactivate-user'
import { useNotifications } from '@/stores/notifications'

type DeactivateUserModalProps = {
  userId: string
  userEmail: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const DeactivateUserModal = ({
  userId,
  userEmail,
  isOpen,
  onClose,
  onSuccess,
}: DeactivateUserModalProps) => {
  const deactivateMutation = useDeactivateUser()
  const { addNotification } = useNotifications()

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync({ userId })
      addNotification({
        type: 'success',
        title: 'User deactivated',
        message: `${userEmail} has been deactivated successfully.`,
      })
      onClose()
      onSuccess?.()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deactivation failed',
        message: 'Failed to deactivate user. Please try again.',
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="500px" title="Deactivate User Account">
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          Are you sure you want to deactivate this user?
        </p>

        <div className="rounded-md bg-slate-50 px-3 py-2">
          <p className="text-sm font-medium text-slate-900">Email: {userEmail}</p>
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <p className="font-medium">This will:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Prevent the user from logging in</li>
            <li>Preserve their data for compliance</li>
            <li>Allow reactivation later if needed</li>
          </ul>
        </div>

        <p className="text-sm text-slate-600">This action can be reversed.</p>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={deactivateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            isLoading={deactivateMutation.isPending}
          >
            Deactivate Account
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

### 5.2 Component Barrel Export

**File**: `frontend/src/features/admin/components/index.ts`

```typescript
export * from './admin-sidebar'
export * from './stats-card'
export * from './status-badge'
export * from './profile-completeness'
export * from './user-table'
export * from './user-table-row'
export * from './search-and-filters'
export * from './profile-history-modal'
export * from './deactivate-user-modal'
// Phase 4 components (charts) will be added here
```

---

## 6. Route Configuration

### 6.1 Route Paths

The admin routes are already defined in `src/config/paths.ts`. **Need to add** the user detail route:

```typescript
// Add to paths.admin in src/config/paths.ts
admin: {
  root: {
    path: '/admin',
    getHref: () => '/admin',
  },
  users: {
    path: '/admin/users',
    getHref: () => '/admin/users',
  },
  userDetail: { // ADD THIS
    path: '/admin/users/:userId',
    getHref: (userId: string) => `/admin/users/${userId}`,
  },
  analytics: {
    path: '/admin/analytics',
    getHref: () => '/admin/analytics',
  },
}
```

### 6.2 Router Configuration

The router in `src/app/router.tsx` already has admin routes. **Need to add** user detail route:

```typescript
// In src/app/router.tsx, add to admin children:
{
  path: paths.admin.userDetail.path, // ADD THIS
  lazy: () => import('./routes/admin/user-detail').then((m) => ({ Component: m.default })),
},
```

### 6.3 Route Components

#### 6.3.1 Admin Dashboard Page

**File**: `src/app/routes/admin/dashboard.tsx`

**Enhancement**: Replace placeholder with real stats

```typescript
import { useDashboardOverview } from '@/features/admin/api/get-dashboard-overview'
import { StatsCard } from '@/features/admin/components/stats-card'
import { Spinner } from '@/components/ui/spinner'

export const AdminDashboardPage = () => {
  const { data, isLoading } = useDashboardOverview()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-slate-600">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          label="TOTAL USERS"
          value={data?.total_users ?? 0}
          description="Total Users"
          trend={{ value: `+${data?.weekly_signups ?? 0} this week`, direction: 'up' }}
        />

        <StatsCard
          label="PROFILE COMPLETION"
          value={`${Math.round((data?.profile_completion_rate ?? 0) * 100)}%`}
          description="Profiles Complete"
          trend={{ value: `${Math.round((data?.profile_completion_rate ?? 0) * data!.total_users)} of ${data?.total_users}`, direction: 'neutral' }}
        />

        <StatsCard
          label="ACTIVE USERS"
          value={`${Math.round((data?.active_users_rate ?? 0) * 100)}%`}
          description="Active Users"
        />
      </div>

      {/* Recent Activity (if available) */}
      {/* Quick Insights (if available) */}
      {/* TODO: Add ActivityFeed and QuickInsights components when backend provides data */}
    </div>
  )
}

export default AdminDashboardPage
```

#### 6.3.2 Admin Users Page

**File**: `src/app/routes/admin/users.tsx`

**Implementation**: User list with search/filters

```typescript
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from '@/hooks/use-debounce'
import { useAdminUsers } from '@/features/admin/api/get-users'
import { UserTable, SearchAndFilters } from '@/features/admin/components'
import { Spinner } from '@/components/ui/spinner'

export const AdminUsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // URL state
  const emailParam = searchParams.get('email') || ''
  const statusParam = searchParams.get('status') || 'all'
  const pageParam = parseInt(searchParams.get('page') || '1', 10)

  // Local state for search input (debounced)
  const [emailSearch, setEmailSearch] = useState(emailParam)
  const debouncedEmail = useDebounce(emailSearch, 300)

  // Filters
  const filters = {
    email: debouncedEmail || undefined,
    is_active:
      statusParam === 'active' ? true : statusParam === 'inactive' ? false : undefined,
    skip: (pageParam - 1) * 20,
    limit: 20,
  }

  const { data, isLoading } = useAdminUsers(filters)

  // Update URL when filters change
  const updateFilter = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      if (value === null || value === '' || value === 'all') {
        prev.delete(key)
      } else {
        prev.set(key, value)
      }
      // Reset to page 1 when filters change
      if (key !== 'page') {
        prev.delete('page')
      }
      return prev
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-slate-600">
            {data ? `${data.total} users` : 'Loading...'}
          </p>
        </div>
      </div>

      <SearchAndFilters
        emailSearch={emailSearch}
        onEmailSearchChange={(value) => {
          setEmailSearch(value)
          updateFilter('email', value)
        }}
        activeFilter={statusParam as 'all' | 'active' | 'inactive'}
        onActiveFilterChange={(value) => updateFilter('status', value)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : (
        <>
          <UserTable users={data?.users ?? []} />

          {/* Pagination */}
          {data && data.total > 20 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600">
                Showing {data.skip + 1}-{Math.min(data.skip + data.limit, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilter('page', String(pageParam - 1))}
                  disabled={pageParam === 1}
                  className="rounded px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => updateFilter('page', String(pageParam + 1))}
                  disabled={data.skip + data.limit >= data.total}
                  className="rounded px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminUsersPage
```

#### 6.3.3 Admin User Detail Page (NEW)

**File**: `src/app/routes/admin/user-detail.tsx`

**Implementation**: User detail with profile and actions

```typescript
import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { paths } from '@/config/paths'
import { useAdminUserDetail } from '@/features/admin/api/get-user-detail'
import { StatusBadge, ProfileHistoryModal, DeactivateUserModal } from '@/features/admin/components'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export const AdminUserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useAdminUserDetail(userId!)

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">User not found.</p>
        <Link to={paths.admin.users.path}>
          <Button variant="secondary" className="mt-4">
            Back to Users
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={paths.admin.users.path}
          className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Users
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">User: {user.email}</h1>
      </div>

      {/* Account Status Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-red-600 hover:text-red-700"
              onClick={() => setIsDeactivateModalOpen(true)}
              disabled={!user.is_active}
            >
              {user.is_active ? 'Deactivate' : 'Already Inactive'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-slate-900">
              {user.is_superuser ? 'Superuser' : 'Regular User'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-slate-900">
              {user.is_verified ? 'Verified Email' : 'Unverified Email'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Profile */}
      {user.profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Current Profile (Version {user.profile.version})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Learning Goal
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {user.profile.learning_goal || '(not set)'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Level
                </p>
                <p className="mt-1 text-sm capitalize text-slate-900">
                  {user.profile.current_level || '(not set)'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Time Commitment
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {user.profile.time_commitment
                    ? `${user.profile.time_commitment} hours/week`
                    : '(not set)'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Interests ({user.profile.interest_count} tags)
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.profile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsHistoryModalOpen(true)}
              >
                View Full Profile History
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-slate-600">
            <p>This user has not set up their profile yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ProfileHistoryModal
        userId={user.id}
        userEmail={user.email}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <DeactivateUserModal
        userId={user.id}
        userEmail={user.email}
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onSuccess={() => navigate(paths.admin.users.path)}
      />
    </div>
  )
}

export default AdminUserDetailPage
```

#### 6.3.4 Admin Analytics Page (Phase 4)

**File**: `src/app/routes/admin/analytics.tsx`

**Enhancement**: Add charts and metrics (Phase 4 - keep as stub for now)

```typescript
// Keep as stub for Phase 4
export const AdminAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-slate-600">Platform usage and engagement insights</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Analytics dashboard coming in Phase 4.</p>
      </div>
    </div>
  )
}

export default AdminAnalyticsPage
```

---

## 7. State Management

### 7.1 Server State (TanStack Query)

All admin data is server state managed by React Query:

| Query Key | Data | Stale Time |
|-----------|------|------------|
| `['admin', 'dashboard']` | Dashboard overview | 5 minutes |
| `['admin', 'users', filters]` | User list | 5 minutes |
| `['admin', 'users', userId]` | User detail | 5 minutes |
| `['admin', 'users', userId, 'profile-history']` | Profile snapshots | 5 minutes |
| `['admin', 'analytics', 'overview']` | Analytics stats | 15 minutes |
| `['admin', 'analytics', 'tags']` | Popular tags | 15 minutes |

**Stale Time Rationale**: Admin data doesn't need real-time updates. 5-15 minute cache reduces API load.

### 7.2 URL State (React Router)

Filter state lives in URL parameters for shareability:

| Route | URL Params | Purpose |
|-------|------------|---------|
| `/admin/users` | `?email=john&status=active&page=2` | User list filters |
| `/admin/analytics` | `?period=30d` | Analytics time range (Phase 4) |

**Implementation Pattern**: Use `useSearchParams` hook to read/write URL state.

### 7.3 Local Component State

Modal open/close state:
- `isHistoryModalOpen`: Profile history modal
- `isDeactivateModalOpen`: Deactivate user modal

**No global state needed** - admin features don't share state across pages.

---

## 8. Backend Requirements

### 8.1 Existing Endpoints (Already Implemented)

These endpoints are ready to use:

| Endpoint | Method | Response Schema |
|----------|--------|-----------------|
| `/admin/users` | GET | `{ users: UserListItem[], total, skip, limit }` |
| `/admin/users/:id` | GET | `{ id, email, is_active, is_superuser, is_verified, profile }` |
| `/admin/users/:id/deactivate` | PATCH | Same as user detail |
| `/admin/users/:id/profile-history` | GET | `{ snapshots: ProfileSnapshot[], count }` |
| `/admin/analytics/overview` | GET | `{ total_users, active_users, superuser_count, ... }` |
| `/admin/analytics/tags/popular` | GET | `{ tags: PopularTag[], total_tags }` |

### 8.2 Missing Endpoints (Need Backend Implementation)

#### 8.2.1 Dashboard Endpoint (NEW)

**Endpoint**: `GET /admin/dashboard/overview`

**Purpose**: Consolidate dashboard metrics + recent activity + insights

**Proposed Response**:
```typescript
{
  total_users: number
  profile_completion_rate: number
  avg_profile_updates: number
  ai_recs_today: number
  weekly_signups: number
  active_users_rate: number
  recent_activity: Array<{
    id: string
    type: 'registration' | 'profile_update' | 'recommendation' | 'deactivation'
    user_email: string
    description: string // e.g., "updated profile (v4)"
    timestamp: string // ISO datetime
  }>
  insights: Array<{
    id: string
    icon: string // emoji
    text: string // e.g., "Top Interest: 'emotional intelligence' (3 users)"
    type: 'positive' | 'warning' | 'info'
  }>
}
```

**Backend Implementation Notes**:
- Combine existing analytics queries
- Add recent activity query (last 10 events from snapshots table + users table)
- Generate insights from data (top tags, power users, profile gaps)

#### 8.2.2 User Reactivation Endpoint (NICE-TO-HAVE)

**Endpoint**: `PATCH /admin/users/:id/activate`

**Purpose**: Reactivate a deactivated user (set `is_active=true`)

**Response**: Same as user detail

---

## 9. Implementation Roadmap

### Phase 1: Core Components & Types (Week 1)

**Goal**: Build foundation components and type definitions

**Tasks**:
1. ✅ Create admin types file (`features/admin/types/index.ts`)
2. ✅ Create AdminSidebar component
3. ✅ Create StatsCard component
4. ✅ Create StatusBadge component
5. ✅ Create ProfileCompleteness component

**Deliverables**: 4 reusable components + complete type definitions

### Phase 2: Dashboard Page (Week 1)

**Goal**: Functional admin dashboard with stats

**Tasks**:
1. Create `get-dashboard-overview` API hook (use existing analytics endpoint temporarily)
2. Enhance `admin/dashboard.tsx` route with StatsCard grid
3. Add loading states and error handling

**Deliverables**: Working dashboard page with 3-6 stats cards

### Phase 3: User Management (Week 2)

**Goal**: User list, detail, and actions

**Tasks**:
1. Create `get-users` API hook
2. Create `get-user-detail` API hook
3. Create `get-user-profile-history` API hook
4. Create `deactivate-user` API hook (mutation)
5. Create SearchAndFilters component
6. Create UserTable + UserTableRow components
7. Create ProfileHistoryModal component
8. Create DeactivateUserModal component
9. Implement `admin/users.tsx` route
10. Create `admin/user-detail.tsx` route (NEW FILE)
11. Add user detail route to router + paths config

**Deliverables**: Complete user management with search, filters, detail view, profile history, and deactivation

### Phase 4: Analytics (Week 3-4 - Optional)

**Goal**: Visual analytics with charts

**Tasks**:
1. Create `get-analytics-overview` API hook
2. Create `get-popular-tags` API hook
3. Create chart components (UserGrowthChart, ProfileBreakdownChart, PopularTagsChart, CategoryBreakdown)
4. Enhance `admin/analytics.tsx` route

**Deliverables**: Analytics page with charts and metrics

---

## Summary

### Files to Create

**API Hooks** (7 files):
1. `features/admin/api/get-users.ts`
2. `features/admin/api/get-user-detail.ts`
3. `features/admin/api/get-user-profile-history.ts`
4. `features/admin/api/deactivate-user.ts`
5. `features/admin/api/get-dashboard-overview.ts`
6. `features/admin/api/get-analytics-overview.ts`
7. `features/admin/api/get-popular-tags.ts`

**Components** (13 files):
1. `features/admin/components/admin-sidebar.tsx`
2. `features/admin/components/stats-card.tsx`
3. `features/admin/components/status-badge.tsx`
4. `features/admin/components/profile-completeness.tsx`
5. `features/admin/components/user-table.tsx`
6. `features/admin/components/user-table-row.tsx`
7. `features/admin/components/search-and-filters.tsx`
8. `features/admin/components/profile-history-modal.tsx`
9. `features/admin/components/deactivate-user-modal.tsx`
10. `features/admin/components/user-growth-chart.tsx` (Phase 4)
11. `features/admin/components/profile-breakdown-chart.tsx` (Phase 4)
12. `features/admin/components/popular-tags-chart.tsx` (Phase 4)
13. `features/admin/components/category-breakdown.tsx` (Phase 4)

**Types** (1 file):
1. `features/admin/types/index.ts`

**Routes** (1 NEW file):
1. `app/routes/admin/user-detail.tsx` (NEW)
2. `app/routes/admin/dashboard.tsx` (ENHANCE EXISTING)
3. `app/routes/admin/users.tsx` (ENHANCE EXISTING)
4. `app/routes/admin/analytics.tsx` (ENHANCE IN PHASE 4)

**Config Updates** (2 files):
1. `config/paths.ts` - Add `admin.userDetail` path
2. `app/router.tsx` - Add user detail route

**Total**: 24 new files + 4 enhanced files

### Backend Requirements

**Existing Endpoints** (6) - Ready to use
**Missing Endpoints** (1-2) - Need backend implementation:
- `GET /admin/dashboard/overview` (consolidate metrics + activity)
- `PATCH /admin/users/:id/activate` (nice-to-have)

---

**Document Status**: Ready for Implementation
**Next Steps**: Start with Phase 1 (core components), then Phase 2 (dashboard), then Phase 3 (user management)
