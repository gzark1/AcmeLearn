import { Link } from '@/components/ui/link'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'

export const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-slate-900">AcmeLearn</h1>
        <p className="mt-4 text-xl text-slate-600">
          AI-Powered Course Recommendations for Your Learning Journey
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to={paths.auth.login.getHref()}>
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </Link>
          <Link to={paths.auth.register.getHref()}>
            <Button variant="secondary" size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
