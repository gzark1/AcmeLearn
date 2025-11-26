import type {
  ProfileBreakdownResponse,
  LevelDistributionResponse,
  TimeDistributionApiResponse,
  PopularTagsApiResponse,
  UserGrowthResponse,
} from '../api/get-analytics-data'

type AnalyticsExportData = {
  profileBreakdown?: ProfileBreakdownResponse
  levelDistribution?: LevelDistributionResponse
  timeDistribution?: TimeDistributionApiResponse
  popularTags?: PopularTagsApiResponse
  userGrowth?: UserGrowthResponse
}

const escapeCSV = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export const exportAnalyticsToCsv = (data: AnalyticsExportData): void => {
  const lines: string[] = []
  const timestamp = new Date().toISOString()

  // Header
  lines.push('AcmeLearn Analytics Export')
  lines.push(`Generated: ${timestamp}`)
  lines.push('')

  // Profile Breakdown Section
  if (data.profileBreakdown) {
    const pb = data.profileBreakdown
    const total = pb.total || 1
    lines.push('=== Profile Completion Breakdown ===')
    lines.push('Status,Count,Percentage')
    lines.push(`Complete,${pb.complete},${((pb.complete / total) * 100).toFixed(1)}%`)
    lines.push(`Partial,${pb.partial},${((pb.partial / total) * 100).toFixed(1)}%`)
    lines.push(`Empty,${pb.empty},${((pb.empty / total) * 100).toFixed(1)}%`)
    lines.push(`Total,${pb.total},100%`)
    lines.push('')
  }

  // Level Distribution Section
  if (data.levelDistribution) {
    const ld = data.levelDistribution
    const total = ld.beginner + ld.intermediate + ld.advanced + ld.not_set || 1
    lines.push('=== User Level Distribution ===')
    lines.push('Level,Count,Percentage')
    lines.push(`Beginner,${ld.beginner},${((ld.beginner / total) * 100).toFixed(1)}%`)
    lines.push(`Intermediate,${ld.intermediate},${((ld.intermediate / total) * 100).toFixed(1)}%`)
    lines.push(`Advanced,${ld.advanced},${((ld.advanced / total) * 100).toFixed(1)}%`)
    lines.push(`Not Set,${ld.not_set},${((ld.not_set / total) * 100).toFixed(1)}%`)
    lines.push('')
  }

  // Time Distribution Section
  if (data.timeDistribution) {
    const td = data.timeDistribution
    const total = td.hours_1_5 + td.hours_5_10 + td.hours_10_20 + td.hours_20_plus + td.not_set || 1
    lines.push('=== Time Commitment Distribution ===')
    lines.push('Hours/Week,Count,Percentage')
    lines.push(`1-5 hours,${td.hours_1_5},${((td.hours_1_5 / total) * 100).toFixed(1)}%`)
    lines.push(`5-10 hours,${td.hours_5_10},${((td.hours_5_10 / total) * 100).toFixed(1)}%`)
    lines.push(`10-20 hours,${td.hours_10_20},${((td.hours_10_20 / total) * 100).toFixed(1)}%`)
    lines.push(`20+ hours,${td.hours_20_plus},${((td.hours_20_plus / total) * 100).toFixed(1)}%`)
    lines.push(`Not Set,${td.not_set},${((td.not_set / total) * 100).toFixed(1)}%`)
    lines.push('')
  }

  // Popular Tags Section
  if (data.popularTags && data.popularTags.tags.length > 0) {
    lines.push('=== Popular Tags ===')
    lines.push('Category,Tag Name,User Count')
    for (const tag of data.popularTags.tags) {
      lines.push(`${escapeCSV(tag.tag_category)},${escapeCSV(tag.tag_name)},${tag.user_count}`)
    }
    lines.push('')
  }

  // User Growth Section
  if (data.userGrowth && data.userGrowth.data.length > 0) {
    lines.push(`=== User Growth (Last ${data.userGrowth.period_days} Days) ===`)
    lines.push('Date,New Users,Cumulative Users')
    for (const point of data.userGrowth.data) {
      lines.push(`${point.date},${point.new_users},${point.cumulative_users}`)
    }
    lines.push('')
  }

  // Create and download file
  const csvContent = lines.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `acmelearn-analytics-${timestamp.split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
