import { api } from '@/lib/api-client'

import type { UserFilters } from '../types'

export const exportUsers = async (filters: UserFilters = {}): Promise<void> => {
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

  const queryString = params.toString()
  const url = queryString ? `/admin/users/export?${queryString}` : '/admin/users/export'

  // Fetch as blob
  const response = await api.get(url, { responseType: 'blob' })

  // Create download link
  const blob = new Blob([response as unknown as BlobPart], { type: 'text/csv' })
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = 'users.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(downloadUrl)
}
