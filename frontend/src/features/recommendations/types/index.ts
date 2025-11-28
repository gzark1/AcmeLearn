// Response types (match backend/schemas/recommendation.py)

export type RecommendedCourse = {
  course_id: string
  title: string
  match_score: number
  explanation: string
  skill_gaps_addressed: string[]
  estimated_weeks: number | null
}

export type LearningPathStep = {
  order: number
  course_id: string
  title: string
  rationale: string
}

export type ProfileAnalysisSummary = {
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  skill_gaps: string[]
  confidence: number
}

export type RecommendationRead = {
  id: string
  query: string | null
  profile_analysis: ProfileAnalysisSummary | null
  profile_feedback: string | null
  courses: RecommendedCourse[]
  learning_path: LearningPathStep[]
  overall_summary: string | null
  created_at: string
}

export type ClarificationResponse = {
  type: 'clarification_needed'
  intent: 'vague' | 'irrelevant'
  message: string
  query: string | null
}

export type RecommendationResponse = RecommendationRead | ClarificationResponse

export type RecommendationQuota = {
  used: number
  limit: number
  remaining: number
}

// Request types

export type RecommendationRequest = {
  query?: string | null
  num_recommendations?: number
}

// List response type

export type RecommendationListResponse = {
  recommendations: RecommendationRead[]
  count: number
}
