import { useNavigate } from 'react-router-dom'

import { Dropdown } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'

type UserMenuProps = {
  user: {
    email: string
    is_superuser?: boolean
  }
  onLogout: () => void
}

export const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const navigate = useNavigate()
  const initials = user.email.slice(0, 2).toUpperCase()

  const items = [
    { label: 'Profile', onClick: () => navigate('/profile') },
    { label: 'Settings', onClick: () => navigate('/settings') },
    ...(user.is_superuser
      ? [{ label: 'Admin Dashboard', onClick: () => navigate('/admin') }]
      : []),
    { label: 'Logout', onClick: onLogout, destructive: true },
  ]

  return (
    <Dropdown
      trigger={
        <Button
          variant="ghost"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 p-0 text-sm font-medium text-white hover:bg-blue-700"
        >
          {initials}
        </Button>
      }
      items={items}
    />
  )
}
