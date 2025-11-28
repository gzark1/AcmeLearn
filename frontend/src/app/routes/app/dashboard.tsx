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

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const getFirstName = (email: string | undefined) => {
  if (!email) return ''
  const name = email.split('@')[0]
  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1)
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

  const firstName = getFirstName(user?.email)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {getGreeting()}{firstName ? `, ${firstName}` : ''}! 👋
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Here's your learning dashboard
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
        <Card className="transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
              <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {courses?.length ?? 0}
              </p>
              <p className="text-sm text-slate-600">Courses Available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
              <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">
                v{profile?.version ?? 1}
              </p>
              <p className="text-sm text-slate-600">Profile Version</p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100">
              <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {profile?.interests.length ?? 0}
              </p>
              <p className="text-sm text-slate-600">Interests Selected</p>
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
          <Card className="group cursor-pointer border-2 border-transparent transition-all hover:border-blue-200 hover:shadow-lg">
            <Link to={paths.app.courses.getHref()} className="block">
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 transition-transform group-hover:scale-110">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <CardTitle className="text-base">Browse Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Explore our catalog of {courses?.length ?? 0} courses
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="group cursor-pointer border-2 border-transparent transition-all hover:border-emerald-200 hover:shadow-lg">
            <Link to={paths.app.profile.getHref()} className="block">
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 transition-transform group-hover:scale-110">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <CardTitle className="text-base">Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Update your learning preferences
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="group cursor-pointer border-2 border-transparent transition-all hover:border-indigo-200 hover:shadow-lg">
            <Link to={paths.app.recommendations.getHref()} className="block">
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 transition-transform group-hover:scale-110">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <CardTitle className="text-base">Get Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  AI-powered course suggestions
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
