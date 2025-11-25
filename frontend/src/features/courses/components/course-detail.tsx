import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { paths } from '@/config/paths'

import type { Course } from '../types'
import { DifficultyBadge } from './difficulty-badge'

export type CourseDetailProps = {
  course: Course
}

export const CourseDetail = ({ course }: CourseDetailProps) => {
  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to={paths.app.courses.getHref()}
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
      >
        <svg
          className="mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Courses
      </Link>

      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">{course.title}</h1>
        <div className="flex flex-wrap items-center gap-4">
          <DifficultyBadge difficulty={course.difficulty} />
          <span className="text-slate-600">{course.duration} hours</span>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Course</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-slate-600">{course.description}</p>
        </CardContent>
      </Card>

      {/* Tags */}
      {course.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {course.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills You'll Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {course.skills.map((skill) => (
                <Badge key={skill.id} variant="info">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Contents */}
      {course.contents && (
        <Card>
          <CardHeader>
            <CardTitle>Course Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-slate-600">{course.contents}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
