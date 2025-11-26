import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { ProfileHistoryResponse } from '../types'

export const getUserProfileHistory = async (
  userId: string,
  limit: number = 50
): Promise<ProfileHistoryResponse> => {
  return api.get(
    `/admin/users/${userId}/profile-history?limit=${limit}`
  ) as Promise<ProfileHistoryResponse>
}

export const useUserProfileHistory = (userId: string, limit?: number) => {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'profile-history', limit],
    queryFn: () => getUserProfileHistory(userId, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}
