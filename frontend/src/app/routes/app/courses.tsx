import { useState, useMemo } from 'react'

import { useCourses } from '@/features/courses/api/get-courses'
import { CourseFilters } from '@/features/courses/components/course-filters'
import { CourseGrid } from '@/features/courses/components/course-grid'
import type { Course, CourseFilters as CourseFiltersType, DurationRange, SortOption } from '@/features/courses/types'

// Duration filter helpers
const getDurationRange = (duration: number): DurationRange => {
  if (duration < 30) return 'short'
  if (duration <= 60) return 'medium'
  return 'long'
}

const matchesDuration = (course: Course, durationFilter?: DurationRange): boolean => {
  if (!durationFilter) return true
  return getDurationRange(course.duration) === durationFilter
}

// Search filter helper
const matchesSearch = (course: Course, searchTerm?: string): boolean => {
  if (!searchTerm) return true
  const term = searchTerm.toLowerCase()
  return (
    course.title.toLowerCase().includes(term) ||
    course.description.toLowerCase().includes(term) ||
    course.tags.some((tag) => tag.name.toLowerCase().includes(term))
  )
}

// Sorting helpers
const DIFFICULTY_ORDER = { beginner: 1, intermediate: 2, advanced: 3 }

const sortCourses = (courses: Course[], sortOption?: SortOption): Course[] => {
  if (!sortOption) return courses

  const sorted = [...courses]

  switch (sortOption) {
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'duration-asc':
      return sorted.sort((a, b) => a.duration - b.duration)
    case 'duration-desc':
      return sorted.sort((a, b) => b.duration - a.duration)
    case 'difficulty':
      return sorted.sort(
        (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
      )
    default:
      return sorted
  }
}

export const CoursesPage = () => {
  const [filters, setFilters] = useState<CourseFiltersType>({})

  // Fetch courses with server-side filters (difficulty, tagIds)
  const { data: courses, isLoading } = useCourses({
    difficulty: filters.difficulty,
    tagIds: filters.tagIds,
  })

  // Apply client-side filters (duration, search) and sorting
  const filteredAndSortedCourses = useMemo(() => {
    if (!courses) return []

    // Apply duration filter
    let result = courses.filter((course) => matchesDuration(course, filters.duration))

    // Apply search filter
    result = result.filter((course) => matchesSearch(course, filters.search))

    // Apply sorting
    result = sortCourses(result, filters.sort)

    return result
  }, [courses, filters.duration, filters.search, filters.sort])

  // Total courses (before client-side filtering)
  const totalCourses = courses?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Course Catalog</h1>
        <p className="mt-1 text-slate-600">Browse our courses</p>
      </div>

      {/* Filters */}
      <CourseFilters
        onFiltersChange={setFilters}
        totalCourses={totalCourses}
        filteredCount={filteredAndSortedCourses.length}
      />

      {/* Course Grid */}
      <CourseGrid
        courses={filteredAndSortedCourses}
        isLoading={isLoading}
        emptyMessage="No courses match your filters. Try adjusting your search."
      />
    </div>
  )
}

export default CoursesPage
