import { Link } from '@/components/ui/link'

type AuthLayoutProps = {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            AcmeLearn
          </Link>
        </div>

        <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
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
  )
}
