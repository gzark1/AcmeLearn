import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getToken } from '@/utils/storage'

import type { User } from '../types'

export const getUser = async (): Promise<User | null> => {
  const token = getToken()
  if (!token) {
    return null
  }

  try {
    // api interceptor returns data directly (not AxiosResponse)
    const user = (await api.get('/users/me')) as User
    return user
  } catch {
    // If token is invalid or expired, return null
    return null
  }
}

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    staleTime: Infinity, // User data doesn't go stale automatically
  })
}
