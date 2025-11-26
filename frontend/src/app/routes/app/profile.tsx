import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { useProfile } from '@/features/profile/api/get-profile'
import { useUpdateProfile } from '@/features/profile/api/update-profile'
import { ProfileView } from '@/features/profile/components/profile-view'
import { ProfileForm } from '@/features/profile/components/profile-form'
import type { ProfileUpdate } from '@/features/profile/types'

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-28" />
    </div>
    <Card>
      <Skeleton className="mb-4 h-6 w-32" />
      <SkeletonText lines={3} />
    </Card>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </Card>
      <Card>
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-6 w-32" />
      </Card>
    </div>
    <Card>
      <Skeleton className="mb-4 h-6 w-24" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-20" />
        ))}
      </div>
    </Card>
  </div>
)

export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false)
  const { data: profile, isLoading, error } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const handleSubmit = async (data: ProfileUpdate) => {
    await updateProfileMutation.mutateAsync(data)
    setIsEditing(false)
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Unable to Load Profile</h2>
          <p className="mt-2 text-slate-600">
            There was an error loading your profile. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <ProfileForm
        profile={profile}
        onSubmit={handleSubmit}
        onCancel={() => setIsEditing(false)}
        isSubmitting={updateProfileMutation.isPending}
      />
    )
  }

  return <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
}

export default ProfilePage
