import { Link } from '@/components/ui/link'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="mt-4 text-xl text-slate-600">Page not found</p>
        <p className="mt-2 text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to={paths.home.getHref()}>
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
