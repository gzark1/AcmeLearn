import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { RecommendationQuota } from '../types'

export const getQuota = async (): Promise<RecommendationQuota> => {
  return api.get('/users/me/recommendation-quota') as Promise<RecommendationQuota>
}

export const useQuota = () => {
  return useQuery({
    queryKey: ['recommendation-quota'],
    queryFn: getQuota,
    refetchInterval: 60000, // Poll every 60s
    staleTime: 30000, // Consider stale after 30s
  })
}
