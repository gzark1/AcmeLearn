import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { RecommendationListResponse } from '../types'

export const getRecommendations = async (): Promise<RecommendationListResponse> => {
  return api.get('/users/me/recommendations') as Promise<RecommendationListResponse>
}

export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
