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

export type ActivityEventType =
  | 'registration'
  | 'profile_update'
  | 'recommendation'
  | 'deactivation'

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
