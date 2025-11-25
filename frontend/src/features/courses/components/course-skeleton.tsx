import { Card } from '@/components/ui/card'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export const CourseSkeleton = () => {
  return (
    <Card className="h-full">
      {/* Title */}
      <Skeleton className="mb-2 h-5 w-3/4" />

      {/* Description */}
      <SkeletonText lines={2} className="mb-4" />

      {/* Difficulty + Duration */}
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </Card>
  )
}

export const CourseDetailSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="mb-2 h-8 w-1/2" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Description */}
      <Card>
        <Skeleton className="mb-3 h-5 w-32" />
        <SkeletonText lines={4} />
      </Card>

      {/* Tags */}
      <Card>
        <Skeleton className="mb-3 h-5 w-16" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-18 rounded-full" />
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <Skeleton className="mb-3 h-5 w-40" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </Card>
    </div>
  )
}
