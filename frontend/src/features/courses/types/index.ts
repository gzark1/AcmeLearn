export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export type Tag = {
  id: string
  name: string
  category: string | null
}

export type Skill = {
  id: string
  name: string
}

export type Course = {
  id: string
  title: string
  description: string
  difficulty: DifficultyLevel
  duration: number
  contents: string
  tags: Tag[]
  skills: Skill[]
}

export type CourseFilters = {
  difficulty?: DifficultyLevel
  tagIds?: string[]
  search?: string
}
