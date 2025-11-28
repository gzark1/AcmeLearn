import { formatDistanceToNow } from 'date-fns'

import { Button } from '@/components/ui/button'

import type { RecommendationRead, ExpandedState } from '../types'
import { ProfileAnalysisCard } from './profile-analysis-summary'
import { ProfileFeedbackBanner } from './profile-feedback-banner'
import { RecommendationCard } from './recommendation-card'
import { LearningPathPreview } from './learning-path-preview'

export type AIResponseProps = {
  data: RecommendationRead
  expanded: ExpandedState
  setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>
}

export const AIResponse = ({ data, expanded, setExpanded }: AIResponseProps) => {
  return (
    <div className="mb-8 max-w-[85%]">
      <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white p-6 shadow-sm">
        {/* Profile Analysis Summary */}
        {data.profile_analysis && <ProfileAnalysisCard analysis={data.profile_analysis} />}

        {/* Profile Feedback Banner (optional) */}
        {data.profile_feedback && <ProfileFeedbackBanner feedback={data.profile_feedback} />}

        {/* Overall Summary */}
        {data.overall_summary && (
          <p className="mb-4 text-base leading-relaxed text-slate-700">{data.overall_summary}</p>
        )}

        {/* Recommendation Cards */}
        <div className="space-y-4">
          {data.courses.map((course, idx) => (
            <RecommendationCard
              key={course.course_id}
              course={course}
              index={idx + 1}
              isExpanded={expanded.explanations.has(course.course_id)}
              onToggleExpand={() => {
                setExpanded((prev) => {
                  const newSet = new Set(prev.explanations)
                  if (newSet.has(course.course_id)) {
                    newSet.delete(course.course_id)
                  } else {
                    newSet.add(course.course_id)
                  }
                  return { ...prev, explanations: newSet }
                })
              }}
              isSelectedForComparison={expanded.comparison.selectedCourseIds.includes(
                course.course_id
              )}
              onToggleComparison={() => {
                setExpanded((prev) => ({
                  ...prev,
                  comparison: {
                    ...prev.comparison,
                    selectedCourseIds: prev.comparison.selectedCourseIds.includes(course.course_id)
                      ? prev.comparison.selectedCourseIds.filter((id) => id !== course.course_id)
                      : [...prev.comparison.selectedCourseIds, course.course_id],
                  },
                }))
              }}
            />
          ))}
        </div>

        {/* Comparison Button */}
        {expanded.comparison.selectedCourseIds.length >= 2 && (
          <Button
            variant="secondary"
            onClick={() =>
              setExpanded((prev) => ({
                ...prev,
                comparison: { ...prev.comparison, isOpen: true },
              }))
            }
            className="mt-4"
          >
            Compare Selected ({expanded.comparison.selectedCourseIds.length})
          </Button>
        )}

        {/* Learning Path Preview */}
        {data.learning_path.length > 0 && (
          <LearningPathPreview
            steps={data.learning_path}
            courses={data.courses}
            isExpanded={expanded.learningPath}
            onToggle={() => setExpanded((prev) => ({ ...prev, learningPath: !prev.learningPath }))}
          />
        )}
      </div>

      <p className="mt-1 text-sm text-slate-500">
        {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
      </p>
    </div>
  )
}
