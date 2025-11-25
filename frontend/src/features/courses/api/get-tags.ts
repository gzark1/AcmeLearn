import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { Tag } from '../types'

export const getTags = async (): Promise<Tag[]> => {
  const tags = (await api.get('/api/tags')) as Tag[]
  return tags
}

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    staleTime: Infinity, // Tags rarely change
  })
}

export type TagCategories = Record<string, Tag[]>

export const getTagCategories = async (): Promise<TagCategories> => {
  const categories = (await api.get('/api/tag-categories')) as TagCategories
  return categories
}

export const useTagCategories = () => {
  return useQuery({
    queryKey: ['tag-categories'],
    queryFn: getTagCategories,
    staleTime: Infinity, // Tags rarely change
  })
}
