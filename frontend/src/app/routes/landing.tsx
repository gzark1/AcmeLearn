import { Navigate } from 'react-router-dom'

import { Link } from '@/components/ui/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { paths } from '@/config/paths'
import { useUser } from '@/lib/auth'

export const LandingPage = () => {
  const { data: user } = useUser()

  // Redirect logged-in users to dashboard
  if (user) {
    return <Navigate to={paths.app.dashboard.getHref()} replace />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-200 opacity-30 blur-3xl" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-indigo-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-blue-100 opacity-30 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Course Count Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            48 Expert-Curated Courses
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Find Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Perfect Learning Path
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
            Get personalized course recommendations powered by AI. Tell us your goals,
            and we'll create a learning path tailored just for you.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={paths.auth.register.getHref()}>
              <Button variant="primary" size="lg" className="min-w-[180px]">
                Get Started Free
              </Button>
            </Link>
            <Link to={paths.auth.login.getHref()}>
              <Button variant="outline" size="lg" className="min-w-[180px]">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Social Proof Indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <span>No Credit Card</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative mx-auto mt-20 max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-slate-900">
            How It Works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                  <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">1. Set Your Goals</h3>
                <p className="text-sm text-slate-600">
                  Tell us about your learning objectives, experience level, and available time.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100">
                  <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">2. Get AI Matches</h3>
                <p className="text-sm text-slate-600">
                  Our AI analyzes your profile and finds the perfect courses for you.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                  <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">3. Start Learning</h3>
                <p className="text-sm text-slate-600">
                  Follow your personalized learning path and achieve your goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Categories */}
        <div className="relative mx-auto mt-16 max-w-5xl px-4 pb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
            Explore by Category
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Programming', color: 'bg-blue-100 text-blue-700' },
              { name: 'Data Science', color: 'bg-purple-100 text-purple-700' },
              { name: 'Business', color: 'bg-amber-100 text-amber-700' },
              { name: 'Design', color: 'bg-pink-100 text-pink-700' },
              { name: 'Leadership', color: 'bg-emerald-100 text-emerald-700' },
              { name: 'Communication', color: 'bg-cyan-100 text-cyan-700' },
              { name: 'Project Management', color: 'bg-orange-100 text-orange-700' },
              { name: 'Cloud Computing', color: 'bg-indigo-100 text-indigo-700' },
            ].map((category) => (
              <span
                key={category.name}
                className={`rounded-full px-4 py-2 text-sm font-medium ${category.color}`}
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
