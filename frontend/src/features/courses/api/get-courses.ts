import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { Course, CourseFilters } from '../types'

export const getCourses = async (filters: CourseFilters): Promise<Course[]> => {
  const params = new URLSearchParams()

  if (filters.difficulty) {
    params.append('difficulty', filters.difficulty)
  }

  if (filters.tagIds?.length) {
    filters.tagIds.forEach((id) => params.append('tag_ids', id))
  }

  const queryString = params.toString()
  const url = queryString ? `/api/courses?${queryString}` : '/api/courses'

  const courses = (await api.get(url)) as Course[]
  return courses
}

export const useCourses = (filters: CourseFilters = {}) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => getCourses(filters),
  })
}
