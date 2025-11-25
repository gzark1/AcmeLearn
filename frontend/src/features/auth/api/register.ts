import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { setToken } from '@/utils/storage'

import type { AuthResponse, RegisterData, User } from '../types'

export const registerUser = async (data: RegisterData): Promise<User> => {
  // Register the user
  await api.post('/auth/register', data)

  // Auto-login after registration
  const params = new URLSearchParams()
  params.append('username', data.email)
  params.append('password', data.password)

  // api interceptor returns data directly (not AxiosResponse)
  const authResponse = (await api.post('/auth/jwt/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })) as AuthResponse

  // Store the token
  setToken(authResponse.access_token)

  // Fetch and return the user
  const user = (await api.get('/users/me')) as User
  return user
}

export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (user) => {
      // Update the user query cache
      queryClient.setQueryData(['user'], user)
    },
  })
}
