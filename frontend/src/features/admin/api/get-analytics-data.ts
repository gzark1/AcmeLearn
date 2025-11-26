import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import type { ProfileBreakdown, LevelDistribution, TimeDistribution, PopularTagsResponse } from '../types'

// Profile Breakdown
export type ProfileBreakdownResponse = ProfileBreakdown & { total: number }

export const getProfileBreakdown = async (): Promise<ProfileBreakdownResponse> => {
  return api.get('/admin/analytics/profile-breakdown') as Promise<ProfileBreakdownResponse>
}

export const useProfileBreakdown = () => {
  return useQuery({
    queryKey: ['admin', 'analytics', 'profile-breakdown'],
    queryFn: getProfileBreakdown,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Level Distribution
export type LevelDistributionResponse = LevelDistribution & { not_set: number }

export const getLevelDistribution = async (): Promise<LevelDistributionResponse> => {
  return api.get('/admin/analytics/level-distribution') as Promise<LevelDistributionResponse>
}

export const useLevelDistribution = () => {
  return useQuery({
    queryKey: ['admin', 'analytics', 'level-distribution'],
    queryFn: getLevelDistribution,
    staleTime: 15 * 60 * 1000,
  })
}

// Time Distribution
export type TimeDistributionApiResponse = {
  hours_1_5: number
  hours_5_10: number
  hours_10_20: number
  hours_20_plus: number
  not_set: number
}

export const getTimeDistribution = async (): Promise<TimeDistributionApiResponse> => {
  return api.get('/admin/analytics/time-distribution') as Promise<TimeDistributionApiResponse>
}

export const useTimeDistribution = () => {
  return useQuery({
    queryKey: ['admin', 'analytics', 'time-distribution'],
    queryFn: getTimeDistribution,
    staleTime: 15 * 60 * 1000,
  })
}

// Popular Tags
export type PopularTagWithCategory = {
  tag_id: string
  tag_name: string
  tag_category: string
  user_count: number
}

export type PopularTagsApiResponse = {
  tags: PopularTagWithCategory[]
  total_tags: number
}

export const getPopularTags = async (limit: number = 20): Promise<PopularTagsApiResponse> => {
  return api.get(`/admin/analytics/tags/popular?limit=${limit}`) as Promise<PopularTagsApiResponse>
}

export const usePopularTags = (limit: number = 20) => {
  return useQuery({
    queryKey: ['admin', 'analytics', 'popular-tags', limit],
    queryFn: () => getPopularTags(limit),
    staleTime: 15 * 60 * 1000,
  })
}
