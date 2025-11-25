import { Link } from '@/components/ui/link'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/layouts'
import { paths } from '@/config/paths'

export const RegisterPage = () => {
  return (
    <AuthLayout title="Create your account">
      <div className="space-y-4">
        <p className="text-center text-sm text-slate-500">
          Registration form will be implemented in Phase 6
        </p>
        <Button className="w-full" disabled>
          Create account
        </Button>
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
