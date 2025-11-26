import { cn } from '@/utils/cn'

import type { DifficultyLevel } from '../types'

const LEVEL_OPTIONS: { value: DifficultyLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to this field' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Extensive experience' },
]

export type LevelSelectorProps = {
  value: DifficultyLevel | null
  onChange: (value: DifficultyLevel | null) => void
  disabled?: boolean
}

export const LevelSelector = ({ value, onChange, disabled }: LevelSelectorProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {LEVEL_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === option.value ? null : option.value)}
          className={cn(
            'flex flex-col items-start rounded-lg border-2 p-4 text-left transition-colors',
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
          <span className="mt-1 text-xs text-slate-500">{option.description}</span>
        </button>
      ))}
    </div>
  )
}
