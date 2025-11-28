import { useState } from 'react'
import {
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/utils/cn'

import { useRecommendations } from '../api'
import { useRecommendationsContext } from '../context'
import type { RecommendationRead } from '../types'

export type RecommendationHistoryProps = {
  className?: string
}

export const RecommendationHistory = ({ className }: RecommendationHistoryProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { data, isLoading } = useRecommendations()
  const { viewingHistoryItem, setViewingHistoryItem, clearMessages, messages } =
    useRecommendationsContext()

  const handleSelectItem = (item: RecommendationRead) => {
    setViewingHistoryItem(item)
  }

  const handleNewChat = () => {
    clearMessages()
  }

  // Determine if an item is "active" (either viewing it or it matches current session's last recommendation)
  const isActive = (item: RecommendationRead) => {
    if (viewingHistoryItem) {
      return viewingHistoryItem.id === item.id
    }
    // Check if current session has this recommendation
    const lastAIMessage = [...messages].reverse().find((m) => m.type === 'ai-recommendations')
    if (lastAIMessage && lastAIMessage.type === 'ai-recommendations') {
      return lastAIMessage.data.id === item.id
    }
    return false
  }

  if (isCollapsed) {
    return (
      <div className={cn('flex flex-col border-r border-slate-200 bg-slate-50', className)}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex h-full w-10 flex-col items-center gap-2 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Expand history panel"
        >
          <ChevronRightIcon className="h-5 w-5" />
          <span className="text-xs font-medium [writing-mode:vertical-lr]">History</span>
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex w-64 flex-col border-r border-slate-200 bg-slate-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-slate-500" />
          <span className="font-medium text-slate-700">History</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          aria-label="Collapse history panel"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="border-b border-slate-200 p-2">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
        >
          <PlusIcon className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg bg-slate-200 p-3">
                <div className="h-3 w-3/4 rounded bg-slate-300" />
                <div className="mt-2 h-2 w-1/2 rounded bg-slate-300" />
              </div>
            ))}
          </div>
        ) : !data?.recommendations.length ? (
          <p className="px-2 py-4 text-center text-sm text-slate-500">
            No previous recommendations yet.
          </p>
        ) : (
          <div className="space-y-1">
            {data.recommendations.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={cn(
                  'w-full rounded-lg p-3 text-left transition-colors',
                  isActive(item)
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-slate-100 text-slate-700'
                )}
              >
                <p className="line-clamp-2 text-sm font-medium">
                  {item.query || 'Profile-based recommendations'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
