import { Button } from '@/components/ui/button'

export type RecommendationInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onProfileBased: () => void
  disabled: boolean
}

export const RecommendationInput = ({
  value,
  onChange,
  onSubmit,
  onProfileBased,
  disabled,
}: RecommendationInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) {
        onSubmit()
      }
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What would you like to learn? (e.g., 'I want to learn Python for data science')"
        className="w-full resize-none rounded-lg border border-slate-300 p-3 text-base placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
        rows={3}
        disabled={disabled}
      />
      <div className="flex gap-3">
        <Button variant="primary" onClick={onSubmit} disabled={disabled || !value.trim()}>
          Get Recommendations
        </Button>
        <Button variant="secondary" onClick={onProfileBased} disabled={disabled}>
          Recommend Based on Profile
        </Button>
      </div>
    </div>
  )
}
