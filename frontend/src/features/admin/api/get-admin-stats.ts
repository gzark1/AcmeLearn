import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { AnalyticsOverview } from '../types'

export const getAdminStats = async (): Promise<AnalyticsOverview> => {
  return api.get('/admin/analytics/overview') as Promise<AnalyticsOverview>
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
