import * as React from 'react'

import { cn } from '@/utils/cn'

export type FormProps = React.FormHTMLAttributes<HTMLFormElement>

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form ref={ref} className={cn('space-y-6', className)} {...props}>
        {children}
      </form>
    )
  }
)

Form.displayName = 'Form'
