import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { useNotifications } from '@/stores/notifications'

import type { AdminUserDetail } from '../types'

type DeactivateUserInput = {
  userId: string
}

export const deactivateUser = async ({
  userId,
}: DeactivateUserInput): Promise<AdminUserDetail> => {
  return api.patch(`/admin/users/${userId}/deactivate`) as Promise<AdminUserDetail>
}

export const useDeactivateUser = () => {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users', variables.userId],
      })
      addNotification({
        type: 'success',
        title: 'User Deactivated',
        message: 'The user has been deactivated successfully.',
      })
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Deactivation Failed',
        message: 'Failed to deactivate user. Please try again.',
      })
    },
  })
}
