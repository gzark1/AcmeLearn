import * as React from 'react'

import { cn } from '@/utils/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-lg border bg-white px-3 py-2 text-base transition-colors',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-100',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
