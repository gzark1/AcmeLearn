import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/config/paths'
import { useAdminUserDetail } from '@/features/admin/api'
import {
  StatusBadge,
  ProfileCompleteness,
  ProfileHistoryModal,
  DeactivateUserModal,
  ActivitySummary,
} from '@/features/admin/components'

const UserDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-9 w-64" />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  </div>
)

export const AdminUserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)

  const { data: user, isLoading, error } = useAdminUserDetail(userId || '')

  if (isLoading) {
    return <UserDetailSkeleton />
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Link
          to={paths.admin.users.getHref()}
          className="text-sm text-violet-600 hover:underline"
        >
          &larr; Back to Users
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">User not found.</p>
        </div>
      </div>
    )
  }

  const status = user.is_active ? 'active' : 'inactive'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={paths.admin.users.getHref()}
            className="text-sm text-violet-600 hover:underline"
          >
            &larr; Back to Users
          </Link>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsHistoryModalOpen(true)}
          >
            View History
          </Button>
          {user.is_active && !user.is_superuser && (
            <Button
              variant="destructive"
              onClick={() => setIsDeactivateModalOpen(true)}
            >
              Deactivate User
            </Button>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{user.email}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={status} />
            {user.is_verified && <StatusBadge status="verified" />}
            {user.is_superuser && (
              <span className="inline-flex items-center rounded-md bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">
                Admin
              </span>
            )}
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-500">User ID</p>
              <p className="mt-1 font-mono text-sm text-slate-900">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Account Status</p>
              <p className="mt-1 text-sm text-slate-900">
                {user.is_active ? 'Active' : 'Deactivated'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Summary</CardTitle>
            {user.profile && (
              <span className="text-sm text-slate-500">
                Version {user.profile.version}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {user.profile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-500">
                  Completeness:
                </span>
                <ProfileCompleteness
                  hasGoal={!!user.profile.learning_goal}
                  hasLevel={!!user.profile.current_level}
                  hasTimeCommitment={user.profile.time_commitment !== null}
                  interestCount={user.profile.interest_count}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Learning Goal
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {user.profile.learning_goal || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Experience Level
                  </p>
                  <p className="mt-1 text-sm capitalize text-slate-900">
                    {user.profile.current_level || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Time Commitment
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {user.profile.time_commitment
                      ? `${user.profile.time_commitment} hours/week`
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Interests
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {user.profile.interest_count} selected
                  </p>
                </div>
              </div>

              {user.profile.interests.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-500">
                    Selected Interests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="py-4 text-center text-slate-500">
              No profile data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <ActivitySummary user={user} />

      {/* Profile History Modal */}
      <ProfileHistoryModal
        userId={userId || ''}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Deactivate User Modal */}
      <DeactivateUserModal
        userId={userId || ''}
        userEmail={user.email}
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onSuccess={() => navigate(paths.admin.users.getHref())}
      />
    </div>
  )
}

export default AdminUserDetailPage
