import { useParams } from 'react-router-dom'

export const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Course Detail</h1>
        <p className="mt-1 text-slate-600">Course ID: {courseId}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">Course detail will be implemented in Phase 7</p>
      </div>
    </div>
  )
}

export default CoursePage
