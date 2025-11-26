import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'

import type { Tag } from '../types'

export type ExpandableTagsProps = {
  tags: Tag[]
  maxVisible?: number
}

export const ExpandableTags = ({ tags, maxVisible = 4 }: ExpandableTagsProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleTags = isExpanded ? tags : tags.slice(0, maxVisible)
  const hiddenCount = tags.length - maxVisible

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent card link navigation
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  if (tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleTags.map((tag) => (
        <Tooltip key={tag.id} content={tag.name} position="top" disabled={tag.name.length < 15}>
          <Badge variant="outline" className="text-xs">
            {tag.name}
          </Badge>
        </Tooltip>
      ))}
      {hiddenCount > 0 && !isExpanded && (
        <button
          onClick={handleToggle}
          className="inline-flex min-h-[28px] min-w-[28px] items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-expanded={isExpanded}
          aria-label={`Show ${hiddenCount} more tags`}
        >
          +{hiddenCount}
        </button>
      )}
      {isExpanded && tags.length > maxVisible && (
        <button
          onClick={handleToggle}
          className="inline-flex min-h-[28px] items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          aria-expanded={isExpanded}
          aria-label="Show fewer tags"
        >
          Show less
        </button>
      )}
    </div>
  )
}
