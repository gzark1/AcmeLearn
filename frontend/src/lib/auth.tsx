import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { paths } from '@/config/paths'
import { Spinner } from '@/components/ui/spinner'
import { clearToken } from '@/utils/storage'
import { useUser } from '@/features/auth/api/get-user'
import type { User } from '@/features/auth/types'

// Re-export hooks from feature
export { useUser } from '@/features/auth/api/get-user'
export { useLogin } from '@/features/auth/api/login'
export { useRegister } from '@/features/auth/api/register'

// Logout hook
export const useLogout = () => {
  const queryClient = useQueryClient()

  const logout = React.useCallback(() => {
    clearToken()
    queryClient.setQueryData(['user'], null)
    queryClient.invalidateQueries({ queryKey: ['user'] })
  }, [queryClient])

  return logout
}

// AuthLoader - loads user on app startup
type AuthLoaderProps = {
  children: React.ReactNode
  renderLoading?: () => React.ReactNode
}

export const AuthLoader = ({ children, renderLoading }: AuthLoaderProps) => {
  const { isLoading } = useUser()

  if (isLoading) {
    if (renderLoading) {
      return <>{renderLoading()}</>
    }
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  return <>{children}</>
}

// ProtectedRoute - redirects to login if not authenticated
type ProtectedRouteProps = {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data: user, isLoading } = useUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
    )
  }

  return <>{children}</>
}

// AdminRoute - requires superuser
type AdminRouteProps = {
  children: React.ReactNode
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { data: user, isLoading } = useUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
    )
  }

  if (!user.is_superuser) {
    return <Navigate to={paths.app.dashboard.getHref()} replace />
  }

  return <>{children}</>
}

// Hook to get current user (throws if not authenticated)
export const useRequiredUser = (): User => {
  const { data: user } = useUser()
  if (!user) {
    throw new Error('User is required but not authenticated')
  }
  return user
}
