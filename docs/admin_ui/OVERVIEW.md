# Admin UI Design System - Overview

## Document Information

| Field | Value |
|-------|-------|
| Author | UI Designer |
| Date | 2025-11-26 |
| Status | Design Specification |
| Version | 1.0 |
| Related Docs | `ADMIN_FEATURE_PROPOSAL.md`, `UI_DESIGN_SYSTEM.md`, `FRONTEND_ARCHITECTURE.md` |

---

## Purpose

This document defines the UI/UX design specifications for AcmeLearn's admin dashboard, a superuser-only interface for managing users, monitoring platform health, and analyzing engagement patterns. The admin UI is optimized for **data density and operational efficiency** rather than consumer-facing polish.

---

## Design Principles

### 1. Data Density Over Whitespace

**Rationale**: Admins need to see lots of information at once to make quick decisions. Unlike user-facing UI (which prioritizes clarity and breathing room), admin interfaces should pack more data per screen.

**Implementation**:
- Tighter spacing: 16px gaps instead of 24px
- Smaller text: 14px body instead of 16px
- More table rows per page: 20-50 instead of 10-20
- Multi-column layouts: Use sidebars, split views

### 2. Consistency with Existing Design System

**Rationale**: Admins are still users of the platform. Reuse existing UI components (buttons, inputs, cards) to maintain familiarity and reduce development time.

**Reuse from User-Facing UI**:
- Button variants (primary, secondary, ghost)
- Input fields and form patterns
- Card components (with tighter padding)
- Badge components (for status indicators)
- Modal/dialog patterns
- Typography scale (but default to smaller sizes)

**Admin-Specific Additions**:
- Violet color theme (to differentiate admin from user UI)
- Stats cards with large numbers
- Data tables with sorting/filtering
- Status indicator dots
- Profile completeness visualizations
- Timeline components (for profile history)

### 3. Progressive Disclosure

**Rationale**: Show high-level metrics by default, with drill-down to details on demand.

**Examples**:
- Dashboard shows total users → Click to see user list
- User list shows summary row → Click to see full profile detail
- Profile snapshot shows current version → Click to see full history

### 4. Admin Actions Are Deliberate

**Rationale**: Admin actions (deactivate user, export data) have consequences. Use confirmation modals and clear visual hierarchy.

**Implementation**:
- Destructive actions use red/warning colors
- Confirmation modals for irreversible actions
- Clear action labels: "Deactivate User" not "Delete"
- Loading states for async operations

### 5. Mobile Support: Optional but Thoughtful

**Rationale**: Admins primarily work on desktops, but basic mobile access is helpful for quick checks.

**Strategy**:
- Desktop-first design (optimize for 1280px+ screens)
- Mobile: Show simplified views, hide advanced filters
- Tables convert to card layouts on mobile
- Charts simplify or hide on mobile

---

## Admin vs. User UI Comparison

| Aspect | User-Facing UI | Admin UI |
|--------|----------------|----------|
| **Primary Goal** | Discoverability, engagement | Efficiency, data visibility |
| **Color Theme** | Blue (`blue-600`, `blue-800`) | Violet (`violet-600`, `violet-400`) |
| **Spacing** | Generous (24px gaps) | Compact (16px gaps) |
| **Typography** | 16px body, 24px headings | 14px body, 20px headings |
| **Data Density** | Low (focus on few items) | High (show many items) |
| **Interactions** | Discovery, exploration | Search, filter, drill-down |
| **Mobile Priority** | Critical | Nice-to-have |

---

## Color Palette (Admin-Specific)

### Admin Primary Colors

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Admin Primary | `#7C3AED` | `violet-600` | Sidebar, headers, primary actions |
| Admin Primary Hover | `#6D28D9` | `violet-700` | Hover states |
| Admin Light | `#A78BFA` | `violet-400` | Accents, active states |
| Admin Lighter | `#EDE9FE` | `violet-100` | Backgrounds, selections |
| Admin Lightest | `#F5F3FF` | `violet-50` | Hover backgrounds |

### Status Colors

| Status | Background | Text | Dot | Usage |
|--------|------------|------|-----|-------|
| Active | `emerald-100` | `emerald-700` | `emerald-500` | Active users |
| Inactive | `gray-100` | `gray-700` | `gray-400` | Inactive users |
| Verified | `blue-100` | `blue-700` | `blue-500` | Verified email |
| Complete | `violet-100` | `violet-700` | `violet-500` | Complete profile |
| Partial | `amber-100` | `amber-700` | `amber-500` | Partial profile |
| Empty | `slate-100` | `slate-700` | `slate-300` | Empty profile |

### Chart Colors

For tag popularity charts and analytics:

| Chart Element | Color | Tailwind |
|---------------|-------|----------|
| Primary bars | `violet-500` | `violet-500` |
| Secondary bars | `violet-300` | `violet-300` |
| Growth trend (positive) | `emerald-500` | `emerald-500` |
| Decline trend (negative) | `red-500` | `red-500` |
| Grid lines | `slate-200` | `slate-200` |
| Labels | `slate-600` | `slate-600` |

---

## Typography Scale (Admin)

Admin UI uses slightly smaller sizes than user-facing UI for data density:

| Name | User UI | Admin UI | Usage |
|------|---------|----------|-------|
| Page Title | 36px (H1) | 30px (H2) | Dashboard title |
| Section Header | 24px (H3) | 20px (H4) | Section titles |
| Card Title | 20px (H4) | 18px | Stats card labels |
| Body | 16px | 14px | Table text, descriptions |
| Caption | 14px | 12px | Timestamps, metadata |

**Font Weight**:
- Numbers (stats): 700 (bold)
- Section headers: 600 (semibold)
- Body text: 400 (regular)
- Captions: 400 (regular)

---

## Spacing System (Admin)

Admin UI uses the same 4px base unit but defaults to tighter spacing:

| Element | User UI | Admin UI |
|---------|---------|----------|
| Card padding | 24px (6 units) | 20px (5 units) |
| Section gaps | 32px (8 units) | 24px (6 units) |
| Table row height | 64px | 56px |
| Button padding | 16px × 24px | 12px × 20px |
| Grid gap (cards) | 24px | 16px |

---

## Layout Patterns

### Admin Sidebar Layout

```
┌──────────────────┬──────────────────────────────────────────────┐
│                  │                                              │
│   SIDEBAR        │   MAIN CONTENT AREA                          │
│   240px fixed    │   Flexible width (min 800px)                 │
│                  │                                              │
│   [Logo]         │   [Page Title]                               │
│   Nav items      │   [Content]                                  │
│   ---            │                                              │
│   [Exit Admin]   │                                              │
│   [User Menu]    │                                              │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

**Sidebar Specifications**:
- Width: 240px (fixed)
- Background: `violet-900` (dark theme)
- Text: `white` (high contrast)
- Hover: `violet-800`
- Active item: `violet-700` + left border accent

**Main Content**:
- Max width: 1440px (wider than user UI's 1280px)
- Padding: 32px horizontal, 24px vertical
- Background: `slate-50`

### Mobile Adaptation

On screens < 1024px:
1. Hide sidebar by default
2. Add hamburger menu to toggle sidebar overlay
3. Sidebar slides in from left (overlay)
4. Main content takes full width

---

## Component Inventory

### New Admin Components

| Component | Purpose | File Path |
|-----------|---------|-----------|
| **AdminSidebar** | Navigation for admin routes | `features/admin/components/admin-sidebar.tsx` |
| **StatsCard** | Large number + label + trend | `features/admin/components/stats-card.tsx` |
| **StatusBadge** | User status indicator | `features/admin/components/status-badge.tsx` |
| **ProfileCompleteness** | 5-dot progress indicator | `features/admin/components/profile-completeness.tsx` |
| **UserTable** | Sortable/filterable user list | `features/admin/components/user-table.tsx` |
| **UserTableRow** | Single user row | `features/admin/components/user-table-row.tsx` |
| **SearchAndFilters** | Search + filter controls | `features/admin/components/search-and-filters.tsx` |
| **ProfileHistoryModal** | Timeline of profile versions | `features/admin/components/profile-history-modal.tsx` |
| **DeactivateUserModal** | Confirmation for deactivation | `features/admin/components/deactivate-user-modal.tsx` |
| **PopularTagsChart** | Bar chart for tag usage | `features/admin/components/popular-tags-chart.tsx` |
| **CategoryBreakdown** | Horizontal bar chart | `features/admin/components/category-breakdown.tsx` |

### Reused from User UI

| Component | Usage in Admin |
|-----------|----------------|
| **Button** | All admin actions (use violet variant) |
| **Input** | Search fields, filters |
| **Card** | Stats cards (with tighter padding) |
| **Badge** | Status indicators, counts |
| **Modal** | Confirmation dialogs |
| **Spinner** | Loading states |
| **Dropdown** | Filter menus |

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Color Contrast**:
   - All text on `violet-900` background must be white (21:1 ratio)
   - Violet buttons (`violet-600`) with white text: 7.5:1 ratio
   - Status indicators must have text labels, not just color

2. **Keyboard Navigation**:
   - All admin actions accessible via keyboard
   - Tab order: Sidebar → Main content → Filters → Table → Pagination
   - Escape key closes modals
   - Arrow keys navigate table rows (optional enhancement)

3. **Screen Reader Support**:
   - Stats cards: `<h3>` for label, `<p aria-label="value">` for number
   - Table: Proper `<thead>`, `<tbody>`, `<th scope="col">`
   - Filter changes announce result count: `aria-live="polite"`
   - Status badges: `<span role="status">Active</span>`

4. **Focus Indicators**:
   - All interactive elements show focus ring: `ring-2 ring-violet-400`
   - High contrast mode support (not rely on color alone)

---

## Responsive Breakpoints

| Breakpoint | Width | Admin Layout |
|------------|-------|--------------|
| Desktop | 1280px+ | Sidebar + full tables |
| Laptop | 1024px - 1279px | Sidebar + tables (narrower) |
| Tablet | 768px - 1023px | Sidebar overlay + card layout |
| Mobile | < 768px | Simplified views, critical data only |

**Responsive Strategy**:
- Desktop: Full experience (default)
- Tablet: Hamburger menu, tables become cards
- Mobile: Hide advanced filters, show critical actions only

---

## Design File Organization

Admin UI designs are split across 3 files:

1. **`OVERVIEW.md`** (this file): Design principles, color palette, typography
2. **`DASHBOARD.md`**: Admin dashboard page, stats cards, layout
3. **`USER_MANAGEMENT.md`**: User list, user detail, profile history
4. **`ANALYTICS.md`**: Analytics page, charts, metrics (future enhancement)

---

## Implementation Notes

### Development Order

1. **Phase 1: Core Components** (Week 1)
   - AdminSidebar
   - StatsCard
   - StatusBadge
   - ProfileCompleteness

2. **Phase 2: Dashboard** (Week 1)
   - Admin dashboard page
   - Wire up stats API
   - Recent activity feed

3. **Phase 3: User Management** (Week 2)
   - UserTable + UserTableRow
   - SearchAndFilters
   - User detail page
   - ProfileHistoryModal
   - DeactivateUserModal

4. **Phase 4: Analytics** (Week 3-4 - Optional)
   - PopularTagsChart
   - CategoryBreakdown
   - Engagement metrics

### Reusable Patterns

- **Loading States**: Use existing `Spinner` component
- **Empty States**: "No users found" with illustration
- **Error States**: "Failed to load data" with retry button
- **Pagination**: Reuse table footer pattern from user-facing UI

---

## Success Metrics

How do we know the admin UI is successful?

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Time to Find User** | < 10 seconds | Admin search → view detail |
| **Data Visibility** | 80%+ key metrics | Admin can answer common questions without exporting |
| **Mobile Usability** | 70% tasks completable | Basic user lookup works on phone |
| **Accessibility Score** | 95+ (Lighthouse) | Automated testing |

---

## Next Steps

After reviewing this overview:
1. Read `DASHBOARD.md` for admin dashboard wireframes
2. Read `USER_MANAGEMENT.md` for user list and detail designs
3. Read `ANALYTICS.md` for charts and metrics (if implementing Phase 4)

---

**Document Status**: Ready for Review
**Approval Needed**: Product Manager, Frontend Developer
