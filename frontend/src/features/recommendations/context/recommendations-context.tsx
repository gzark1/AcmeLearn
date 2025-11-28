import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

import type { ChatMessage, ExpandedState, RecommendationRead, ClarificationResponse } from '../types'

type RecommendationsContextValue = {
  // Chat messages for current session
  messages: ChatMessage[]
  addUserMessage: (query: string) => void
  addAIRecommendations: (data: RecommendationRead) => void
  addAIClarification: (data: ClarificationResponse) => void
  removeLastMessage: () => void
  clearMessages: () => void

  // View state for viewing a past recommendation (from history)
  viewingHistoryItem: RecommendationRead | null
  setViewingHistoryItem: (item: RecommendationRead | null) => void

  // Expanded state for recommendation cards
  expanded: ExpandedState
  setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>
}

const RecommendationsContext = createContext<RecommendationsContextValue | null>(null)

export const RecommendationsProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [viewingHistoryItem, setViewingHistoryItem] = useState<RecommendationRead | null>(null)
  const [expanded, setExpanded] = useState<ExpandedState>({
    explanations: new Set(),
    learningPath: false,
    comparison: { isOpen: false, selectedCourseIds: [] },
  })

  const addUserMessage = useCallback((query: string) => {
    setMessages((prev) => [...prev, { type: 'user', query, timestamp: new Date() }])
    // Clear any history view when starting new chat
    setViewingHistoryItem(null)
  }, [])

  const addAIRecommendations = useCallback((data: RecommendationRead) => {
    setMessages((prev) => [...prev, { type: 'ai-recommendations', data, timestamp: new Date() }])
    // Reset expanded state for new response
    setExpanded({
      explanations: new Set(),
      learningPath: false,
      comparison: { isOpen: false, selectedCourseIds: [] },
    })
  }, [])

  const addAIClarification = useCallback((data: ClarificationResponse) => {
    setMessages((prev) => [...prev, { type: 'ai-clarification', data, timestamp: new Date() }])
  }, [])

  const removeLastMessage = useCallback(() => {
    setMessages((prev) => prev.slice(0, -1))
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setViewingHistoryItem(null)
    setExpanded({
      explanations: new Set(),
      learningPath: false,
      comparison: { isOpen: false, selectedCourseIds: [] },
    })
  }, [])

  return (
    <RecommendationsContext.Provider
      value={{
        messages,
        addUserMessage,
        addAIRecommendations,
        addAIClarification,
        removeLastMessage,
        clearMessages,
        viewingHistoryItem,
        setViewingHistoryItem,
        expanded,
        setExpanded,
      }}
    >
      {children}
    </RecommendationsContext.Provider>
  )
}

export const useRecommendationsContext = () => {
  const context = useContext(RecommendationsContext)
  if (!context) {
    throw new Error('useRecommendationsContext must be used within RecommendationsProvider')
  }
  return context
}
