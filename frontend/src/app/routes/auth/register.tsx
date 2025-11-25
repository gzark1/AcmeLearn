import { Link } from '@/components/ui/link'
import { AuthLayout } from '@/layouts'
import { paths } from '@/config/paths'
import { RegisterForm } from '@/features/auth/components/register-form'

export const RegisterPage = () => {
  return (
    <AuthLayout title="Create your account">
      <div className="space-y-6">
        <RegisterForm />
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to={paths.auth.login.getHref()} className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
