import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/input'
import { Form, FieldWrapper } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useChangePassword } from '@/features/auth/api/change-password'
import { useProfile } from '@/features/profile/api/get-profile'
import { useUser } from '@/lib/auth'

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-5 w-48" />
    </div>
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const SettingsPage = () => {
  const { data: user, isLoading: userLoading } = useUser()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const changePassword = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  })

  const isLoading = userLoading || profileLoading

  if (isLoading) {
    return <SettingsSkeleton />
  }

  const onSubmit = async (data: PasswordChangeFormData) => {
    try {
      await changePassword.mutateAsync({
        old_password: data.currentPassword,
        new_password: data.newPassword,
      })
      reset()
    } catch {
      // Error is handled by api-client (shows toast)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-600">Manage your account settings</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="text-sm text-slate-900">{user?.email}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <dt className="text-sm font-medium text-slate-500">Member Since</dt>
              <dd className="text-sm text-slate-900">
                {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-slate-500">Account Status</dt>
              <dd>
                {user?.is_active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="error">Inactive</Badge>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
            <FieldWrapper
              label="Current Password"
              error={errors.currentPassword}
              required
            >
              <PasswordInput
                placeholder="Enter your current password"
                autoComplete="current-password"
                error={!!errors.currentPassword}
                {...register('currentPassword')}
              />
            </FieldWrapper>

            <FieldWrapper
              label="New Password"
              error={errors.newPassword}
              required
            >
              <PasswordInput
                placeholder="Enter your new password"
                autoComplete="new-password"
                error={!!errors.newPassword}
                {...register('newPassword')}
              />
            </FieldWrapper>

            <FieldWrapper
              label="Confirm New Password"
              error={errors.confirmPassword}
              required
            >
              <PasswordInput
                placeholder="Confirm your new password"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
            </FieldWrapper>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={changePassword.isPending}
                disabled={changePassword.isPending}
              >
                Update Password
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
