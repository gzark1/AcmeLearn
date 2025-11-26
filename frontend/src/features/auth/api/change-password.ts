import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { useNotifications } from '@/stores/notifications'

type ChangePasswordData = {
  old_password: string
  new_password: string
}

export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  await api.post('/users/me/change-password', data)
}

export const useChangePassword = () => {
  const { addNotification } = useNotifications()

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been updated successfully.',
      })
    },
  })
}
