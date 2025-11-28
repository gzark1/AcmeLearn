import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'
import { paths } from '@/config/paths'

import type { Course } from '../types'
import { DifficultyBadge } from './difficulty-badge'
import { ExpandableTags } from './expandable-tags'

export type CourseCardProps = {
  course: Course
}

export const CourseCard = ({ course }: CourseCardProps) => {
  // Check if title is likely truncated (longer than ~40 chars)
  const isTitleLong = course.title.length > 40
  // Check if description is likely truncated (longer than ~100 chars for 3 lines)
  const isDescriptionLong = course.description.length > 100

  return (
    <Link to={paths.app.course.getHref(course.id)} className="block h-full">
      <Card className="flex h-full min-h-[20rem] flex-col transition-shadow hover:shadow-md">
        {/* Title with Tooltip */}
        {isTitleLong ? (
          <Tooltip content={course.title} position="top">
            <h3 className="mb-2 line-clamp-2 min-h-[3.5rem] cursor-help text-lg font-semibold text-slate-900">
              {course.title}
            </h3>
          </Tooltip>
        ) : (
          <h3 className="mb-2 line-clamp-2 min-h-[3.5rem] text-lg font-semibold text-slate-900">
            {course.title}
          </h3>
        )}

        {/* Description with Tooltip */}
        {isDescriptionLong ? (
          <Tooltip content={course.description} position="bottom">
            <p className="mb-4 line-clamp-3 flex-1 cursor-help text-sm text-slate-600">
              {course.description}
            </p>
          </Tooltip>
        ) : (
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-slate-600">
            {course.description}
          </p>
        )}

        {/* Difficulty + Duration */}
        <div className="mb-4 flex items-center gap-3">
          <DifficultyBadge difficulty={course.difficulty} />
          <span className="text-sm text-slate-500">{course.duration} hours</span>
        </div>

        {/* Tags - Expandable */}
        <ExpandableTags tags={course.tags} maxVisible={4} />
      </Card>
    </Link>
  )
}
