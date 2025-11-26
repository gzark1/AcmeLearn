import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type TimeDistributionProps = {
  hours1to5: number
  hours5to10: number
  hours10to20: number
  hours20Plus: number
  notSet: number
  isLoading?: boolean
}

export const TimeDistribution = ({
  hours1to5,
  hours5to10,
  hours10to20,
  hours20Plus,
  notSet,
  isLoading,
}: TimeDistributionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Commitment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    )
  }

  const total = hours1to5 + hours5to10 + hours10to20 + hours20Plus + notSet
  const items = [
    { label: '1-5 hrs/week', count: hours1to5, color: 'bg-teal-400' },
    { label: '5-10 hrs/week', count: hours5to10, color: 'bg-violet-400' },
    { label: '10-20 hrs/week', count: hours10to20, color: 'bg-violet-500' },
    { label: '20+ hrs/week', count: hours20Plus, color: 'bg-violet-600' },
    { label: 'Not set', count: notSet, color: 'bg-slate-300' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Commitment</CardTitle>
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
