# Admin Analytics Page Design

## Document Information

| Field | Value |
|-------|-------|
| Page | Analytics Dashboard (`/admin/analytics`) |
| Access | Superusers only |
| Purpose | Aggregate insights about platform usage, engagement, and content effectiveness |
| Related | `OVERVIEW.md`, `DASHBOARD.md`, `ADMIN_FEATURE_PROPOSAL.md` |

---

## Page Purpose

The analytics page answers critical strategic questions:
1. **Is the platform growing?** User growth trends
2. **Are users engaged?** Profile completion and update frequency
3. **What do users want?** Tag popularity and content demand
4. **Where are the gaps?** Empty profiles and unused content

This is a **nice-to-have feature** (Phase 4) - prioritize Dashboard and User Management first.

---

## Page Layout

### Desktop View (1280px+)

```
┌──────────────────┬───────────────────────────────────────────────────────────┐
│                  │                                                           │
│   ADMIN NAV      │   Analytics                                               │
│   (Sidebar)      │                                                           │
│                  │   User Growth (Last 30 Days)                              │
│   Dashboard      │   ┌─────────────────────────────────────────────────────┐ │
│   Users          │   │         *                                           │ │
│   Analytics ●    │   │        * *           *                              │ │
│                  │   │       *   *         * *    *                        │ │
│                  │   │      *     *       *   *  * *                       │ │
│                  │   │     *       * * * *     **   * *                    │ │
│                  │   │  ──────────────────────────────────────────────── │ │
│                  │   │  Oct 28                             Nov 26         │ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
│                  │   Profile Completion Breakdown                            │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│                  │   │  ████████████████████████████████████ 55% Complete  │ │
│                  │   │                                       (18 users)     │ │
│                  │   │  ████████████ 15% Partial (5 users)                 │ │
│                  │   │  ████████████████████ 30% Empty (10 users)          │ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
│                  │   ┌─────────────────────────┐  ┌────────────────────────┐│
│                  │   │ User Level Distribution │  │ Time Commitment Dist.  ││
│                  │   │                         │  │                        ││
│                  │   │ Beginner:     18% (4)   │  │ 1-5 hrs:     17% (3)   ││
│                  │   │ Intermediate: 41% (9)   │  │ 5-10 hrs:    33% (6)   ││
│                  │   │ Advanced:     41% (9)   │  │ 10-20 hrs:   22% (4)   ││
│                  │   │                         │  │ 20+ hrs:     28% (5)   ││
│                  │   └─────────────────────────┘  └────────────────────────┘│
│                  │                                                           │
│                  │   Popular Tags by Category                                │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│                  │   │ SOFT_SKILLS                                         │ │
│                  │   │ emotional intelligence  ████████████ 3              │ │
│                  │   │ leadership              ████████ 2                  │ │
│                  │   │ work-life balance       ████ 1                      │ │
│                  │   │                                                     │ │
│                  │   │ PROGRAMMING                                         │ │
│                  │   │ go                      ████████ 2                  │ │
│                  │   │ javascript              ████ 1                      │ │
│                  │   │ angular                 ████ 1                      │ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
│                  │   Category Interest Distribution                          │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│                  │   │ SOFT_SKILLS:   ████████████████████████ 16%        │ │
│                  │   │ BUSINESS:      ██████████████████ 13%              │ │
│                  │   │ DATA_SCIENCE:  ██████████████████ 13%              │ │
│                  │   │ MARKETING:     ████████████████ 13%                │ │
│                  │   │ DEVOPS:        ██████████████ 11%                  │ │
│                  │   │ PROGRAMMING:   ██████████████ 11%                  │ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
└──────────────────┴───────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### User Growth Chart (Line Chart)

**Purpose**: Visualize user registration trend over time.

**Chart Type**: Line chart (simple, no library needed for MVP)

**Specifications**:
- **Container**:
  - Background: `white`
  - Border: `1px solid slate-200`
  - Border radius: `12px`
  - Padding: `24px`
  - Height: `300px`

- **Title**:
  - Font size: `18px` (H4)
  - Font weight: `600` (semibold)
  - Color: `slate-900`
  - Margin bottom: `16px`

- **Chart Area**:
  - Grid lines: `1px solid slate-200`
  - Data line: `2px solid violet-500`
  - Data points: `6px` circles (`bg-violet-600`)
  - Hover state: Show tooltip with date and count

- **Axes**:
  - X-axis: Dates (format: "Oct 28", "Nov 4", etc.)
  - Y-axis: User count (0, 10, 20, 30...)
  - Label font size: `12px`
  - Label color: `slate-500`

**Implementation Note**:
- For MVP: Use simple SVG + line/circle elements (no charting library)
- For production: Consider `recharts` or `chart.js` if more complex charts needed

**Data Format**:
```typescript
type GrowthDataPoint = {
  date: string; // ISO date
  count: number;
};

type GrowthData = GrowthDataPoint[];

// Example
[
  { date: '2025-10-28', count: 0 },
  { date: '2025-11-04', count: 5 },
  { date: '2025-11-11', count: 12 },
  { date: '2025-11-18', count: 20 },
  { date: '2025-11-25', count: 27 },
  { date: '2025-11-26', count: 33 },
]
```

**Empty State**:
```
Not enough data to show growth trend yet.
Chart will appear after 7+ days of user activity.
```

---

### Profile Completion Breakdown (Horizontal Bar Chart)

**Purpose**: Show proportion of users with complete, partial, or empty profiles.

**Chart Type**: Horizontal stacked bar chart

**Visual Structure**:
```
████████████████████████████████████ 55% Complete (18 users)
████████████ 15% Partial (5 users)
████████████████████ 30% Empty (10 users)
```

**Specifications**:
- **Container**: Same as User Growth Chart

- **Bar**:
  - Height: `32px`
  - Border radius: `8px`
  - Layout: Horizontal flex (stacked segments)
  - Total width: 100%

- **Segments**:
  - **Complete**: `bg-violet-500`
  - **Partial**: `bg-amber-400`
  - **Empty**: `bg-slate-300`
  - Width: Proportional to percentage (e.g., 55% = 55% of bar width)

- **Labels**:
  - Position: Inside segment (if wide enough) or outside
  - Font size: `14px`
  - Color: `white` (inside), `slate-900` (outside)
  - Format: "{percentage}% {status} ({count} users)"

**Legend**:
```
● Complete (18)   ● Partial (5)   ● Empty (10)
```

**Data Format**:
```typescript
type ProfileBreakdown = {
  complete: number;
  partial: number;
  empty: number;
};

// Example
{ complete: 18, partial: 5, empty: 10 }
```

---

### User Level Distribution (Simple Bar Chart)

**Purpose**: Show how users distribute across beginner/intermediate/advanced levels.

**Chart Type**: Vertical bar chart or simple text list

**Visual Structure** (Text List - Simpler):
```
┌─────────────────────────┐
│ User Level Distribution │
├─────────────────────────┤
│ Beginner:     18% (4)   │
│ Intermediate: 41% (9)   │
│ Advanced:     41% (9)   │
└─────────────────────────┘
```

**Specifications**:
- **Container**: Same card styling as other panels
- **List Item**:
  - Font size: `14px`
  - Color: `slate-900`
  - Line height: `1.8`
  - Format: "{Level}: {percentage}% ({count})"

**Alternative** (Bar Chart):
```
Beginner     ████████████ 18% (4)
Intermediate ████████████████████████ 41% (9)
Advanced     ████████████████████████ 41% (9)
```

**Data Format**:
```typescript
type LevelDistribution = {
  beginner: number;
  intermediate: number;
  advanced: number;
};
```

---

### Time Commitment Distribution

**Purpose**: Show how users distribute across time commitment buckets.

**Visual Structure** (Same as Level Distribution):
```
┌────────────────────────┐
│ Time Commitment Dist.  │
├────────────────────────┤
│ 1-5 hrs:     17% (3)   │
│ 5-10 hrs:    33% (6)   │
│ 10-20 hrs:   22% (4)   │
│ 20+ hrs:     28% (5)   │
└────────────────────────┘
```

**Specifications**: Same as Level Distribution

**Bucket Logic**:
- **1-5 hours**: `time_commitment BETWEEN 1 AND 5`
- **5-10 hours**: `time_commitment BETWEEN 6 AND 10`
- **10-20 hours**: `time_commitment BETWEEN 11 AND 20`
- **20+ hours**: `time_commitment > 20`

---

### Popular Tags Chart

**Purpose**: Show which tags are most selected by users, grouped by category.

**Chart Type**: Horizontal bar chart (within each category)

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Popular Tags by Category                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ SOFT_SKILLS                                             │
│ emotional intelligence  ████████████ 3                  │
│ leadership              ████████ 2                      │
│ work-life balance       ████ 1                          │
│                                                         │
│ PROGRAMMING                                             │
│ go                      ████████ 2                      │
│ javascript              ████ 1                          │
│ angular                 ████ 1                          │
│                                                         │
│ MARKETING                                               │
│ seo                     ████████ 2                      │
│ ecommerce               ████████ 2                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- **Container**: Same as other panels

- **Category Header**:
  - Font size: `14px`
  - Font weight: `600` (semibold)
  - Color: `slate-900`
  - Text transform: `uppercase`
  - Margin top: `16px` (except first)
  - Margin bottom: `8px`

- **Tag Row**:
  - Layout: Flex (tag name, bar, count)
  - Gap: `12px`
  - Padding: `4px 0`

- **Tag Name**:
  - Font size: `14px`
  - Color: `slate-700`
  - Width: `200px` (fixed, for alignment)

- **Bar**:
  - Height: `20px`
  - Background: `violet-500`
  - Border radius: `4px`
  - Width: Proportional to max count in category
  - Flex grow: Based on percentage

- **Count**:
  - Font size: `14px`
  - Color: `slate-900`
  - Font weight: `500` (medium)
  - Min width: `30px` (for alignment)

**Data Format**:
```typescript
type TagPopularity = {
  tag_name: string;
  tag_category: string;
  user_count: number;
};

type PopularTagsByCategory = {
  [category: string]: TagPopularity[];
};

// Example
{
  'SOFT_SKILLS': [
    { tag_name: 'emotional intelligence', tag_category: 'SOFT_SKILLS', user_count: 3 },
    { tag_name: 'leadership', tag_category: 'SOFT_SKILLS', user_count: 2 },
    { tag_name: 'work-life balance', tag_category: 'SOFT_SKILLS', user_count: 1 },
  ],
  'PROGRAMMING': [
    { tag_name: 'go', tag_category: 'PROGRAMMING', user_count: 2 },
    { tag_name: 'javascript', tag_category: 'PROGRAMMING', user_count: 1 },
    { tag_name: 'angular', tag_category: 'PROGRAMMING', user_count: 1 },
  ],
}
```

**Display Logic**:
- Show top 3 tags per category (limit to reduce clutter)
- Sort categories by total selection count (most popular first)
- If category has 0 tags selected, hide category

---

### Category Interest Distribution

**Purpose**: Show which tag categories are most popular overall.

**Chart Type**: Horizontal bar chart

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Category Interest Distribution                          │
├─────────────────────────────────────────────────────────┤
│ SOFT_SKILLS:   ████████████████████████ 16%            │
│ BUSINESS:      ██████████████████ 13%                  │
│ DATA_SCIENCE:  ██████████████████ 13%                  │
│ MARKETING:     ████████████████ 13%                    │
│ DEVOPS:        ██████████████ 11%                      │
│ PROGRAMMING:   ██████████████ 11%                      │
│ HR_TALENT:     ██████████ 10%                          │
│ OTHER:         ██████████ 10%                          │
│ DESIGN:        ████ 5%                                 │
│ SECURITY:      ████ 3%                                 │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- Similar to Popular Tags Chart but without sub-items
- Each row: Category name, bar, percentage

**Data Format**:
```typescript
type CategoryDistribution = {
  category: string;
  percentage: number;
};
```

---

## Engagement Metrics Table

**Purpose**: Show deep engagement metrics in table format (optional enhancement).

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Engagement Metrics                                      │
├─────────────────────────────────────────────────────────┤
│ Metric                     Value      Trend             │
├─────────────────────────────────────────────────────────┤
│ Avg Profile Updates/User   2.4        ↑ +0.2           │
│ Users with 3+ Updates      11 (33%)   ↑ +2             │
│ Users Never Updated        10 (30%)   ↓ -1             │
│ Recommendations Generated  0          →                 │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- **Table**: Same styling as User Management table
- **Columns**:
  1. Metric name (left-aligned)
  2. Value (center-aligned)
  3. Trend (right-aligned, with arrow and change)

---

## Course Catalog Summary

**Purpose**: Show basic stats about course catalog (for context).

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Course Catalog Summary                                  │
├─────────────────────────────────────────────────────────┤
│ Difficulty Distribution:                                │
│   Beginner: 7 courses (15%) - Avg 26 hrs                │
│   Intermediate: 29 courses (60%) - Avg 38 hrs           │
│   Advanced: 12 courses (25%) - Avg 56 hrs               │
│                                                         │
│ Total Duration: ~1,900 hours of content                 │
│ Avg Course Duration: 40 hours                           │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- Same card styling
- Text-based (no charts needed)
- Font size: `14px`
- Color: `slate-700`

---

## Export Functionality (Optional)

**Purpose**: Allow admins to export analytics data as CSV.

**UI Element**:
```
[Export Analytics Data ↓]
```

**Button**:
- Position: Top-right of page (next to title)
- Variant: Secondary
- Icon: Download icon
- Click: Triggers CSV download

**CSV Contents**:
- All metrics from the page
- Timestamp of export
- User-level data (if appropriate)

---

## Responsive Behavior

### Tablet (768px - 1023px)

- Charts stack vertically (1 per row)
- Bar charts maintain full width

### Mobile (< 768px)

- Hide complex charts (growth chart, category distribution)
- Show only:
  - Profile completion breakdown
  - Popular tags (top 5 overall, no categories)
  - Key metrics (text-based)

**Mobile Wireframe**:
```
┌───────────────────────────────┐
│ Analytics                     │
├───────────────────────────────┤
│                               │
│ Profile Completion            │
│ ██████████████ 55% Complete   │
│ ████ 15% Partial              │
│ ████████ 30% Empty            │
│                               │
│ Top Tags                      │
│ emotional intelligence (3)    │
│ leadership (2)                │
│ go (2)                        │
│ seo (2)                       │
│ ecommerce (2)                 │
│                               │
│ Key Metrics                   │
│ Avg Profile Updates: 2.4      │
│ Users with 3+ Updates: 33%    │
│                               │
└───────────────────────────────┘
```

---

## Empty States

**Not Enough Data**:
```
┌─────────────────────────────────────────┐
│                                         │
│           [Illustration]                │
│                                         │
│   Not enough data to show analytics     │
│                                         │
│   Analytics will appear once 10+ users  │
│   have registered and created profiles. │
│                                         │
└─────────────────────────────────────────┘
```

---

## Loading States

- Show skeleton for each chart/panel
- Charts: Show pulsing rectangles
- Tables: Show pulsing rows

---

## Accessibility Specifications

### Charts

- Provide text alternative for visual charts
- Use ARIA labels for chart data
- Ensure color is not the only differentiator (use patterns or labels)

**Example**:
```html
<div role="img" aria-label="Profile completion breakdown: 55% complete, 15% partial, 30% empty">
  <!-- Visual chart here -->
</div>

<div className="sr-only">
  <h3>Profile Completion Breakdown</h3>
  <ul>
    <li>Complete: 18 users (55%)</li>
    <li>Partial: 5 users (15%)</li>
    <li>Empty: 10 users (30%)</li>
  </ul>
</div>
```

### Keyboard Navigation

- Tab through interactive elements (export button, category toggles if collapsible)
- No keyboard trap in charts
- Focus indicators on interactive elements

---

## Performance Considerations

1. **Data Caching**: Cache analytics data for 15 minutes (infrequent updates acceptable)
2. **Chart Rendering**: Use `useMemo` to prevent unnecessary recalculations
3. **Large Datasets**: If 1000+ users, consider server-side aggregation (don't fetch all user data client-side)

---

## Implementation Notes

### Component Files

```
features/admin/components/
├── user-growth-chart.tsx
├── profile-breakdown-chart.tsx
├── level-distribution.tsx
├── time-commitment-distribution.tsx
├── popular-tags-chart.tsx
├── category-breakdown.tsx
├── engagement-metrics-table.tsx
├── course-summary.tsx
└── analytics-skeleton.tsx
```

### API Integration

```typescript
// API hook: features/admin/api/get-analytics.ts
export type AnalyticsData = {
  user_growth: GrowthDataPoint[];
  profile_breakdown: ProfileBreakdown;
  level_distribution: LevelDistribution;
  time_commitment_distribution: TimeDistribution;
  popular_tags: PopularTagsByCategory;
  category_distribution: CategoryDistribution[];
  engagement_metrics: EngagementMetrics;
  course_summary: CourseSummary;
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: getAnalytics,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
```

---

## Testing Checklist

- [ ] User growth chart displays correct trend
- [ ] Profile breakdown percentages add up to 100%
- [ ] Level distribution matches user data
- [ ] Popular tags show correct counts per category
- [ ] Category distribution sorted by popularity
- [ ] Empty state appears when < 10 users
- [ ] Loading skeletons show while data fetches
- [ ] Charts are responsive on tablet/mobile
- [ ] Screen reader can access chart data
- [ ] Export button downloads CSV (if implemented)

---

## Future Enhancements

1. **AI Recommendation Analytics**:
   - Track how many recommendations generated per day/week
   - Show which courses are most recommended
   - User satisfaction with recommendations (if feedback implemented)

2. **User Cohort Analysis**:
   - Compare user groups (e.g., beginners vs advanced)
   - Retention curves (how many users return after N days)

3. **Course Recommendation Effectiveness**:
   - Did users like the AI suggestions?
   - Which courses have highest engagement after recommendation?

4. **Email Notifications**:
   - Alert admins when key metrics change (e.g., 50% drop in signups)

5. **Audit Log**:
   - Track admin actions (who deactivated which user, when)

---

**Document Status**: Ready for Implementation (Phase 4)
**Priority**: Nice-to-have (implement after Dashboard and User Management)
**Related Files**: `DASHBOARD.md`, `USER_MANAGEMENT.md`
