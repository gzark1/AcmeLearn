import { Badge, type BadgeProps } from '@/components/ui/badge'

import type { DifficultyLevel } from '../types'

const difficultyConfig: Record<
  DifficultyLevel,
  { variant: BadgeProps['variant']; label: string }
> = {
  beginner: { variant: 'success', label: 'Beginner' },
  intermediate: { variant: 'warning', label: 'Intermediate' },
  advanced: { variant: 'error', label: 'Advanced' },
}

export type DifficultyBadgeProps = {
  difficulty: DifficultyLevel
  className?: string
}

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const config = difficultyConfig[difficulty]

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
