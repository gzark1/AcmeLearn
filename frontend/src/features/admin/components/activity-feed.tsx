import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { ActivityLogItem } from '../api/get-dashboard-data'

type ActivityFeedProps = {
  events: ActivityLogItem[]
  isLoading?: boolean
}

const formatRelativeTime = (dateStr: string): string => {
  // Ensure the date is parsed as UTC by appending Z if not present
  const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`
  const date = new Date(utcDateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

const eventDotColor: Record<ActivityLogItem['event_type'], string> = {
  registration: 'bg-emerald-500',
  profile_update: 'bg-violet-500',
  recommendation: 'bg-blue-500',
  deactivation: 'bg-red-500',
}

const ActivityFeedSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-2 w-2 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export const ActivityFeed = ({ events, isLoading }: ActivityFeedProps) => {
  if (isLoading) {
    return <ActivityFeedSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No recent activity to display.
          </div>
        ) : (
          <div className="max-h-[400px] space-y-0 overflow-y-auto">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`flex gap-3 py-3 ${
                  index < events.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <div
                  className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                    eventDotColor[event.event_type]
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{event.user_email}</span>{' '}
                    {event.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatRelativeTime(event.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
