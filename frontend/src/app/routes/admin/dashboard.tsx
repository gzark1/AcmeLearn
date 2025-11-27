import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminStats,
  useActivityFeed,
  useQuickInsights,
} from '@/features/admin/api'
import {
  StatsCard,
  ActivityFeed,
  QuickInsights,
} from '@/features/admin/components'

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-5 w-48" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
      <Skeleton className="h-[140px]" />
    </div>
  </div>
)

export const AdminDashboardPage = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats()
  const { data: activityData, isLoading: activityLoading } = useActivityFeed(10)
  const { data: insightsData, isLoading: insightsLoading } = useQuickInsights()

  if (statsLoading) {
    return <DashboardSkeleton />
  }

  if (statsError) {
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
          Platform overview and user management
        </p>
      </div>

      {/* Stats Grid - 6 cards in 2 rows */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1 */}
        <StatsCard
          label="Total Users"
          value={stats?.total_users ?? 0}
          description="Registered accounts"
          trend={{
            value: `+${stats?.new_registrations_7d ?? 0} this week`,
            direction: (stats?.new_registrations_7d ?? 0) > 0 ? 'up' : 'neutral',
          }}
        />

        <StatsCard
          label="Profiles Complete"
          value={completionPercentage}
          description="Avg profile completeness"
          trend={{
            value: `${stats?.profiles_complete_count ?? 0} of ${stats?.total_users ?? 0} users`,
            direction: 'neutral',
          }}
        />

        <StatsCard
          label="Avg Profile Updates"
          value={stats?.avg_profile_updates ?? 0}
          description="Updates per user"
          trend={{
            value: 'Profile refinements',
            direction: 'neutral',
          }}
        />

        {/* Row 2 */}
        <StatsCard
          label="AI Recs Today"
          value={0}
          description="Recommendations generated"
          trend={{
            value: 'Coming soon',
            direction: 'neutral',
          }}
        />

        <StatsCard
          label="Signups This Week"
          value={stats?.new_registrations_7d ?? 0}
          description="New registrations"
          trend={{
            value: `${stats?.new_registrations_30d ?? 0} this month`,
            direction: (stats?.new_registrations_7d ?? 0) > 0 ? 'up' : 'neutral',
          }}
        />

        <StatsCard
          label="Active Users"
          value={`${activeRate}%`}
          description="Non-deactivated accounts"
          trend={{
            value: `${stats?.active_users ?? 0} of ${stats?.total_users ?? 0}`,
            direction: activeRate > 90 ? 'up' : 'neutral',
          }}
        />
      </div>

      {/* Quick Insights */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Quick Insights
        </h2>
        <QuickInsights
          insights={insightsData?.insights ?? []}
          isLoading={insightsLoading}
        />
      </div>

      {/* Activity Feed */}
      <ActivityFeed
        events={activityData?.events ?? []}
        isLoading={activityLoading}
      />
    </div>
  )
}

export default AdminDashboardPage
