import { RecommendationsProvider, RecommendationChat } from '@/features/recommendations'

export const RecommendationsPage = () => {
  return (
    <RecommendationsProvider>
      <RecommendationChat />
    </RecommendationsProvider>
  )
}

export default RecommendationsPage
