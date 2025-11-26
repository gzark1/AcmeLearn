import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { UserProfile } from '../types'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const TIME_LABELS: Record<string, string> = {
  '1-5': '1-5 hours/week',
  '5-10': '5-10 hours/week',
  '10-20': '10-20 hours/week',
  '20+': '20+ hours/week',
}

export type ProfileViewProps = {
  profile: UserProfile
  onEdit: () => void
}

export const ProfileView = ({ profile, onEdit }: ProfileViewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Your Learning Profile</h1>
        <Button onClick={onEdit}>Edit Profile</Button>
      </div>

      {/* Profile Content */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Goal</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.learning_goal ? (
            <p className="whitespace-pre-wrap text-slate-600">{profile.learning_goal}</p>
          ) : (
            <p className="italic text-slate-400">No learning goal set</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Current Level */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Level</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.current_level ? (
              <Badge variant="info">{LEVEL_LABELS[profile.current_level]}</Badge>
            ) : (
              <p className="italic text-slate-400">Not specified</p>
            )}
          </CardContent>
        </Card>

        {/* Time Commitment */}
        <Card>
          <CardHeader>
            <CardTitle>Time Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.time_commitment ? (
              <span className="font-medium text-slate-700">
                {TIME_LABELS[profile.time_commitment]}
              </span>
            ) : (
              <p className="italic text-slate-400">Not specified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Interests</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="italic text-slate-400">No interests selected</p>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500">
        <span>Profile Version: {profile.version}</span>
        <span>Last updated: {formatDate(profile.updated_at)}</span>
      </div>
    </div>
  )
}
