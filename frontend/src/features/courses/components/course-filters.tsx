import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

import { useTags } from '../api/get-tags'
import type { CourseFilters as CourseFiltersType, DifficultyLevel, DurationRange, SortOption, Tag } from '../types'

const DIFFICULTY_OPTIONS: { value: DifficultyLevel | ''; label: string }[] = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const DURATION_OPTIONS: { value: DurationRange | ''; label: string; description: string }[] = [
  { value: '', label: 'Any Duration', description: '' },
  { value: 'short', label: 'Short', description: '< 30h' },
  { value: 'medium', label: 'Medium', description: '30-60h' },
  { value: 'long', label: 'Long', description: '> 60h' },
]

const SORT_OPTIONS: { value: SortOption | ''; label: string }[] = [
  { value: '', label: 'Default' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'duration-asc', label: 'Duration (Short-Long)' },
  { value: 'duration-desc', label: 'Duration (Long-Short)' },
  { value: 'difficulty', label: 'Difficulty' },
]

export type CourseFiltersProps = {
  onFiltersChange: (filters: CourseFiltersType) => void
  totalCourses?: number
  filteredCount?: number
}

export const CourseFilters = ({ onFiltersChange, totalCourses, filteredCount }: CourseFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: allTags = [] } = useTags()

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  // Parse filters from URL
  const filters: CourseFiltersType = {
    difficulty: (searchParams.get('difficulty') as DifficultyLevel) || undefined,
    tagIds: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    search: searchParams.get('search') || undefined,
    duration: (searchParams.get('duration') as DurationRange) || undefined,
    sort: (searchParams.get('sort') as SortOption) || undefined,
  }

  // Get selected tags objects
  const selectedTags = allTags.filter((tag) => filters.tagIds?.includes(tag.id))

  const hasActiveFilters =
    filters.difficulty || filters.tagIds?.length || filters.search || filters.duration

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
    if (merged.duration) {
      params.set('duration', merged.duration)
    }
    if (merged.sort) {
      params.set('sort', merged.sort)
    }

    setSearchParams(params, { replace: true })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({}, { replace: true })
  }

  // Remove a specific tag
  const removeTag = (tagId: string) => {
    const newTagIds = filters.tagIds?.filter((id) => id !== tagId)
    updateFilters({ tagIds: newTagIds?.length ? newTagIds : undefined })
  }

  // Handle tag selection
  const handleTagChange = (tags: Tag[]) => {
    const tagIds = tags.map((t) => t.id)
    updateFilters({ tagIds: tagIds.length ? tagIds : undefined })
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
      {/* Search and Filters Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by title, description, or tags..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tag Multi-Select */}
          <Listbox value={selectedTags} onChange={handleTagChange} multiple>
            <div className="relative">
              <ListboxButton
                className={cn(
                  'flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm',
                  'hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  selectedTags.length > 0 && 'border-blue-500 bg-blue-50'
                )}
              >
                <span>Tags</span>
                {selectedTags.length > 0 && (
                  <Badge variant="primary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {selectedTags.length}
                  </Badge>
                )}
                <ChevronDownIcon className="h-4 w-4 text-slate-500" />
              </ListboxButton>
              <ListboxOptions
                className={cn(
                  'absolute left-0 z-50 mt-1 max-h-60 w-64 overflow-auto rounded-lg border border-slate-200',
                  'bg-white py-1 shadow-lg focus:outline-none',
                  'sm:left-0 sm:right-auto'
                )}
              >
                {allTags.map((tag) => (
                  <ListboxOption
                    key={tag.id}
                    value={tag}
                    className={({ focus, selected }) =>
                      cn(
                        'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                        focus && 'bg-slate-100',
                        selected && 'bg-blue-50 text-blue-700'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span>{tag.name}</span>
                        {selected && <CheckIcon className="h-4 w-4 text-blue-600" />}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>

          {/* Duration Filter */}
          <Listbox
            value={DURATION_OPTIONS.find((d) => d.value === (filters.duration || '')) || DURATION_OPTIONS[0]}
            onChange={(option) => updateFilters({ duration: option.value || undefined })}
          >
            <div className="relative">
              <ListboxButton
                className={cn(
                  'flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm',
                  'hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  filters.duration && 'border-blue-500 bg-blue-50'
                )}
              >
                <span>
                  {filters.duration
                    ? DURATION_OPTIONS.find((d) => d.value === filters.duration)?.label
                    : 'Duration'}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-slate-500" />
              </ListboxButton>
              <ListboxOptions
                className={cn(
                  'absolute z-50 mt-1 w-40 overflow-auto rounded-lg border border-slate-200',
                  'bg-white py-1 shadow-lg focus:outline-none'
                )}
              >
                {DURATION_OPTIONS.map((option) => (
                  <ListboxOption
                    key={option.value}
                    value={option}
                    className={({ focus, selected }) =>
                      cn(
                        'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                        focus && 'bg-slate-100',
                        selected && 'bg-blue-50 text-blue-700'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span>
                          {option.label}
                          {option.description && (
                            <span className="ml-1 text-slate-500">({option.description})</span>
                          )}
                        </span>
                        {selected && <CheckIcon className="h-4 w-4 text-blue-600" />}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>

          {/* Sort Dropdown */}
          <Listbox
            value={SORT_OPTIONS.find((s) => s.value === (filters.sort || '')) || SORT_OPTIONS[0]}
            onChange={(option) => updateFilters({ sort: option.value || undefined })}
          >
            <div className="relative">
              <ListboxButton
                className={cn(
                  'flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm',
                  'hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  filters.sort && 'border-blue-500 bg-blue-50'
                )}
              >
                <span>
                  {filters.sort
                    ? SORT_OPTIONS.find((s) => s.value === filters.sort)?.label
                    : 'Sort by'}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-slate-500" />
              </ListboxButton>
              <ListboxOptions
                className={cn(
                  'absolute right-0 z-50 mt-1 w-48 overflow-auto rounded-lg border border-slate-200',
                  'bg-white py-1 shadow-lg focus:outline-none'
                )}
              >
                {SORT_OPTIONS.map((option) => (
                  <ListboxOption
                    key={option.value}
                    value={option}
                    className={({ focus, selected }) =>
                      cn(
                        'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                        focus && 'bg-slate-100',
                        selected && 'bg-blue-50 text-blue-700'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span>{option.label}</span>
                        {selected && <CheckIcon className="h-4 w-4 text-blue-600" />}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
      </div>

      {/* Difficulty Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {DIFFICULTY_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={
              filters.difficulty === option.value || (!filters.difficulty && !option.value)
                ? 'primary'
                : 'secondary'
            }
            size="sm"
            onClick={() => updateFilters({ difficulty: option.value || undefined })}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Active Filters and Results */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Filter Pills */}
          {filters.difficulty && (
            <Badge
              variant="info"
              className="flex items-center gap-1 pr-1"
            >
              {filters.difficulty}
              <button
                onClick={() => updateFilters({ difficulty: undefined })}
                className="ml-1 rounded-full p-0.5 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`Remove ${filters.difficulty} filter`}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.duration && (
            <Badge
              variant="info"
              className="flex items-center gap-1 pr-1"
            >
              {DURATION_OPTIONS.find((d) => d.value === filters.duration)?.label}
              <button
                onClick={() => updateFilters({ duration: undefined })}
                className="ml-1 rounded-full p-0.5 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Remove duration filter"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="info"
              className="flex items-center gap-1 pr-1"
            >
              {tag.name}
              <button
                onClick={() => removeTag(tag.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`Remove ${tag.name} filter`}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.search && (
            <Badge
              variant="info"
              className="flex items-center gap-1 pr-1"
            >
              "{filters.search}"
              <button
                onClick={() => {
                  setSearchInput('')
                  updateFilters({ search: undefined })
                }}
                className="ml-1 rounded-full p-0.5 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Remove search filter"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="rounded text-sm text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Results Counter */}
        {totalCourses !== undefined && filteredCount !== undefined && (
          <p className="text-sm text-slate-500">
            Showing {filteredCount} of {totalCourses} courses
          </p>
        )}
      </div>
    </div>
  )
}
