import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { ProfileHistoryResponse } from '../types'

export const getProfileHistory = async (): Promise<ProfileHistoryResponse> => {
  return api.get('/profiles/me/history') as Promise<ProfileHistoryResponse>
}

export const useProfileHistory = () => {
  return useQuery({
    queryKey: ['profile', 'history'],
    queryFn: getProfileHistory,
  })
}
