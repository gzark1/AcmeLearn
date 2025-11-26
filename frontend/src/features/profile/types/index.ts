import type { Tag } from '@/features/courses/types'

export type TimeCommitment = '1-5' | '5-10' | '10-20' | '20+'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export type UserProfile = {
  id: string
  user_id: string
  learning_goal: string | null
  current_level: DifficultyLevel | null
  time_commitment: TimeCommitment | null
  version: number
  interests: Tag[]
  created_at: string
  updated_at: string
}

export type ProfileUpdate = {
  learning_goal?: string | null
  current_level?: DifficultyLevel | null
  time_commitment?: TimeCommitment | null
  interest_tag_ids?: string[] | null
}

export type ProfileSnapshot = {
  id: string
  version: number
  learning_goal: string | null
  current_level: DifficultyLevel | null
  time_commitment: TimeCommitment | null
  interests_snapshot: string[]
  created_at: string
}

export type ProfileHistoryResponse = {
  snapshots: ProfileSnapshot[]
  count: number
}
