import { Link } from '@/components/ui/link'

type AuthLayoutProps = {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      {/* Decorative Panel - hidden on mobile/tablet */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white">
        {/* Logo */}
        <div>
          <Link to="/" className="text-2xl font-bold text-white hover:text-white/90">
            AcmeLearn
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold">
              Discover Your Perfect Learning Path
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              AI-powered recommendations tailored to your goals, experience, and available time.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-blue-100">48 expert-curated courses</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-blue-100">Personalized recommendations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-blue-100">Track your progress</span>
            </div>
          </div>
        </div>

        {/* Footer quote */}
        <div className="text-sm text-blue-200">
          "The best investment you can make is in yourself."
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex w-full flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Mobile logo - only shown on smaller screens */}
          <div className="flex justify-center lg:hidden">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              AcmeLearn
            </Link>
          </div>

          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 lg:mt-0">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-slate-600">{subtitle}</p>
          )}
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 shadow-sm sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
