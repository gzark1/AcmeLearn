import { useParams } from 'react-router-dom'

import { useCourse } from '@/features/courses/api/get-course'
import { CourseDetail } from '@/features/courses/components/course-detail'
import { CourseDetailSkeleton } from '@/features/courses/components/course-skeleton'

export const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: course, isLoading, error } = useCourse(courseId || '')

  if (isLoading) {
    return <CourseDetailSkeleton />
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Course Not Found</h2>
          <p className="mt-2 text-slate-600">
            The course you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  return <CourseDetail course={course} />
}

export default CoursePage
