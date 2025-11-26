import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStats } from '@/features/admin/api'
import { StatsCard } from '@/features/admin/components'

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-5 w-48" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
    </div>
  </div>
)

export const AdminDashboardPage = () => {
  const { data: stats, isLoading, error } = useAdminStats()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">Failed to load admin statistics.</p>
      </div>
    )
  }

  const completionPercentage = stats?.profile_completion_rate
    ? `${Math.round(stats.profile_completion_rate * 100)}%`
    : '0%'

  const activeRate = stats
    ? Math.round((stats.active_users / (stats.total_users || 1)) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-slate-600">
          System overview and user management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Users"
          value={stats?.total_users ?? 0}
          description="Registered accounts"
          trend={{
            value: `${stats?.active_users ?? 0} active`,
            direction: 'neutral',
          }}
        />

        <StatsCard
          label="Active Users"
          value={stats?.active_users ?? 0}
          description={`${activeRate}% of all users`}
          trend={{
            value: 'Currently active',
            direction: 'up',
          }}
        />

        <StatsCard
          label="Profile Completion"
          value={completionPercentage}
          description="Avg profile completeness"
          trend={{
            value: 'With learning goals',
            direction: 'neutral',
          }}
        />

        <StatsCard
          label="Superusers"
          value={stats?.superuser_count ?? 0}
          description="Admin accounts"
          trend={{
            value: 'Platform admins',
            direction: 'neutral',
          }}
        />
      </div>

      {/* Quick Stats Summary */}
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-6">
        <h2 className="text-lg font-semibold text-violet-900">
          Platform Summary
        </h2>
        <p className="mt-2 text-sm text-violet-700">
          Your platform has <strong>{stats?.total_users ?? 0}</strong> registered
          users, of which <strong>{stats?.active_users ?? 0}</strong> are
          currently active. The average profile completion rate is{' '}
          <strong>{completionPercentage}</strong>.
        </p>
      </div>
    </div>
  )
}

export default AdminDashboardPage
