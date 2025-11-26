# Admin User Management Design

## Document Information

| Field | Value |
|-------|-------|
| Pages | User List (`/admin/users`), User Detail (`/admin/users/:id`) |
| Access | Superusers only |
| Purpose | Browse, search, and manage user accounts with profile history |
| Related | `OVERVIEW.md`, `DASHBOARD.md`, `ADMIN_FEATURE_PROPOSAL.md` |

---

## Page Purpose

User management enables admins to:
1. **Support users**: "Why can't I get recommendations?" → Check profile completion
2. **Identify engaged users**: Users with many profile updates are power users
3. **Handle abuse**: Deactivate problematic accounts
4. **Understand user journey**: Profile history shows how users evolve goals

---

## User List Page

### Desktop Layout (1280px+)

```
┌──────────────────┬───────────────────────────────────────────────────────────┐
│                  │                                                           │
│   ADMIN NAV      │   User Management                            33 users     │
│   (Sidebar)      │                                                           │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│   Dashboard      │   │ [Search by email...]              [Filters ▼]      │ │
│   Users ●        │   └─────────────────────────────────────────────────────┘ │
│   Analytics      │                                                           │
│                  │   Filters:                                                │
│                  │   Status: [All] [●Active] [○Inactive]                     │
│                  │   Profile: [All] [Complete] [Partial] [Empty]             │
│                  │                                                           │
│                  │   Showing 33 users                           [Export CSV] │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│                  │   │ Email                 Status  Level  Profile Actions│ │
│                  │   ├─────────────────────────────────────────────────────┤ │
│                  │   │ admin@example.com     ● Active Inter. ●●●●● [View] │ │
│                  │   │ Has goal • 7 interests                              │ │
│                  │   ├─────────────────────────────────────────────────────┤ │
│                  │   │ demo17@example.com    ● Active Inter. ●●●●● [View] │ │
│                  │   │ Has goal • 5 interests                              │ │
│                  │   ├─────────────────────────────────────────────────────┤ │
│                  │   │ dockertest@test.com   ● Active -      ●○○○○ [View] │ │
│                  │   │ No goal • 0 interests                               │ │
│                  │   ├─────────────────────────────────────────────────────┤ │
│                  │   │ aa@a.gr               ● Active -      ●○○○○ [View] │ │
│                  │   │ No goal • 0 interests                               │ │
│                  │   ├─────────────────────────────────────────────────────┤ │
│                  │   │ inactive@test.com     ○ Inact. Begin. ●●●○○ [View] │ │
│                  │   │ Has goal • 2 interests                              │ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
│                  │   [← Previous]  Page 1 of 2  [Next →]                     │
│                  │                                                           │
└──────────────────┴───────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Search and Filters

**Purpose**: Allow admins to quickly find users by email or filter by status/profile completion.

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ [Search by email...]                      [Filters ▼]  │
└─────────────────────────────────────────────────────────┘

Filters:
Status: [All] [●Active] [○Inactive]
Profile: [All] [Complete] [Partial] [Empty]
```

**Search Input Specifications**:
- **Width**: Full width of content area
- **Placeholder**: "Search by email..."
- **Behavior**:
  - Debounced at 300ms
  - Filters table immediately (client-side or API call)
  - Shows "No results found" if no matches

**Filter Buttons Specifications**:
- **Layout**: Horizontal button group
- **Style**:
  - Unselected: `bg-white border border-slate-300 text-slate-700`
  - Selected: `bg-violet-600 text-white`
  - Hover: `bg-violet-50` (unselected), `bg-violet-700` (selected)
- **Size**: `h-9 px-4 text-sm`
- **Border radius**: Left button `rounded-l-lg`, right button `rounded-r-lg`

**Active Filters Display**:
When filters are applied, show count:
```
Showing 18 of 33 users  [Clear Filters]
```

---

### User Table

**Purpose**: Display all users with sortable columns, status, and profile completion.

**Column Specifications**:

| Column | Width | Content | Sortable |
|--------|-------|---------|----------|
| **Email** | 35% | User email + profile summary | Yes (default) |
| **Status** | 15% | Active/Inactive indicator | Yes |
| **Level** | 15% | Beginner/Intermediate/Advanced | Yes |
| **Profile** | 20% | 5-dot completeness indicator | Yes |
| **Actions** | 15% | View Details button | No |

**Table Specifications**:
- **Container**:
  - Background: `white`
  - Border: `1px solid slate-200`
  - Border radius: `12px`
  - Overflow: Hidden (for rounded corners)

- **Header Row**:
  - Background: `slate-50`
  - Border bottom: `1px solid slate-200`
  - Height: `48px`
  - Padding: `12px 16px`
  - Font size: `12px`
  - Font weight: `600` (semibold)
  - Color: `slate-700`
  - Text transform: `uppercase`
  - Letter spacing: `0.05em`

- **Data Rows**:
  - Height: `72px` (more compact than user-facing UI)
  - Padding: `12px 16px`
  - Border bottom: `1px solid slate-100`
  - Font size: `14px`

**Row States**:
- **Default**: `bg-white`
- **Hover**: `bg-slate-50`, cursor pointer
- **Inactive User**: `bg-gray-50`, text color `slate-500` (reduced opacity)
- **Selected**: `bg-violet-50` (if implementing row selection)

---

### User Table Row

**Purpose**: Display single user with email, status, level, profile completion, and action.

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ admin@example.com          ● Active    Intermediate    ●●●●●  [View]│
│ Has goal • 7 interests                                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Email Column**:
- **Primary text** (email):
  - Font size: `14px`
  - Color: `slate-900`
  - Font weight: `500` (medium)
  - Line 1
- **Secondary text** (profile summary):
  - Font size: `12px`
  - Color: `slate-500`
  - Line 2
  - Format: "{goal_status} • {interest_count} interests"
  - Examples:
    - "Has goal • 7 interests"
    - "No goal • 0 interests"
    - "Has goal • 2 interests"

**Status Column**:
- **Active**:
  - Icon: `●` (filled circle) or `<span className="h-2 w-2 rounded-full bg-emerald-500" />`
  - Color: `emerald-500`
  - Text: "Active" (`emerald-700`)
- **Inactive**:
  - Icon: `○` (empty circle) or `<span className="h-2 w-2 rounded-full border-2 border-gray-400" />`
  - Color: `gray-400`
  - Text: "Inactive" (`gray-700`)

**Level Column**:
- **Display**: "Beginner", "Intermediate", "Advanced", or "-" (if not set)
- **Color**: `slate-900`
- **Font size**: `14px`

**Profile Completeness Column**:
- **5-Dot Indicator** (see component spec below)

**Actions Column**:
- **Button**: "View" (secondary variant)
- **Size**: Small (`h-8 px-3 text-sm`)
- **Click**: Navigate to `/admin/users/:id`

---

### Profile Completeness Indicator

**Purpose**: Visually show how complete a user's profile is (5-dot system).

**Dot Criteria**:
1. **Dot 1**: `learning_goal` is not null/empty
2. **Dot 2**: `current_level` is not null
3. **Dot 3**: `time_commitment` is not null
4. **Dot 4**: User has 1+ interests
5. **Dot 5**: User has 5+ interests

**Visual Structure**:
```
●●●●○  (4 filled, 1 empty)
```

**Specifications**:
- **Dot Size**: `8px` diameter circles
- **Gap**: `4px` between dots
- **Filled Dot**: `bg-violet-500`
- **Empty Dot**: `bg-slate-300`
- **Layout**: Horizontal flex row

**Tooltip** (on hover):
- Show completion percentage: "Profile 80% complete"
- List missing fields: "Missing: 5+ interests"

**Component Signature**:
```typescript
type ProfileCompletenessProps = {
  hasGoal: boolean;
  hasLevel: boolean;
  hasTimeCommitment: boolean;
  interestCount: number;
};

// Usage
<ProfileCompleteness
  hasGoal={true}
  hasLevel={true}
  hasTimeCommitment={true}
  interestCount={3}
/>
// Renders: ●●●●○ (4 filled: goal, level, time, 1+ interests)
```

---

### Status Badge

**Purpose**: Display user status (Active/Inactive/Verified) with consistent styling.

**Variants**:

| Status | Background | Text | Dot | Usage |
|--------|------------|------|-----|-------|
| Active | `emerald-100` | `emerald-700` | `emerald-500` | User is active |
| Inactive | `gray-100` | `gray-700` | `gray-400` | User is deactivated |
| Verified | `blue-100` | `blue-700` | `blue-500` | Email verified (future) |

**Visual Structure**:
```
● Active  (emerald)
○ Inactive  (gray)
```

**Specifications**:
- **Container**:
  - Display: Inline-flex
  - Align items: Center
  - Gap: `6px` (dot to text)
  - Padding: `4px 8px`
  - Border radius: `6px` (rounded-md)
  - Font size: `12px`
  - Font weight: `500` (medium)

- **Dot**:
  - Size: `6px` circle
  - Positioned: Vertically centered with text

**Component Signature**:
```typescript
type StatusBadgeProps = {
  status: 'active' | 'inactive' | 'verified';
};
```

---

## Pagination

**Visual Structure**:
```
Showing 1-20 of 524
[← Previous]  Page 1 of 27  [Next →]
```

**Specifications**:
- **Container**:
  - Padding: `16px`
  - Border top: `1px solid slate-200`
  - Display: Flex, justify-between

- **Result Count**:
  - Font size: `14px`
  - Color: `slate-600`

- **Navigation Buttons**:
  - Style: Ghost button variant
  - Size: Small (`h-8 px-3 text-sm`)
  - Disabled state: `opacity-50 cursor-not-allowed`

- **Page Number**:
  - Font size: `14px`
  - Color: `slate-900`
  - Font weight: `500` (medium)

---

## User Detail Page

### Desktop Layout

```
┌──────────────────┬───────────────────────────────────────────────────────────┐
│                  │                                                           │
│   ADMIN NAV      │   ← Back to Users                                         │
│   (Sidebar)      │                                                           │
│                  │   User: admin@example.com                                 │
│   Dashboard      │                                                           │
│   Users ●        │   Account Status                                          │
│   Analytics      │   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│                  │   │ ● Active      │ │ Regular User  │ │ Unverified    │  │
│                  │   │ [Deactivate]  │ │               │ │ Email         │  │
│                  │   └───────────────┘ └───────────────┘ └───────────────┘  │
│                  │                                                           │
│                  │   Current Profile (Version 4)                             │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│                  │   │                                                      │ │
│                  │   │   Learning Goal                                      │ │
│                  │   │   "i want to become a python dev"                    │ │
│                  │   │                                                      │ │
│                  │   │   Level: Intermediate                                │ │
│                  │   │   Time Commitment: 20+ hours/week                    │ │
│                  │   │                                                      │ │
│                  │   │   Interests (7 tags):                                │ │
│                  │   │   [go] [emotional intelligence] [project mgmt]       │ │
│                  │   │   [ecommerce] [c++] [data science] [ci/cd]           │ │
│                  │   │                                                      │ │
│                  │   │                           [View Full Profile History]│ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
│                  │   Activity Summary                                        │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│                  │   │   Registered: November 25, 2025                      │ │
│                  │   │   Last Active: November 26, 2025                     │ │
│                  │   │   Profile Updates: 4 versions                        │ │
│                  │   │   AI Recommendations: 0 generated                    │ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
│                  │   Danger Zone                                             │
│                  │   ┌─────────────────────────────────────────────────────┐ │
│                  │   │   [Deactivate User Account]                          │ │
│                  │   │   This will prevent the user from logging in.        │ │
│                  │   └─────────────────────────────────────────────────────┘ │
│                  │                                                           │
└──────────────────┴───────────────────────────────────────────────────────────┘
```

---

## Component Specifications (Detail Page)

### Account Status Cards

**Purpose**: Show user status at a glance with actionable toggles.

**Visual Structure** (3-card layout):
```
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ ● Active      │ │ Regular User  │ │ Unverified    │
│ [Deactivate]  │ │               │ │ Email         │
└───────────────┘ └───────────────┘ └───────────────┘
```

**Specifications**:
- **Container**: 3 cards in row (equal width)
- **Gap**: `16px`
- **Card**:
  - Background: `white`
  - Border: `1px solid slate-200`
  - Border radius: `12px`
  - Padding: `20px`
  - Min height: `100px`

**Card 1: Status**
- **Status Indicator**: Same as StatusBadge (dot + text)
- **Action Button**:
  - If active: "Deactivate" (ghost variant, red text)
  - If inactive: "Activate" (ghost variant, green text)
  - Size: Small (`h-8 px-3 text-sm`)

**Card 2: Role**
- **Label**: "Regular User" or "Superuser"
- **Color**: `slate-900` (informational only, no action)

**Card 3: Verification**
- **Label**: "Unverified Email" or "Verified Email"
- **Color**: `slate-900` (informational, no email sending implemented)

---

### Current Profile Panel

**Purpose**: Display user's current profile snapshot with option to view history.

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Current Profile (Version 4)                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Learning Goal                                         │
│   "i want to become a python dev"                       │
│                                                         │
│   Level: Intermediate                                   │
│   Time Commitment: 20+ hours/week                       │
│                                                         │
│   Interests (7 tags):                                   │
│   [go] [emotional intelligence] [project mgmt]          │
│   [ecommerce] [c++] [data science] [ci/cd]              │
│                                                         │
│                           [View Full Profile History]   │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- **Container**:
  - Background: `white`
  - Border: `1px solid slate-200`
  - Border radius: `12px`
  - Padding: `24px`

- **Section Title**:
  - Font size: `18px` (H4)
  - Font weight: `600` (semibold)
  - Color: `slate-900`
  - Margin bottom: `16px`

- **Field Display**:
  - **Label**:
    - Font size: `12px`
    - Color: `slate-500`
    - Font weight: `500` (medium)
    - Text transform: `uppercase`
    - Letter spacing: `0.05em`
    - Margin bottom: `4px`
  - **Value**:
    - Font size: `14px`
    - Color: `slate-900`
    - Line height: `1.5`
    - Margin bottom: `16px`

- **Tags Display**:
  - Reuse `TagBadge` component from courses feature
  - Layout: Flex wrap with `8px` gap
  - Max visible: Show all (no "+N" needed for admin view)

- **Action Button**:
  - "View Full Profile History" (secondary variant)
  - Positioned: Bottom right
  - Click: Opens profile history modal

**Empty State** (if profile not set up):
```
This user has not set up their profile yet.

Encourage them to complete their profile for better recommendations.
```

---

### Activity Summary Panel

**Purpose**: Show user engagement metrics.

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Activity Summary                                        │
├─────────────────────────────────────────────────────────┤
│   Registered: November 25, 2025                         │
│   Last Active: November 26, 2025                        │
│   Profile Updates: 4 versions                           │
│   AI Recommendations: 0 generated                       │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- Same card styling as Current Profile Panel
- **Metrics**:
  - **Label**: Same as field labels (12px, uppercase, slate-500)
  - **Value**: Same as field values (14px, slate-900)
  - **Layout**: Single column, each metric on new line

**Metric Definitions**:
- **Registered**: `user.created_at` (formatted: "November 25, 2025")
- **Last Active**: `user.updated_at` or last login (if tracking)
- **Profile Updates**: Count of `user_profile_snapshots`
- **AI Recommendations**: Count of recommendations generated by this user

---

### Deactivate User Modal

**Purpose**: Confirm admin wants to deactivate user (soft delete).

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Deactivate User Account                           [X]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Are you sure you want to deactivate this user?       │
│                                                         │
│   Email: admin@example.com                              │
│                                                         │
│   This will:                                            │
│   • Prevent the user from logging in                    │
│   • Preserve their data for compliance                  │
│   • Allow reactivation later if needed                  │
│                                                         │
│   This action can be reversed.                          │
│                                                         │
│   [Cancel]                        [Deactivate Account]  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- **Modal**: Reuse existing `Modal` component from user UI
- **Max width**: `500px`
- **Padding**: `24px`

- **Title**:
  - Font size: `20px` (H4)
  - Font weight: `600` (semibold)
  - Color: `slate-900`

- **Body Text**:
  - Font size: `14px`
  - Color: `slate-700`
  - Line height: `1.6`

- **Email Display**:
  - Font size: `14px`
  - Color: `slate-900`
  - Font weight: `500` (medium)
  - Background: `slate-50`
  - Padding: `8px 12px`
  - Border radius: `6px`

- **Bullet List**:
  - Font size: `14px`
  - Color: `slate-700`
  - Margin left: `20px`

- **Action Buttons**:
  - **Cancel**: Secondary variant, left-aligned
  - **Deactivate**: Destructive variant (`bg-red-600 text-white hover:bg-red-700`)
  - Gap: `12px`
  - Layout: Flex, justify-end

**Loading State**:
- Button shows spinner: "Deactivating..."
- Disable cancel button during operation

**Success State**:
- Modal closes automatically
- Toast notification: "User deactivated successfully"
- User detail page updates status to "Inactive"

**Error State**:
- Modal stays open
- Error message appears below buttons: "Failed to deactivate user. Please try again."

---

## Profile History Modal

**Purpose**: Show timeline of all profile versions.

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Profile History - admin@example.com                       [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   ● Version 4 (Current)             November 26, 2025  │   │
│   │   │                                                     │   │
│   │   │   Goal: "i want to become a python dev"            │   │
│   │   │   Level: Intermediate                              │   │
│   │   │   Time: 20+ hours/week                             │   │
│   │   │   Interests: 7 tags                                │   │
│   │   │                                                     │   │
│   │   ○ Version 3                       November 25, 2025  │   │
│   │   │                                                     │   │
│   │   │   Goal: "learning web development"                 │   │
│   │   │   Level: Beginner → Intermediate                   │   │
│   │   │   Time: 10-20 hours → 20+ hours                    │   │
│   │   │   Interests: 5 tags                                │   │
│   │   │                                                     │   │
│   │   ○ Version 2                       November 24, 2025  │   │
│   │   │                                                     │   │
│   │   │   Goal: "learning web development"                 │   │
│   │   │   Level: Beginner                                  │   │
│   │   │   Time: 5-10 hours                                 │   │
│   │   │   Interests: 3 tags                                │   │
│   │   │                                                     │   │
│   │   ○ Version 1 (Initial)             November 25, 2025  │   │
│   │                                                         │   │
│   │     Profile created (empty)                            │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                    [Close]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications**:
- **Modal**:
  - Max width: `700px`
  - Max height: `80vh` (scrollable content if > 6 versions)
  - Padding: `24px`

- **Timeline**:
  - Left border: `2px solid violet-200` (connects all versions)
  - Version nodes: Positioned along left border

- **Version Node**:
  - **Current Version**:
    - Dot: `●` filled circle (`bg-violet-600`, `12px` diameter)
    - Label: "Version 4 (Current)"
  - **Past Versions**:
    - Dot: `○` empty circle (`border-2 border-violet-400`, `12px` diameter)
    - Label: "Version 3"

- **Version Details**:
  - **Header**:
    - Version label: `14px`, `semibold`, `slate-900`
    - Date: `12px`, `slate-500`, right-aligned
  - **Body**:
    - Padding left: `32px` (to account for timeline)
    - Font size: `14px`
    - Color: `slate-700`
    - Line height: `1.6`
  - **Changed Fields** (if showing diff):
    - Show arrow: "Beginner → Intermediate"
    - Color: `violet-600` (to highlight change)

**Empty State** (only v1 exists):
```
This user has only the initial profile version.

Profile updates will appear here as the user refines their goals.
```

**Component Signature**:
```typescript
type ProfileHistoryModalProps = {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
};

// API data
type ProfileSnapshot = {
  version: number;
  created_at: string;
  learning_goal: string | null;
  current_level: string | null;
  time_commitment: number | null;
  interest_count: number;
};
```

---

## Responsive Behavior

### Tablet (768px - 1023px)

**User List**:
- Table converts to card layout (similar to mobile)
- Search and filters stack vertically

**User Detail**:
- Account status cards: 1 per row (stacked)
- Profile and activity panels: Full width

### Mobile (< 768px)

**User List**:
Convert table to card layout:
```
┌──────────────────────────────────────┐
│  admin@example.com                   │
│  ● Active • Intermediate             │
│  ●●●●● Profile 100% complete         │
│  Has goal • 7 interests              │
│  [View Details]                      │
└──────────────────────────────────────┘
```

**User Detail**:
- All cards stack vertically
- Profile history modal: Full screen overlay

---

## Empty States

**No Users Found** (after search/filter):
```
┌─────────────────────────────────────────┐
│                                         │
│           [Illustration]                │
│                                         │
│      No users match your filters        │
│                                         │
│   Try adjusting your search or filters  │
│                                         │
│          [Clear Filters]                │
│                                         │
└─────────────────────────────────────────┘
```

**No Users in System** (first-time setup):
```
┌─────────────────────────────────────────┐
│                                         │
│           [Illustration]                │
│                                         │
│         No users yet!                   │
│                                         │
│  The platform is ready. Share the       │
│  registration link to invite users.     │
│                                         │
│     [Copy Registration Link]            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Loading States

**User List Skeleton**:
```
┌─────────────────────────────────────────────────────────┐
│ ████████████████       ████████  ████████  ████  [View]│
│ ████████████ (pulsing)                                 │
├─────────────────────────────────────────────────────────┤
│ ████████████████       ████████  ████████  ████  [View]│
│ ████████████                                           │
└─────────────────────────────────────────────────────────┘
```

**User Detail Skeleton**:
- Account status cards: Show 3 pulsing rectangles
- Profile panel: Show pulsing text lines
- Activity panel: Show pulsing text lines

---

## Accessibility Specifications

### User Table

```html
<table role="table" aria-label="User list">
  <thead>
    <tr>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
      <th scope="col">Level</th>
      <th scope="col">Profile</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <div>
          <span className="email">admin@example.com</span>
          <span className="profile-summary" aria-label="User profile: Has goal and 7 interests">
            Has goal • 7 interests
          </span>
        </div>
      </td>
      <td>
        <span role="status" aria-label="Active user">● Active</span>
      </td>
      <td>Intermediate</td>
      <td>
        <ProfileCompleteness
          hasGoal={true}
          hasLevel={true}
          hasTimeCommitment={true}
          interestCount={7}
          aria-label="Profile 100% complete"
        />
      </td>
      <td>
        <button aria-label="View details for admin@example.com">View</button>
      </td>
    </tr>
  </tbody>
</table>
```

### Keyboard Navigation

- **User Table**:
  - Arrow keys: Navigate rows (optional enhancement)
  - Enter: Open user detail
  - Tab: Move to next row's action button

- **Filters**: Tab through filter buttons, Space/Enter to toggle

- **Modals**: Escape to close, Tab to cycle through buttons

---

## Testing Checklist

- [ ] Search filters users by email (case-insensitive)
- [ ] Status filter shows only active/inactive users
- [ ] Profile filter shows only complete/partial/empty profiles
- [ ] Table sorts by email, status, level (if implemented)
- [ ] Pagination works correctly (prev/next disabled at boundaries)
- [ ] Profile completeness dots match criteria
- [ ] User detail loads correct user data
- [ ] Profile history modal shows all versions in chronological order
- [ ] Deactivate user modal confirms action
- [ ] Deactivation updates user status immediately
- [ ] Toast notifications appear on success/error
- [ ] Loading skeletons show while data fetches
- [ ] Empty states appear when no users/results
- [ ] Mobile cards display correctly
- [ ] Screen reader announces status changes
- [ ] Keyboard navigation flows logically

---

**Document Status**: Ready for Implementation
**Related Files**: `DASHBOARD.md`, `ANALYTICS.md` (future)
