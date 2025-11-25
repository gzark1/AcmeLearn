import { useMemo } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { paths } from '@/config/paths'
import { MainLayout, AdminLayout } from '@/layouts'

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
const SettingsPage = () => import('./routes/app/settings').then((m) => ({ Component: m.default }))
const AdminDashboardPage = () => import('./routes/admin/dashboard').then((m) => ({ Component: m.default }))
const AdminUsersPage = () => import('./routes/admin/users').then((m) => ({ Component: m.default }))
const AdminAnalyticsPage = () => import('./routes/admin/analytics').then((m) => ({ Component: m.default }))

// Mock user for now - will be replaced with real auth in Phase 6
const mockUser = { email: 'demo@acmelearn.com', is_superuser: true }
const handleLogout = () => {
  // Will be implemented in Phase 6
  window.location.href = paths.auth.login.getHref()
}

// App layout wrapper - MainLayout already uses Outlet internally
const AppLayoutWrapper = () => (
  <MainLayout user={mockUser} onLogout={handleLogout} />
)

// Admin layout wrapper - AdminLayout already uses Outlet internally
const AdminLayoutWrapper = () => (
  <AdminLayout user={mockUser} onLogout={handleLogout} />
)

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

    // App routes (will be protected in Phase 6)
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
          path: paths.app.settings.path,
          lazy: SettingsPage,
        },
      ],
    },

    // Admin routes (will be protected + superuser check in Phase 6)
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
