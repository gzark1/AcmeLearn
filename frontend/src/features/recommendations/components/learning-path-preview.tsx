import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

import { Button } from '@/components/ui/button'

import type { LearningPathStep, RecommendedCourse } from '../types'

export type LearningPathPreviewProps = {
  steps: LearningPathStep[]
  courses: RecommendedCourse[]
  isExpanded: boolean
  onToggle: () => void
}

export const LearningPathPreview = ({
  steps,
  courses,
  isExpanded,
  onToggle,
}: LearningPathPreviewProps) => {
  if (steps.length === 0) return null

  // Calculate total estimated weeks from courses in the learning path
  const totalWeeks = steps.reduce((sum, step) => {
    const course = courses.find((c) => c.course_id === step.course_id)
    return sum + (course?.estimated_weeks || 0)
  }, 0)

  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls="learning-path-content"
        icon={isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        className="w-full justify-between"
      >
        <span>
          View Learning Path ({steps.length} course{steps.length !== 1 ? 's' : ''}
          {totalWeeks > 0 && `, ~${totalWeeks} weeks`})
        </span>
      </Button>

      {isExpanded && (
        <div id="learning-path-content" className="mt-4 space-y-4">
          {steps.map((step) => (
            <div key={step.course_id} className="flex gap-3">
              {/* Step number badge */}
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {step.order}
              </div>
              {/* Step content */}
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{step.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{step.rationale}</p>
              </div>
            </div>
          ))}

          {/* Summary footer */}
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium">Recommended learning path</p>
            <p className="mt-1">
              Complete these {steps.length} courses in order for the best learning experience.
              {totalWeeks > 0 && ` Estimated time: ~${totalWeeks} weeks.`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
