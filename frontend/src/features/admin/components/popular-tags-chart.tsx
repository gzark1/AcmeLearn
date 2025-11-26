import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type PopularTag = {
  tag_id: string
  tag_name: string
  tag_category: string
  user_count: number
}

type PopularTagsChartProps = {
  tags: PopularTag[]
  isLoading?: boolean
}

export const PopularTagsChart = ({ tags, isLoading }: PopularTagsChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Tags by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Group tags by category
  const tagsByCategory = useMemo(() => {
    const grouped: Record<string, PopularTag[]> = {}
    for (const tag of tags) {
      if (!grouped[tag.tag_category]) {
        grouped[tag.tag_category] = []
      }
      grouped[tag.tag_category].push(tag)
    }

    // Sort categories by total user count
    const sortedCategories = Object.entries(grouped)
      .map(([category, categoryTags]) => ({
        category,
        tags: categoryTags.slice(0, 3), // Top 3 per category
        totalCount: categoryTags.reduce((sum, t) => sum + t.user_count, 0),
      }))
      .filter((c) => c.totalCount > 0) // Only show categories with selections
      .sort((a, b) => b.totalCount - a.totalCount)

    return sortedCategories
  }, [tags])

  const maxCount = Math.max(...tags.map((t) => t.user_count), 1)

  if (tagsByCategory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Tags by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-slate-500">
            No tag selections yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Tags by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {tagsByCategory.map(({ category, tags: categoryTags }) => (
          <div key={category}>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-900">
              {category.replace(/_/g, ' ')}
            </h4>
            <div className="space-y-2">
              {categoryTags.map((tag) => {
                const widthPercent = (tag.user_count / maxCount) * 100
                return (
                  <div key={tag.tag_id} className="flex items-center gap-3">
                    <span className="w-40 truncate text-sm text-slate-700">
                      {tag.tag_name}
                    </span>
                    <div className="flex-1">
                      <div className="h-5 w-full overflow-hidden rounded bg-slate-100">
                        <div
                          className="h-full bg-violet-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-sm font-medium text-slate-900">
                      {tag.user_count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
