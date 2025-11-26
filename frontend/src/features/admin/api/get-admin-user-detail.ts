import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { AdminUserDetail } from '../types'

export const getAdminUserDetail = async (
  userId: string
): Promise<AdminUserDetail> => {
  return api.get(`/admin/users/${userId}`) as Promise<AdminUserDetail>
}

export const useAdminUserDetail = (userId: string) => {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => getAdminUserDetail(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
