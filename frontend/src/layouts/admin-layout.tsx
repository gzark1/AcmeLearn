import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { MobileNav } from './mobile-nav'

type AdminLayoutProps = {
  user?: {
    email: string
    is_superuser?: boolean
  }
  onLogout?: () => void
}

const sidebarLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Analytics', to: '/admin/analytics' },
]

export const AdminLayout = ({ user, onLogout }: AdminLayoutProps) => {
  const navigate = useNavigate()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - hidden on mobile */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <span className="text-xl font-bold text-blue-600">AcmeLearn</span>
          <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            Admin
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 hover:text-slate-900"
            onClick={() => navigate('/dashboard')}
          >
            Exit Admin
          </Button>
          {onLogout && (
            <Button
              variant="ghost"
              className="mt-1 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onLogout}
            >
              Logout
            </Button>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <Button
            variant="ghost"
            className="p-2"
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
          <span className="font-semibold text-slate-900">Admin</span>
          <div className="w-10" /> {/* Spacer for balance */}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 animate-fadeIn">
          <Outlet />
        </main>
      </div>

      {/* Mobile navigation drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        user={user}
        onLogout={onLogout}
      />
    </div>
  )
}
