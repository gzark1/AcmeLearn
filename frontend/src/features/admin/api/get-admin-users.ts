import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { AdminUserListResponse, UserFilters } from '../types'

export const getAdminUsers = async (
  filters: UserFilters = {}
): Promise<AdminUserListResponse> => {
  const params = new URLSearchParams()

  if (filters.email) {
    params.append('email', filters.email)
  }

  if (filters.is_active !== undefined) {
    params.append('is_active', String(filters.is_active))
  }

  if (filters.profile_status) {
    params.append('profile_status', filters.profile_status)
  }

  if (filters.skip !== undefined) {
    params.append('skip', String(filters.skip))
  }

  if (filters.limit !== undefined) {
    params.append('limit', String(filters.limit))
  }

  const queryString = params.toString()
  const url = queryString ? `/admin/users?${queryString}` : '/admin/users'

  return api.get(url) as Promise<AdminUserListResponse>
}

export const useAdminUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => getAdminUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
