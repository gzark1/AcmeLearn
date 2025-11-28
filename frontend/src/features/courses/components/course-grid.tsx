import { EmptyState } from '@/components/ui/empty-state'

import type { Course } from '../types'
import { CourseCard } from './course-card'
import { CourseSkeleton } from './course-skeleton'

export type CourseGridProps = {
  courses?: Course[]
  isLoading?: boolean
  emptyMessage?: string
}

export const CourseGrid = ({
  courses,
  isLoading,
  emptyMessage = 'No courses found',
}: CourseGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CourseSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!courses?.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50">
        <EmptyState
          icon={
            <svg
              className="h-12 w-12 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          }
          title="No courses found"
          description={emptyMessage}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
