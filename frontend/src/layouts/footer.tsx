import { Link } from '@/components/ui/link'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} AcmeLearn. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link to="/about" className="text-sm text-slate-500 hover:text-slate-700">
              About
            </Link>
            <Link to="/privacy" className="text-sm text-slate-500 hover:text-slate-700">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-slate-500 hover:text-slate-700">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
