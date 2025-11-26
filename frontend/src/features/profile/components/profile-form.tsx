import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input/textarea'
import { FieldWrapper } from '@/components/ui/form/field-wrapper'

import type { UserProfile, ProfileUpdate, DifficultyLevel, TimeCommitment } from '../types'
import { LevelSelector } from './level-selector'
import { TimeCommitmentSelector } from './time-commitment-selector'
import { InterestSelector } from './interest-selector'

const profileSchema = z.object({
  learning_goal: z.string().max(1000, 'Learning goal must be less than 1000 characters').nullable(),
  current_level: z.enum(['beginner', 'intermediate', 'advanced']).nullable(),
  time_commitment: z.enum(['1-5', '5-10', '10-20', '20+']).nullable(),
  interest_tag_ids: z.array(z.string()),
})

type ProfileFormData = z.infer<typeof profileSchema>

export type ProfileFormProps = {
  profile: UserProfile
  onSubmit: (data: ProfileUpdate) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export const ProfileForm = ({ profile, onSubmit, onCancel, isSubmitting }: ProfileFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      learning_goal: profile.learning_goal || '',
      current_level: profile.current_level,
      time_commitment: profile.time_commitment,
      interest_tag_ids: profile.interests.map((tag) => tag.id),
    },
  })

  const onFormSubmit = async (data: ProfileFormData) => {
    const updateData: ProfileUpdate = {
      learning_goal: data.learning_goal || null,
      current_level: data.current_level,
      time_commitment: data.time_commitment,
      interest_tag_ids: data.interest_tag_ids,
    }
    await onSubmit(updateData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Your Profile</h1>
        <p className="mt-1 text-slate-600">
          Update your learning preferences to get better course recommendations.
        </p>
      </div>

      {/* Learning Goal */}
      <FieldWrapper
        label="Learning Goal"
        error={errors.learning_goal}
        description="What do you want to achieve? (max 1000 characters)"
      >
        <Textarea
          {...register('learning_goal')}
          placeholder="e.g., Become a full-stack developer with expertise in Python backend and React frontend..."
          error={!!errors.learning_goal}
          disabled={isSubmitting}
        />
      </FieldWrapper>

      {/* Experience Level */}
      <FieldWrapper label="Your Experience Level" error={errors.current_level}>
        <Controller
          name="current_level"
          control={control}
          render={({ field }) => (
            <LevelSelector
              value={field.value as DifficultyLevel | null}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </FieldWrapper>

      {/* Time Commitment */}
      <FieldWrapper label="Time Available Per Week" error={errors.time_commitment}>
        <Controller
          name="time_commitment"
          control={control}
          render={({ field }) => (
            <TimeCommitmentSelector
              value={field.value as TimeCommitment | null}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </FieldWrapper>

      {/* Interests */}
      <FieldWrapper label="Your Interests" description="Select topics you're interested in learning">
        <Controller
          name="interest_tag_ids"
          control={control}
          render={({ field }) => (
            <InterestSelector
              selectedIds={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </FieldWrapper>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
