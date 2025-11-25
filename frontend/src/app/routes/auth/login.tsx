import { Link } from '@/components/ui/link'
import { AuthLayout } from '@/layouts'
import { paths } from '@/config/paths'
import { LoginForm } from '@/features/auth/components/login-form'

export const LoginPage = () => {
  return (
    <AuthLayout title="Sign in to your account">
      <div className="space-y-6">
        <LoginForm />
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
