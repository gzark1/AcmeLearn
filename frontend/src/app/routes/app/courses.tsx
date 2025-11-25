import { useState } from 'react'

import { useCourses } from '@/features/courses/api/get-courses'
import { CourseFilters } from '@/features/courses/components/course-filters'
import { CourseGrid } from '@/features/courses/components/course-grid'
import type { CourseFilters as CourseFiltersType } from '@/features/courses/types'

export const CoursesPage = () => {
  const [filters, setFilters] = useState<CourseFiltersType>({})
  const { data: courses, isLoading } = useCourses(filters)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Course Catalog</h1>
          <p className="mt-1 text-slate-600">Browse our courses</p>
        </div>
        {courses && (
          <p className="text-sm text-slate-500">
            Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Filters */}
      <CourseFilters onFiltersChange={setFilters} />

      {/* Course Grid */}
      <CourseGrid
        courses={courses}
        isLoading={isLoading}
        emptyMessage="No courses match your filters. Try adjusting your search."
      />
    </div>
  )
}

export default CoursesPage
