import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { Course } from '../types'

export const getCourse = async (courseId: string): Promise<Course> => {
  const course = (await api.get(`/api/courses/${courseId}`)) as Course
  return course
}

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(courseId),
    enabled: !!courseId,
  })
}
