import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/config/paths'
import { useProfile } from '@/features/profile/api/get-profile'
import { useProfileHistory } from '@/features/profile/api/get-profile-history'
import { ProfileHistoryTimeline } from '@/features/profile/components/profile-history-timeline'

const ProfileHistorySkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-4 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const ProfileHistoryPage = () => {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: historyData, isLoading: historyLoading, error } = useProfileHistory()

  const isLoading = profileLoading || historyLoading

  if (isLoading) {
    return <ProfileHistorySkeleton />
  }

  if (error || !historyData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Unable to Load History</h2>
          <p className="mt-2 text-slate-600">
            There was an error loading your profile history. Please try again later.
          </p>
          <Link
            to={paths.app.profile.getHref()}
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Profile History</h1>
            {profile && (
              <Badge variant="info">Current: v{profile.version}</Badge>
            )}
          </div>
          <p className="mt-1 text-slate-600">
            Track how your learning profile has evolved over time
          </p>
        </div>
        <Link
          to={paths.app.profile.getHref()}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Profile
        </Link>
      </div>

      {/* Timeline */}
      <ProfileHistoryTimeline
        snapshots={historyData.snapshots}
        currentVersion={profile?.version ?? 1}
      />

      {/* Summary */}
      {historyData.count > 0 && (
        <p className="text-center text-sm text-slate-500">
          {historyData.count} version{historyData.count !== 1 ? 's' : ''} tracked
        </p>
      )}
    </div>
  )
}

export default ProfileHistoryPage
