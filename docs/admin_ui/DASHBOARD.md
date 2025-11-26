# Admin Dashboard Page Design

## Document Information

| Field | Value |
|-------|-------|
| Page | Admin Dashboard (`/admin` or `/admin/dashboard`) |
| Access | Superusers only |
| Purpose | At-a-glance platform health metrics |
| Related | `OVERVIEW.md`, `ADMIN_FEATURE_PROPOSAL.md` |

---

## Page Purpose

The admin dashboard answers the critical question: **"Is AcmeLearn healthy?"**

A learning platform succeeds when:
1. Users complete their profiles (better recommendations)
2. Users actively engage (profile updates show refinement)
3. Users use the AI feature (recommendations generated)

The dashboard surfaces these health indicators immediately.

---

## Page Layout

### Desktop View (1280px+)

```
┌──────────────────┬───────────────────────────────────────────────────────────┐
│                  │                                                           │
│   ADMIN NAV      │   Admin Dashboard                                         │
│   (Sidebar)      │                                                           │
│                  │   Platform Overview                                       │
│   Dashboard ●    │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│   Users          │   │ TOTAL USERS │ │ PROFILE     │ │ AVG PROFILE │        │
│   Analytics      │   │             │ │ COMPLETION  │ │ UPDATES     │        │
│                  │   │     33      │ │     55%     │ │     2.4     │        │
│   ─────────      │   │             │ │             │ │             │        │
│                  │   │ Total Users │ │ Profiles    │ │ Avg Updates │        │
│   [Exit Admin]   │   │             │ │ Complete    │ │ per User    │        │
│                  │   │ ↑ +6 this   │ │ 18 of 33    │ │             │        │
│                  │   │   week      │ │             │ │             │        │
│                  │   └─────────────┘ └─────────────┘ └─────────────┘        │
│                  │                                                           │
│                  │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│                  │   │ AI RECS     │ │ SIGNUPS     │ │ ACTIVE      │        │
│                  │   │ TODAY       │ │ THIS WEEK   │ │ USERS       │        │
│                  │   │     0       │ │     6       │ │     97%     │        │
│                  │   │             │ │             │ │             │        │
│                  │   │ AI Recs     │ │ Signups     │ │ Active      │        │
│                  │   │ Today       │ │ This Week   │ │ Users       │        │
│                  │   │             │ │             │ │ 32 of 33    │        │
│                  │   │             │ │             │ │             │        │
│                  │   └─────────────┘ └─────────────┘ └─────────────┘        │
│                  │                                                           │
│                  │   Recent Activity                                         │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│                  │   │ ○ demo17@example.com updated profile (v4)           │ │
│                  │   │   2 minutes ago                                     │ │
│                  │   ├─────────────────────────────────────────────────────┤ │
│                  │   │ ○ admin@example.com updated profile (v3)            │ │
│                  │   │   15 minutes ago                                    │ │
│                  │   ├─────────────────────────────────────────────────────┤ │
│                  │   │ ○ dockertest@test.com registered                    │ │
│                  │   │   1 hour ago                                        │ │
│                  │   ├─────────────────────────────────────────────────────┤ │
│                  │   │ ○ user@test.com generated AI recommendations        │ │
│                  │   │   3 hours ago                                       │ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
│                  │   Quick Insights                                          │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│                  │   │ 📈 Top Interest: "emotional intelligence" (3 users)  │ │
│                  │   │ 🔥 Most Active: 1 user with 6 profile updates       │ │
│                  │   │ ⚠️  Profile Gap: 10 users never set up profile       │ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
│                  │   Quick Actions                                           │
│                  │   [View All Users] [Popular Tags] [Analytics Dashboard]   │
│                  │                                                           │
└──────────────────┴───────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Stats Card

**Purpose**: Display a single metric with large number, label, and optional trend indicator.

**Visual Structure**:
```
┌────────────────────────────┐
│                            │
│  LABEL (uppercase, 12px)   │  ← Slate-500, 500 weight, letter-spacing: 0.05em
│                            │
│  524                       │  ← 48px (3rem), bold 700, slate-900
│                            │
│  Total Users               │  ← 14px, regular 400, slate-600
│                            │
│  ↑ +12 this week           │  ← 12px, emerald-600 (positive) or red-600 (negative)
│                            │
└────────────────────────────┘
```

**Specifications**:
- **Container**:
  - Background: `white`
  - Border: `1px solid slate-200`
  - Border radius: `12px` (md)
  - Padding: `20px` (5 units)
  - Shadow: `sm` (default), `md` (hover)
  - Min height: `140px`
  - Transition: `shadow 200ms ease`

- **Label** (e.g., "TOTAL USERS"):
  - Font size: `12px` (0.75rem)
  - Color: `slate-500`
  - Font weight: `500` (medium)
  - Text transform: `uppercase`
  - Letter spacing: `0.05em`
  - Margin bottom: `8px`

- **Number** (e.g., "524"):
  - Font size: `48px` (3rem)
  - Color: `slate-900`
  - Font weight: `700` (bold)
  - Line height: `1.1`
  - Margin bottom: `4px`

- **Description** (e.g., "Total Users"):
  - Font size: `14px` (0.875rem)
  - Color: `slate-600`
  - Font weight: `400` (regular)
  - Margin bottom: `12px`

- **Trend Indicator** (optional):
  - Font size: `12px` (0.75rem)
  - Color: `emerald-600` (positive), `red-600` (negative), `slate-500` (neutral)
  - Icon: `↑` (up arrow) or `↓` (down arrow) or `→` (neutral)
  - Format: "{icon} {change} {period}"
  - Examples: "↑ +12 this week", "↓ -3% vs last month"

**Variants**:

```typescript
// Component signature
type StatsCardProps = {
  label: string;
  value: number | string;
  description: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode; // Optional icon next to label
};
```

**Example Usage**:
```tsx
<StatsCard
  label="TOTAL USERS"
  value={33}
  description="Total Users"
  trend={{ value: '+6 this week', direction: 'up' }}
/>

<StatsCard
  label="PROFILE COMPLETION"
  value="55%"
  description="Profiles Complete"
  trend={{ value: '18 of 33', direction: 'neutral' }}
/>
```

---

### Recent Activity Feed

**Purpose**: Show recent platform events (registrations, profile updates, recommendations).

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Recent Activity                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ○ demo17@example.com updated profile (v4)              │  ← Violet-500 dot
│   2 minutes ago                                         │  ← Slate-500, 12px
│                                                         │
│ ○ admin@example.com updated profile (v3)               │
│   15 minutes ago                                        │
│                                                         │
│ ○ dockertest@test.com registered                       │
│   1 hour ago                                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- **Container**:
  - Background: `white`
  - Border: `1px solid slate-200`
  - Border radius: `12px`
  - Padding: `20px`
  - Max height: `400px` (scrollable if more than ~8 items)

- **Section Title**:
  - Font size: `18px` (H4)
  - Font weight: `600` (semibold)
  - Color: `slate-900`
  - Margin bottom: `16px`

- **Activity Item**:
  - Padding: `12px 0`
  - Border bottom: `1px solid slate-100` (except last item)
  - Display: Flex with gap `12px`

- **Status Dot**:
  - Size: `8px` circle
  - Color: `violet-500` (default), `emerald-500` (registration), `blue-500` (recommendation)
  - Positioned top-aligned with text

- **Event Text**:
  - Font size: `14px`
  - Color: `slate-900`
  - Line height: `1.5`

- **Timestamp**:
  - Font size: `12px`
  - Color: `slate-500`
  - Display below event text

**Event Types**:

| Event | Icon Color | Text Format |
|-------|------------|-------------|
| User Registration | `emerald-500` | "{email} registered" |
| Profile Update | `violet-500` | "{email} updated profile (v{version})" |
| AI Recommendation | `blue-500` | "{email} generated AI recommendations" |
| User Deactivation | `red-500` | "{email} account deactivated" |

**Empty State**:
```
No recent activity to display.
```

---

### Quick Insights Panel

**Purpose**: Highlight interesting patterns or potential issues.

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Quick Insights                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📈 Top Interest: "emotional intelligence" (3 users)     │
│ 🔥 Most Active: 1 user with 6 profile updates          │
│ ⚠️  Profile Gap: 10 users never set up profile          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- **Container**: Same as Recent Activity
- **Insight Item**:
  - Padding: `12px 0`
  - Display: Flex with gap `8px`
  - Icon + Text layout

- **Icon/Emoji**:
  - Size: `16px`
  - Positioned: Aligned with first line of text

- **Text**:
  - Font size: `14px`
  - Color: `slate-900`
  - Line height: `1.5`

**Insight Types**:

| Type | Icon | Format |
|------|------|--------|
| Popular Tag | 📈 | "Top Interest: \"{tag}\" ({count} users)" |
| Power User | 🔥 | "Most Active: {count} user(s) with {updates} profile updates" |
| Profile Gap | ⚠️ | "Profile Gap: {count} users never set up profile" |
| Growth | 🚀 | "Growth Spike: {count} new users this week" |
| Low Engagement | 📉 | "Low Engagement: {count} users haven't logged in 30+ days" |

**Empty State**:
```
No insights available yet. Check back after more users join.
```

---

## Metrics Definitions

| Metric | Calculation | API Endpoint |
|--------|-------------|--------------|
| **Total Users** | COUNT(*) FROM users | GET /admin/dashboard/overview |
| **Profile Completion Rate** | COUNT(complete profiles) / COUNT(users) | GET /admin/dashboard/overview |
| **Avg Profile Updates** | AVG(profile version count) per user | GET /admin/dashboard/overview |
| **AI Recs Today** | COUNT(recommendations WHERE created_at = today) | GET /admin/dashboard/overview |
| **Signups This Week** | COUNT(users WHERE created_at >= 7 days ago) | GET /admin/dashboard/overview |
| **Active Users %** | COUNT(is_active=true) / COUNT(users) | GET /admin/dashboard/overview |

**Profile Completion Logic**:
- **Complete**: learning_goal, current_level, time_commitment, 2+ interests
- **Partial**: 1-3 fields filled
- **Empty**: All fields null/empty

---

## Responsive Behavior

### Tablet (768px - 1023px)

- Stats cards: 2 per row (instead of 3)
- Recent activity: Full width below stats
- Quick insights: Full width below activity

### Mobile (< 768px)

- Stats cards: 1 per row (stacked)
- Show only top 4 stats (hide AI Recs Today, Signups This Week)
- Recent activity: Show only 3 most recent
- Quick insights: Show only top insight

**Mobile Wireframe**:
```
┌───────────────────────────────┐
│ [Hamburger]     Admin         │
├───────────────────────────────┤
│                               │
│ ┌───────────────────────────┐ │
│ │ TOTAL USERS               │ │
│ │ 33                        │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ PROFILE COMPLETION        │ │
│ │ 55%                       │ │
│ └───────────────────────────┘ │
│                               │
│ Recent Activity (3)           │
│ ○ user@test.com updated...    │
│ ○ admin@test.com...           │
│ ○ demo@test.com...            │
│                               │
│ [View All Users]              │
│                               │
└───────────────────────────────┘
```

---

## Interaction States

### Stats Card States

1. **Default**: White background, subtle shadow
2. **Hover**: Slightly larger shadow (`md`), cursor pointer (if clickable)
3. **Loading**: Show skeleton with pulsing animation
4. **Error**: Red border, error message below number

### Activity Feed States

1. **Loading**: Show 3 skeleton rows
2. **Empty**: "No recent activity" message
3. **Error**: "Failed to load activity. [Retry]"

### Quick Insights States

1. **Loading**: Show 3 skeleton rows
2. **Empty**: "No insights available yet."
3. **Error**: "Failed to load insights. [Retry]"

---

## Loading States

**Skeleton for Stats Card**:
```
┌────────────────────────────┐
│                            │
│  ████████ (pulsing)        │
│                            │
│  ████████████████          │
│                            │
│  ████████████              │
│                            │
└────────────────────────────┘
```

**Skeleton for Activity Item**:
```
○ ████████████████████████████ (pulsing)
  ████████ (pulsing)
```

---

## Empty States

**First-Time Admin (No Users)**:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Illustration]                       │
│                                                         │
│              No users yet!                              │
│                                                         │
│   The platform is ready. Share the registration link    │
│   to invite your first users.                           │
│                                                         │
│              [Copy Registration Link]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**No Recent Activity**:
```
No recent activity to display.
Users typically update profiles within the first 24 hours.
```

---

## Accessibility Specifications

### Screen Reader Support

**Stats Cards**:
```html
<div role="region" aria-labelledby="stats-heading">
  <h2 id="stats-heading" class="sr-only">Platform Statistics</h2>

  <div class="stats-card">
    <h3 class="stats-label">Total Users</h3>
    <p class="stats-value" aria-label="33 total users">33</p>
    <p class="stats-description">Total Users</p>
    <p class="stats-trend" aria-label="Increased by 6 this week">
      <span aria-hidden="true">↑</span> +6 this week
    </p>
  </div>
</div>
```

**Activity Feed**:
```html
<section aria-labelledby="activity-heading">
  <h2 id="activity-heading">Recent Activity</h2>
  <ul role="list" aria-live="polite">
    <li>
      <span role="status" aria-label="Profile update">○</span>
      demo17@example.com updated profile (version 4)
      <time datetime="2025-11-26T14:30:00">2 minutes ago</time>
    </li>
  </ul>
</section>
```

### Keyboard Navigation

- Tab order: Stats grid (left to right, top to bottom) → Recent Activity → Quick Insights → Quick Actions
- Stats cards: Focusable if clickable (navigates to detail view)
- Activity items: Not focusable (informational only)
- Quick action buttons: Tab-accessible, Enter/Space to activate

---

## Performance Considerations

1. **Stats Caching**: Cache dashboard metrics for 5 minutes (they don't need real-time updates)
2. **Activity Feed**: Limit to 10 most recent items (no pagination)
3. **Skeleton Loading**: Show immediately while data loads
4. **Debounce**: If stats update on interval, debounce refresh to 30 seconds

---

## Implementation Notes

### Component Files

```
features/admin/components/
├── stats-card.tsx           # Reusable stats card
├── activity-feed.tsx        # Recent activity list
├── activity-item.tsx        # Single activity row
├── quick-insights.tsx       # Insights panel
├── dashboard-skeleton.tsx   # Loading state
└── empty-dashboard.tsx      # First-time state
```

### API Integration

```typescript
// API hook: features/admin/api/get-dashboard-overview.ts
export type DashboardOverview = {
  total_users: number;
  profile_completion_rate: number;
  avg_profile_updates: number;
  ai_recs_today: number;
  weekly_signups: number;
  active_users_rate: number;
  recent_activity: ActivityEvent[];
  insights: Insight[];
};

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboardOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

---

## Testing Checklist

- [ ] Stats cards display correct numbers from API
- [ ] Trend indicators show correct direction (up/down/neutral)
- [ ] Recent activity updates when new events occur
- [ ] Quick insights highlight relevant patterns
- [ ] Loading skeletons show while data fetches
- [ ] Empty state appears when no users exist
- [ ] Error states display on API failure
- [ ] Hover states work on interactive elements
- [ ] Keyboard navigation flows logically
- [ ] Screen reader announces metric changes
- [ ] Mobile view stacks cards correctly
- [ ] Tablet view shows 2 cards per row

---

**Document Status**: Ready for Implementation
**Related Files**: `USER_MANAGEMENT.md`, `ANALYTICS.md`
