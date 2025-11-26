import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/config/paths'
import { useCourses } from '@/features/courses/api/get-courses'
import { useProfile } from '@/features/profile/api/get-profile'
import { useUser } from '@/lib/auth'

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-5 w-48" />
    </div>
    <Skeleton className="h-40 w-full" />
    <div className="grid gap-4 md:grid-cols-3">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  </div>
)

const calculateProfileCompletion = (profile: {
  learning_goal: string | null
  current_level: string | null
  time_commitment: string | null
  interests: unknown[]
}) => {
  const fields = [
    { name: 'Learning Goal', filled: !!profile.learning_goal },
    { name: 'Experience Level', filled: !!profile.current_level },
    { name: 'Time Commitment', filled: !!profile.time_commitment },
    { name: 'Interests', filled: profile.interests.length > 0 },
  ]

  const filledCount = fields.filter((f) => f.filled).length
  const percentage = Math.round((filledCount / fields.length) * 100)
  const missing = fields.filter((f) => !f.filled).map((f) => f.name)

  return { percentage, missing, isComplete: filledCount === fields.length }
}

export const DashboardPage = () => {
  const { data: user, isLoading: userLoading } = useUser()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: courses, isLoading: coursesLoading } = useCourses({})

  const isLoading = userLoading || profileLoading || coursesLoading

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const completion = profile
    ? calculateProfileCompletion(profile)
    : { percentage: 0, missing: [], isComplete: false }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{user?.email ? `, ${user.email}` : ''}!
        </h1>
        <p className="mt-1 text-slate-600">
          Here's an overview of your learning journey
        </p>
      </div>

      {/* Profile Completion Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Profile Completion</CardTitle>
            <span className="text-2xl font-bold text-slate-900">
              {completion.percentage}%
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${
                completion.isComplete ? 'bg-green-500' : 'bg-blue-600'
              }`}
              style={{ width: `${completion.percentage}%` }}
            />
          </div>

          {completion.isComplete ? (
            <p className="text-sm text-green-600">
              Your profile is complete! You'll get the best recommendations.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Complete your profile to get better course recommendations
              </p>
              {completion.missing.length > 0 && (
                <p className="text-sm text-slate-500">
                  Missing: {completion.missing.join(', ')}
                </p>
              )}
            </>
          )}

          {!completion.isComplete && (
            <Link to={paths.app.profile.getHref()}>
              <Button variant="secondary" size="sm">
                Complete Profile
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                {courses?.length ?? 0}
              </p>
              <p className="mt-1 text-sm text-slate-600">Courses Available</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                {profile?.version ?? 1}
              </p>
              <p className="mt-1 text-sm text-slate-600">Profile Version</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                {profile?.interests.length ?? 0}
              </p>
              <p className="mt-1 text-sm text-slate-600">Interests Selected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Browse Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                Explore our catalog of {courses?.length ?? 0} courses
              </p>
              <Link to={paths.app.courses.getHref()}>
                <Button variant="secondary" size="sm" className="w-full">
                  View Courses
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                Update your learning preferences
              </p>
              <Link to={paths.app.profile.getHref()}>
                <Button variant="secondary" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Get Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                AI-powered course suggestions
              </p>
              <Link to={paths.app.recommendations.getHref()}>
                <Button variant="secondary" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
