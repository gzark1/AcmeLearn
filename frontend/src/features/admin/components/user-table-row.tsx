import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'

import type { AdminUserListItem } from '../types'

import { ProfileCompleteness } from './profile-completeness'
import { StatusBadge } from './status-badge'

type UserTableRowProps = {
  user: AdminUserListItem
}

export const UserTableRow = ({ user }: UserTableRowProps) => {
  const status = user.is_active ? 'active' : 'inactive'

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{user.email}</span>
          {user.is_superuser && (
            <span className="text-xs text-violet-600">Admin</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {user.is_verified && <StatusBadge status="verified" />}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <ProfileCompleteness
            hasGoal={user.has_learning_goal}
            hasLevel={user.has_level}
            hasTimeCommitment={user.has_time_commitment}
            interestCount={user.interest_count}
          />
          <span className="text-xs text-slate-500">
            {user.interest_count} interests
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <Link to={paths.admin.user.getHref(user.id)}>
          <Button variant="outline" size="sm">
            View
          </Button>
        </Link>
      </td>
    </tr>
  )
}
