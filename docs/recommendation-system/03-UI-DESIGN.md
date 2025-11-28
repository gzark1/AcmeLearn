# AcmeLearn Recommendation System - UI Design Specification

## Document Purpose

This document provides comprehensive UI/UX design specifications for the AcmeLearn AI-powered course recommendation system. It translates product strategy decisions into actionable design patterns, wireframes, and implementation guidance for React developers.

**Context**: This is a desktop-first feature (mobile NOT a priority) with a conversational chat-like interface backed by a 2-agent LLM system.

**Last Updated**: 2025-11-28
**Status**: Ready for Implementation

---

## Table of Contents

1. [Overview and Design Principles](#1-overview-and-design-principles)
2. [User Flow Diagram](#2-user-flow-diagram)
3. [Component Specifications](#3-component-specifications)
4. [Wireframes](#4-wireframes)
5. [Accessibility Considerations](#5-accessibility-considerations)
6. [Implementation Notes](#6-implementation-notes)

---

## 1. Overview and Design Principles

### 1.1 Design Goals

The recommendation UI must achieve four key objectives:

1. **Transparency**: Users should understand WHY each course was recommended
2. **Conversational**: Feel like talking to an advisor, not filling out forms
3. **Informative**: Rich explanations that build trust in AI quality
4. **Actionable**: Clear next steps from recommendations to enrollment

### 1.2 Core Design Principles

**1. Query-First Architecture**
- User's request is the PRIMARY driver for recommendations
- Profile data ENRICHES and PERSONALIZES, doesn't redirect
- Clear visual hierarchy: query → AI analysis → recommendations

**2. Conversational, Not Transactional**
- Chat-like interface with message bubbles
- Natural language input (textarea, not structured form)
- AI responses feel like advisor guidance, not database output

**3. Progressive Disclosure**
- Show essential info first (course title, match score, primary reason)
- Expandable sections for deep dives ("Explain this recommendation")
- Learning path preview collapsed by default

**4. Trust Through Transparency**
- Always explain WHY (fit reasons, skill gaps addressed)
- Show AI confidence levels
- Acknowledge profile gaps with helpful feedback

**5. Visual Clarity**
- Distinct visual treatment for user input vs AI response
- Clear separation between recommendations
- Visual indicators for match quality (scores, badges)

### 1.3 Backend API Response Structure

The UI must work with this exact API response:

```typescript
{
  "type": "recommendations",  // or "clarification_needed"
  "id": UUID,
  "query": string | null,
  "profile_analysis": {
    "skill_level": "beginner" | "intermediate" | "advanced",
    "skill_gaps": string[],
    "bridging_opportunities": string[],
    "confidence": "high" | "medium" | "low"
  },
  "profile_feedback": string | null,  // Optional AI feedback
  "courses": [
    {
      "course_id": UUID,
      "title": string,
      "match_score": float (0-1),
      "explanation": string,
      "skill_gaps_addressed": string[],
      "fit_reasons": string[],
      "estimated_weeks": int
    }
  ],
  "learning_path": [
    {
      "order": int,
      "course_id": UUID,
      "title": string,
      "rationale": string
    }
  ],
  "overall_summary": string,
  "created_at": datetime
}
```

**Clarification Response** (for vague/irrelevant queries):
```typescript
{
  "type": "clarification_needed",
  "intent": "vague" | "irrelevant",
  "message": string,
  "query": string
}
```

---

## 2. User Flow Diagram

### 2.1 Happy Path Flow

```
1. User lands on /app/recommendations
   ↓
2. Sees chat interface + quota indicator (7/10 remaining)
   ↓
3. User types query OR clicks "Recommend based on my profile"
   ↓
4. User submits request
   ↓
5. Loading state (animated brain, progress messages)
   ↓
6. AI response appears as chat message
   ↓
7. User views:
   - Profile analysis summary (if meaningful)
   - Course recommendations with explanations
   - Learning path preview (collapsed)
   ↓
8. User actions:
   - Click course to view details
   - Expand "Explain this recommendation"
   - View learning path
   - Start new query
```

### 2.2 Edge Case Flows

**Flow A: Rate Limit Exceeded**
```
Submit request → 429 error → Show rate limit message + reset countdown
```

**Flow B: Clarification Needed (Vague Query)**
```
Submit vague query → "clarification_needed" response →
Show helpful message + suggest completing profile
```

**Flow C: Clarification Needed (Irrelevant Query)**
```
Submit irrelevant query → "clarification_needed" response →
Gently redirect: "I can help with course recommendations..."
```

**Flow D: Profile Feedback**
```
Submit query → AI detects profile gaps →
Show recommendations + helpful feedback banner
```

### 2.3 Conversation History Flow (Phase 3 - Not MVP)

```
User has existing conversation → Load message history →
User types new query → Context preserved →
AI avoids duplicate suggestions
```

---

## 3. Component Specifications

### 3.1 RecommendationChat (Main Container)

**Purpose**: Conversational interface for AI recommendations

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│  AI Course Recommendations                    7/10 remaining    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Message History - Chat Bubbles]                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  User Message (Right-aligned, blue-50 bg)               │   │
│  │  "I want to become a better leader and improve my       │   │
│  │  team management skills"                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  AI Response (Left-aligned, white bg)                    │   │
│  │                                                          │   │
│  │  Profile Analysis: Intermediate level, 3 skill gaps     │   │
│  │                                                          │   │
│  │  [Course Recommendation Cards]                           │   │
│  │                                                          │   │
│  │  [Learning Path Preview - Collapsed]                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  What would you like to learn?                           │   │
│  │  [Textarea - 3 rows]                                     │   │
│  │                                                          │   │
│  │  [Get Recommendations]  [Recommend Based on My Profile]  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**States**:
- **Empty**: Show welcome message + quick actions
- **Loading**: Animated loading message replaces input form
- **Results**: Chat bubbles with user message + AI response
- **Rate Limited**: Disable input, show countdown timer
- **Error**: Error banner above input

**Layout Specs**:
- Max width: 1024px (64rem) - wide container
- Padding: 32px (2rem)
- Background: slate-50 (matches page background)
- Message area: flex-grow, scroll on overflow
- Input area: sticky bottom

### 3.2 UserMessage (Chat Bubble)

**Purpose**: Display user's query as chat message

**Visual Specs**:
```
                            ┌───────────────────────────────┐
                            │  I want to become a better    │
                            │  leader and improve my team   │
                            │  management skills            │
                            └───────────────────────────────┘
                            2 minutes ago
```

**Styling**:
- Alignment: Right (margin-left: auto)
- Max width: 70% of container
- Background: blue-50
- Border: 1px blue-200
- Border radius: 16px (large, rounded on left, square bottom-right)
- Padding: 16px (1rem)
- Text: slate-900, text-base (16px), line-height 1.6
- Timestamp: slate-500, text-sm (14px), right-aligned below bubble
- Margin bottom: 24px (1.5rem)

**Accessibility**:
- Role: "article"
- Aria-label: "Your message: {query}"

### 3.3 AIResponse (Chat Bubble with Nested Components)

**Purpose**: Display AI recommendation response

**Visual Structure**:
```
┌───────────────────────────────────────────────────────────────┐
│  Profile Analysis                                             │
│  Intermediate level • 3 skill gaps identified • High confidence│
│                                                               │
│  [Profile Feedback Banner - If present]                       │
│                                                               │
│  Based on your goals, I recommend these courses:              │
│                                                               │
│  [RecommendationCard #1]                                      │
│  [RecommendationCard #2]                                      │
│  [RecommendationCard #3]                                      │
│                                                               │
│  [LearningPathPreview - Collapsed]                            │
└───────────────────────────────────────────────────────────────┘
Just now
```

**Styling**:
- Alignment: Left
- Max width: 85% of container (wider than user message)
- Background: white
- Border: 1px slate-200
- Border radius: 16px (rounded on right, square bottom-left)
- Padding: 24px (1.5rem)
- Shadow: sm (subtle elevation)
- Margin bottom: 32px (2rem)
- Timestamp: slate-500, text-sm, left-aligned below bubble

**Profile Analysis Section**:
- Border-bottom: 1px slate-200
- Padding-bottom: 16px
- Margin-bottom: 16px
- Display: Horizontal list of badges
  - Skill level badge (colored based on level)
  - Skill gaps count badge (slate-100)
  - Confidence badge (emerald-100 for high, amber-100 for medium)

**Profile Feedback Banner** (optional, appears if backend returns feedback):
```
┌───────────────────────────────────────────────────────────────┐
│  💡 Tip: {profile_feedback}                                   │
│                                                               │
│  [Complete Your Profile]                                      │
└───────────────────────────────────────────────────────────────┘
```
- Background: blue-50
- Border: 1px blue-200
- Border radius: 8px
- Padding: 16px
- Margin-bottom: 16px
- Icon: blue-500

### 3.4 RecommendationCard (Individual Course Recommendation)

**Purpose**: Display single course recommendation with explanation

**Visual Structure**:
```
┌───────────────────────────────────────────────────────────────┐
│  1. Leadership Excellence: From Manager to Leader             │
│  ★ 94% Match                                                  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Why this course?                                             │
│  Based on your goal to improve leadership skills and your     │
│  intermediate experience level, this course offers practical  │
│  team management techniques that bridge your current gaps.    │
│                                                               │
│  ✓ Addresses your skill gaps:                                 │
│    • Strategic thinking                                       │
│    • Team motivation                                          │
│    • Conflict resolution                                      │
│                                                               │
│  🎯 Perfect fit because:                                      │
│    • Matches your "leadership" interest                       │
│    • Intermediate level aligns with your experience          │
│    • 35 hours fits your 10 hrs/week commitment (~4 weeks)     │
│                                                               │
│  [Intermediate]  35 hours  ~4 weeks                           │
│                                                               │
│  [View Course Details]  [Explain This Recommendation ▼]       │
└───────────────────────────────────────────────────────────────┘
```

**Styling**:
- Background: slate-50 (subtle distinction from AI bubble background)
- Border: 1px slate-200
- Border-radius: 12px (medium)
- Padding: 20px (1.25rem)
- Margin-bottom: 16px (1rem)
- Transition: shadow on hover (shadow-sm → shadow-md)

**Header Section**:
- Title: text-lg (18px), font-semibold, slate-900, line-clamp-2
- Match score:
  - Display as percentage with star icon
  - Color scale:
    - 90-100%: emerald-600 (excellent)
    - 75-89%: blue-600 (good)
    - 60-74%: amber-600 (moderate)
  - Font: text-sm, font-medium

**Explanation Section**:
- Label: "Why this course?" (text-sm, font-medium, slate-700)
- Text: text-base, slate-600, line-height 1.6
- Margin-top: 12px

**Skill Gaps Section**:
- Label: "✓ Addresses your skill gaps:" (text-sm, font-medium, slate-700)
- List: Bulleted, slate-600, text-sm
- Max display: 3 gaps, "+N more" if exceeds
- Margin-top: 12px

**Fit Reasons Section**:
- Label: "🎯 Perfect fit because:" (text-sm, font-medium, slate-700)
- List: Bulleted, slate-600, text-sm
- Margin-top: 12px

**Metadata Row**:
- Display: Horizontal flex, items-center, gap-3
- Difficulty badge (colored)
- Duration: "35 hours" (slate-600, text-sm)
- Estimated weeks: "~4 weeks" (slate-500, text-sm, italic)
- Margin-top: 16px
- Border-top: 1px slate-200, padding-top: 16px

**Action Buttons**:
- "View Course Details": Primary button (blue-600)
- "Explain This Recommendation": Secondary button with chevron icon
- Margin-top: 16px
- Gap: 12px

### 3.5 ExplainRecommendation (Expandable Deep Dive)

**Purpose**: Detailed AI reasoning when user clicks "Explain This Recommendation"

**Visual Structure** (Expanded State):
```
┌───────────────────────────────────────────────────────────────┐
│  [Explain This Recommendation ▲]                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Deep Dive: Why "Leadership Excellence" was chosen            │
│                                                               │
│  Profile Alignment Analysis                                   │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  Your goal: "Become a better leader and improve my team       │
│  management skills"                                           │
│                                                               │
│  This course directly addresses:                              │
│  • Core leadership principles (matches "leader" keyword)      │
│  • Team management techniques (matches "team" keyword)        │
│  • Practical skill development (aligns with your intermediate │
│    level)                                                     │
│                                                               │
│  Skill Development Path                                       │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  Based on your profile, you have gaps in:                     │
│  1. Strategic thinking - This course covers strategic         │
│     planning frameworks in Module 3                           │
│  2. Team motivation - Dedicated section on motivational       │
│     techniques in Module 5                                    │
│  3. Conflict resolution - Full module on resolving team       │
│     conflicts constructively                                  │
│                                                               │
│  Time Commitment Assessment                                   │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  Course duration: 35 hours                                    │
│  Your availability: 10 hours/week                             │
│  Estimated completion: 3-4 weeks                              │
│                                                               │
│  This pace allows for:                                        │
│  • Thorough module completion                                 │
│  • Practice exercises between sessions                        │
│  • Reflection and application to your work                    │
│                                                               │
│  Next Steps After This Course                                 │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  After completing this course, consider:                      │
│  • "Advanced Leadership Communication" (builds on these       │
│    foundations)                                               │
│  • "Strategic Decision Making for Leaders" (complements       │
│    Module 3)                                                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Styling**:
- Background: white (same as expanded parent)
- Border-top: 1px slate-200 (separates from card)
- Padding: 20px
- Margin-top: 16px
- Animation: Slide down (200ms ease)

**Section Headers**:
- Font: text-base, font-semibold, slate-900
- Underline: 1px slate-200 (visual separator)
- Margin-bottom: 12px

**Content Blocks**:
- Font: text-sm, slate-600, line-height 1.6
- Nested lists: Bulleted, indented 16px
- Spacing: 12px between paragraphs

**Collapse Behavior**:
- Toggle button shows chevron (▼ collapsed, ▲ expanded)
- Smooth animation (max-height transition)
- Keyboard accessible (Enter/Space to toggle)

### 3.6 CourseComparisonView (Side-by-Side Comparison)

**Purpose**: Compare 2-3 recommended courses side-by-side

**Trigger**: User selects courses to compare (checkbox on cards)

**Visual Structure**:
```
┌───────────────────────────────────────────────────────────────┐
│  Compare Courses                                      [Close] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │  Course A    │  Course B    │  Course C    │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │              │              │              │             │
│  │  Leadership  │  Emotional   │  Strategic   │             │
│  │  Excellence  │  Intelligence│  Thinking    │             │
│  │              │              │              │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  Match Score │  Match Score │  Match Score │             │
│  │  ★ 94%       │  ★ 88%       │  ★ 82%       │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  Difficulty  │  Difficulty  │  Difficulty  │             │
│  │  Intermediate│  Intermediate│  Advanced    │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  Duration    │  Duration    │  Duration    │             │
│  │  35 hours    │  40 hours    │  50 hours    │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  Completion  │  Completion  │  Completion  │             │
│  │  ~4 weeks    │  ~4 weeks    │  ~5 weeks    │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  Skills Covered                            │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  • Strategic │  • Empathy   │  • Analysis  │             │
│  │    thinking  │  • Self-     │  • Decision  │             │
│  │  • Team      │    awareness │    making    │             │
│  │    motivation│  • Relation- │  • Problem   │             │
│  │  • Conflict  │    ship mgmt │    solving   │             │
│  │    resolution│              │              │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  Why AI Recommended This Course             │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  Direct match│  Complements │  Stretch goal│             │
│  │  for your    │  leadership  │  to build on │             │
│  │  stated goal │  with EQ     │  foundations │             │
│  │  of team mgmt│  focus       │              │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  Skill Gaps Addressed                       │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  ✓ Strategic │  ✓ Empathy   │  ✓ Strategic │             │
│  │  ✓ Team      │  ✓ Conflict  │  ✓ Analysis  │             │
│  │    motivation│              │              │             │
│  │  ✓ Conflict  │              │              │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │  [View]      │  [View]      │  [View]      │             │
│  └──────────────┴──────────────┴──────────────┘             │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Trigger UI** (on Recommendation Cards):
```
┌───────────────────────────────────────────────────────────────┐
│  [☐ Compare]  1. Leadership Excellence  ★ 94% Match           │
│  ...                                                          │
└───────────────────────────────────────────────────────────────┘

When 2+ selected:
┌───────────────────────────────────────────────────────────────┐
│  [Compare Selected (2)]                                       │
└───────────────────────────────────────────────────────────────┘
```

**Modal Styling**:
- Full-screen modal overlay (bg-black/50)
- Content container: max-w-7xl, bg-white, rounded-lg
- Padding: 32px
- Shadow: xl
- Close button: top-right, slate-500 hover:slate-700

**Table Styling**:
- Border: 1px slate-200 (all cells)
- Header cells: bg-slate-50, font-semibold, slate-900
- Body cells: bg-white, slate-600
- Padding: 12px per cell
- Row hover: bg-slate-50 (for readability)

**Responsive Behavior**:
- Desktop: 3 columns (up to 3 courses)
- Tablet: 2 columns (scroll for 3rd)
- Mobile: Stack vertically (comparison not ideal on mobile)

### 3.7 LearningPathPreview (2-3 Course Sequence)

**Purpose**: Show recommended course sequence with rationale

**Visual Structure** (Collapsed State):
```
┌───────────────────────────────────────────────────────────────┐
│  📚 Learning Path: Your Journey to Leadership Mastery [Expand]│
│  3 courses, 12-16 weeks total                                 │
└───────────────────────────────────────────────────────────────┘
```

**Visual Structure** (Expanded State):
```
┌───────────────────────────────────────────────────────────────┐
│  📚 Learning Path: Your Journey to Leadership Mastery         │
│  [Collapse ▲]                                                 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────┐                                                      │
│  │  1  │ → Leadership Excellence: From Manager to Leader      │
│  └─────┘   Start here                                         │
│                                                               │
│            Why first? Build foundational leadership skills    │
│            before advancing to specialized topics.            │
│                                                               │
│            [Intermediate]  35 hours  ~4 weeks                 │
│                                                               │
│            ↓                                                  │
│                                                               │
│  ┌─────┐                                                      │
│  │  2  │ → Emotional Intelligence in Leadership               │
│  └─────┘   Then continue with                                │
│                                                               │
│            Why second? Builds on leadership foundations by    │
│            adding emotional intelligence and interpersonal    │
│            skills crucial for team management.                │
│                                                               │
│            [Intermediate]  40 hours  ~4 weeks                 │
│                                                               │
│            ↓                                                  │
│                                                               │
│  ┌─────┐                                                      │
│  │  3  │ → Strategic Thinking for Leaders                     │
│  └─────┘   Finish with                                       │
│                                                               │
│            Why third? Capstone course that synthesizes        │
│            leadership and EQ into strategic decision-making.  │
│            Requires strong foundation from previous courses.  │
│                                                               │
│            [Advanced]  50 hours  ~5 weeks                     │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  Total time investment: 125 hours over 12-16 weeks            │
│  At your pace (10 hrs/week): ~13 weeks                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Styling (Collapsed)**:
- Background: blue-50
- Border: 1px blue-200
- Border-radius: 12px
- Padding: 16px
- Margin-top: 24px
- Cursor: pointer (entire card clickable)
- Transition: bg-blue-100 on hover

**Styling (Expanded)**:
- Background: white
- Border: 2px blue-300 (emphasize active state)
- Border-radius: 12px
- Padding: 24px
- Shadow: md (elevated)

**Step Cards**:
- Display: Vertical flow with arrows between steps
- Number badge:
  - Circle: 48px diameter
  - Background: blue-600
  - Text: white, text-xl, font-bold
  - Border: 2px white
  - Shadow: sm
- Course title: text-base, font-semibold, slate-900
- Label: text-sm, slate-500 ("Start here", "Then continue with", "Finish with")
- Rationale: text-sm, slate-600, italic, margin-top 8px
- Metadata row: Difficulty + Duration + Weeks
- Spacing: 20px between steps
- Arrow: gray-300, centered, 24px height

**Summary Footer**:
- Border-top: 1px slate-200
- Padding-top: 16px
- Margin-top: 20px
- Font: text-sm, slate-700
- Bold: Total time, estimated weeks

### 3.8 AILoadingState (Animated Progress)

**Purpose**: Engaging loading experience during LLM processing

**Visual Structure**:
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                                                               │
│                   [Animated Brain Icon]                       │
│                    (pulsing animation)                        │
│                                                               │
│            Finding your perfect courses...                    │
│                                                               │
│                                                               │
│         "Analyzing your learning goals..."                    │
│                                                               │
│                                                               │
│              Usually takes 3-5 seconds                        │
│                                                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Animation Sequence**:

**Phase 1: 0-2 seconds**
- Message: "Analyzing your learning goals..."
- Icon: Pulsing brain (scale 1 → 1.1 → 1, repeat)

**Phase 2: 2-4 seconds**
- Message: "Matching courses to your interests..."
- Icon: Continue pulsing

**Phase 3: 4-6 seconds**
- Message: "Crafting personalized recommendations..."
- Icon: Continue pulsing

**Phase 4: 6+ seconds** (if still loading)
- Message: "This is taking longer than usual..."
- Icon: Continue pulsing
- Additional text: "Our AI is being extra thorough!"

**Styling**:
- Container: max-w-md, mx-auto, text-center
- Background: white
- Border: 1px slate-200
- Border-radius: 16px
- Padding: 48px 32px
- Shadow: md
- Icon: 64px × 64px, blue-500
- Title: text-xl, font-semibold, slate-900, margin-top 24px
- Progress message: text-base, slate-600, margin-top 16px, min-height 24px (prevents layout shift)
- Estimate: text-sm, slate-500, italic, margin-top 24px

**Brain Icon Implementation**:
```jsx
// Use Heroicons "SparklesIcon" or custom SVG
import { SparklesIcon } from '@heroicons/react/24/outline';

<div className="relative">
  <SparklesIcon className="h-16 w-16 text-blue-500 animate-pulse" />
</div>
```

**Accessibility**:
- Role: "status"
- Aria-live: "polite"
- Aria-label: "Loading recommendations, please wait"

### 3.9 RateLimitIndicator (Quota Display)

**Purpose**: Show remaining recommendation quota

**Visual Structure** (Header of page):
```
AI Course Recommendations                    7/10 remaining
                                             ──────────────
                                             ████████░░░ 70%
```

**Styling**:
- Display: Inline-flex, items-center, gap-2
- Font: text-sm, slate-600
- Progress bar:
  - Width: 100px
  - Height: 6px
  - Background: slate-200
  - Fill: blue-500
  - Border-radius: 9999px (full)
- Position: Top-right of page header

**States**:
- **Healthy (7-10 remaining)**: blue-500 fill, slate-600 text
- **Warning (3-6 remaining)**: amber-500 fill, amber-700 text
- **Critical (1-2 remaining)**: red-500 fill, red-700 text
- **Exhausted (0 remaining)**: gray-400 fill, gray-600 text, "Resets in 4h 23m"

**Tooltip on Hover**:
```
┌────────────────────────────────────┐
│  Recommendation Quota              │
│                                    │
│  Used: 3 of 10                     │
│  Remaining: 7                      │
│  Resets: Tomorrow at 2:45 PM       │
│                                    │
│  Tip: Complete your profile for    │
│  better recommendations with       │
│  fewer requests!                   │
└────────────────────────────────────┘
```

### 3.10 ClarificationMessage (Edge Case UI)

**Purpose**: Handle vague or irrelevant queries gracefully

**Visual Structure** (Vague Query with Profile):
```
┌───────────────────────────────────────────────────────────────┐
│  I'd love to help you find the perfect courses!               │
│                                                               │
│  Your query was a bit general. Based on your profile, I can   │
│  recommend courses related to:                                │
│                                                               │
│  • Leadership (from your interests)                           │
│  • Team management (from your goal)                           │
│  • Python (from your interests)                               │
│                                                               │
│  Would you like me to recommend courses based on your profile?│
│                                                               │
│  [Recommend Based on My Profile]                              │
│                                                               │
│  Or, try being more specific:                                 │
│  • "I want to learn Python for data analysis"                 │
│  • "Help me improve my leadership communication skills"       │
│  • "Show me beginner courses in machine learning"             │
└───────────────────────────────────────────────────────────────┘
```

**Visual Structure** (Irrelevant Query):
```
┌───────────────────────────────────────────────────────────────┐
│  I specialize in course recommendations!                      │
│                                                               │
│  I noticed your query wasn't about learning or courses.       │
│  I'm here to help you find courses that match your goals.     │
│                                                               │
│  Try asking about:                                            │
│  • Technical skills (Python, JavaScript, AWS, etc.)           │
│  • Professional development (Leadership, Communication, etc.) │
│  • Career goals ("I want to become a data scientist")         │
│                                                               │
│  [Browse All Courses]                                         │
└───────────────────────────────────────────────────────────────┘
```

**Styling**:
- Background: amber-50 (gentle warning color)
- Border: 1px amber-200
- Border-radius: 12px
- Padding: 24px
- Icon: Lightbulb or information icon (amber-500)
- Title: text-lg, font-semibold, slate-900
- Body: text-base, slate-600
- Examples: Bulleted list, text-sm, slate-600, italic
- CTA button: Primary style (blue-600)

**Tone**:
- Friendly, helpful (never scolding)
- Acknowledge user input positively
- Guide toward successful query

---

## 4. Wireframes

### 4.1 Empty State (First Visit)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Nav Bar - Dashboard | Courses | Recommendations | Avatar]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AI Course Recommendations                    10/10 remaining   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │              [Sparkles Icon - 64px]                      │   │
│  │                                                          │   │
│  │        Tell me what you'd like to learn!                 │   │
│  │                                                          │   │
│  │  I'll analyze your goals and profile to recommend        │   │
│  │  the perfect courses from our catalog of 48 expert-      │   │
│  │  curated courses.                                        │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  What would you like to learn?                           │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Example: "I want to become a better leader and   │    │   │
│  │  │ improve my team management skills"              │    │   │
│  │  │                                                 │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  │  [Get Recommendations]  [Recommend Based on My Profile]  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Quick Examples:                                                │
│  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐ │
│  │ "Learn Python    │ │ "Improve my      │ │ "Become a data │ │
│  │  for data        │ │  leadership      │ │  scientist"    │ │
│  │  analysis"       │ │  skills"         │ │                │ │
│  │                  │ │                  │ │                │ │
│  │ [Try this query] │ │ [Try this query] │ │ [Try this...]  │ │
│  └──────────────────┘ └──────────────────┘ └────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Loading State

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Course Recommendations                    9/10 remaining    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Previous conversation messages if any...]                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  I want to become a better leader and improve my        │   │
│  │  team management skills                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Just now                                                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │                  [Animated Brain Icon]                   │   │
│  │                   (pulsing animation)                    │   │
│  │                                                          │   │
│  │           Finding your perfect courses...                │   │
│  │                                                          │   │
│  │       "Analyzing your learning goals..."                 │   │
│  │                                                          │   │
│  │             Usually takes 3-5 seconds                    │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Recommendations Result (Success State)

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Course Recommendations                    7/10 remaining    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  I want to become a better leader and improve my        │   │
│  │  team management skills                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│  2 minutes ago                                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Profile Analysis                                        │   │
│  │  [Intermediate]  [3 skill gaps]  [High confidence]      │   │
│  │  ──────────────────────────────────────────────────────  │   │
│  │                                                          │   │
│  │  Based on your goals, I recommend these courses:         │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ [☐] 1. Leadership Excellence: From Manager...    │   │   │
│  │  │ ★ 94% Match                                      │   │   │
│  │  │ ─────────────────────────────────────────────── │   │   │
│  │  │ Why this course?                                 │   │   │
│  │  │ Based on your goal to improve leadership skills  │   │   │
│  │  │ and your intermediate experience level, this...  │   │   │
│  │  │                                                  │   │   │
│  │  │ ✓ Addresses your skill gaps:                     │   │   │
│  │  │   • Strategic thinking                           │   │   │
│  │  │   • Team motivation                              │   │   │
│  │  │   • Conflict resolution                          │   │   │
│  │  │                                                  │   │   │
│  │  │ 🎯 Perfect fit because:                          │   │   │
│  │  │   • Matches your "leadership" interest           │   │   │
│  │  │   • Intermediate level aligns with experience    │   │   │
│  │  │   • 35 hours fits your 10 hrs/week (~4 weeks)    │   │   │
│  │  │                                                  │   │   │
│  │  │ [Intermediate]  35 hours  ~4 weeks               │   │   │
│  │  │                                                  │   │   │
│  │  │ [View Course]  [Explain This Recommendation ▼]   │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ [☐] 2. Emotional Intelligence in Leadership      │   │   │
│  │  │ ★ 88% Match                                      │   │   │
│  │  │ [Similar structure...]                           │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ [☐] 3. Strategic Thinking for Leaders            │   │   │
│  │  │ ★ 82% Match                                      │   │   │
│  │  │ [Similar structure...]                           │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  [Compare Selected (0)]                                  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ 📚 Learning Path: Your Journey to Leadership     │   │   │
│  │  │ Mastery                              [Expand ▼]  │   │   │
│  │  │ 3 courses, 12-16 weeks total                     │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Just now                                                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  What else would you like to learn?                      │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                                                 │    │   │
│  │  │                                                 │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  │  [Get Recommendations]  [Recommend Based on My Profile]  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Rate Limit Reached State

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Course Recommendations                    0/10 remaining    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Previous conversation messages...]                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  ⏱️ You've reached your daily recommendation limit       │   │
│  │                                                          │   │
│  │  You've used all 10 recommendations for today.           │   │
│  │  Your quota resets in:                                   │   │
│  │                                                          │   │
│  │          4 hours 23 minutes                              │   │
│  │                                                          │   │
│  │  While you wait, you can:                                │   │
│  │  • Browse our full course catalog                        │   │
│  │  • Complete your profile for better recommendations      │   │
│  │  • Review your recommendation history                    │   │
│  │                                                          │   │
│  │  [Browse All Courses]  [Edit My Profile]                 │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💡 Tip: A complete profile helps our AI give better     │   │
│  │  recommendations with fewer requests!                    │   │
│  │                                                          │   │
│  │  Your profile completeness: ●●●○○ (60%)                  │   │
│  │  Missing: Learning goal, Time commitment                 │   │
│  │                                                          │   │
│  │  [Complete Your Profile]                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Comparison Modal (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Compare Courses                                    [X]   │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │  ┌──────────────┬──────────────┬──────────────┐          │ │
│  │  │  Course 1    │  Course 2    │  Course 3    │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │              │              │              │          │ │
│  │  │ Leadership   │ Emotional    │ Strategic    │          │ │
│  │  │ Excellence   │ Intelligence │ Thinking     │          │ │
│  │  │              │              │              │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ Match Score  │ Match Score  │ Match Score  │          │ │
│  │  │ ★ 94%        │ ★ 88%        │ ★ 82%        │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ Difficulty   │ Difficulty   │ Difficulty   │          │ │
│  │  │ Intermediate │ Intermediate │ Advanced     │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ Duration     │ Duration     │ Duration     │          │ │
│  │  │ 35 hours     │ 40 hours     │ 50 hours     │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ Completion   │ Completion   │ Completion   │          │ │
│  │  │ ~4 weeks     │ ~4 weeks     │ ~5 weeks     │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ Skills You'll Learn                        │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ • Strategic  │ • Empathy    │ • Analysis   │          │ │
│  │  │   thinking   │ • Self-aware │ • Decision   │          │ │
│  │  │ • Team       │ • Relations  │   making     │          │ │
│  │  │   motivation │              │ • Problem    │          │ │
│  │  │ • Conflict   │              │   solving    │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ Why AI Recommended                         │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ Direct match │ Complements  │ Stretch goal │          │ │
│  │  │ for team     │ leadership   │ to build on  │          │ │
│  │  │ management   │ with EQ      │ foundations  │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ Skill Gaps Addressed                       │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ ✓ Strategic  │ ✓ Empathy    │ ✓ Strategic  │          │ │
│  │  │ ✓ Team       │ ✓ Conflict   │ ✓ Analysis   │          │ │
│  │  │   motivation │              │              │          │ │
│  │  │ ✓ Conflict   │              │              │          │ │
│  │  ├──────────────┼──────────────┼──────────────┤          │ │
│  │  │ [View Course]│ [View Course]│ [View Course]│          │ │
│  │  └──────────────┴──────────────┴──────────────┘          │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Accessibility Considerations

### 5.1 WCAG 2.1 AA Compliance

**Color Contrast**:
- All text meets 4.5:1 minimum contrast ratio
- Large text (18px+) meets 3:1 minimum
- Interactive elements have 3:1 contrast against background
- Focus indicators have 3:1 contrast

**Keyboard Navigation**:
- All interactive elements focusable via Tab/Shift+Tab
- Logical tab order (top to bottom, left to right)
- Skip navigation link for keyboard users
- Modal traps focus while open
- Escape key closes modals

**Screen Reader Support**:
- Semantic HTML (button, nav, article, section)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content (loading states)
- ARIA expanded/collapsed for accordions
- Alt text for all informational icons

**Focus Management**:
- Visible focus indicators (2px blue-500 ring)
- Focus trapped in modals
- Focus returned to trigger after modal close
- Skip to main content link

### 5.2 Component-Specific Accessibility

**RecommendationChat**:
- Role: "main"
- Aria-label: "Course recommendation interface"
- Keyboard: Arrow keys to navigate messages

**UserMessage/AIResponse**:
- Role: "article"
- Aria-labelledby: message content ID
- Time stamp: aria-label="Posted {relative time}"

**RecommendationCard**:
- Role: "article"
- Aria-labelledby: course title ID
- Checkbox: Accessible label "Select {course} for comparison"

**ExplainRecommendation**:
- Button: aria-expanded="true/false"
- Button: aria-controls="{content-id}"
- Content: aria-hidden="true" when collapsed

**CourseComparisonView**:
- Role: "dialog"
- Aria-modal: "true"
- Aria-labelledby: "Compare Courses"
- Close button: aria-label="Close comparison"
- Focus trap: Tab cycles through modal elements

**LearningPathPreview**:
- Button: aria-expanded="true/false"
- Content: aria-hidden="true" when collapsed
- Ordered list: Semantic <ol> for steps

**AILoadingState**:
- Role: "status"
- Aria-live: "polite"
- Aria-label: "Loading recommendations"
- Progress messages: auto-announced by screen reader

**RateLimitIndicator**:
- Aria-label: "{used} of {limit} recommendations used"
- Tooltip: aria-describedby points to tooltip content

### 5.3 Motion and Animation

**Respect prefers-reduced-motion**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Safe Animations**:
- Pulsing brain icon: Scale change only (no flashing)
- Message slide-in: Opacity + translate (no sudden appearance)
- Expand/collapse: Max-height transition (smooth)

### 5.4 Testing Checklist

- [ ] Test with VoiceOver (Mac) or NVDA (Windows)
- [ ] Navigate entire flow using only keyboard
- [ ] Verify color contrast with Chrome DevTools
- [ ] Test with 200% zoom (text should reflow)
- [ ] Enable prefers-reduced-motion and verify
- [ ] Test with screen reader + keyboard only
- [ ] Verify focus order matches visual order
- [ ] Ensure all interactive elements have visible focus

---

## 6. Implementation Notes

### 6.1 React Component Hierarchy

```
app/routes/app/recommendations.tsx (Page)
  └─ RecommendationChat (features/recommendations/components/)
      ├─ RateLimitIndicator
      ├─ MessageHistory
      │   ├─ UserMessage (multiple)
      │   └─ AIResponse (multiple)
      │       ├─ ProfileAnalysisSummary
      │       ├─ ProfileFeedbackBanner (conditional)
      │       ├─ RecommendationCard (multiple)
      │       │   └─ ExplainRecommendation (expandable)
      │       └─ LearningPathPreview (expandable)
      ├─ AILoadingState (conditional)
      ├─ ClarificationMessage (conditional)
      └─ RecommendationInput
          ├─ Textarea
          └─ Button (Get Recommendations, Recommend Based on Profile)

CourseComparisonView (Separate Modal Component)
```

### 6.2 State Management

**React Query Queries**:
- `useRecommendationQuota`: Fetch quota status (polled every 60s)
- `useRecommendations`: Not used (single request, no caching)

**React Query Mutations**:
- `useGenerateRecommendations`: POST to generate recommendations
  - On success: Append AI response to message history
  - On error: Show error banner
  - Invalidates: quota query

**Local State (React.useState)**:
- `messages: Message[]` - Chat history (user + AI messages)
- `isLoading: boolean` - Loading state for current request
- `selectedCourseIds: string[]` - Courses selected for comparison
- `expandedExplanations: Set<string>` - Which cards have expanded details
- `expandedLearningPath: boolean` - Learning path expanded state

**No Global State Needed**: This feature is self-contained

### 6.3 API Integration

**Generate Recommendations**:
```typescript
// features/recommendations/api/generate-recommendations.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

type GenerateRecommendationsInput = {
  query?: string;
  num_recommendations?: number;
};

type RecommendationsResponse = {
  type: "recommendations" | "clarification_needed";
  // ... (see Section 1.3)
};

export const generateRecommendations = (
  data: GenerateRecommendationsInput
): Promise<RecommendationsResponse> => {
  return api.post('/api/v1/recommendations/generate', data);
};

export const useGenerateRecommendations = () => {
  return useMutation({
    mutationFn: generateRecommendations,
  });
};
```

**Get Quota**:
```typescript
// features/recommendations/api/get-quota.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

type QuotaResponse = {
  used: number;
  limit: number;
  remaining: number;
};

export const getQuota = (): Promise<QuotaResponse> => {
  return api.get('/api/v1/recommendations/quota');
};

export const useQuota = () => {
  return useQuery({
    queryKey: ['recommendations', 'quota'],
    queryFn: getQuota,
    refetchInterval: 60000, // Poll every 60s
  });
};
```

### 6.4 Error Handling

**429 Rate Limit**:
- Catch in mutation onError
- Extract reset time from backend response
- Display rate limit modal/banner
- Disable input, show countdown

**400 Bad Request**:
- Display error message inline
- Allow user to retry with different query
- Don't clear input (preserve user's text)

**504 Timeout**:
- Show friendly message: "This is taking longer than usual. Please try again."
- Provide "Try Again" button
- Log to error tracking (Sentry)

**Network Error**:
- Display offline banner
- Provide "Retry" button
- Explain issue clearly

**Clarification Needed**:
- NOT an error - handle as normal response
- Display ClarificationMessage component
- Provide helpful suggestions

### 6.5 Performance Optimizations

**Code Splitting**:
- Lazy load CourseComparisonView modal
- Only load when user clicks "Compare Selected"

**Message Virtualization**:
- Not needed for MVP (max 10 conversations per day)
- Consider if Phase 3 adds unlimited history

**Debouncing**:
- Not applicable (no search input)
- Submit is explicit button click

**Optimistic Updates**:
- Append user message immediately on submit
- Show loading state while waiting for AI
- Append AI response when ready

**Image Loading**:
- No images in MVP (text-only recommendations)
- Course images load in course detail page

### 6.6 Testing Strategy

**Unit Tests** (Vitest):
- RecommendationCard: Match score color logic
- RateLimitIndicator: Quota state calculations
- ClarificationMessage: Conditional rendering
- LearningPathPreview: Step ordering

**Component Tests** (Testing Library):
- RecommendationChat: Full user flow
- AILoadingState: Animation cycle
- ExplainRecommendation: Expand/collapse
- CourseComparisonView: Modal behavior

**Integration Tests** (MSW + Testing Library):
- Submit query → Loading → Success
- Submit query → Rate limit error
- Submit query → Clarification response
- Select courses → Open comparison

**E2E Tests** (Playwright):
- Complete recommendation flow
- Rate limit reached flow
- Comparison modal flow

### 6.7 Mobile Considerations (NOT A PRIORITY)

**Note**: Mobile is explicitly NOT a priority per Product Strategy. These notes are for future reference only.

**If Mobile Support Added**:
- Stack recommendation cards vertically
- Reduce padding/spacing (16px → 12px)
- Collapse "Explain This" by default
- Disable comparison view (too complex for mobile)
- Show 2-3 course cards max, with "View More" button
- Use bottom sheet for learning path preview
- Reduce font sizes slightly (16px → 14px for body)

### 6.8 Browser Compatibility

**Target Browsers**:
- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+
- Edge 90+

**Polyfills** (if needed):
- Intersection Observer (for lazy loading)
- Scroll behavior smooth (for anchor links)

**Not Supporting**:
- IE11 (end of life)
- Opera Mini (limited support)

### 6.9 Design Tokens (Tailwind Config)

All colors, spacing, and typography follow existing design system in `docs/UI_DESIGN_SYSTEM.md`.

**Key Tailwind Classes**:
- Container: `max-w-4xl mx-auto px-4`
- Card: `bg-white rounded-xl border border-slate-200 shadow-sm`
- User message: `bg-blue-50 border-blue-200`
- AI message: `bg-white border-slate-200`
- Button primary: `bg-blue-600 text-white hover:bg-blue-700`
- Button secondary: `border border-blue-600 text-blue-600 hover:bg-blue-50`
- Loading state: `animate-pulse`

### 6.10 Implementation Priority

**Phase 1 - Core Functionality** (Build First):
1. RecommendationChat (main container)
2. RecommendationInput (textarea + buttons)
3. AILoadingState (animated progress)
4. UserMessage (chat bubble)
5. AIResponse (with nested components)
6. RecommendationCard (course display)
7. RateLimitIndicator (quota display)
8. ClarificationMessage (edge cases)

**Phase 2 - Enhanced Features** (Build Second):
9. ExplainRecommendation (expandable details)
10. LearningPathPreview (collapsible path)
11. CourseComparisonView (modal)
12. ProfileFeedbackBanner (conditional)

**Phase 3 - Polish** (Final):
13. Animations and transitions
14. Error states and loading skeletons
15. Empty states and onboarding
16. Accessibility audit and fixes

---

## Appendix: Design Decisions

### Why Chat Interface Instead of Form?

**Decision**: Conversational chat-like UI with message bubbles

**Rationale**:
1. **User Expectation**: ChatGPT normalized chat UX for AI interactions
2. **Query-First**: User's request is primary, not profile fields
3. **Transparency**: AI responses feel like advisor guidance
4. **Engagement**: More engaging than filling out forms
5. **Flexibility**: Supports free-text queries easily

### Why No Streaming for MVP?

**Decision**: Animated loading instead of typewriter streaming

**Rationale**:
1. **Simpler Implementation**: No SSE setup, easier error handling
2. **Good Enough UX**: Animated progress messages keep users engaged
3. **Fast Responses**: 3-5s latency doesn't require streaming
4. **Phase 2 Feature**: Can add later without redesigning UI

### Why Desktop-First?

**Decision**: Optimize for desktop, mobile not a priority

**Rationale**:
1. **User Context**: Course research done on desktop
2. **Complexity**: Comparison view, learning paths hard on mobile
3. **Time Constraint**: MVP focus on core value
4. **Responsive Still Works**: UI degrades gracefully on mobile

### Why Expandable "Explain This"?

**Decision**: Collapsed by default, expand on demand

**Rationale**:
1. **Progressive Disclosure**: Don't overwhelm with info
2. **Scannable**: Users can quickly review all recommendations
3. **Depth Available**: Power users can dive deep
4. **Reduced Scroll**: Keeps page manageable

### Why 2-3 Course Learning Path?

**Decision**: Show 2-3 courses in sequence, not 5+

**Rationale**:
1. **Clearer Focus**: 2-3 courses easier to grasp than 5+
2. **Achievable**: ~12-16 weeks feels realistic
3. **Backend Constraint**: API returns 2-3 step paths
4. **Visual Clarity**: Easier to display vertically

---

**Document Version**: 1.0
**Author**: Claude (UI Designer)
**Status**: Ready for Implementation
**Next Steps**: Frontend developer should implement Phase 1 components, starting with RecommendationChat container and working down the component tree.
