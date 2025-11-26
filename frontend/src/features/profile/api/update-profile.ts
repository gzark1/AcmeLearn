import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { useNotifications } from '@/stores/notifications'

import type { ProfileUpdate, UserProfile } from '../types'

export const updateProfile = async (data: ProfileUpdate): Promise<UserProfile> => {
  return api.patch('/profiles/me', data) as Promise<UserProfile>
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been saved successfully.',
      })
    },
  })
}
