import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { ProfileSnapshot } from '../types'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const TIME_LABELS: Record<string, string> = {
  '1-5': '1-5 hrs/week',
  '5-10': '5-10 hrs/week',
  '10-20': '10-20 hrs/week',
  '20+': '20+ hrs/week',
}

type VersionChange = {
  field: string
  from: string | null
  to: string | null
}

const computeChanges = (
  current: ProfileSnapshot,
  previous: ProfileSnapshot | null
): VersionChange[] => {
  if (!previous) {
    return [{ field: 'Profile', from: null, to: 'created' }]
  }

  const changes: VersionChange[] = []

  if (current.learning_goal !== previous.learning_goal) {
    changes.push({
      field: 'Learning Goal',
      from: previous.learning_goal ? 'previous goal' : 'empty',
      to: current.learning_goal ? 'updated' : 'cleared',
    })
  }

  if (current.current_level !== previous.current_level) {
    changes.push({
      field: 'Level',
      from: previous.current_level ? LEVEL_LABELS[previous.current_level] : 'not set',
      to: current.current_level ? LEVEL_LABELS[current.current_level] : 'not set',
    })
  }

  if (current.time_commitment !== previous.time_commitment) {
    changes.push({
      field: 'Time',
      from: previous.time_commitment ? TIME_LABELS[previous.time_commitment] : 'not set',
      to: current.time_commitment ? TIME_LABELS[current.time_commitment] : 'not set',
    })
  }

  // Compare interests
  const prevInterests = new Set(previous.interests_snapshot)
  const currInterests = new Set(current.interests_snapshot)
  const added = current.interests_snapshot.filter((i) => !prevInterests.has(i))
  const removed = previous.interests_snapshot.filter((i) => !currInterests.has(i))

  if (added.length > 0 || removed.length > 0) {
    const parts: string[] = []
    if (added.length > 0) parts.push(`+${added.length} added`)
    if (removed.length > 0) parts.push(`-${removed.length} removed`)
    changes.push({
      field: 'Interests',
      from: `${previous.interests_snapshot.length} interests`,
      to: parts.join(', '),
    })
  }

  return changes
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}

type TimelineItemProps = {
  snapshot: ProfileSnapshot
  previousSnapshot: ProfileSnapshot | null
  isLast: boolean
  currentVersion: number
}

const TimelineItem = ({
  snapshot,
  previousSnapshot,
  isLast,
  currentVersion,
}: TimelineItemProps) => {
  const isCurrent = snapshot.version === currentVersion
  const changes = computeChanges(snapshot, previousSnapshot)

  return (
    <div className="relative flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div
          className={`z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
            isCurrent
              ? 'border-blue-600 bg-blue-600'
              : 'border-slate-300 bg-white'
          }`}
        >
          {isCurrent && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
        </div>
        {/* Line */}
        {!isLast && <div className="w-0.5 flex-1 bg-slate-200" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isCurrent ? 'text-blue-600' : 'text-slate-700'}`}>
              Version {snapshot.version}
            </span>
            {isCurrent && (
              <Badge variant="primary" className="text-xs">
                Current
              </Badge>
            )}
          </div>
          <span className="text-sm text-slate-500">{formatDate(snapshot.created_at)}</span>
        </div>

        {/* Snapshot details */}
        <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {/* Learning Goal */}
          {snapshot.learning_goal && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-500">Learning Goal</span>
              <p className="mt-0.5 line-clamp-2 text-sm text-slate-700">{snapshot.learning_goal}</p>
            </div>
          )}

          {/* Level and Time */}
          <div className="flex flex-wrap gap-4">
            {snapshot.current_level && (
              <div>
                <span className="text-xs font-medium uppercase text-slate-500">Level</span>
                <p className="mt-0.5 text-sm text-slate-700">
                  {LEVEL_LABELS[snapshot.current_level]}
                </p>
              </div>
            )}
            {snapshot.time_commitment && (
              <div>
                <span className="text-xs font-medium uppercase text-slate-500">Time</span>
                <p className="mt-0.5 text-sm text-slate-700">
                  {TIME_LABELS[snapshot.time_commitment]}
                </p>
              </div>
            )}
          </div>

          {/* Interests */}
          {snapshot.interests_snapshot.length > 0 && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-500">Interests</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {snapshot.interests_snapshot.slice(0, 5).map((interest, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {snapshot.interests_snapshot.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{snapshot.interests_snapshot.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!snapshot.learning_goal &&
            !snapshot.current_level &&
            !snapshot.time_commitment &&
            snapshot.interests_snapshot.length === 0 && (
              <p className="text-sm italic text-slate-400">Empty profile</p>
            )}
        </div>

        {/* Changes */}
        {changes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {changes.map((change, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                {change.field}: {change.to}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export type ProfileHistoryTimelineProps = {
  snapshots: ProfileSnapshot[]
  currentVersion: number
}

export const ProfileHistoryTimeline = ({
  snapshots,
  currentVersion,
}: ProfileHistoryTimelineProps) => {
  const [showAll, setShowAll] = useState(false)
  const INITIAL_DISPLAY = 5

  // Snapshots are ordered by version desc (newest first)
  const displaySnapshots = showAll ? snapshots : snapshots.slice(0, INITIAL_DISPLAY)
  const hasMore = snapshots.length > INITIAL_DISPLAY

  if (snapshots.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-slate-600">No profile history available yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          Your profile history will appear here after you make changes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-0">
        {displaySnapshots.map((snapshot, index) => {
          // Previous snapshot is the next one in the array (since sorted desc)
          const previousSnapshot = snapshots[index + 1] || null
          return (
            <TimelineItem
              key={snapshot.id}
              snapshot={snapshot}
              previousSnapshot={previousSnapshot}
              isLast={index === displaySnapshots.length - 1}
              currentVersion={currentVersion}
            />
          )
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" size="sm" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Less' : `Show All ${snapshots.length} Versions`}
          </Button>
        </div>
      )}
    </div>
  )
}
