import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { UserProfile } from '../types'

export const getProfile = async (): Promise<UserProfile> => {
  return api.get('/profiles/me') as Promise<UserProfile>
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })
}
