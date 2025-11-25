import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { paths } from '@/config/paths'

import type { Course } from '../types'
import { DifficultyBadge } from './difficulty-badge'

export type CourseCardProps = {
  course: Course
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const visibleTags = course.tags.slice(0, 3)
  const remainingTags = course.tags.length - 3

  return (
    <Link to={paths.app.course.getHref(course.id)} className="block h-full">
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        {/* Title */}
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-slate-900">
          {course.title}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-600">
          {course.description}
        </p>

        {/* Difficulty + Duration */}
        <div className="mb-4 flex items-center gap-3">
          <DifficultyBadge difficulty={course.difficulty} />
          <span className="text-sm text-slate-500">{course.duration} hours</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
          {remainingTags > 0 && (
            <Badge variant="default" className="text-xs">
              +{remainingTags}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  )
}
