import { Button } from '@/components/ui/button'
import {
  useProfileBreakdown,
  useLevelDistribution,
  useTimeDistribution,
  usePopularTags,
  useUserGrowth,
  useCategoryDistribution,
} from '@/features/admin/api'
import {
  ProfileBreakdownChart,
  LevelDistribution,
  TimeDistribution,
  PopularTagsChart,
  UserGrowthChart,
  CategoryDistribution,
} from '@/features/admin/components'
import { exportAnalyticsToCsv } from '@/features/admin/utils/export-csv'

export const AdminAnalyticsPage = () => {
  const { data: profileBreakdown, isLoading: profileLoading } = useProfileBreakdown()
  const { data: levelDist, isLoading: levelLoading } = useLevelDistribution()
  const { data: timeDist, isLoading: timeLoading } = useTimeDistribution()
  const { data: popularTags, isLoading: tagsLoading } = usePopularTags(50)
  const { data: userGrowth, isLoading: growthLoading } = useUserGrowth(30)
  const { data: categoryDist, isLoading: categoryLoading } = useCategoryDistribution()

  const isAnyLoading = profileLoading || levelLoading || timeLoading || tagsLoading || growthLoading || categoryLoading

  const handleExportCsv = () => {
    exportAnalyticsToCsv({
      profileBreakdown,
      levelDistribution: levelDist,
      timeDistribution: timeDist,
      popularTags,
      userGrowth,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-1 text-slate-600">Platform usage statistics and insights</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCsv}
          disabled={isAnyLoading}
        >
          Export CSV
        </Button>
      </div>

      {/* User Growth Chart */}
      <UserGrowthChart
        data={userGrowth?.data ?? []}
        periodDays={userGrowth?.period_days ?? 30}
        isLoading={growthLoading}
      />

      {/* Profile Completion Breakdown */}
      <ProfileBreakdownChart
        complete={profileBreakdown?.complete ?? 0}
        partial={profileBreakdown?.partial ?? 0}
        empty={profileBreakdown?.empty ?? 0}
        total={profileBreakdown?.total ?? 0}
        isLoading={profileLoading}
      />

      {/* Level & Time Distribution Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        <LevelDistribution
          beginner={levelDist?.beginner ?? 0}
          intermediate={levelDist?.intermediate ?? 0}
          advanced={levelDist?.advanced ?? 0}
          notSet={levelDist?.not_set ?? 0}
          isLoading={levelLoading}
        />
        <TimeDistribution
          hours1to5={timeDist?.hours_1_5 ?? 0}
          hours5to10={timeDist?.hours_5_10 ?? 0}
          hours10to20={timeDist?.hours_10_20 ?? 0}
          hours20Plus={timeDist?.hours_20_plus ?? 0}
          notSet={timeDist?.not_set ?? 0}
          isLoading={timeLoading}
        />
      </div>

      {/* Popular Tags by Category */}
      <PopularTagsChart
        tags={popularTags?.tags ?? []}
        isLoading={tagsLoading}
      />

      {/* Category Interest Distribution */}
      <CategoryDistribution
        categories={categoryDist?.categories ?? []}
        totalSelections={categoryDist?.total_selections ?? 0}
        isLoading={categoryLoading}
      />
    </div>
  )
}

export default AdminAnalyticsPage
