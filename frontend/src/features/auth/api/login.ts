import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { setToken } from '@/utils/storage'

import type { AuthResponse, LoginCredentials, User } from '../types'

export const loginWithCredentials = async (
  credentials: LoginCredentials
): Promise<User> => {
  // Backend expects form-urlencoded with 'username' field (not 'email')
  const params = new URLSearchParams()
  params.append('username', credentials.email)
  params.append('password', credentials.password)

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

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginWithCredentials,
    onSuccess: (user) => {
      // Update the user query cache
      queryClient.setQueryData(['user'], user)
    },
  })
}
