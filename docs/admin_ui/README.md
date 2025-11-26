# Admin UI Design Documentation

## Overview

This folder contains comprehensive UI/UX design specifications for AcmeLearn's admin dashboard. These documents were created by the UI Designer based on the Product Manager's feature proposal and the existing user-facing design system.

**Created**: 2025-11-26
**Status**: Ready for Implementation
**Target**: Superuser-only admin interface for managing users and monitoring platform health

---

## Document Structure

| Document | Purpose | Key Content |
|----------|---------|-------------|
| **[OVERVIEW.md](./OVERVIEW.md)** | Design principles and system-wide specifications | Color palette, typography, spacing, component inventory, accessibility |
| **[DASHBOARD.md](./DASHBOARD.md)** | Admin dashboard page design | Stats cards, activity feed, quick insights, metrics definitions |
| **[USER_MANAGEMENT.md](./USER_MANAGEMENT.md)** | User list and detail page designs | User table, search/filters, profile completeness, profile history modal |
| **[ANALYTICS.md](./ANALYTICS.md)** | Analytics page design (Phase 4) | Charts, tag popularity, engagement metrics, growth trends |

---

## Quick Reference

### Design Principles (from OVERVIEW.md)

1. **Data Density Over Whitespace**: Admins need to see lots of information at once
2. **Consistency with Existing Design System**: Reuse user-facing UI components
3. **Progressive Disclosure**: Show high-level metrics, drill down to details
4. **Admin Actions Are Deliberate**: Confirmation modals for destructive actions
5. **Mobile Support: Optional but Thoughtful**: Desktop-first, simplified mobile views

### Admin Color Theme

The admin UI uses **violet** as the primary color to differentiate from the user-facing blue theme:

| Element | Color | Tailwind |
|---------|-------|----------|
| Primary | `#7C3AED` | `violet-600` |
| Sidebar Background | Dark violet | `violet-900` |
| Hover | `#6D28D9` | `violet-700` |
| Light Accent | `#A78BFA` | `violet-400` |
| Backgrounds | `#EDE9FE` | `violet-100` |

### Key Components to Build

**Phase 1: Core Components**
- `AdminSidebar` - Left navigation for admin routes
- `StatsCard` - Large number + label + trend indicator
- `StatusBadge` - User status (Active/Inactive/Verified)
- `ProfileCompleteness` - 5-dot progress indicator

**Phase 2: Dashboard**
- `ActivityFeed` - Recent user activity list
- `QuickInsights` - Platform health insights

**Phase 3: User Management**
- `UserTable` + `UserTableRow` - Sortable/filterable user list
- `SearchAndFilters` - Search by email + status/profile filters
- `ProfileHistoryModal` - Timeline of profile versions
- `DeactivateUserModal` - Confirmation for user deactivation

**Phase 4: Analytics (Optional)**
- `UserGrowthChart` - Line chart for registrations
- `ProfileBreakdownChart` - Horizontal bar for completion
- `PopularTagsChart` - Bar chart grouped by category
- `CategoryBreakdown` - Category interest distribution

---

## Implementation Priority

### Must-Have (MVP)

1. **AdminSidebar** + **AdminLayout** (Week 1)
2. **Admin Dashboard** with stats cards and activity feed (Week 1)
3. **User List** with search/filters (Week 2)
4. **User Detail** page with profile view (Week 2)
5. **Profile History Modal** (Week 2)
6. **Deactivate User** functionality (Week 2)

### Nice-to-Have (Phase 4)

1. **Analytics Page** with charts and metrics (Week 3-4)
2. **Export to CSV** functionality
3. **Advanced filtering** (by level, completion percentage)
4. **Engagement metrics** table

---

## Design Decisions

### Why Violet Instead of Blue?

- **Differentiation**: Admin area needs clear visual distinction from user-facing UI
- **Hierarchy**: Violet suggests elevated access level (superuser)
- **Contrast**: Violet stands out from blue course UI without clashing

### Why Data Density?

- **Admin Use Case**: Admins scan for patterns, not leisurely browsing
- **Efficiency**: More data on screen = fewer clicks
- **Industry Standard**: Most admin tools (Stripe, AWS Console) prioritize density

### Why Desktop-First?

- **Primary Context**: Admins work on computers, not phones
- **Data Complexity**: Tables and charts don't translate well to small screens
- **Resource Allocation**: Mobile polish is low ROI for admin UI

### Why Reuse User UI Components?

- **Development Speed**: No need to rebuild buttons, inputs, modals
- **Familiarity**: Admins are also users; consistent patterns reduce cognitive load
- **Maintenance**: Fewer components to maintain

---

## Key Metrics and Definitions

### Profile Completion Criteria

A profile is **complete** if all these fields are filled:
1. `learning_goal` (text)
2. `current_level` (beginner/intermediate/advanced)
3. `time_commitment` (hours per week)
4. At least 2 interest tags

### User Status

- **Active**: `is_active = true` (can log in)
- **Inactive**: `is_active = false` (soft-deleted, cannot log in)
- **Verified**: `is_verified = true` (email verified - future enhancement)

### Activity Events

| Event Type | Description |
|------------|-------------|
| Registration | User created account |
| Profile Update | User updated profile (new version created) |
| Recommendation | User generated AI recommendations |
| Deactivation | Admin deactivated user account |

---

## Accessibility Highlights

### WCAG 2.1 AA Compliance

- **Color Contrast**: All text on violet backgrounds uses white (21:1 ratio)
- **Keyboard Navigation**: Tab order flows logically (Sidebar → Content → Actions)
- **Screen Reader Support**: Proper semantic HTML (`<table>`, `<th scope="col">`)
- **Focus Indicators**: 2px violet ring on all interactive elements
- **Status Indicators**: Use text labels, not just color (e.g., "● Active")

### Specific Implementations

- Stats cards: `<h3>` for label, `aria-label` for value
- User table: Proper `<thead>`, `<tbody>`, `<th>` structure
- Filter changes: `aria-live="polite"` region for result count
- Profile completeness: Tooltip with text description

---

## Responsive Strategy

### Desktop (1280px+)
- Sidebar visible (240px fixed width)
- Tables show all columns
- Stats cards: 3 per row

### Tablet (768px - 1023px)
- Sidebar collapses to hamburger menu (overlay)
- Tables convert to card layout
- Stats cards: 2 per row

### Mobile (< 768px)
- Simplified views (critical data only)
- Stats cards: 1 per row (stacked)
- Hide advanced filters
- Show top 3 activity items only

---

## API Endpoints Required

Based on the designs, these backend endpoints are needed:

### Dashboard
- `GET /admin/dashboard/overview` - All dashboard metrics

### User Management
- `GET /admin/users` - User list with filters (search, status, profile)
- `GET /admin/users/:id` - User detail with profile
- `GET /admin/users/:id/profile-history` - All profile versions
- `PATCH /admin/users/:id/deactivate` - Deactivate user

### Analytics (Phase 4)
- `GET /admin/analytics/overview` - All analytics data
- `GET /admin/analytics/tags/popular` - Tag popularity by category

---

## Testing Checklist

Use this checklist to verify implementation matches the design:

### Visual Design
- [ ] Admin UI uses violet color scheme (not blue)
- [ ] Stats cards display large numbers with correct typography
- [ ] Sidebar has dark violet background with white text
- [ ] Status badges show correct colors (emerald/gray/blue)
- [ ] Profile completeness dots render correctly (5 dots)

### Functionality
- [ ] Search filters users by email (case-insensitive, debounced)
- [ ] Status filter shows only active/inactive users
- [ ] Profile completeness filter works (complete/partial/empty)
- [ ] User table sorts by email (if implemented)
- [ ] Pagination disables prev/next at boundaries
- [ ] Profile history modal shows all versions chronologically
- [ ] Deactivate user requires confirmation
- [ ] Toast notifications appear on success/error

### Accessibility
- [ ] Keyboard navigation flows logically
- [ ] Screen reader announces metric values
- [ ] All interactive elements have focus indicators
- [ ] Color is not the only status differentiator
- [ ] Tables use proper semantic HTML

### Responsive
- [ ] Sidebar collapses on mobile (< 1024px)
- [ ] Stats cards stack correctly (3→2→1 columns)
- [ ] Tables convert to cards on mobile
- [ ] Charts simplify or hide on small screens

### Performance
- [ ] Dashboard metrics cache for 5 minutes
- [ ] Analytics data caches for 15 minutes
- [ ] Loading skeletons show while data fetches
- [ ] No layout shift during loading

---

## File Organization

When implementing, place admin components here:

```
frontend/src/features/admin/
├── api/
│   ├── get-dashboard-overview.ts
│   ├── get-users.ts
│   ├── get-user-detail.ts
│   ├── get-user-profile-history.ts
│   ├── deactivate-user.ts
│   ├── get-analytics.ts (Phase 4)
│   └── get-popular-tags.ts (Phase 4)
│
├── components/
│   ├── admin-sidebar.tsx
│   ├── stats-card.tsx
│   ├── status-badge.tsx
│   ├── profile-completeness.tsx
│   ├── activity-feed.tsx
│   ├── quick-insights.tsx
│   ├── user-table.tsx
│   ├── user-table-row.tsx
│   ├── search-and-filters.tsx
│   ├── profile-history-modal.tsx
│   ├── deactivate-user-modal.tsx
│   ├── user-growth-chart.tsx (Phase 4)
│   ├── profile-breakdown-chart.tsx (Phase 4)
│   ├── popular-tags-chart.tsx (Phase 4)
│   └── category-breakdown.tsx (Phase 4)
│
└── types/
    └── index.ts
```

---

## Design Handoff Checklist

Before starting implementation, ensure:

- [ ] Product Manager has reviewed and approved designs
- [ ] Backend API endpoints are planned/documented
- [ ] Frontend developer understands admin vs. user UI differences
- [ ] Accessibility requirements are clear
- [ ] Priority is agreed upon (Dashboard → Users → Analytics)
- [ ] Timeline is realistic (2-4 weeks depending on scope)

---

## Questions for Implementation Team

1. **Charts**: Should we use a charting library (recharts, chart.js) or build simple SVG charts?
2. **Real-time Updates**: Should admin dashboard auto-refresh metrics, or manual refresh only?
3. **Export**: Is CSV export a must-have or nice-to-have?
4. **Mobile**: What's the minimum viable mobile experience? (Just view stats, or full user management?)
5. **Permissions**: Should there be multiple admin roles, or just superuser vs. regular user?

---

## Next Steps

1. **Review**: Product Manager + Frontend Developer review all 4 documents
2. **Prioritize**: Confirm MVP scope (Dashboard + User Management)
3. **Backend**: Implement admin API endpoints
4. **Frontend**: Build components in order:
   - Week 1: Sidebar, layout, dashboard
   - Week 2: User list, user detail, modals
   - Week 3-4: Analytics (if time permits)
5. **Test**: Verify against testing checklist
6. **Deploy**: Roll out to superusers for feedback

---

## Contact

For questions or clarifications on these designs, contact:
- **UI Designer**: Design decisions, component specs, accessibility
- **Product Manager**: Feature requirements, priority, scope
- **Frontend Lead**: Implementation feasibility, timeline

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Status**: Ready for Implementation
