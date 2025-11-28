import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'

type NavbarProps = {
  user?: {
    email: string
    is_superuser?: boolean
  }
  onLogout?: () => void
}

const navLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Courses', to: '/courses' },
  { label: 'Recommendations', to: '/recommendations' },
]

export const Navbar = ({ user, onLogout }: NavbarProps) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo + hamburger on mobile */}
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                className="p-2 lg:hidden"
                onClick={() => setIsMobileNavOpen(true)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </Button>

              {/* Logo */}
              <NavLink to="/" className="text-xl font-bold text-blue-600">
                AcmeLearn
              </NavLink>
            </div>

            {/* Center: Nav links (hidden on mobile) */}
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'relative px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {user?.is_superuser && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    cn(
                      'relative px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    )
                  }
                >
                  Admin
                </NavLink>
              )}
            </div>

            {/* Right: User menu */}
            <div className="flex items-center">
              {user && onLogout && <UserMenu user={user} onLogout={onLogout} />}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile navigation drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        user={user}
        onLogout={onLogout}
      />
    </>
  )
}
