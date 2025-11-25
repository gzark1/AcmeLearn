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
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
        <p className="text-slate-500">{emptyMessage}</p>
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
