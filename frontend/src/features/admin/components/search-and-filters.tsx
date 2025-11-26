import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SearchAndFiltersProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
}

export const SearchAndFilters = ({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: SearchAndFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(searchValue)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(localSearch)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search by email..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-64"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Status:</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={statusFilter === '' ? 'default' : 'ghost'}
            onClick={() => onStatusFilterChange('')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'active' ? 'default' : 'ghost'}
            onClick={() => onStatusFilterChange('active')}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'inactive' ? 'default' : 'ghost'}
            onClick={() => onStatusFilterChange('inactive')}
          >
            Inactive
          </Button>
        </div>
      </div>
    </div>
  )
}
