import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type ProfileBreakdownChartProps = {
  complete: number
  partial: number
  empty: number
  total: number
  isLoading?: boolean
}

export const ProfileBreakdownChart = ({
  complete,
  partial,
  empty,
  total,
  isLoading,
}: ProfileBreakdownChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-44" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const completePercent = total > 0 ? Math.round((complete / total) * 100) : 0
  const partialPercent = total > 0 ? Math.round((partial / total) * 100) : 0
  const emptyPercent = total > 0 ? Math.round((empty / total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stacked Bar */}
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {completePercent > 0 && (
            <div
              className="flex items-center justify-center bg-violet-500 text-xs font-medium text-white"
              style={{ width: `${completePercent}%` }}
            >
              {completePercent >= 10 && `${completePercent}%`}
            </div>
          )}
          {partialPercent > 0 && (
            <div
              className="flex items-center justify-center bg-amber-400 text-xs font-medium text-slate-900"
              style={{ width: `${partialPercent}%` }}
            >
              {partialPercent >= 10 && `${partialPercent}%`}
            </div>
          )}
          {emptyPercent > 0 && (
            <div
              className="flex items-center justify-center bg-slate-300 text-xs font-medium text-slate-700"
              style={{ width: `${emptyPercent}%` }}
            >
              {emptyPercent >= 10 && `${emptyPercent}%`}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-violet-500" />
            <span className="text-sm text-slate-700">
              Complete ({complete})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="text-sm text-slate-700">
              Partial ({partial})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-300" />
            <span className="text-sm text-slate-700">
              Empty ({empty})
            </span>
          </div>
        </div>

        {/* Screen reader text */}
        <div className="sr-only">
          Profile completion breakdown: {completePercent}% complete ({complete} users),{' '}
          {partialPercent}% partial ({partial} users), {emptyPercent}% empty ({empty} users).
        </div>
      </CardContent>
    </Card>
  )
}
