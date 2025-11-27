import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

// ============================================================================
// Activity Feed
// ============================================================================

export type ActivityLogItem = {
  id: string
  event_type: 'registration' | 'profile_update' | 'recommendation' | 'deactivation'
  user_id: string
  user_email: string
  description: string
  created_at: string
}

export type ActivityFeedResponse = {
  events: ActivityLogItem[]
  count: number
}

export const getActivityFeed = async (
  limit: number = 10
): Promise<ActivityFeedResponse> => {
  return api.get(`/admin/dashboard/activity?limit=${limit}`) as Promise<ActivityFeedResponse>
}

export const useActivityFeed = (limit: number = 10) => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'activity', limit],
    queryFn: () => getActivityFeed(limit),
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for activity
  })
}

// ============================================================================
// Quick Insights
// ============================================================================

export type InsightItem = {
  icon: string // emoji
  text: string
  type: 'positive' | 'warning' | 'info'
}

export type InsightsResponse = {
  insights: InsightItem[]
}

export const getQuickInsights = async (): Promise<InsightsResponse> => {
  return api.get('/admin/dashboard/insights') as Promise<InsightsResponse>
}

export const useQuickInsights = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'insights'],
    queryFn: getQuickInsights,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
