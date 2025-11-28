import { cn } from '@/utils/cn'

import type { RecommendationQuota } from '../types'

export type RateLimitIndicatorProps = {
  quota: RecommendationQuota | undefined
}

const getQuotaColor = (remaining: number, limit: number) => {
  const percentage = (remaining / limit) * 100
  if (percentage >= 70) return 'blue'
  if (percentage >= 30) return 'amber'
  return 'red'
}

const colorClasses = {
  blue: {
    text: 'text-blue-700',
    bg: 'bg-blue-500',
  },
  amber: {
    text: 'text-amber-700',
    bg: 'bg-amber-500',
  },
  red: {
    text: 'text-red-700',
    bg: 'bg-red-500',
  },
}

export const RateLimitIndicator = ({ quota }: RateLimitIndicatorProps) => {
  if (!quota) return null

  const color = getQuotaColor(quota.remaining, quota.limit)
  const percentage = (quota.remaining / quota.limit) * 100
  const classes = colorClasses[color]

  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-sm font-medium', classes.text)}>
        {quota.remaining}/{quota.limit} remaining
      </span>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn('h-full transition-all', classes.bg)}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={quota.remaining}
          aria-valuemin={0}
          aria-valuemax={quota.limit}
          aria-label="Recommendation quota"
        />
      </div>
    </div>
  )
}
