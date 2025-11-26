import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type LevelDistributionProps = {
  beginner: number
  intermediate: number
  advanced: number
  notSet: number
  isLoading?: boolean
}

export const LevelDistribution = ({
  beginner,
  intermediate,
  advanced,
  notSet,
  isLoading,
}: LevelDistributionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Experience Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    )
  }

  const total = beginner + intermediate + advanced + notSet
  const items = [
    { label: 'Beginner', count: beginner, color: 'bg-emerald-500' },
    { label: 'Intermediate', count: intermediate, color: 'bg-violet-500' },
    { label: 'Advanced', count: advanced, color: 'bg-indigo-600' },
    { label: 'Not set', count: notSet, color: 'bg-slate-300' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience Level</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{item.label}</span>
                <span className="font-medium text-slate-900">
                  {percent}% ({item.count})
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full ${item.color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
