import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { useNotifications } from '@/stores/notifications'

import type { RecommendationRequest, RecommendationResponse } from '../types'

export const generateRecommendations = async (
  data: RecommendationRequest
): Promise<RecommendationResponse> => {
  return api.post('/users/me/recommendations', data) as Promise<RecommendationResponse>
}

export const useGenerateRecommendations = () => {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()

  return useMutation({
    mutationFn: generateRecommendations,
    onSuccess: () => {
      // Invalidate quota (it decreased)
      queryClient.invalidateQueries({ queryKey: ['recommendation-quota'] })
      // Invalidate history (new recommendation added)
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { status?: number; data?: { detail?: string } } }
      const status = axiosError?.response?.status
      const detail = axiosError?.response?.data?.detail

      if (status === 429) {
        addNotification({
          type: 'error',
          title: 'Rate Limit Reached',
          message: "You've used all your recommendations for today. Try again tomorrow.",
        })
      } else if (status === 504) {
        addNotification({
          type: 'error',
          title: 'Request Timeout',
          message: 'The AI is taking too long. Please try again.',
        })
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: detail || 'Failed to generate recommendations.',
        })
      }
    },
  })
}
