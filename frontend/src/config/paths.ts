/**
 * Application route paths
 * Each path has a `path` for router definition and `getHref` for navigation
 */
export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  auth: {
    login: {
      path: '/login',
      getHref: (redirectTo?: string | null) =>
        `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    register: {
      path: '/register',
      getHref: (redirectTo?: string | null) =>
        `/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },

  app: {
    dashboard: {
      path: '/dashboard',
      getHref: () => '/dashboard',
    },
    courses: {
      path: '/courses',
      getHref: () => '/courses',
    },
    course: {
      path: '/courses/:courseId',
      getHref: (courseId: string) => `/courses/${courseId}`,
    },
    recommendations: {
      path: '/recommendations',
      getHref: () => '/recommendations',
    },
    profile: {
      path: '/profile',
      getHref: () => '/profile',
    },
    profileHistory: {
      path: '/profile/history',
      getHref: () => '/profile/history',
    },
    settings: {
      path: '/settings',
      getHref: () => '/settings',
    },
  },

  admin: {
    root: {
      path: '/admin',
      getHref: () => '/admin',
    },
    users: {
      path: '/admin/users',
      getHref: () => '/admin/users',
    },
    user: {
      path: '/admin/users/:userId',
      getHref: (userId: string) => `/admin/users/${userId}`,
    },
    analytics: {
      path: '/admin/analytics',
      getHref: () => '/admin/analytics',
    },
  },
} as const
