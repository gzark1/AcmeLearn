import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

type MobileNavProps = {
  isOpen: boolean
  onClose: () => void
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
  { label: 'Profile', to: '/profile' },
  { label: 'Settings', to: '/settings' },
]

export const MobileNav = ({ isOpen, onClose, user, onLogout }: MobileNavProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <DialogPanel
            transition
            className="fixed inset-y-0 left-0 flex w-72 max-w-full transform flex-col bg-white shadow-xl transition duration-300 ease-in-out data-[closed]:-translate-x-full"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-xl font-bold text-blue-600">AcmeLearn</span>
              <Button variant="ghost" onClick={onClose} className="p-2">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-lg px-3 py-2 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-700 hover:bg-slate-100'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {user?.is_superuser && (
                <>
                  <div className="my-4 h-px bg-slate-200" />
                  <NavLink
                    to="/admin"
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-lg px-3 py-2 text-base font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-700 hover:bg-slate-100'
                      )
                    }
                  >
                    Admin
                  </NavLink>
                </>
              )}
            </nav>

            {/* Footer */}
            {onLogout && (
              <div className="border-t border-slate-200 p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    onLogout()
                    onClose()
                  }}
                >
                  Logout
                </Button>
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
