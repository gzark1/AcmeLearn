import * as React from 'react'
import { cn } from '@/utils/cn'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export type TooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
  position?: TooltipPosition
  delay?: number
  className?: string
  disabled?: boolean
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent',
}

export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
  disabled = false,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect touch device
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)

  React.useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const showTooltip = () => {
    if (disabled || isTouchDevice) return
    timeoutRef.current = setTimeout(() => {
      setIsMounted(true)
      // Small delay to trigger animation
      requestAnimationFrame(() => setIsVisible(true))
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsVisible(false)
    // Wait for fade out animation
    setTimeout(() => setIsMounted(false), 150)
  }

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Don't render tooltip on touch devices
  if (isTouchDevice || disabled) {
    return <>{children}</>
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isMounted && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 min-w-[280px] max-w-md whitespace-normal rounded-lg bg-slate-800 px-3 py-2 text-sm text-white shadow-lg',
            'transition-opacity duration-150',
            isVisible ? 'opacity-100' : 'opacity-0',
            positionClasses[position],
            className
          )}
        >
          {content}
          {/* Arrow */}
          <span
            className={cn(
              'absolute h-0 w-0 border-4',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  )
}
