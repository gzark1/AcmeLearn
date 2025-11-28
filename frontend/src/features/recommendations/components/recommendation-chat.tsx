import { useState, useRef, useEffect } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'

import { useQuota, useGenerateRecommendations } from '../api'
import { useRecommendationsContext } from '../context'
import type { RecommendationResponse } from '../types'
import { RateLimitIndicator } from './rate-limit-indicator'
import { UserMessage } from './user-message'
import { AIResponse } from './ai-response'
import { ClarificationMessage } from './clarification-message'
import { AILoadingState } from './ai-loading-state'
import { RecommendationInput } from './recommendation-input'
import { RecommendationHistory } from './recommendation-history'

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <SparklesIcon className="h-16 w-16 text-blue-400" />
    <h2 className="mt-6 text-xl font-semibold text-slate-900">
      Get Personalized Course Recommendations
    </h2>
    <p className="mt-2 max-w-md text-base text-slate-600">
      Tell me what you'd like to learn, and I'll find the perfect courses for you based on your
      profile and goals.
    </p>
    <div className="mt-6 space-y-2 text-sm text-slate-500">
      <p className="font-medium">Try asking:</p>
      <ul className="list-inside list-disc space-y-1 text-left italic">
        <li>"I want to learn Python for data science"</li>
        <li>"Help me improve my leadership skills"</li>
        <li>"Show me beginner courses in web development"</li>
      </ul>
    </div>
  </div>
)

export const RecommendationChat = () => {
  const [inputQuery, setInputQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    addUserMessage,
    addAIRecommendations,
    addAIClarification,
    removeLastMessage,
    viewingHistoryItem,
    setViewingHistoryItem,
    expanded,
    setExpanded,
  } = useRecommendationsContext()

  const { data: quota } = useQuota()
  const generateMutation = useGenerateRecommendations()

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, generateMutation.isPending])

  const handleResponse = (result: RecommendationResponse) => {
    if ('type' in result && result.type === 'clarification_needed') {
      addAIClarification(result)
    } else {
      // Cast is safe because we checked for clarification above
      addAIRecommendations(result as import('../types').RecommendationRead)
    }
  }

  const handleSubmit = async () => {
    if (!inputQuery.trim() || generateMutation.isPending) return

    const query = inputQuery.trim()
    setInputQuery('')

    // Optimistic update - add user message
    addUserMessage(query)

    try {
      const result = await generateMutation.mutateAsync({ query })
      handleResponse(result)
    } catch {
      // Error handled by mutation's onError - remove optimistic message
      removeLastMessage()
    }
  }

  const handleProfileBased = async () => {
    if (generateMutation.isPending) return

    // Optimistic update - add user message
    addUserMessage('Recommend courses based on my profile')

    try {
      const result = await generateMutation.mutateAsync({})
      handleResponse(result)
    } catch {
      // Error handled by mutation's onError - remove optimistic message
      removeLastMessage()
    }
  }

  const isDisabled = generateMutation.isPending || quota?.remaining === 0

  // When viewing a history item, show it directly without chat interface
  const renderContent = () => {
    if (viewingHistoryItem) {
      return (
        <div className="p-6">
          {/* Show the query */}
          {viewingHistoryItem.query && (
            <UserMessage
              query={viewingHistoryItem.query}
              timestamp={new Date(viewingHistoryItem.created_at)}
            />
          )}
          {!viewingHistoryItem.query && (
            <UserMessage
              query="Recommend courses based on my profile"
              timestamp={new Date(viewingHistoryItem.created_at)}
            />
          )}
          {/* Show the recommendation */}
          <AIResponse data={viewingHistoryItem} expanded={expanded} setExpanded={setExpanded} />
          {/* Back to chat button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setViewingHistoryItem(null)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              ← Back to current chat
            </button>
          </div>
        </div>
      )
    }

    // Normal chat view
    if (messages.length === 0 && !generateMutation.isPending) {
      return (
        <div className="p-6">
          <EmptyState />
        </div>
      )
    }

    return (
      <div className="p-6">
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.type === 'user' && <UserMessage query={msg.query} timestamp={msg.timestamp} />}
            {msg.type === 'ai-recommendations' && (
              <AIResponse data={msg.data} expanded={expanded} setExpanded={setExpanded} />
            )}
            {msg.type === 'ai-clarification' && <ClarificationMessage {...msg.data} />}
          </div>
        ))}
        {generateMutation.isPending && <AILoadingState />}
        <div ref={messagesEndRef} />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0">
      {/* History Sidebar */}
      <RecommendationHistory />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header with quota */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h1 className="text-xl font-bold text-slate-900">AI Course Recommendations</h1>
          <RateLimitIndicator quota={quota} />
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {/* Messages (scrollable) */}
          <div className="flex-1 overflow-y-auto">{renderContent()}</div>

          {/* Input area (sticky bottom) - hide when viewing history */}
          {!viewingHistoryItem && (
            <div className="border-t border-slate-200 bg-slate-50 p-4">
              {quota?.remaining === 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                  <p className="font-medium text-red-900">Daily limit reached</p>
                  <p className="mt-1 text-sm text-red-700">
                    You've used all {quota.limit} recommendations for today. Your quota resets at
                    midnight.
                  </p>
                </div>
              ) : (
                <RecommendationInput
                  value={inputQuery}
                  onChange={setInputQuery}
                  onSubmit={handleSubmit}
                  onProfileBased={handleProfileBased}
                  disabled={isDisabled}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
