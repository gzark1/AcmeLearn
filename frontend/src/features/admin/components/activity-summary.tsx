import type { AdminUserDetail } from '../types'

type ActivitySummaryProps = {
  user: AdminUserDetail
}

const formatDate = (dateStr: string): string => {
  const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`
  const date = new Date(utcDateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatRelativeTime = (dateStr: string): string => {
  const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`
  const date = new Date(utcDateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  return formatDate(dateStr)
}

export const ActivitySummary = ({ user }: ActivitySummaryProps) => {
  const profileVersion = user.profile?.version ?? 0
  const profileUpdates = profileVersion > 0 ? profileVersion - 1 : 0

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        Activity Summary
      </h3>
      <div className="space-y-3">
        {/* Member Since */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Member Since</span>
          <span className="text-sm font-medium text-slate-900">
            {formatDate(user.created_at)}
          </span>
        </div>

        {/* Profile Updates */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Profile Updates</span>
          <span className="text-sm font-medium text-slate-900">
            {profileUpdates} update{profileUpdates !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Last Updated */}
        {user.profile?.updated_at && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Last Updated</span>
            <span className="text-sm font-medium text-slate-900">
              {formatRelativeTime(user.profile.updated_at)}
            </span>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">AI Recommendations</span>
          <span className="text-sm font-medium text-slate-900">
            {user.recommendation_count} generated
          </span>
        </div>
      </div>
    </div>
  )
}
