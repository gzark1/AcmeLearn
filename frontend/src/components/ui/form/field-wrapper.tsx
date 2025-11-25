import * as React from 'react'
import type { FieldError } from 'react-hook-form'

import { cn } from '@/utils/cn'

type FieldWrapperProps = {
  label?: string
  error?: FieldError | string
  description?: string
  children: React.ReactNode
  className?: string
  required?: boolean
}

export const FieldWrapper = ({
  label,
  error,
  description,
  children,
  className,
  required,
}: FieldWrapperProps) => {
  const errorMessage = typeof error === 'string' ? error : error?.message

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {children}
      {description && !errorMessage && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
      {errorMessage && (
        <p className="flex items-center gap-1 text-sm text-red-600" role="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  )
}
