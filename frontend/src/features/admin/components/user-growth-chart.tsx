import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { UserGrowthDataPoint } from '../api/get-analytics-data'

type UserGrowthChartProps = {
  data: UserGrowthDataPoint[]
  periodDays: number
  isLoading?: boolean
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const UserGrowthChart = ({ data, periodDays, isLoading }: UserGrowthChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Growth (Last {periodDays} Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const values = data.map((d) => d.cumulative_users)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const valueRange = maxValue - minValue || 1

    // Chart dimensions
    const height = 220
    const padding = { top: 20, right: 40, bottom: 40, left: 50 }
    const chartWidth = 800 // SVG viewBox width
    const chartHeight = height
    const plotWidth = chartWidth - padding.left - padding.right
    const plotHeight = chartHeight - padding.top - padding.bottom

    // Calculate points
    const points = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1 || 1)) * plotWidth,
      y: padding.top + plotHeight - ((d.cumulative_users - minValue) / valueRange) * plotHeight,
      date: d.date,
      value: d.cumulative_users,
      newUsers: d.new_users,
    }))

    // Create path
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    // Y-axis ticks (5 ticks)
    const yTicks = Array.from({ length: 5 }, (_, i) => {
      const value = minValue + (valueRange * i) / 4
      const y = padding.top + plotHeight - (i / 4) * plotHeight
      return { value: Math.round(value), y }
    })

    // X-axis labels (show ~6 labels)
    const labelInterval = Math.max(1, Math.floor(data.length / 6))
    const xLabels = data
      .filter((_, i) => i % labelInterval === 0 || i === data.length - 1)
      .map((d) => {
        const originalIndex = data.indexOf(d)
        return {
          label: formatDate(d.date),
          x: padding.left + (originalIndex / (data.length - 1 || 1)) * plotWidth,
        }
      })

    return {
      points,
      pathData,
      yTicks,
      xLabels,
      chartWidth,
      chartHeight,
      padding,
      plotWidth,
      plotHeight,
    }
  }, [data])

  if (!chartData || data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Growth (Last {periodDays} Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] items-center justify-center text-slate-500">
            Not enough data to show growth trend yet.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth (Last {periodDays} Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${chartData.chartWidth} ${chartData.chartHeight}`}
          className="h-[250px] w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {chartData.yTicks.map((tick, i) => (
            <line
              key={i}
              x1={chartData.padding.left}
              y1={tick.y}
              x2={chartData.padding.left + chartData.plotWidth}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {chartData.yTicks.map((tick, i) => (
            <text
              key={i}
              x={chartData.padding.left - 10}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-500 text-xs"
              fontSize="12"
            >
              {tick.value}
            </text>
          ))}

          {/* X-axis labels */}
          {chartData.xLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={chartData.chartHeight - 10}
              textAnchor="middle"
              className="fill-slate-500 text-xs"
              fontSize="12"
            >
              {label.label}
            </text>
          ))}

          {/* Line */}
          <path
            d={chartData.pathData}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.points.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#7c3aed"
                className="cursor-pointer"
              />
              <title>
                {formatDate(point.date)}: {point.value} users (+{point.newUsers} new)
              </title>
            </g>
          ))}
        </svg>

        {/* Summary stats */}
        <div className="mt-4 flex justify-center gap-8 text-sm text-slate-600">
          <div>
            <span className="font-medium text-slate-900">
              {data[data.length - 1]?.cumulative_users ?? 0}
            </span>{' '}
            total users
          </div>
          <div>
            <span className="font-medium text-slate-900">
              +{data.reduce((sum, d) => sum + d.new_users, 0)}
            </span>{' '}
            new in {periodDays} days
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
