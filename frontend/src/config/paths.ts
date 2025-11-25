/**
 * Application route paths
 * Centralized to avoid magic strings throughout the app
 */
export const paths = {
  // Public routes
  home: '/',
  login: '/login',
  register: '/register',

  // Protected routes
  dashboard: '/dashboard',
  courses: {
    list: '/courses',
    detail: (id: string) => `/courses/${id}`,
  },
  recommendations: '/recommendations',
  profile: {
    view: '/profile',
    history: '/profile/history',
  },
  settings: '/settings',

  // Admin routes (superuser only)
  admin: {
    dashboard: '/admin',
    users: {
      list: '/admin/users',
      detail: (id: string) => `/admin/users/${id}`,
    },
    analytics: '/admin/analytics',
  },
} as const
