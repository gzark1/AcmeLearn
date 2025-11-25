import * as React from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'

import { cn } from '@/utils/cn'

export type LinkProps = RouterLinkProps & {
  variant?: 'default' | 'muted'
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <RouterLink
        ref={ref}
        className={cn(
          'transition-colors',
          variant === 'default' && 'text-blue-600 hover:text-blue-700 hover:underline',
          variant === 'muted' && 'text-slate-600 hover:text-slate-900',
          className
        )}
        {...props}
      >
        {children}
      </RouterLink>
    )
  }
)

Link.displayName = 'Link'
