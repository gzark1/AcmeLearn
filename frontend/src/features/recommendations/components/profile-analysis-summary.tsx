import { Badge, type BadgeProps } from '@/components/ui/badge'

import type { ProfileAnalysisSummary } from '../types'

export type ProfileAnalysisCardProps = {
  analysis: ProfileAnalysisSummary
}

const skillLevelConfig: Record<
  ProfileAnalysisSummary['skill_level'],
  { variant: BadgeProps['variant']; label: string }
> = {
  beginner: { variant: 'success', label: 'Beginner' },
  intermediate: { variant: 'warning', label: 'Intermediate' },
  advanced: { variant: 'error', label: 'Advanced' },
}

export const ProfileAnalysisCard = ({ analysis }: ProfileAnalysisCardProps) => {
  const skillConfig = skillLevelConfig[analysis.skill_level]
  const confidencePercent = Math.round(analysis.confidence * 100)

  return (
    <div className="mb-4 flex flex-wrap items-start gap-4 rounded-lg bg-slate-50 p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Skill Level</p>
        <Badge variant={skillConfig.variant} className="mt-1">
          {skillConfig.label}
        </Badge>
      </div>

      {analysis.skill_gaps.length > 0 && (
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Areas to Develop
          </p>
          <ul className="mt-1 space-y-0.5">
            {analysis.skill_gaps.map((gap, idx) => (
              <li key={idx} className="text-sm text-slate-700">
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Confidence</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-700">{confidencePercent}%</span>
        </div>
      </div>
    </div>
  )
}
