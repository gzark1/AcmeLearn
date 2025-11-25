import { cn } from '@/utils/cn'

export type SkeletonProps = {
  className?: string
  width?: string | number
  height?: string | number
}

export const Skeleton = ({ className, width, height }: SkeletonProps) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export type SkeletonTextProps = {
  lines?: number
  className?: string
}

export const SkeletonText = ({ lines = 3, className }: SkeletonTextProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && 'w-3/4')}
        />
      ))}
    </div>
  )
}

export type SkeletonCircleProps = {
  size?: number | string
  className?: string
}

export const SkeletonCircle = ({ size = 40, className }: SkeletonCircleProps) => {
  return (
    <Skeleton
      className={cn('rounded-full', className)}
      width={size}
      height={size}
    />
  )
}
