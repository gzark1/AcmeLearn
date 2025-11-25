import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

import type { Tag } from '../types'

export type TagBadgeProps = {
  tag: Tag
  onClick?: () => void
  selected?: boolean
  className?: string
}

export const TagBadge = ({ tag, onClick, selected, className }: TagBadgeProps) => {
  return (
    <Badge
      variant={selected ? 'info' : 'outline'}
      className={cn(
        onClick && 'cursor-pointer hover:bg-slate-50',
        selected && 'hover:bg-blue-100',
        className
      )}
      onClick={onClick}
    >
      {tag.name}
    </Badge>
  )
}
