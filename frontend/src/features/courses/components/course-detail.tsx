import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { paths } from '@/config/paths'

import type { Course } from '../types'
import { DifficultyBadge } from './difficulty-badge'

// Parse course contents into structured modules
type ParsedModule = {
  number: number
  title: string
  description: string
}

const parseModules = (contents: string): ParsedModule[] => {
  // Pattern: "Module N: Title - Description."
  const moduleRegex = /Module\s+(\d+):\s+([^-]+)\s*-\s*([^.]+(?:\.[^M])*)/g
  const modules: ParsedModule[] = []
  let match

  while ((match = moduleRegex.exec(contents)) !== null) {
    modules.push({
      number: parseInt(match[1], 10),
      title: match[2].trim(),
      description: match[3].trim().replace(/\.$/, ''),
    })
  }

  return modules
}

// Component to display course modules
const CourseModules = ({ contents }: { contents: string }) => {
  const modules = parseModules(contents)

  // If parsing failed, fall back to plain text
  if (modules.length === 0) {
    return <div className="whitespace-pre-wrap text-slate-600">{contents}</div>
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div key={module.number} className="flex gap-4">
          {/* Module number badge */}
          <div className="flex-shrink-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
              {module.number}
            </span>
          </div>
          {/* Module content */}
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">{module.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{module.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

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
            <CourseModules contents={course.contents} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
