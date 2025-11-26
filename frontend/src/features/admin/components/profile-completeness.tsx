import { cn } from '@/utils/cn'

type ProfileCompletenessProps = {
  hasGoal: boolean
  hasLevel: boolean
  hasTimeCommitment: boolean
  interestCount: number
  showTooltip?: boolean
}

export const ProfileCompleteness = ({
  hasGoal,
  hasLevel,
  hasTimeCommitment,
  interestCount,
  showTooltip = true,
}: ProfileCompletenessProps) => {
  const dots = [
    hasGoal,
    hasLevel,
    hasTimeCommitment,
    interestCount >= 1,
    interestCount >= 5,
  ]

  const filledCount = dots.filter(Boolean).length
  const percentage = (filledCount / 5) * 100

  const missing: string[] = []
  if (!hasGoal) missing.push('learning goal')
  if (!hasLevel) missing.push('level')
  if (!hasTimeCommitment) missing.push('time commitment')
  if (interestCount < 1) missing.push('1+ interests')
  else if (interestCount < 5) missing.push('5+ interests')

  const tooltipText =
    missing.length > 0
      ? `Profile ${percentage}% complete. Missing: ${missing.join(', ')}`
      : 'Profile 100% complete'

  return (
    <div
      className="flex items-center gap-1"
      title={showTooltip ? tooltipText : undefined}
    >
      {dots.map((filled, index) => (
        <div
          key={index}
          className={cn(
            'h-2 w-2 rounded-full',
            filled ? 'bg-violet-500' : 'bg-slate-300'
          )}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{tooltipText}</span>
    </div>
  )
}
