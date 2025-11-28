import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

import type { AdminUserListItem } from '../types'

import { UserTableRow } from './user-table-row'

type UserTableProps = {
  users: AdminUserListItem[]
  isLoading?: boolean
}

const TableSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
)

export const UserTable = ({ users, isLoading }: UserTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <TableSkeleton />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        <EmptyState
          title="No users found"
          description="Try adjusting your search or filters."
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full" role="table" aria-label="User list">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              Email
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              Level
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              Profile
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserTableRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
