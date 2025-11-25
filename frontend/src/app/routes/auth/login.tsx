import { Link } from '@/components/ui/link'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/layouts'
import { paths } from '@/config/paths'

export const LoginPage = () => {
  return (
    <AuthLayout title="Sign in to your account">
      <div className="space-y-4">
        <p className="text-center text-sm text-slate-500">
          Login form will be implemented in Phase 6
        </p>
        <Button className="w-full" disabled>
          Sign in
        </Button>
        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to={paths.auth.register.getHref()} className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
