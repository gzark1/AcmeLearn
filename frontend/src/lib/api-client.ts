import Axios, { type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { paths } from '@/config/paths'
import { useNotifications } from '@/stores/notifications'
import { getToken, clearToken } from '@/utils/storage'

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json'

    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
}

export const api = Axios.create({
  baseURL: env.VITE_API_URL,
})

api.interceptors.request.use(authRequestInterceptor)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.detail || error.response?.data?.message || error.message

    useNotifications.getState().addNotification({
      type: 'error',
      title: 'Error',
      message,
    })

    if (error.response?.status === 401) {
      // Clear the invalid token to prevent infinite redirect loop
      clearToken()
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        window.location.href = paths.auth.login.getHref(currentPath)
      }
    }

    return Promise.reject(error)
  }
)
