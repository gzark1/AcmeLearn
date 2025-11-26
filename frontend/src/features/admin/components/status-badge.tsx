import { cn } from '@/utils/cn'

import type { UserStatus } from '../types'

type StatusBadgeProps = {
  status: UserStatus
}

const statusConfig = {
  active: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
    label: 'Inactive',
  },
  verified: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Verified',
  },
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
        config.bg,
        config.text
      )}
      role="status"
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', config.dot)}
        aria-hidden="true"
      />
      {config.label}
    </div>
  )
}
