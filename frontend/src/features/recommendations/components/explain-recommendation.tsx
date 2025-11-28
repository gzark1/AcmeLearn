import type { RecommendedCourse } from '../types'

export type ExplainRecommendationProps = {
  course: RecommendedCourse
}

export const ExplainRecommendation = ({ course }: ExplainRecommendationProps) => {
  return (
    <div
      id={`explanation-${course.course_id}`}
      className="mt-4 border-t border-slate-200 pt-4"
    >
      <h4 className="text-sm font-semibold text-slate-900">Deep Dive</h4>
      <div className="mt-2 space-y-3 text-sm text-slate-600">
        <div>
          <p className="font-medium text-slate-700">How this aligns with your goals:</p>
          <p className="mt-1">{course.explanation}</p>
        </div>

        {course.skill_gaps_addressed.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">Skills you'll develop:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              {course.skill_gaps_addressed.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>
        )}

        {course.estimated_weeks && (
          <div>
            <p className="font-medium text-slate-700">Time investment:</p>
            <p className="mt-1">
              Approximately {course.estimated_weeks} week{course.estimated_weeks !== 1 ? 's' : ''} to complete
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
