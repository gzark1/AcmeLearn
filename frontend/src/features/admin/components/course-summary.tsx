import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { DifficultyStats } from '../api/get-analytics-data'

type CourseSummaryProps = {
  difficultyDistribution: DifficultyStats[]
  totalCourses: number
  totalHours: number
  avgCourseHours: number
  isLoading?: boolean
}

// Format difficulty names for display
const formatDifficulty = (difficulty: string): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

export const CourseSummary = ({
  difficultyDistribution,
  totalCourses,
  totalHours,
  avgCourseHours,
  isLoading,
}: CourseSummaryProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Catalog Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (totalCourses === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Catalog Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-slate-500">
            No courses in the catalog yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Catalog Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Difficulty Distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">
            Difficulty Distribution:
          </h4>
          <div className="space-y-1 pl-2">
            {difficultyDistribution.map((item) => (
              <p key={item.difficulty} className="text-sm text-slate-600">
                {formatDifficulty(item.difficulty)}: {item.count} courses ({item.percentage}%) - Avg {item.avg_hours} hrs
              </p>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-1 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-600">
            <span className="font-medium">Total Duration:</span> ~{totalHours.toLocaleString()} hours of content
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-medium">Avg Course Duration:</span> {avgCourseHours} hours
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
