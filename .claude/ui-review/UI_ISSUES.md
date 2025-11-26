# UI Issues for Designer Review

This document captures current UI issues that need attention

**Frontend URL**: `http://localhost:5173`
**Test Credentials**:
- Email: `admin@example.com`
- Password: `YourSecurePassword123`

---

## Issue 1: Course Contents Display (Course Detail Page)

**Priority**: Low - cosmetic improvement
**Location**: Course detail page → "Course Contents" section
**Example URL**: `http://localhost:5173/courses/3160820a-ee68-4ab5-8118-602e36ee6cc3`

### Problem

The course contents section displays all modules as a single paragraph of text, making it extremely hard to read. All 8 modules run together in a dense text block with no visual separation.

**Current state**: Modules displayed as continuous text:
> "Module 1: Leadership Foundations - Understanding leadership styles... Module 2: Emotional Intelligence - Self-awareness... Module 3: Strategic Thinking..."

### Suggested Improvements

**Option A: Simple List**
Display each module on its own line:
- Module 1: Leadership Foundations - Understanding leadership styles...
- Module 2: Emotional Intelligence - Self-awareness...
- Module 3: Strategic Thinking...
- etc.

**Option B: Module Cards/Accordion**
Each module as a distinct visual component with:
- Module number/title as header
- Description below
- Possibly collapsible for long content
- Visual hierarchy (module number emphasized)

**Option C: Numbered List with Styling**
```
1. Leadership Foundations
   Understanding leadership styles, self-assessment, and personal leadership philosophy.

2. Emotional Intelligence
   Self-awareness, empathy, social skills, and managing emotions in the workplace.
```

---

## Issue 2: Course Card Truncation (Catalog Page)

**Priority**: Low - cosmetic improvement
**Location**: Course catalog page → course cards
**URL**: `http://localhost:5173/courses`

### Problem

Course cards truncate important information, making it difficult to evaluate courses at a glance:

1. **Titles cut off**: "Leadership Excellence: Fro...", "Introduction to Python...", "Modern Web Development...", etc.
2. **Descriptions truncated**: All descriptions end with "..." with no way to preview full text
3. **Hidden tags**: Shown as "+2", "+3" with no way to reveal them without clicking into the course

### Current Observations

- Cards use fixed height, causing content overflow
- No tooltips on hover to reveal full text
- Tags are limited to ~3 visible, rest hidden behind "+N" badge
- "+N" badge is not interactive (no hover expansion)

### Suggested Improvements

**Option A: Tooltips on Hover**
- Show full title on hover
- Show full description on hover
- Expand tags on hover

**Option B: Taller Cards / Multi-line Text**
- Allow 2-3 lines for titles
- Allow 3-4 lines for descriptions
- Show all tags (or more tags)

**Option C: Expandable Cards**
- Click/hover to expand card
- Show full content in expanded state
- Smooth animation

**Option D: Different Layout**
- List view option (more vertical space per course)
- Toggle between grid/list views

---

## Issue 3: Limited Filtering & Sorting (Catalog Page)

**Priority**: Medium - impacts course discovery UX
**Location**: Course catalog page → filter/search section
**URL**: `http://localhost:5173/courses`

### Problem

With 48 courses, users have limited ways to find relevant courses:

1. **Only difficulty filter exists**: All Levels, Beginner, Intermediate, Advanced
2. **No tag filtering**: Can't filter by topic (python, leadership, aws, etc.)
3. **No skills filtering**: Can't filter by what you'll learn
4. **No duration filtering**: Can't filter by short/medium/long courses
5. **No sorting options**: Can't sort by title, duration, difficulty, etc.
6. **Unclear search scope**: Placeholder just says "Search courses..." - doesn't indicate what fields are searchable

### Current Filter UI

```
[Search courses...                    ] [All Levels] [Beginner] [Intermediate] [Advanced]
```

### Suggested Improvements

**Enhanced Filtering**
- Filter by tags (multi-select dropdown or checkbox list)
- Filter by skills (what you'll learn)
- Filter by duration range (0-20h, 20-50h, 50h+)
- Combine multiple filters

**Sorting Options**
- Sort by title (A-Z, Z-A)
- Sort by duration (shortest first, longest first)
- Sort by difficulty

**Search Improvements**
- Clarify search scope: "Search by title, description, or tags"
- Show active filters with ability to clear
- "Clear all filters" button
- Show filter count: "Showing 12 of 48 courses"

**UI Layout**
```
[Search by title, description, or tags...          ]

Filters:  [Difficulty ▼]  [Tags ▼]  [Duration ▼]  [Sort by ▼]  [Clear all]

Active: Intermediate × python ×                    Showing 5 of 48 courses
```


## Technical Notes

- **Page Title**: "frontend" (should probably be "AcmeLearn - Course Catalog" or similar)
- **Routes**: `/courses` for catalog, `/courses/:courseId` for detail
- **Framework**: React with Tailwind CSS
- **Current card count**: 48 courses displayed

---

## For UI Designer

When reviewing these issues, consider:

1. **Consistency** with existing design system (`docs/UI_DESIGN_SYSTEM.md`)
2. **Accessibility** (WCAG 2.1 AA compliance)
   - Truncated text should have accessible alternatives
   - Filter controls should be keyboard navigable
3. **Responsive behavior** across breakpoints
4. **Animation/transition** opportunities for expand/collapse
5. **Component reusability** (tooltip component, filter component)
6. **Performance** - lazy loading for expanded content

### Priority Recommendation

1. **High**: Issue 3 (Filtering) - directly impacts user ability to find courses
2. **Medium**: Issue 1 (Contents display) - affects readability on detail page
3. **Low**: Issue 2 (Card truncation) - cosmetic but reduces information density
