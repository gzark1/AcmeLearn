import * as React from 'react'

import { cn } from '@/utils/cn'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-lg border bg-white px-3 py-2 text-base transition-all duration-200',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:shadow-sm',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-100',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50',
          'resize-y',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
