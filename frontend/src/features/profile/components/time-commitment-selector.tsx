import { cn } from '@/utils/cn'

import type { TimeCommitment } from '../types'

const TIME_OPTIONS: { value: TimeCommitment; label: string; description: string }[] = [
  { value: '1-5', label: '1-5 hours', description: 'Light' },
  { value: '5-10', label: '5-10 hours', description: 'Regular' },
  { value: '10-20', label: '10-20 hours', description: 'Intensive' },
  { value: '20+', label: '20+ hours', description: 'Full-time' },
]

export type TimeCommitmentSelectorProps = {
  value: TimeCommitment | null
  onChange: (value: TimeCommitment | null) => void
  disabled?: boolean
}

export const TimeCommitmentSelector = ({
  value,
  onChange,
  disabled,
}: TimeCommitmentSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TIME_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === option.value ? null : option.value)}
          className={cn(
            'flex flex-col items-center rounded-lg border-2 p-3 text-center transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            value === option.value
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          <span
            className={cn(
              'text-sm font-semibold',
              value === option.value ? 'text-blue-700' : 'text-slate-900'
            )}
          >
            {option.label}
          </span>
          <span className="mt-0.5 text-xs text-slate-500">{option.description}</span>
        </button>
      ))}
    </div>
  )
}
