import { useMemo } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { paths } from '@/config/paths'
import { MainLayout, AdminLayout } from '@/layouts'
import { ProtectedRoute, AdminRoute, useUser, useLogout } from '@/lib/auth'

// Lazy load pages
const LandingPage = () => import('./routes/landing').then((m) => ({ Component: m.default }))
const NotFoundPage = () => import('./routes/not-found').then((m) => ({ Component: m.default }))
const LoginPage = () => import('./routes/auth/login').then((m) => ({ Component: m.default }))
const RegisterPage = () => import('./routes/auth/register').then((m) => ({ Component: m.default }))
const DashboardPage = () => import('./routes/app/dashboard').then((m) => ({ Component: m.default }))
const CoursesPage = () => import('./routes/app/courses').then((m) => ({ Component: m.default }))
const CoursePage = () => import('./routes/app/course').then((m) => ({ Component: m.default }))
const RecommendationsPage = () => import('./routes/app/recommendations').then((m) => ({ Component: m.default }))
const ProfilePage = () => import('./routes/app/profile').then((m) => ({ Component: m.default }))
const ProfileHistoryPage = () => import('./routes/app/profile-history').then((m) => ({ Component: m.default }))
const SettingsPage = () => import('./routes/app/settings').then((m) => ({ Component: m.default }))
const AdminDashboardPage = () => import('./routes/admin/dashboard').then((m) => ({ Component: m.default }))
const AdminUsersPage = () => import('./routes/admin/users').then((m) => ({ Component: m.default }))
const AdminAnalyticsPage = () => import('./routes/admin/analytics').then((m) => ({ Component: m.default }))

// App layout wrapper with real auth
const AppLayoutWrapper = () => {
  const { data: user } = useUser()
  const logout = useLogout()

  const handleLogout = () => {
    logout()
    window.location.href = paths.auth.login.getHref()
  }

  return (
    <ProtectedRoute>
      <MainLayout user={user ?? undefined} onLogout={handleLogout} />
    </ProtectedRoute>
  )
}

// Admin layout wrapper with real auth + superuser check
const AdminLayoutWrapper = () => {
  const { data: user } = useUser()
  const logout = useLogout()

  const handleLogout = () => {
    logout()
    window.location.href = paths.auth.login.getHref()
  }

  return (
    <AdminRoute>
      <AdminLayout user={user ?? undefined} onLogout={handleLogout} />
    </AdminRoute>
  )
}

const createAppRouter = () =>
  createBrowserRouter([
    // Public routes
    {
      path: paths.home.path,
      lazy: LandingPage,
    },
    {
      path: paths.auth.login.path,
      lazy: LoginPage,
    },
    {
      path: paths.auth.register.path,
      lazy: RegisterPage,
    },

    // App routes (protected)
    {
      element: <AppLayoutWrapper />,
      children: [
        {
          path: paths.app.dashboard.path,
          lazy: DashboardPage,
        },
        {
          path: paths.app.courses.path,
          lazy: CoursesPage,
        },
        {
          path: paths.app.course.path,
          lazy: CoursePage,
        },
        {
          path: paths.app.recommendations.path,
          lazy: RecommendationsPage,
        },
        {
          path: paths.app.profile.path,
          lazy: ProfilePage,
        },
        {
          path: paths.app.profileHistory.path,
          lazy: ProfileHistoryPage,
        },
        {
          path: paths.app.settings.path,
          lazy: SettingsPage,
        },
      ],
    },

    // Admin routes (protected + superuser check)
    {
      element: <AdminLayoutWrapper />,
      children: [
        {
          path: paths.admin.root.path,
          lazy: AdminDashboardPage,
        },
        {
          path: paths.admin.users.path,
          lazy: AdminUsersPage,
        },
        {
          path: paths.admin.analytics.path,
          lazy: AdminAnalyticsPage,
        },
      ],
    },

    // 404
    {
      path: '*',
      lazy: NotFoundPage,
    },
  ])

export const AppRouter = () => {
  const router = useMemo(() => createAppRouter(), [])
  return <RouterProvider router={router} />
}
