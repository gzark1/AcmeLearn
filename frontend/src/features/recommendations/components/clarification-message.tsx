import { Link } from 'react-router-dom'
import { LightBulbIcon } from '@heroicons/react/24/outline'

import type { ClarificationResponse } from '../types'

export type ClarificationMessageProps = ClarificationResponse

export const ClarificationMessage = ({ intent, message }: ClarificationMessageProps) => {
  return (
    <div className="mb-8 max-w-[85%] rounded-2xl rounded-bl-sm border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <LightBulbIcon className="h-6 w-6 flex-shrink-0 text-amber-500" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            {intent === 'vague'
              ? "I'd love to help you find the perfect courses!"
              : 'I specialize in course recommendations!'}
          </h3>
          <p className="mt-2 text-base leading-relaxed text-slate-700">{message}</p>

          {intent === 'vague' && (
            <>
              <p className="mt-4 text-sm font-medium text-slate-700">Try being more specific:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm italic text-slate-600">
                <li>"I want to learn Python for data analysis"</li>
                <li>"Help me improve my leadership communication skills"</li>
                <li>"Show me beginner courses in machine learning"</li>
              </ul>
            </>
          )}

          <div className="mt-4">
            {intent === 'vague' ? (
              <Link
                to="/app/profile"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-base font-medium text-white transition-colors hover:bg-blue-700"
              >
                Complete Your Profile
              </Link>
            ) : (
              <Link
                to="/app/courses"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-base font-medium text-white transition-colors hover:bg-blue-700"
              >
                Browse All Courses
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
