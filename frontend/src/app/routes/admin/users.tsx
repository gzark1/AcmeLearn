import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminUsers } from '@/features/admin/api'
import { SearchAndFilters, UserTable } from '@/features/admin/components'

const ITEMS_PER_PAGE = 20

const UsersSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-5 w-32" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-80" />
  </div>
)

export const AdminUsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const email = searchParams.get('email') || ''
  const status = searchParams.get('status') || ''
  const profileStatus = searchParams.get('profile_status') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const skip = (page - 1) * ITEMS_PER_PAGE

  const { data, isLoading, error } = useAdminUsers({
    email: email || undefined,
    is_active: status === 'active' ? true : status === 'inactive' ? false : undefined,
    profile_status: profileStatus || undefined,
    skip,
    limit: ITEMS_PER_PAGE,
  })

  const handleSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('email', value)
    } else {
      newParams.delete('email')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleStatusChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('status', value)
    } else {
      newParams.delete('status')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleProfileStatusChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('profile_status', value)
    } else {
      newParams.delete('profile_status')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', String(newPage))
    setSearchParams(newParams)
  }

  if (isLoading) {
    return <UsersSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">Failed to load users.</p>
      </div>
    )
  }

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-slate-600">
          {data?.total ?? 0} total users
        </p>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters
        searchValue={email}
        onSearchChange={handleSearchChange}
        statusFilter={status}
        onStatusFilterChange={handleStatusChange}
        profileFilter={profileStatus}
        onProfileFilterChange={handleProfileStatusChange}
      />

      {/* User Table */}
      <UserTable users={data?.users ?? []} isLoading={isLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {skip + 1} to {Math.min(skip + ITEMS_PER_PAGE, data?.total || 0)} of{' '}
            {data?.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
