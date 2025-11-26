import { useState, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTagCategories } from '@/features/courses/api/get-tags'
import type { Tag } from '@/features/courses/types'
import { cn } from '@/utils/cn'

export type InterestSelectorProps = {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export const InterestSelector = ({ selectedIds, onChange, disabled }: InterestSelectorProps) => {
  const { data: categories, isLoading } = useTagCategories()
  const [search, setSearch] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Get all tags as a flat map for lookup
  const tagMap = useMemo(() => {
    if (!categories) return new Map<string, Tag>()
    const map = new Map<string, Tag>()
    Object.values(categories).forEach((tags) => {
      tags.forEach((tag) => map.set(tag.id, tag))
    })
    return map
  }, [categories])

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categories) return {}
    if (!search.trim()) return categories

    const searchLower = search.toLowerCase()
    const filtered: Record<string, Tag[]> = {}

    Object.entries(categories).forEach(([category, tags]) => {
      const matchingTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchLower))
      if (matchingTags.length > 0) {
        filtered[category] = matchingTags
      }
    })

    return filtered
  }, [categories, search])

  const toggleTag = (tagId: string) => {
    if (disabled) return
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedIds, tagId])
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const selectedTags = selectedIds.map((id) => tagMap.get(id)).filter(Boolean) as Tag[]

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Selected ({selectedTags.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="info"
                className={cn(
                  'cursor-pointer transition-colors hover:bg-blue-200',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <Input
        type="search"
        placeholder="Search interests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
      />

      {/* Categories */}
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
        {Object.entries(filteredCategories).map(([category, tags]) => (
          <div key={category} className="border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="flex w-full items-center justify-between py-1 text-left text-sm font-medium text-slate-700 hover:text-slate-900"
              disabled={disabled}
            >
              <span>
                {category} ({tags.length})
              </span>
              <svg
                className={cn(
                  'h-4 w-4 transition-transform',
                  expandedCategories.has(category) && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedCategories.has(category) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const isSelected = selectedIds.includes(tag.id)
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? 'info' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isSelected ? 'hover:bg-blue-200' : 'hover:bg-slate-100',
                        disabled && 'cursor-not-allowed opacity-50'
                      )}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {Object.keys(filteredCategories).length === 0 && (
          <p className="py-4 text-center text-sm text-slate-500">No interests found</p>
        )}
      </div>
    </div>
  )
}
