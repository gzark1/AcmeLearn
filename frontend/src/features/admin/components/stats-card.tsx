import { cn } from '@/utils/cn'

type TrendDirection = 'up' | 'down' | 'neutral'

type StatsCardProps = {
  label: string
  value: number | string
  description: string
  trend?: {
    value: string
    direction: TrendDirection
  }
  icon?: React.ReactNode
}

export const StatsCard = ({
  label,
  value,
  description,
  trend,
  icon,
}: StatsCardProps) => {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-slate-500',
  }

  const trendIcons = {
    up: '\u2191',
    down: '\u2193',
    neutral: '\u2192',
  }

  return (
    <div className="min-h-[140px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {icon && <div className="mb-2">{icon}</div>}

      <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </h3>

      <p className="mt-2 text-5xl font-bold leading-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-600">{description}</p>

      {trend && (
        <p className={cn('mt-3 text-xs', trendColors[trend.direction])}>
          <span aria-hidden="true">{trendIcons[trend.direction]} </span>
          {trend.value}
        </p>
      )}
    </div>
  )
}
