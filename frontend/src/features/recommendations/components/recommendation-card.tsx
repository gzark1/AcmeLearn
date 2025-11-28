import { Link } from 'react-router-dom'
import { StarIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid'

import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'
import { cn } from '@/utils/cn'

import type { RecommendedCourse } from '../types'
import { ExplainRecommendation } from './explain-recommendation'

export type RecommendationCardProps = {
  course: RecommendedCourse
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
  // Comparison feature - hidden until fully implemented
  isSelectedForComparison?: boolean
  onToggleComparison?: () => void
  showComparison?: boolean
}

const getMatchScoreColor = (score: number) => {
  if (score >= 0.9) return 'text-emerald-600'
  if (score >= 0.75) return 'text-blue-600'
  return 'text-amber-600'
}

export const RecommendationCard = ({
  course,
  index,
  isExpanded,
  onToggleExpand,
  isSelectedForComparison = false,
  onToggleComparison,
  showComparison = false,
}: RecommendationCardProps) => {
  const matchScoreColor = getMatchScoreColor(course.match_score)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            {index}. {course.title}
          </h3>
          <p className={cn('mt-1 flex items-center gap-1 text-sm font-medium', matchScoreColor)}>
            <StarIcon className="h-4 w-4" />
            {Math.round(course.match_score * 100)}% Match
          </p>
        </div>
        {/* Comparison Checkbox - hidden until feature is fully implemented */}
        {showComparison && onToggleComparison && (
          <input
            type="checkbox"
            checked={isSelectedForComparison}
            onChange={onToggleComparison}
            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            aria-label={`Select ${course.title} for comparison`}
          />
        )}
      </div>

      {/* Explanation */}
      <div className="mb-3">
        <p className="text-sm font-medium text-slate-700">Why this course?</p>
        <p className="mt-1 text-base leading-relaxed text-slate-600">{course.explanation}</p>
      </div>

      {/* Skill Gaps Addressed */}
      {course.skill_gaps_addressed.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-slate-700">Addresses your skill gaps:</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
            {course.skill_gaps_addressed.map((gap, idx) => (
              <li key={idx}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata */}
      {course.estimated_weeks && (
        <div className="flex items-center gap-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
          <span className="italic">~{course.estimated_weeks} weeks</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <Link
          to={paths.app.course.getHref(course.course_id)}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          View Course Details
        </Link>
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleExpand}
          icon={isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          aria-expanded={isExpanded}
          aria-controls={`explanation-${course.course_id}`}
        >
          {isExpanded ? 'Hide Details' : 'Explain This'}
        </Button>
      </div>

      {/* Expandable Deep Dive */}
      {isExpanded && <ExplainRecommendation course={course} />}
    </div>
  )
}
