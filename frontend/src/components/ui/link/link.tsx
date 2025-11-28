import * as React from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'

import { cn } from '@/utils/cn'

export type LinkProps = RouterLinkProps & {
  variant?: 'default' | 'muted' | 'animated'
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
          variant === 'animated' &&
            'relative text-blue-600 hover:text-blue-700 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full',
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
