import { Outlet } from 'react-router-dom'

import { Navbar } from './navbar'
import { Footer } from './footer'

type MainLayoutProps = {
  user?: {
    email: string
    is_superuser?: boolean
  }
  onLogout?: () => void
}

export const MainLayout = ({ user, onLogout }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar user={user} onLogout={onLogout} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}
