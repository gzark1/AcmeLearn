import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { exportUsers } from '../api/export-users'

type SearchAndFiltersProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  profileFilter: string
  onProfileFilterChange: (value: string) => void
}

export const SearchAndFilters = ({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  profileFilter,
  onProfileFilterChange,
}: SearchAndFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(searchValue)
  const [isExporting, setIsExporting] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(localSearch)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportUsers({
        email: searchValue || undefined,
        is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        profile_status: profileFilter || undefined,
      })
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Export Row */}
      <div className="flex items-center justify-between">
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
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-6">
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

        {/* Profile Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Profile:</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={profileFilter === '' ? 'default' : 'ghost'}
              onClick={() => onProfileFilterChange('')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={profileFilter === 'complete' ? 'default' : 'ghost'}
              onClick={() => onProfileFilterChange('complete')}
            >
              Complete
            </Button>
            <Button
              size="sm"
              variant={profileFilter === 'partial' ? 'default' : 'ghost'}
              onClick={() => onProfileFilterChange('partial')}
            >
              Partial
            </Button>
            <Button
              size="sm"
              variant={profileFilter === 'empty' ? 'default' : 'ghost'}
              onClick={() => onProfileFilterChange('empty')}
            >
              Empty
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
