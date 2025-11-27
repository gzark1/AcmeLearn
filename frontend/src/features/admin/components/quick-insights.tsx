import { Skeleton } from '@/components/ui/skeleton'

import type { InsightItem } from '../api/get-dashboard-data'

type QuickInsightsProps = {
  insights: InsightItem[]
  isLoading?: boolean
}

const insightBorderColor: Record<InsightItem['type'], string> = {
  positive: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
}

const insightBgColor: Record<InsightItem['type'], string> = {
  positive: 'bg-emerald-50',
  warning: 'bg-amber-50',
  info: 'bg-blue-50',
}

const QuickInsightsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-lg border border-slate-200 bg-white p-4"
      >
        <Skeleton className="h-5 w-full" />
      </div>
    ))}
  </div>
)

export const QuickInsights = ({ insights, isLoading }: QuickInsightsProps) => {
  if (isLoading) {
    return <QuickInsightsSkeleton />
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
        No insights available yet. Check back after more users join.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`rounded-lg border border-slate-200 border-l-4 p-4 ${insightBorderColor[insight.type]} ${insightBgColor[insight.type]}`}
        >
          <div className="flex items-start gap-2">
            <span className="text-base">{insight.icon}</span>
            <p className="text-sm text-slate-700">{insight.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
