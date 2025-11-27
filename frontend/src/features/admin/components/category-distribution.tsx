import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { CategoryDistributionItem } from '../api/get-analytics-data'

type CategoryDistributionProps = {
  categories: CategoryDistributionItem[]
  totalSelections: number
  isLoading?: boolean
}

// Format category names for display
const formatCategoryName = (category: string): string => {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Color palette for categories
const categoryColors: Record<string, string> = {
  PROGRAMMING: 'bg-violet-500',
  DATA_SCIENCE: 'bg-indigo-500',
  DEVOPS: 'bg-blue-500',
  BUSINESS: 'bg-emerald-500',
  MARKETING: 'bg-pink-500',
  DESIGN: 'bg-amber-500',
  SOFT_SKILLS: 'bg-teal-500',
  HR_TALENT: 'bg-rose-500',
  SECURITY: 'bg-red-500',
  SUSTAINABILITY: 'bg-green-500',
  OTHER: 'bg-slate-400',
}

export const CategoryDistribution = ({
  categories,
  totalSelections,
  isLoading,
}: CategoryDistributionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Interest Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Interest Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-slate-500">
            No interest data available yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Category Interest Distribution</CardTitle>
          <span className="text-sm text-slate-500">
            {totalSelections} total selections
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map((item) => {
          const color = categoryColors[item.category] || 'bg-slate-400'
          return (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">
                  {formatCategoryName(item.category)}
                </span>
                <span className="font-medium text-slate-900">
                  {item.percentage}% ({item.count})
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full ${color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
