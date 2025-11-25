import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import type { CourseFilters as CourseFiltersType, DifficultyLevel } from '../types'

const DIFFICULTY_OPTIONS: { value: DifficultyLevel | ''; label: string }[] = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export type CourseFiltersProps = {
  onFiltersChange: (filters: CourseFiltersType) => void
}

export const CourseFilters = ({ onFiltersChange }: CourseFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  // Parse filters from URL
  const filters: CourseFiltersType = {
    difficulty: (searchParams.get('difficulty') as DifficultyLevel) || undefined,
    tagIds: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    search: searchParams.get('search') || undefined,
  }

  const hasActiveFilters = filters.difficulty || filters.tagIds?.length || filters.search

  // Update URL params
  const updateFilters = (newFilters: Partial<CourseFiltersType>) => {
    const merged = { ...filters, ...newFilters }
    const params = new URLSearchParams()

    if (merged.difficulty) {
      params.set('difficulty', merged.difficulty)
    }
    if (merged.tagIds?.length) {
      params.set('tags', merged.tagIds.join(','))
    }
    if (merged.search) {
      params.set('search', merged.search)
    }

    setSearchParams(params, { replace: true })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({}, { replace: true })
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        updateFilters({ search: searchInput || undefined })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [searchParams])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={filters.difficulty === option.value || (!filters.difficulty && !option.value) ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => updateFilters({ difficulty: option.value || undefined })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters / Clear */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Active filters:</span>
          {filters.difficulty && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
              {filters.difficulty}
            </span>
          )}
          {filters.search && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
              "{filters.search}"
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
