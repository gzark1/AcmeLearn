# AcmeLearn - UI Design System & Frontend Architecture

## Document Overview

This document provides a comprehensive blueprint for the AcmeLearn frontend implementation. It covers information architecture, visual design system, component specifications, user experience patterns, accessibility requirements, and React implementation guidelines.

**Target Audience**: Frontend developers, designers, and stakeholders
**Last Updated**: 2025-11-25

---

## Table of Contents

1. [Product Context](#1-product-context)
2. [Information Architecture](#2-information-architecture)
3. [Visual Design System](#3-visual-design-system)
4. [Page Designs](#4-page-designs)
5. [Component Specifications](#5-component-specifications)
6. [User Experience Patterns](#6-user-experience-patterns)
7. [Accessibility Requirements](#7-accessibility-requirements)
8. [React Architecture](#8-react-architecture)
9. [Implementation Recommendations](#9-implementation-recommendations)

---

## 1. Product Context

### What is AcmeLearn?

AcmeLearn is an AI-powered learning recommendation platform that helps users discover personalized courses from a curated catalog of 48 courses spanning technical skills (programming, data science, cloud) and professional development (leadership, communication, HR).

### Key Product Features

| Feature | Description |
|---------|-------------|
| **Course Catalog** | 48 courses with filtering by difficulty, tags, and duration |
| **User Profiles** | Learning goals, skill level, interests, time commitment |
| **AI Recommendations** | Personalized course suggestions with explanations |
| **Privacy-First** | All user data is private; users only see their own data |

### Data Dimensions

- **Courses**: 48 courses
- **Tags**: 169 unique tags (categorized: Technical, Business, Soft Skills)
- **Skills**: 230 unique skills
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Course Duration**: 20-90 hours

### Business Rules Affecting UI

1. **Authentication Required**: Users must log in to browse courses (landing page is public)
2. **Rate Limiting**: 10 AI recommendations per user per 24 hours
3. **Profile Optional at Registration**: Users can complete profile later
4. **Soft Delete Only**: Account deletion marks as inactive (no hard delete)

---

## 2. Information Architecture

### 2.1 Site Map

```
AcmeLearn
├── Public (Unauthenticated)
│   ├── Landing Page (/)
│   ├── Login (/login)
│   └── Register (/register)
│
├── Protected (Authenticated)
│   ├── Dashboard (/dashboard)
│   ├── Courses
│   │   ├── Catalog (/courses)
│   │   └── Course Detail (/courses/:id)
│   ├── Recommendations (/recommendations)
│   ├── Profile
│   │   ├── View/Edit (/profile)
│   │   └── History (/profile/history)
│   └── Settings (/settings)
│
└── Admin (Superuser Only)
    ├── Admin Dashboard (/admin)
    ├── User Management
    │   ├── User List (/admin/users)
    │   └── User Detail (/admin/users/:id)
    └── Analytics (/admin/analytics)
```

### 2.2 Navigation Structure

**Primary Navigation (Desktop - Regular Users)**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]     Dashboard   Courses   Recommendations      [Avatar] │
└─────────────────────────────────────────────────────────────────┘
```

**Primary Navigation (Desktop - Superusers)**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]     Dashboard   Courses   Recommendations   Admin   [Avatar] │
└─────────────────────────────────────────────────────────────────┘
```

**Admin Sidebar Navigation (Desktop - Superusers)**
When on `/admin/*` routes, replace primary nav with:
```
┌──────────────────┬──────────────────────────────────────────────┐
│  [Logo]          │                                              │
│  AcmeLearn Admin │  [Main content area]                         │
├──────────────────┤                                              │
│  Dashboard       │                                              │
│  Users           │                                              │
│  Analytics       │                                              │
│                  │                                              │
│  ───────────────  │                                              │
│                  │                                              │
│  [Exit Admin]    │                                              │
│  [Avatar Menu]   │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

**Primary Navigation (Mobile)**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Hamburger]                [Logo]                     [Avatar] │
└─────────────────────────────────────────────────────────────────┘

Slide-out menu:
├── Dashboard
├── Courses
├── Recommendations
├── Profile
├── Settings
├── ─────────────
├── Admin (if superuser)
└── Logout
```

**User Menu Dropdown (Regular Users)**
- Profile
- Settings
- Logout

**User Menu Dropdown (Superusers)**
- Profile
- Settings
- Admin Dashboard
- Logout

### 2.3 User Journeys

**Journey 1: New User Onboarding**
```
Landing → Register → Profile Setup (optional) → Dashboard → Browse/Recommend
```

**Journey 2: Course Discovery**
```
Courses → Filter/Search → View Course Detail → Get Recommendations
```

**Journey 3: AI Recommendations**
```
Recommendations → Enter Query OR Use Profile → Loading → View Results → Explore Courses
```

**Journey 4: Profile Management**
```
Profile → Edit Form → Update Interests → Save → Updated Recommendations
```

**Journey 5: Admin User Management (Superusers)**
```
Admin → Users List → Filter/Search → User Detail → View Profile History → Deactivate User (optional)
```

**Journey 6: Admin Analytics Review (Superusers)**
```
Admin → Analytics → View Stats → Popular Tags → User Growth Trends → Export Data (optional)
```

---

## 3. Visual Design System

### 3.1 Design Principles

1. **Clarity Over Cleverness**: Users should immediately understand the interface
2. **Progressive Disclosure**: Simple by default, powerful when needed
3. **Consistent Patterns**: Predictable interactions reduce cognitive load
4. **Accessible by Default**: WCAG 2.1 AA compliance from the start
5. **Trust Through Design**: Professional aesthetic builds confidence in AI recommendations

### 3.2 Color Palette

#### Primary Colors

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Primary | `#1E40AF` | `blue-800` | Headers, primary actions |
| Primary Light | `#3B82F6` | `blue-500` | Buttons, links, focus states |
| Primary Lighter | `#DBEAFE` | `blue-100` | Backgrounds, selections |
| Accent | `#10B981` | `emerald-500` | Success, growth, progress |

#### Neutral Colors

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Background | `#F8FAFC` | `slate-50` | Page background |
| Surface | `#FFFFFF` | `white` | Cards, modals |
| Border | `#E2E8F0` | `slate-200` | Dividers, card borders |
| Text Primary | `#0F172A` | `slate-900` | Headings, body text |
| Text Secondary | `#64748B` | `slate-500` | Supporting text |
| Text Muted | `#94A3B8` | `slate-400` | Placeholders, disabled |

#### Semantic Colors

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Success | `#10B981` | `emerald-500` | Success states, beginner level |
| Warning | `#F59E0B` | `amber-500` | Warnings, intermediate level |
| Error | `#EF4444` | `red-500` | Errors, advanced level |
| Info | `#3B82F6` | `blue-500` | Information, tips |

#### Difficulty Level Colors

| Level | Background | Text | Border |
|-------|------------|------|--------|
| Beginner | `emerald-100` | `emerald-700` | `emerald-200` |
| Intermediate | `amber-100` | `amber-700` | `amber-200` |
| Advanced | `red-100` | `red-700` | `red-200` |

#### Admin UI Colors

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Admin Primary | `#7C3AED` | `violet-600` | Admin nav, headers, actions |
| Admin Light | `#A78BFA` | `violet-400` | Hover states, accents |
| Admin Lighter | `#EDE9FE` | `violet-100` | Backgrounds, selections |
| Status Active | `#10B981` | `emerald-500` | Active users indicator |
| Status Inactive | `#6B7280` | `gray-500` | Inactive users indicator |
| Status Verified | `#3B82F6` | `blue-500` | Verified users indicator |

### 3.3 Typography

#### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Rationale**: Inter is highly legible, works well at all sizes, and has excellent screen rendering. The system font fallback ensures fast loading.

#### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| Display | 48px (3rem) | 1.1 | 700 | Hero headlines |
| H1 | 36px (2.25rem) | 1.2 | 700 | Page titles |
| H2 | 30px (1.875rem) | 1.25 | 600 | Section headers |
| H3 | 24px (1.5rem) | 1.3 | 600 | Card titles |
| H4 | 20px (1.25rem) | 1.4 | 600 | Subsections |
| Body Large | 18px (1.125rem) | 1.6 | 400 | Featured text |
| Body | 16px (1rem) | 1.6 | 400 | Default paragraphs |
| Body Small | 14px (0.875rem) | 1.5 | 400 | Captions, metadata |
| Caption | 12px (0.75rem) | 1.4 | 500 | Labels, timestamps |

#### Letter Spacing

- Headings: `-0.025em` (slightly tighter)
- Body: `normal`
- All-caps labels: `0.05em`

### 3.4 Spacing System

**Base Unit**: 4px (0.25rem)

| Scale | Value | Usage |
|-------|-------|-------|
| 1 | 4px | Icon gaps, tight spacing |
| 2 | 8px | Compact elements |
| 3 | 12px | Small gaps |
| 4 | 16px | Default spacing |
| 5 | 20px | Medium spacing |
| 6 | 24px | Component padding |
| 8 | 32px | Section spacing |
| 10 | 40px | Large gaps |
| 12 | 48px | Major section breaks |
| 16 | 64px | Page sections |
| 20 | 80px | Hero spacing |

### 3.5 Layout System

#### Container Widths

| Type | Max Width | Usage |
|------|-----------|-------|
| Narrow | 480px (30rem) | Auth forms, modals |
| Medium | 768px (48rem) | Content-focused pages |
| Wide | 1024px (64rem) | Card grids |
| Full | 1280px (80rem) | Main container |

#### Responsive Breakpoints

| Name | Min Width | Target |
|------|-----------|--------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

#### Grid System

- 12-column grid for flexibility
- Course catalog: 1 col (mobile) -> 2 col (sm) -> 3 col (lg) -> 4 col (xl)
- Gap between cards: 24px

### 3.6 Border Radius

| Name | Value | Usage |
|------|-------|-------|
| none | 0 | - |
| sm | 4px | Subtle rounding |
| DEFAULT | 8px | Buttons, inputs |
| md | 12px | Cards |
| lg | 16px | Large cards, modals |
| full | 9999px | Pills, avatars |

### 3.7 Shadows

| Name | Value | Usage |
|------|-------|-------|
| sm | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| DEFAULT | `0 1px 3px rgba(0,0,0,0.1)` | Cards |
| md | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns, hover states |
| lg | `0 10px 15px rgba(0,0,0,0.1)` | Modals |
| xl | `0 20px 25px rgba(0,0,0,0.15)` | Popovers |

---

## 4. Page Designs

### 4.1 Landing Page (Public)

**Purpose**: Attract visitors, communicate value proposition, drive registration

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]                                      [Login] [Register] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Discover Your Learning Path                  │
│                                                                 │
│     AI-powered course recommendations from 48 expert-curated    │
│     courses. Tell us your goals, and we'll guide your journey.  │
│                                                                 │
│                    [Get Started - Primary CTA]                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      How It Works                               │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐               │
│  │ 1. Set    │    │ 2. Get AI │    │ 3. Start  │               │
│  │   Goals   │    │   Matches │    │  Learning │               │
│  └───────────┘    └───────────┘    └───────────┘               │
├─────────────────────────────────────────────────────────────────┤
│                      Course Categories                          │
│  [Technical] [Business] [Leadership] [Data Science] [+more]     │
├─────────────────────────────────────────────────────────────────┤
│                         Footer                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Elements**:
- Hero with clear value proposition
- Social proof: "48 expert-curated courses"
- Simple 3-step process explanation
- Tag cloud preview (visual interest)
- Clear CTAs to register

### 4.2 Login Page

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│                          [Logo]                                 │
│                                                                 │
│                      Welcome Back                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Email                                                   │   │
│  │  [email@example.com                                   ]  │   │
│  │                                                          │   │
│  │  Password                                                │   │
│  │  [********                                            ]  │   │
│  │                                                          │   │
│  │  [          Sign In - Primary Button                  ]  │   │
│  │                                                          │   │
│  │  Don't have an account? [Register]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Form Specifications**:
- Max width: 400px, centered
- Email: Required, email validation
- Password: Required, min 8 characters
- Error display: Below each field, red text
- Loading state: Button shows spinner, disabled

### 4.3 Register Page

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│                          [Logo]                                 │
│                                                                 │
│                    Create Your Account                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Email *                                                 │   │
│  │  [email@example.com                                   ]  │   │
│  │                                                          │   │
│  │  Password *                                              │   │
│  │  [********                                            ]  │   │
│  │  Must be at least 8 characters                           │   │
│  │                                                          │   │
│  │  Confirm Password *                                      │   │
│  │  [********                                            ]  │   │
│  │                                                          │   │
│  │  [          Create Account - Primary Button           ]  │   │
│  │                                                          │   │
│  │  Already have an account? [Sign In]                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Notes**:
- Profile fields are NOT collected at registration (per business requirements)
- Users are prompted to complete profile after first login

### 4.4 Dashboard (Authenticated Home)

**Purpose**: Personalized home with quick actions and status

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Nav]     Dashboard   Courses   Recommendations       [Avatar] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Welcome back, {Name}!                                          │
│                                                                 │
│  ┌─────────────────────────────┐ ┌─────────────────────────┐   │
│  │  Profile Completeness       │ │  Recommendations Today  │   │
│  │  ████████░░ 70%             │ │  3 / 10 used            │   │
│  │  [Complete Profile]         │ │  [Get Recommendations]  │   │
│  └─────────────────────────────┘ └─────────────────────────┘   │
│                                                                 │
│  Quick Actions                                                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                     │
│  │ Browse    │ │ Update    │ │ Get AI    │                     │
│  │ Courses   │ │ Profile   │ │ Picks     │                     │
│  └───────────┘ └───────────┘ └───────────┘                     │
│                                                                 │
│  Recent Recommendations (if any)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Course Card] [Course Card] [Course Card]               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**States**:
- New user: Prominent "Complete Your Profile" prompt
- Profile complete: Show recommendation cards
- No recommendations yet: Encourage first recommendation request

### 4.5 Course Catalog

**Purpose**: Browse and filter all 48 courses

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Nav]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Course Catalog                              48 courses         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ [Search courses...]                      [Filter ▼]       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Filters:                                                       │
│  Difficulty: [All] [Beginner] [Intermediate] [Advanced]         │
│  Tags: [Python] [Leadership] [+Add Tag]                         │
│  Duration: [Any] [<30h] [30-60h] [>60h]                        │
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Course Card │ │ Course Card │ │ Course Card │               │
│  │             │ │             │ │             │               │
│  │ Title       │ │ Title       │ │ Title       │               │
│  │ Description │ │ Description │ │ Description │               │
│  │ [Beginner]  │ │ [Advanced]  │ │ [Inter...]  │               │
│  │ 40h         │ │ 80h         │ │ 55h         │               │
│  │ [tag] [tag] │ │ [tag] [tag] │ │ [tag] [tag] │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Course Card │ │ Course Card │ │ Course Card │               │
│  │   ...       │ │   ...       │ │   ...       │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                 │
│  [Load More] or pagination                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Filter Behavior**:
- Filters apply immediately (no submit button needed)
- URL updates with filter state (shareable URLs)
- "Clear all filters" link when any filter active
- Result count updates dynamically: "Showing 12 of 48 courses"

**Course Card Anatomy**:
```
┌─────────────────────────────────────┐
│  [Category Icon/Color Bar]          │
├─────────────────────────────────────┤
│                                     │
│  Course Title                       │
│                                     │
│  Two-line description that gets     │
│  truncated with ellipsis...         │
│                                     │
│  [Beginner]  40 hours               │
│                                     │
│  [python] [backend] [+3]            │
│                                     │
└─────────────────────────────────────┘
```

### 4.6 Course Detail Page

**Purpose**: Full course information

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Nav]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  <- Back to Courses                                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Introduction to Python Programming                      │   │
│  │                                                          │   │
│  │  [Beginner]    40 hours    5 modules                     │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────────────────┐ ┌───────────────────────────┐   │
│  │  About This Course        │ │  Course Details           │   │
│  │                           │ │                           │   │
│  │  Full description text    │ │  Difficulty: Beginner     │   │
│  │  that explains what the   │ │  Duration: 40 hours       │   │
│  │  course covers and who    │ │                           │   │
│  │  it's for...              │ │  Tags:                    │   │
│  │                           │ │  [python] [programming]   │   │
│  │                           │ │  [beginner] [technical]   │   │
│  │                           │ │                           │   │
│  └───────────────────────────┘ └───────────────────────────┘   │
│                                                                 │
│  Skills You'll Learn                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Python syntax] [Variables] [Functions] [OOP] [+more]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Course Contents                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Module 1: Python Basics                                 │   │
│  │  Module 2: Data Types and Variables                      │   │
│  │  Module 3: Control Flow                                  │   │
│  │  ...                                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Get AI Recommendations Including This Course]          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.7 Recommendations Page

**Purpose**: Request and view AI-powered course recommendations

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Nav]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AI Course Recommendations                    7/10 remaining    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  What would you like to learn?                           │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ I want to become a better leader and improve    │    │   │
│  │  │ my team management skills...                    │    │   │
│  │  │                                                 │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  │  [Get Recommendations]                                   │   │
│  │                                                          │   │
│  │  ─── or ───                                              │   │
│  │                                                          │   │
│  │  [Recommend Based on My Profile]                         │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Your Recommendations                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  ★ Leadership Excellence: From Manager to Leader         │   │
│  │                                                          │   │
│  │  Why this course?                                        │   │
│  │  "Based on your goal to improve leadership skills and    │   │
│  │  your intermediate experience level, this course         │   │
│  │  offers practical team management techniques..."         │   │
│  │                                                          │   │
│  │  [Intermediate] 35 hours                                 │   │
│  │  Matches your interests: [leadership] [management]       │   │
│  │                                                          │   │
│  │  [View Course]                                           │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ★ Emotional Intelligence in Leadership                  │   │
│  │  ...                                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**AI Loading State** (Critical UX moment):
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    [Animated Brain Icon]                        │
│                                                                 │
│              Finding your perfect courses...                    │
│                                                                 │
│         "Analyzing your learning goals..."                      │
│         "Matching courses to your interests..."                 │
│         "Crafting personalized recommendations..."              │
│                                                                 │
│              Usually takes 3-5 seconds                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Rate Limit Reached State**:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  You've used all 10 recommendations for today                   │
│                                                                 │
│  Resets in: 4 hours 23 minutes                                  │
│                                                                 │
│  Tip: Complete your profile for better recommendations          │
│  with fewer requests!                                           │
│                                                                 │
│  [Browse Courses Instead]                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.8 Profile Page

**Purpose**: View and edit user learning profile

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Nav]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your Learning Profile                         [Edit]           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Learning Goal                                           │   │
│  │  "Become a full-stack developer with expertise in        │   │
│  │  Python backend and React frontend..."                   │   │
│  │                                                          │   │
│  │  Current Level                                           │   │
│  │  [Intermediate]                                          │   │
│  │                                                          │   │
│  │  Time Commitment                                         │   │
│  │  10 hours per week                                       │   │
│  │                                                          │   │
│  │  Interests                                               │   │
│  │  [python] [react] [web development] [backend]            │   │
│  │  [frontend] [databases]                                  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Profile Version: 3                                             │
│  Last updated: November 25, 2025                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Profile Edit Mode** (Important: Tag Selection UX):
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Edit Your Profile                                              │
│                                                                 │
│  Learning Goal                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ What do you want to achieve? (e.g., "Become a data      │   │
│  │ scientist" or "Improve my leadership skills")           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Your Experience Level                                          │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │   Beginner    │ │ Intermediate  │ │   Advanced    │         │
│  │   (selected)  │ │               │ │               │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                 │
│  Time Available Per Week                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Slider: 1 ──────●────────────────────────────────── 40] │   │
│  │                 10 hours/week                            │   │
│  │ ~2 courses per month at this pace                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Your Interests                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Selected: [python ×] [react ×] [leadership ×]            │   │
│  │                                                          │   │
│  │ [Search tags...]                                         │   │
│  │                                                          │   │
│  │ Popular:                                                 │   │
│  │ [python] [leadership] [data science] [javascript]        │   │
│  │ [management] [web development] [machine learning]        │   │
│  │                                                          │   │
│  │ [Browse all 169 tags >]                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Cancel]                                    [Save Changes]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Tag Browser Modal** (for "Browse all tags"):
```
┌─────────────────────────────────────────────────────────────────┐
│  Browse Tags                                              [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Search tags...]                                               │
│                                                                 │
│  Selected (3): [python ×] [react ×] [leadership ×]              │
│                                                                 │
│  ▼ Technical (87 tags)                                          │
│    [python] [javascript] [react] [sql] [aws] [docker]           │
│    [kubernetes] [go] [rust] [tensorflow] ...                    │
│                                                                 │
│  ▼ Business (45 tags)                                           │
│    [management] [finance] [marketing] [sales] [hr]              │
│    [strategy] [analytics] ...                                   │
│                                                                 │
│  ▼ Soft Skills (37 tags)                                        │
│    [leadership] [communication] [negotiation] [time mgmt]       │
│    [presentation] [networking] ...                              │
│                                                                 │
│                                                   [Done]        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.9 Settings Page

**Purpose**: Account settings and preferences

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Nav]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Settings                                                       │
│                                                                 │
│  Account                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Email: user@example.com (cannot be changed)             │   │
│  │  Member since: October 15, 2025                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Security                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Change Password]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Danger Zone                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Delete Account]                                        │   │
│  │  This will deactivate your account. Your data will be    │   │
│  │  retained but you won't be able to log in.               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.10 Profile History Page (User View)

**Purpose**: Allow users to view their own profile version history

**Layout Description**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Nav]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  My Profile History                              Current: v5    │
│                                                                 │
│  Track how your learning profile has evolved over time          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Timeline View                                           │   │
│  │                                                          │   │
│  │  ● Version 5 (Current)                    Nov 25, 2025  │   │
│  │  │  Learning Goal: "Become a full-stack developer..."   │   │
│  │  │  Level: Intermediate                                 │   │
│  │  │  Time: 10 hrs/week                                   │   │
│  │  │  Interests: [python] [react] [backend] +5            │   │
│  │  │                                                       │   │
│  │  ○ Version 4                              Nov 18, 2025  │   │
│  │  │  Learning Goal: "Become a full-stack developer..."   │   │
│  │  │  Level: Beginner → Intermediate                      │   │
│  │  │  Time: 8 hrs/week → 10 hrs/week                      │   │
│  │  │  Interests: [python] [react] [backend] +2            │   │
│  │  │                                                       │   │
│  │  ○ Version 3                              Nov 10, 2025  │   │
│  │  │  Learning Goal: "Learn web development"              │   │
│  │  │  Level: Beginner                                     │   │
│  │  │  Time: 8 hrs/week                                    │   │
│  │  │  Interests: [python] [javascript]                    │   │
│  │  │                                                       │   │
│  │  ○ Version 2                              Nov 5, 2025   │   │
│  │  │  [Initial incomplete profile]                        │   │
│  │  │                                                       │   │
│  │  ○ Version 1                              Nov 1, 2025   │   │
│  │    Profile created (empty)                              │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Compare Versions] [Export History]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.11 Admin Dashboard (Superuser Only)

**Purpose**: Overview of system health and key metrics

**Layout Description**:
```
┌──────────────────┬──────────────────────────────────────────────┐
│  [Admin Nav]     │  Admin Dashboard                             │
│                  │                                              │
│  Dashboard       │  System Overview                             │
│  Users           │                                              │
│  Analytics       │  ┌──────────────┐  ┌──────────────┐          │
│                  │  │ Total Users  │  │ Active Users │          │
│                  │  │     524      │  │     489      │          │
│  ───────────────  │  └──────────────┘  └──────────────┘          │
│                  │                                              │
│  [Exit Admin]    │  ┌──────────────┐  ┌──────────────┐          │
│                  │  │  Superusers  │  │ Completion % │          │
│                  │  │      3       │  │     76.5%    │          │
│                  │  └──────────────┘  └──────────────┘          │
│                  │                                              │
│                  │  Recent Activity                             │
│                  │  ┌────────────────────────────────────────┐  │
│                  │  │  📊 User #123 updated profile (v5)     │  │
│                  │  │  2 minutes ago                         │  │
│                  │  ├────────────────────────────────────────┤  │
│                  │  │  👤 New user registration              │  │
│                  │  │  user@example.com - 10 minutes ago     │  │
│                  │  ├────────────────────────────────────────┤  │
│                  │  │  🤖 Recommendation generated           │  │
│                  │  │  User #87 - 15 minutes ago             │  │
│                  │  └────────────────────────────────────────┘  │
│                  │                                              │
│                  │  Quick Actions                               │
│                  │  [View All Users] [Analytics] [Popular Tags] │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

**Stats Card Specifications**:
```
┌────────────────────────┐
│  Label (text-sm gray)  │
│  524                   │  ← Large number (3rem, bold)
│  Total Users           │
│                        │
│  ↑ +12 this week       │  ← Trend indicator (optional)
└────────────────────────┘

Border: 1px slate-200
Border radius: 12px
Padding: 24px
Background: white
Shadow: sm (default), md (hover)
Min height: 140px
```

### 4.12 Admin User List (Superuser Only)

**Purpose**: Browse, filter, and manage users

**Layout Description**:
```
┌──────────────────┬──────────────────────────────────────────────┐
│  [Admin Nav]     │  User Management                    524 users│
│                  │                                              │
│  Dashboard       │  ┌──────────────────────────────────────┐    │
│  Users (active)  │  │ [Search email...]           [Filters]│    │
│  Analytics       │  └──────────────────────────────────────┘    │
│                  │                                              │
│                  │  Filters:                                    │
│                  │  Status: [All] [Active] [Inactive]           │
│                  │  Role: [All] [Superuser] [Regular]           │
│                  │  Profile: [All] [Complete] [Incomplete]      │
│                  │                                              │
│                  │  ┌────────────────────────────────────────┐  │
│                  │  │ Email          Status    Role  Profile │  │
│                  │  ├────────────────────────────────────────┤  │
│                  │  │ user1@ex.com   ✓ Active  User  ●●●●○  │  │
│                  │  │ Has goal • 5 interests                 │  │
│                  │  │                         [View Details] │  │
│                  │  ├────────────────────────────────────────┤  │
│                  │  │ admin@ex.com   ✓ Active  Admin ●●●●●  │  │
│                  │  │ Has goal • 12 interests                │  │
│                  │  │                         [View Details] │  │
│                  │  ├────────────────────────────────────────┤  │
│                  │  │ user2@ex.com   ○ Inactive User ●●○○○  │  │
│                  │  │ No goal • 2 interests                  │  │
│                  │  │                         [View Details] │  │
│                  │  ├────────────────────────────────────────┤  │
│                  │  │ ...                                    │  │
│                  │  └────────────────────────────────────────┘  │
│                  │                                              │
│                  │  Showing 1-20 of 524                         │
│                  │  [← Previous]                    [Next →]    │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

**Table Row States**:
- Default: White background
- Hover: `slate-50` background
- Inactive user: `gray-100` background, reduced opacity
- Selected: `violet-50` background

**Status Indicators**:
- Active: `emerald-500` dot + "Active" text
- Inactive: `gray-400` dot + "Inactive" text
- Verified: Blue checkmark badge

**Profile Completeness Indicator**:
- 5 dots representing: learning_goal, current_level, time_commitment, interests (2+ tags), interests (5+ tags)
- Filled dot: `violet-500`
- Empty dot: `slate-300`

**Mobile Responsive Design**:
Convert table to card layout on mobile:
```
┌──────────────────────────────────────┐
│  user1@example.com                   │
│  ✓ Active • User                     │
│  ●●●●○ Profile 80% complete          │
│  Has goal • 5 interests              │
│  [View Details]                      │
└──────────────────────────────────────┘
```

### 4.13 Admin User Detail (Superuser Only)

**Purpose**: View complete user information and profile history

**Layout Description**:
```
┌──────────────────┬──────────────────────────────────────────────┐
│  [Admin Nav]     │  ← Back to Users                             │
│                  │                                              │
│  Dashboard       │  User Details                                │
│  Users (active)  │                                              │
│  Analytics       │  ┌────────────────────────────────────────┐  │
│                  │  │  Account Information                   │  │
│                  │  │                                        │  │
│                  │  │  Email: user1@example.com              │  │
│                  │  │  Status: ✓ Active                      │  │
│                  │  │  Role: User                            │  │
│                  │  │  Verified: Yes                         │  │
│                  │  │  User ID: a1b2c3d4-...                 │  │
│                  │  │                                        │  │
│                  │  └────────────────────────────────────────┘  │
│                  │                                              │
│                  │  ┌────────────────────────────────────────┐  │
│                  │  │  Current Profile (Version 5)           │  │
│                  │  │                                        │  │
│                  │  │  Learning Goal:                        │  │
│                  │  │  "Become a full-stack developer with   │  │
│                  │  │  expertise in Python and React..."     │  │
│                  │  │                                        │  │
│                  │  │  Current Level: Intermediate           │  │
│                  │  │  Time Commitment: 10 hours/week        │  │
│                  │  │                                        │  │
│                  │  │  Interests (5):                        │  │
│                  │  │  [python] [react] [backend]            │  │
│                  │  │  [frontend] [web development]          │  │
│                  │  │                                        │  │
│                  │  │  Last Updated: Nov 25, 2025            │  │
│                  │  │                                        │  │
│                  │  └────────────────────────────────────────┘  │
│                  │                                              │
│                  │  Profile History (5 versions)                │
│                  │  [View Full History]                         │
│                  │                                              │
│                  │  ┌────────────────────────────────────────┐  │
│                  │  │  ● Version 5 (Current)  Nov 25, 2025   │  │
│                  │  │    Level: Intermediate • 10 hrs/week   │  │
│                  │  │    5 interests                         │  │
│                  │  ├────────────────────────────────────────┤  │
│                  │  │  ○ Version 4            Nov 18, 2025   │  │
│                  │  │    Level: Beginner • 8 hrs/week        │  │
│                  │  │    3 interests                         │  │
│                  │  ├────────────────────────────────────────┤  │
│                  │  │  ○ Version 3            Nov 10, 2025   │  │
│                  │  │    Level: Beginner • 8 hrs/week        │  │
│                  │  │    2 interests                         │  │
│                  │  └────────────────────────────────────────┘  │
│                  │                                              │
│                  │  Actions                                     │
│                  │  ┌────────────────────────────────────────┐  │
│                  │  │  [Deactivate User - Destructive]       │  │
│                  │  │  ⚠ This will prevent the user from      │  │
│                  │  │  logging in. Their data will be         │  │
│                  │  │  retained.                              │  │
│                  │  └────────────────────────────────────────┘  │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

**Profile History Modal** (when "View Full History" clicked):
```
┌─────────────────────────────────────────────────────────────────┐
│  Profile History for user1@example.com                    [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  5 versions tracked since Nov 1, 2025                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  ● Version 5 (Current)                     Nov 25, 2025   │ │
│  │  │                                                         │ │
│  │  │  Learning Goal:                                        │ │
│  │  │  "Become a full-stack developer with expertise in      │ │
│  │  │  Python backend and React frontend..."                 │ │
│  │  │                                                         │ │
│  │  │  Level: Intermediate                                   │ │
│  │  │  Time: 10 hours/week                                   │ │
│  │  │                                                         │ │
│  │  │  Interests (5):                                        │ │
│  │  │  [python] [react] [backend] [frontend]                │ │
│  │  │  [web development]                                     │ │
│  │  │                                                         │ │
│  │  │  Changes from v4:                                      │ │
│  │  │  • Level: Beginner → Intermediate                      │ │
│  │  │  • Time: 8 hrs/week → 10 hrs/week                      │ │
│  │  │  • Added interests: [backend], [frontend]              │ │
│  │  │                                                         │ │
│  │  ────────────────────────────────────────────────────────  │ │
│  │                                                            │ │
│  │  ○ Version 4                               Nov 18, 2025   │ │
│  │  │                                                         │ │
│  │  │  Learning Goal:                                        │ │
│  │  │  "Become a full-stack developer..."                    │ │
│  │  │                                                         │ │
│  │  │  Level: Beginner                                       │ │
│  │  │  Time: 8 hours/week                                    │ │
│  │  │                                                         │ │
│  │  │  Interests (3):                                        │ │
│  │  │  [python] [react] [web development]                    │ │
│  │  │                                                         │ │
│  │  ────────────────────────────────────────────────────────  │ │
│  │                                                            │ │
│  │  ○ Version 3                               Nov 10, 2025   │ │
│  │  │  [Details collapsed - click to expand]                 │ │
│  │                                                            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Export CSV]                                        [Close]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.14 Admin Analytics (Superuser Only)

**Purpose**: Visualize system-wide trends and popular content

**Layout Description**:
```
┌──────────────────┬──────────────────────────────────────────────┐
│  [Admin Nav]     │  Analytics                                   │
│                  │                                              │
│  Dashboard       │  System Metrics                              │
│  Users           │                                              │
│  Analytics       │  ┌─────────────────────────────────────────┐ │
│  (active)        │  │  Total Users            Active Users    │ │
│                  │  │  524                    489 (93.3%)     │ │
│                  │  │                                         │ │
│                  │  │  Superusers             Profile         │ │
│                  │  │  3 (0.6%)               Completion      │ │
│                  │  │                         76.5%           │ │
│                  │  └─────────────────────────────────────────┘ │
│                  │                                              │
│                  │  Popular Tags                                │
│                  │  Tags users are most interested in           │
│                  │                                              │
│                  │  ┌─────────────────────────────────────────┐ │
│                  │  │  Rank  Tag                 User Count   │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  1     [python]            234 users    │ │
│                  │  │  ████████████████████████████░░         │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  2     [leadership]        198 users    │ │
│                  │  │  ███████████████████████░░░░░░░         │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  3     [javascript]        176 users    │ │
│                  │  │  █████████████████████░░░░░░░░░         │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  4     [data science]      145 users    │ │
│                  │  │  ██████████████████░░░░░░░░░░░░         │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  5     [machine learning]  132 users    │ │
│                  │  │  ████████████████░░░░░░░░░░░░░░         │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  6     [management]        128 users    │ │
│                  │  │  ████████████████░░░░░░░░░░░░░░         │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  7     [react]             115 users    │ │
│                  │  │  ██████████████░░░░░░░░░░░░░░░░         │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  8     [aws]               98 users     │ │
│                  │  │  ████████████░░░░░░░░░░░░░░░░░░         │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  9     [communication]     87 users     │ │
│                  │  │  ███████████░░░░░░░░░░░░░░░░░░░         │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │  10    [web development]   76 users     │ │
│                  │  │  █████████░░░░░░░░░░░░░░░░░░░░░         │ │
│                  │  └─────────────────────────────────────────┘ │
│                  │                                              │
│                  │  [View Top 20] [View All 169 Tags]           │
│                  │                                              │
│                  │  Category Breakdown                          │
│                  │                                              │
│                  │  ┌──────────────┐  ┌──────────────┐          │
│                  │  │  Technical   │  │  Business    │          │
│                  │  │  ██████░░░░  │  │  ████░░░░░░  │          │
│                  │  │  1,234       │  │  687         │          │
│                  │  │  interests   │  │  interests   │          │
│                  │  └──────────────┘  └──────────────┘          │
│                  │                                              │
│                  │  ┌──────────────┐                            │
│                  │  │  Soft Skills │                            │
│                  │  │  ██████████  │                            │
│                  │  │  423         │                            │
│                  │  │  interests   │                            │
│                  │  └──────────────┘                            │
│                  │                                              │
│                  │  [Export Data]                               │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

**Bar Chart Specifications**:
- Bar height: 24px
- Bar background: `violet-500` (filled), `slate-200` (empty)
- Bar width: Proportional to max value (100% = highest count)
- Hover: Show exact percentage
- Smooth transitions on data changes

---

## 5. Component Specifications

### 5.1 Button Component

**Variants**:

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| Primary | `blue-600` | `white` | none | Main CTAs |
| Secondary | `white` | `blue-600` | `blue-600` | Secondary actions |
| Ghost | `transparent` | `blue-600` | none | Tertiary actions |
| Destructive | `red-600` | `white` | none | Dangerous actions |

**Sizes**:

| Size | Height | Padding X | Font Size | Icon Size |
|------|--------|-----------|-----------|-----------|
| sm | 32px | 12px | 14px | 16px |
| md | 40px | 16px | 16px | 20px |
| lg | 48px | 24px | 18px | 24px |

**States**:
- Default: Base styles
- Hover: Darken background 10%
- Focus: 2px ring with `blue-200`, offset 2px
- Active: Darken background 15%
- Disabled: 50% opacity, cursor not-allowed
- Loading: Show spinner, text hidden, disabled

**Accessibility**:
- Minimum touch target: 44x44px
- Focus visible for keyboard navigation
- `aria-disabled` when loading
- `aria-busy` when loading

### 5.2 Input Component

**Anatomy**:
```
Label (optional)
┌─────────────────────────────────────────┐
│ Placeholder text                        │
└─────────────────────────────────────────┘
Helper text or error message
```

**Specifications**:

| Property | Value |
|----------|-------|
| Height | 40px (sm), 48px (lg) |
| Border | 1px `slate-300` |
| Border Radius | 8px |
| Padding | 12px horizontal |
| Font Size | 16px (prevents iOS zoom) |

**States**:
- Default: `slate-300` border
- Hover: `slate-400` border
- Focus: `blue-500` border, `blue-100` ring
- Error: `red-500` border, `red-100` ring
- Disabled: `slate-100` background, 50% opacity

**Input Types Needed**:
- Text
- Email
- Password (with show/hide toggle)
- Textarea
- Search (with search icon)

### 5.3 Card Component

**Course Card Specifications**:

```
┌─────────────────────────────────────────┐
│  [Difficulty color bar - 4px height]    │
├─────────────────────────────────────────┤
│  padding: 24px                          │
│                                         │
│  Title (H3, semibold, slate-900)        │
│  max 2 lines, ellipsis                  │
│                                         │
│  Description (body, slate-600)          │
│  max 3 lines, ellipsis                  │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  [Difficulty Badge]    [Clock] 40h      │
│                                         │
│  [tag] [tag] [tag] [+2]                 │
│                                         │
└─────────────────────────────────────────┘

Width: 100% of grid column
Min width: 280px
Max width: none (fills column)
Border: 1px slate-200
Border radius: 12px
Shadow: sm (default), md (hover)
Transition: shadow 150ms, transform 150ms
Hover: translateY(-2px), shadow-md
```

### 5.4 Badge Component

**Difficulty Badges**:

| Level | Background | Text | Border |
|-------|------------|------|--------|
| Beginner | `emerald-100` | `emerald-700` | `emerald-200` |
| Intermediate | `amber-100` | `amber-700` | `amber-200` |
| Advanced | `red-100` | `red-700` | `red-200` |

**Size**: `text-xs`, `px-2.5`, `py-1`, `rounded-full`, `font-medium`

**Tag Badges**:

| State | Background | Text |
|-------|------------|------|
| Default | `slate-100` | `slate-700` |
| Selected | `blue-100` | `blue-700` |
| Removable | Same + `x` icon on hover |

### 5.5 Modal Component

**Specifications**:

| Property | Value |
|----------|-------|
| Overlay | `black/50` |
| Background | `white` |
| Border Radius | 16px |
| Shadow | `xl` |
| Max Width | sm (384px), md (448px), lg (512px), xl (576px) |
| Max Height | 90vh |
| Padding | 24px |

**Structure**:
```
┌─────────────────────────────────────────┐
│  Header                           [X]   │
├─────────────────────────────────────────┤
│                                         │
│  Content (scrollable if needed)         │
│                                         │
├─────────────────────────────────────────┤
│  Footer (actions)                       │
└─────────────────────────────────────────┘
```

**Behavior**:
- Close on overlay click
- Close on Escape key
- Trap focus within modal
- Return focus to trigger on close
- Prevent body scroll when open

### 5.6 Navigation Component

**Desktop Navbar**:
```
Height: 64px
Background: white
Border: 1px bottom slate-200
Shadow: sm
Position: sticky top

Content:
- Logo (left)
- Nav links (center) - 24px gap
- User menu (right)
```

**Active Link Style**:
- Text: `blue-600`
- Border bottom: 2px `blue-600`

**Mobile Navbar**:
```
Height: 56px
Content:
- Hamburger menu (left)
- Logo (center)
- Avatar (right)
```

**Mobile Drawer**:
- Width: 280px
- Slides from left
- Overlay: `black/50`
- Full height

### 5.7 Tag Selector Component

This is a complex, custom component for selecting interests from 169 tags.

**Features**:
1. Search input with real-time filtering
2. Selected tags display (removable)
3. Popular/suggested tags quick-select
4. Categorized browsing (expand/collapse)
5. "Browse all" modal option

**States**:
- Empty: Show popular tags prominently
- With selections: Selected tags at top, search, then suggestions
- Searching: Filter results in real-time
- Browse mode: Modal with categories

**Accessibility**:
- Keyboard navigable
- ARIA combobox pattern
- Screen reader announcements for selections

### 5.8 Admin Data Table Component

**Purpose**: Display paginated, filterable user data with actions

**Anatomy**:
```
┌───────────────────────────────────────────────────────────────┐
│  [Search/Filter Controls]                                     │
├───────────────────────────────────────────────────────────────┤
│  Header Row                                                   │
├───────────────────────────────────────────────────────────────┤
│  Data Row 1                                           [Action]│
│  Data Row 2                                           [Action]│
│  Data Row 3                                           [Action]│
│  ...                                                          │
├───────────────────────────────────────────────────────────────┤
│  Showing 1-20 of 524                [← Previous] [Next →]     │
└───────────────────────────────────────────────────────────────┘
```

**Specifications**:

| Property | Value |
|----------|-------|
| Border | 1px `slate-200` |
| Border Radius | 12px |
| Header Background | `slate-50` |
| Header Font | `text-sm`, `font-semibold`, `slate-700` |
| Header Padding | 12px vertical, 16px horizontal |
| Row Padding | 16px vertical, 16px horizontal |
| Row Border | 1px bottom `slate-100` |

**States**:
- Default row: White background
- Hover row: `slate-50` background
- Selected row: `violet-50` background
- Inactive row: `gray-100` background, 70% opacity
- Loading: Skeleton rows with pulse animation

**Sortable Columns**:
- Header shows sort icon (↑↓)
- Click to toggle: unsorted → ascending → descending → unsorted
- Active sort: Icon becomes solid, column header in `violet-600`

**Mobile Behavior**:
- Tables convert to card layout
- Each row becomes a card with key-value pairs
- Actions appear at bottom of card

**Accessibility**:
- `role="table"`, `role="row"`, `role="cell"`
- Sortable columns have `aria-sort` attribute
- Row actions keyboard accessible
- Focus visible on interactive elements

### 5.9 Admin Stats Card Component

**Purpose**: Display key metrics with optional trend indicators

**Anatomy**:
```
┌─────────────────────────┐
│  Label (secondary text) │
│                         │
│  524                    │  ← Primary metric (large, bold)
│  Total Users            │  ← Description
│                         │
│  ↑ +12 this week        │  ← Trend (optional)
└─────────────────────────┘
```

**Specifications**:

| Property | Value |
|----------|-------|
| Width | Flexible (grid item) |
| Min Height | 140px |
| Padding | 24px |
| Border | 1px `slate-200` |
| Border Radius | 12px |
| Background | `white` |
| Shadow | `sm` (default), `md` (hover) |

**Typography**:
- Label: `text-sm`, `slate-500`, `uppercase`, `tracking-wide`
- Metric: `text-4xl` (3rem), `font-bold`, `slate-900`
- Description: `text-base`, `slate-600`
- Trend: `text-sm`, `font-medium`, `emerald-600` (positive) or `red-600` (negative)

**Trend Indicators**:
- Positive: ↑ icon in `emerald-500`, green text
- Negative: ↓ icon in `red-500`, red text
- Neutral: → icon in `slate-500`, gray text

**Variants**:
```typescript
interface StatsCardProps {
  label: string;
  value: number | string;
  description?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string; // e.g., "+12 this week"
  };
  icon?: ReactNode; // Optional icon in top-right
  color?: 'default' | 'violet' | 'blue' | 'emerald'; // Border accent color
}
```

### 5.10 Admin Timeline Component

**Purpose**: Display profile version history in chronological order

**Anatomy**:
```
┌─────────────────────────────────────┐
│  ● Version 5 (Current)  Nov 25, 2025│
│  │                                  │
│  │  [Content for this version]     │
│  │                                  │
│  ────────────────────────────────   │
│                                     │
│  ○ Version 4           Nov 18, 2025│
│  │                                  │
│  │  [Content for this version]     │
│  │                                  │
│  ────────────────────────────────   │
│                                     │
│  ○ Version 3           Nov 10, 2025│
│     [Content...]                    │
└─────────────────────────────────────┘
```

**Specifications**:

| Property | Value |
|----------|-------|
| Line Color | `slate-300` |
| Line Width | 2px |
| Line Offset | 8px from left |
| Dot Size | 12px diameter |
| Dot Current | `violet-500` filled |
| Dot Past | `slate-300` outline |
| Spacing | 24px between items |

**Version Item Structure**:
- Header: Version number + date (flex, space-between)
- Content: Indented 32px from line
- Changes indicator: Highlighted diffs (e.g., "Beginner → Intermediate")
- Collapsed state: Summary only, click to expand

**Diff Highlighting**:
- Added values: `emerald-100` background, `emerald-700` text
- Removed values: `red-100` background, `red-700` text
- Changed values: Show both with arrow (→)

**Accessibility**:
- Semantic `<ol>` list structure
- `aria-label` on timeline
- Date in `<time>` element with `datetime` attribute
- Current version indicated with `aria-current="step"`

### 5.11 Admin Status Badge Component

**Purpose**: Indicate user status (active, inactive, verified, role)

**Variants**:

| Status | Background | Text | Icon |
|--------|------------|------|------|
| Active | `emerald-100` | `emerald-700` | ✓ dot |
| Inactive | `gray-100` | `gray-600` | ○ dot |
| Verified | `blue-100` | `blue-700` | ✓ checkmark |
| Superuser | `violet-100` | `violet-700` | ⚡ icon |
| Regular User | `slate-100` | `slate-700` | 👤 icon |

**Size**: Same as regular badge (text-xs, px-2.5, py-1, rounded-full, font-medium)

**With Icon**:
- Icon appears before text
- Icon size: 12px
- Gap: 4px

**Accessibility**:
- Use semantic colors (not color-only)
- Include text label, not just icon
- `aria-label` for screen readers if abbreviated

### 5.12 Admin Search and Filter Bar

**Purpose**: Combined search and filter controls for data tables

**Layout**:
```
┌───────────────────────────────────────────────────────┐
│  [Search email...]                        [Filters ▼]│
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│  Status: [All] [Active] [Inactive]                    │
│  Role: [All] [Superuser] [Regular]                    │
│  Profile: [All] [Complete] [Incomplete]               │
│  [Clear All]                                          │
└───────────────────────────────────────────────────────┘
```

**Search Input Specifications**:
- Width: 100% on mobile, 400px on desktop
- Height: 40px
- Icon: Magnifying glass (left side)
- Placeholder: Context-specific (e.g., "Search email...")
- Clear button: X icon (right side, appears when typing)
- Debounced: 300ms delay before search executes

**Filter Toggle Button**:
- Label: "Filters" + count badge if active (e.g., "Filters (2)")
- Icon: Chevron down (collapsed), Chevron up (expanded)
- Background: `slate-100` when filters active
- Style: Secondary button variant

**Filter Panel**:
- Appears below search when toggle clicked
- Background: `slate-50`
- Padding: 16px
- Border radius: 8px
- Margin top: 8px

**Filter Options**:
- Radio buttons for mutually exclusive filters (Status, Role)
- Checkboxes for multi-select filters
- "Clear All" link (text-sm, violet-600) appears when any filter active
- Active filters: `violet-100` background, `violet-700` text

**Mobile Behavior**:
- Stack search and filters vertically
- Full-width controls
- Filter panel slides in from bottom as modal on small screens

---

## 6. User Experience Patterns

### 6.1 Loading States

**Full Page Loading**:
- Centered spinner
- Optional skeleton screens for known layouts

**Component Loading**:
- Skeleton placeholders matching content shape
- Pulse animation (slate-200 to slate-100)

**AI Recommendation Loading** (special):
- Animated illustration
- Rotating status messages
- Progress indication
- Cancel option

**Button Loading**:
- Replace text with spinner
- Maintain button width
- Disable interaction

### 6.2 Empty States

**No Courses Found** (after filtering):
```
[Illustration]
No courses match your filters

Try adjusting your filters or search term.

[Clear Filters]
```

**No Recommendations Yet**:
```
[Illustration]
Get personalized course recommendations

Tell us what you want to learn, and our AI will
find the perfect courses for you.

[Get Started]
```

**Profile Not Complete**:
```
[Illustration]
Complete your profile for better recommendations

The more we know about your goals, the better
we can recommend courses for you.

[Complete Profile]
```

### 6.3 Error States

**Form Validation Errors**:
- Inline, below the field
- Red text, red border
- Icon + message

**API Errors**:
- Toast notification (non-blocking)
- Error message with retry option

**Network Errors**:
- Full-page error state
- Retry button

**Rate Limit Error**:
- Friendly message
- Time until reset
- Alternative action (browse courses)

### 6.4 Success Feedback

**Form Submission**:
- Toast notification: "Profile updated successfully"
- Auto-dismiss after 3 seconds

**Recommendation Generated**:
- Smooth transition to results
- Results count announcement

### 6.5 Confirmation Dialogs

**Account Deletion**:
```
Delete Your Account?

This will deactivate your account. You won't be able
to log in, but your data will be retained.

[Cancel]  [Delete Account - destructive]
```

**Unsaved Changes**:
```
Unsaved Changes

You have unsaved changes. Are you sure you want to leave?

[Stay]  [Leave Without Saving]
```

### 6.6 Progressive Disclosure

**Profile Onboarding**:
Instead of showing all 169 tags at once:
1. First show popular tags (10-15)
2. Provide search for specific interests
3. Offer "Browse all" for completionists

**Course Details**:
1. Show essential info above fold
2. Expandable "Course Contents" section
3. Skills shown as summary with expand option

### 6.7 Keyboard Navigation

**Global Shortcuts**:
- `/` - Focus search (on courses page)
- `Escape` - Close modal/dropdown
- `Tab` - Navigate interactive elements

**Form Navigation**:
- `Enter` - Submit form
- `Tab` - Next field
- `Shift+Tab` - Previous field

---

## 7. Accessibility Requirements

### 7.1 WCAG 2.1 AA Compliance Checklist

#### Perceivable

- [ ] All images have descriptive alt text
- [ ] Color is not the only means of conveying information
- [ ] Text contrast ratio minimum 4.5:1 (3:1 for large text)
- [ ] Text resizable to 200% without loss of content
- [ ] No content relies solely on sensory characteristics

#### Operable

- [ ] All functionality available via keyboard
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip navigation link present
- [ ] No keyboard traps
- [ ] Touch targets minimum 44x44px
- [ ] Page titles descriptive and unique

#### Understandable

- [ ] Language declared on HTML element
- [ ] Form labels clearly associated with inputs
- [ ] Error messages specific and helpful
- [ ] Consistent navigation across pages
- [ ] Help text available for complex inputs

#### Robust

- [ ] Valid HTML structure
- [ ] ARIA labels where semantic HTML insufficient
- [ ] Components work with screen readers
- [ ] Role attributes for custom components

### 7.2 Focus Management

**Focus Styles**:
```css
:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

**Focus Order**:
- Logical tab order following visual layout
- Skip to main content link
- Focus trapped in modals
- Focus returned to trigger after modal close

### 7.3 Screen Reader Considerations

**Announcements**:
- Form submission results
- Dynamic content changes
- Loading states
- Error messages

**ARIA Patterns**:
- `role="alert"` for errors
- `aria-live="polite"` for updates
- `aria-busy` for loading states
- `aria-expanded` for expandable sections

### 7.4 Motion and Animation

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Animation Guidelines**:
- Transitions: 150-300ms
- No auto-playing animations longer than 5 seconds
- No flashing content (>3 flashes per second)

---

## 8. React Architecture

### 8.1 Directory Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/                    # Design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts           # Barrel export
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── index.ts
│   │   ├── courses/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseGrid.tsx
│   │   │   ├── CourseFilters.tsx
│   │   │   ├── CourseDetail.tsx
│   │   │   ├── DifficultyBadge.tsx
│   │   │   ├── CourseSkeleton.tsx
│   │   │   └── index.ts
│   │   ├── profile/
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── ProfileView.tsx
│   │   │   ├── InterestSelector.tsx
│   │   │   ├── TagBrowser.tsx
│   │   │   ├── LevelSelector.tsx
│   │   │   └── index.ts
│   │   ├── recommendations/
│   │   │   ├── RecommendationRequest.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   ├── RecommendationList.tsx
│   │   │   ├── AILoadingState.tsx
│   │   │   ├── RateLimitIndicator.tsx
│   │   │   └── index.ts
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       ├── StatsCard.tsx
│   │       ├── UserTable.tsx
│   │       ├── UserTableRow.tsx
│   │       ├── SearchAndFilters.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── ProfileCompletenessIndicator.tsx
│   │       ├── ProfileHistoryTimeline.tsx
│   │       ├── ProfileHistoryModal.tsx
│   │       ├── PopularTagsChart.tsx
│   │       ├── CategoryBreakdownChart.tsx
│   │       ├── DeactivateUserModal.tsx
│   │       └── index.ts
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Courses.tsx
│   │   ├── CourseDetailPage.tsx
│   │   ├── Profile.tsx
│   │   ├── ProfileHistory.tsx
│   │   ├── Recommendations.tsx
│   │   ├── Settings.tsx
│   │   ├── NotFound.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminUsers.tsx
│   │       ├── AdminUserDetail.tsx
│   │       ├── AdminAnalytics.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCourses.ts
│   │   ├── useTags.ts
│   │   ├── useProfile.ts
│   │   ├── useRecommendations.ts
│   │   ├── useLocalStorage.ts
│   │   └── admin/
│   │       ├── useAdminUsers.ts
│   │       ├── useAdminUser.ts
│   │       ├── useAdminAnalytics.ts
│   │       ├── useDeactivateUser.ts
│   │       └── index.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── services/
│   │   ├── api.ts                 # Axios instance with interceptors
│   │   ├── authService.ts
│   │   ├── courseService.ts
│   │   ├── profileService.ts
│   │   ├── tagService.ts
│   │   ├── recommendationService.ts
│   │   └── admin/
│   │       ├── adminUserService.ts
│   │       ├── adminAnalyticsService.ts
│   │       └── index.ts
│   ├── types/
│   │   ├── course.ts
│   │   ├── user.ts
│   │   ├── profile.ts
│   │   ├── tag.ts
│   │   ├── recommendation.ts
│   │   ├── api.ts
│   │   └── admin/
│   │       ├── user.ts
│   │       ├── analytics.ts
│   │       └── index.ts
│   ├── utils/
│   │   ├── formatters.ts          # Date, number formatting
│   │   ├── validators.ts          # Form validation schemas
│   │   ├── constants.ts           # App constants
│   │   └── cn.ts                  # Class name utility
│   ├── styles/
│   │   └── globals.css            # Tailwind imports, custom styles
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### 8.2 State Management Strategy

**Server State (TanStack Query)**:
- Courses list and details
- Tags and skills
- User profile
- Recommendations

**Client State (React Context)**:
- Authentication (user, token, isAuthenticated)
- Toast notifications
- Theme (if implementing dark mode)

**Local Component State**:
- Form inputs
- UI state (modal open, filter expanded)
- Loading states for user actions

### 8.3 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Components                         │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │                   │                        │
│              TanStack Query      React Context                   │
│              (Server State)      (Client State)                  │
│                    │                   │                        │
│                    │                   │                        │
│              ┌─────┴─────┐            │                        │
│              │  Services │            │                        │
│              └─────┬─────┘            │                        │
│                    │                   │                        │
│              ┌─────┴─────┐            │                        │
│              │  Axios    │            │                        │
│              └─────┬─────┘            │                        │
│                    │                   │                        │
└────────────────────┼───────────────────┘
                     │
              ┌──────┴──────┐
              │  FastAPI    │
              │  Backend    │
              └─────────────┘
```

### 8.4 Routing Configuration

```typescript
// App.tsx routing structure
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/courses" element={<Courses />} />
    <Route path="/courses/:id" element={<CourseDetailPage />} />
    <Route path="/recommendations" element={<Recommendations />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/history" element={<ProfileHistory />} />
    <Route path="/settings" element={<Settings />} />
  </Route>

  {/* Admin routes (superuser only) */}
  <Route element={<AdminRoute />}>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<AdminUsers />} />
    <Route path="/admin/users/:id" element={<AdminUserDetail />} />
    <Route path="/admin/analytics" element={<AdminAnalytics />} />
  </Route>

  {/* Fallback */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

**AdminRoute Component**:
```typescript
// components/auth/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AdminRoute() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_superuser) {
    // Non-superusers get redirected to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Superusers can access admin routes
  return <Outlet />;
}
```

### 8.5 Type Definitions

```typescript
// types/course.ts
export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  contents: string;
  tags: Tag[];
  skills: Skill[];
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  category?: 'technical' | 'business' | 'soft_skills';
}

export interface Skill {
  id: string;
  name: string;
}

// types/profile.ts
export interface UserProfile {
  id: string;
  user_id: string;
  learning_goal: string | null;
  current_level: 'beginner' | 'intermediate' | 'advanced' | null;
  time_commitment: number | null;
  interests: Tag[];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  learning_goal?: string;
  current_level?: 'beginner' | 'intermediate' | 'advanced';
  time_commitment?: number;
  interest_tag_ids?: string[];
}

// types/recommendation.ts
export interface Recommendation {
  id: string;
  user_id: string;
  query: string | null;
  recommended_courses: Course[];
  explanation: string;
  created_at: string;
}

export interface RecommendationRequest {
  query?: string;
}

// types/admin/user.ts
export interface AdminUserListItem {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  has_learning_goal: boolean;
  interest_count: number;
}

export interface AdminUserListResponse {
  users: AdminUserListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminProfileSummary {
  id: string;
  learning_goal: string | null;
  current_level: 'beginner' | 'intermediate' | 'advanced' | null;
  time_commitment: number | null;
  version: number;
  interest_count: number;
  interests: string[]; // Tag names
  created_at: string;
  updated_at: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  profile: AdminProfileSummary | null;
}

export interface ProfileSnapshot {
  id: string;
  version: number;
  learning_goal: string | null;
  current_level: 'beginner' | 'intermediate' | 'advanced' | null;
  time_commitment: number | null;
  interests_snapshot: string[];
  created_at: string;
}

export interface ProfileSnapshotListResponse {
  snapshots: ProfileSnapshot[];
  count: number;
}

export interface UserFilters {
  email?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  skip?: number;
  limit?: number;
}

// types/admin/analytics.ts
export interface AnalyticsOverview {
  total_users: number;
  active_users: number;
  superuser_count: number;
  new_registrations_7d: number;
  new_registrations_30d: number;
  profile_completion_rate: number; // 0.0 to 1.0
}

export interface PopularTag {
  tag_id: string;
  tag_name: string;
  user_count: number;
}

export interface PopularTagsResponse {
  tags: PopularTag[];
  total_tags: number;
}

export interface CategoryStats {
  category: 'technical' | 'business' | 'soft_skills';
  interest_count: number;
  percentage: number;
}
```

### 8.6 API Service Layer

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 8.7 Custom Hooks Examples

```typescript
// hooks/useCourses.ts
import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';

interface CourseFilters {
  difficulty?: string;
  tags?: string[];
  search?: string;
}

export function useCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => courseService.getCourses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourse(id),
    enabled: !!id,
  });
}

// hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profileService';
import { ProfileUpdate } from '@/types/profile';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdate) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// hooks/admin/useAdminUsers.ts
import { useQuery } from '@tanstack/react-query';
import { adminUserService } from '@/services/admin/adminUserService';
import { UserFilters } from '@/types/admin/user';

export function useAdminUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => adminUserService.getUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminUserService.getUserDetail(userId),
    enabled: !!userId,
  });
}

export function useUserProfileHistory(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId, 'history'],
    queryFn: () => adminUserService.getProfileHistory(userId),
    enabled: !!userId,
  });
}

// hooks/admin/useDeactivateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '@/services/admin/adminUserService';
import { useToast } from '@/hooks/useToast';

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (userId: string) => adminUserService.deactivateUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
      toast({
        title: 'User deactivated',
        description: 'The user has been successfully deactivated.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to deactivate user';
      toast({
        title: 'Error',
        description: message,
        variant: 'error',
      });
    },
  });
}

// hooks/admin/useAdminAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin/adminAnalyticsService';

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: () => adminAnalyticsService.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePopularTags(limit: number = 20) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'tags', limit],
    queryFn: () => adminAnalyticsService.getPopularTags(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// services/admin/adminUserService.ts
import api from '../api';
import {
  AdminUserListResponse,
  AdminUserDetail,
  ProfileSnapshotListResponse,
  UserFilters,
} from '@/types/admin/user';

export const adminUserService = {
  async getUsers(filters: UserFilters = {}): Promise<AdminUserListResponse> {
    const params = new URLSearchParams();
    if (filters.email) params.append('email', filters.email);
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters.is_superuser !== undefined) params.append('is_superuser', String(filters.is_superuser));
    if (filters.skip !== undefined) params.append('skip', String(filters.skip));
    if (filters.limit !== undefined) params.append('limit', String(filters.limit));

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  async getUserDetail(userId: string): Promise<AdminUserDetail> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  async deactivateUser(userId: string): Promise<AdminUserDetail> {
    const response = await api.patch(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  async getProfileHistory(userId: string, limit: number = 50): Promise<ProfileSnapshotListResponse> {
    const response = await api.get(`/admin/users/${userId}/profile-history?limit=${limit}`);
    return response.data;
  },
};

// services/admin/adminAnalyticsService.ts
import api from '../api';
import { AnalyticsOverview, PopularTagsResponse } from '@/types/admin/analytics';

export const adminAnalyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  },

  async getPopularTags(limit: number = 20): Promise<PopularTagsResponse> {
    const response = await api.get(`/admin/analytics/tags/popular?limit=${limit}`);
    return response.data;
  },
};
```

---

## 9. Implementation Recommendations

### 9.1 Recommended Libraries

| Category | Library | Rationale |
|----------|---------|-----------|
| **UI Components** | shadcn/ui | Radix primitives + Tailwind, accessible, customizable |
| **Styling** | Tailwind CSS | Utility-first, consistent design system |
| **Form Handling** | React Hook Form | Performant, minimal re-renders |
| **Validation** | Zod | TypeScript-first, composable schemas |
| **Data Fetching** | TanStack Query | Caching, loading states, mutations |
| **Routing** | React Router v6 | Standard, well-supported |
| **Icons** | Lucide React | Clean, consistent, MIT licensed |
| **Animation** | Framer Motion | AI loading states, page transitions |
| **Toasts** | Sonner | Beautiful, accessible toast notifications |
| **Date Handling** | date-fns | Lightweight, tree-shakeable |

### 9.2 Development Priorities

**Phase 1: Foundation (MVP)**
1. Project setup (Vite + React + TypeScript + Tailwind)
2. Design system components (Button, Input, Card, Badge)
3. Authentication flow (Login, Register, ProtectedRoute)
4. Basic layout (Navbar, PageContainer)

**Phase 2: Core Features**
5. Course catalog with filters
6. Course detail page
7. Profile view and edit

**Phase 3: AI Integration**
8. Recommendation request UI
9. AI loading state
10. Recommendation display

**Phase 4: Polish**
11. Dashboard
12. Settings page
13. Error handling
14. Loading states and skeletons
15. Accessibility audit

### 9.3 Performance Considerations

**Code Splitting**:
- Lazy load route components
- Dynamic import for heavy components (TagBrowser modal)

**Image Optimization**:
- Use WebP format
- Lazy load images below fold
- Placeholder skeletons

**Caching Strategy**:
- Courses list: 5 minute stale time
- Tags: 30 minute stale time (rarely changes)
- Profile: Refetch on window focus
- Recommendations: No caching (always fresh)

**Bundle Size**:
- Tree-shake unused icons
- Analyze bundle with rollup-plugin-visualizer
- Target < 200KB initial JS (gzipped)

### 9.4 Testing Strategy

**Unit Tests** (Vitest):
- Utility functions
- Custom hooks
- Form validation schemas

**Component Tests** (Testing Library):
- UI components in isolation
- Form interactions
- Accessibility checks

**Integration Tests** (Playwright):
- Authentication flow
- Course browsing and filtering
- Profile update flow
- Recommendation request flow

### 9.5 Environment Variables

```bash
# .env.example
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=AcmeLearn
```

### 9.6 Error Handling Strategy

**API Errors**:
```typescript
try {
  await api.post('/recommendations', data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) {
      // Rate limit - show friendly message
      toast.error('Daily recommendation limit reached');
    } else if (error.response?.status === 401) {
      // Auth error - redirect handled by interceptor
    } else {
      // Generic error
      toast.error('Something went wrong. Please try again.');
    }
  }
}
```

**Form Validation**:
```typescript
const profileSchema = z.object({
  learning_goal: z.string().max(500).optional(),
  current_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  time_commitment: z.number().min(1).max(168).optional(),
  interest_tag_ids: z.array(z.string().uuid()).optional(),
});
```

---

## Appendix A: Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## Appendix B: Component Quick Reference

### Difficulty Badge Usage
```tsx
<DifficultyBadge level="beginner" />
<DifficultyBadge level="intermediate" />
<DifficultyBadge level="advanced" />
```

### Button Usage
```tsx
<Button variant="primary" size="md">Get Started</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="ghost">Learn More</Button>
<Button variant="destructive">Delete Account</Button>
<Button loading>Saving...</Button>
```

### Course Card Usage
```tsx
<CourseCard
  course={course}
  onClick={() => navigate(`/courses/${course.id}`)}
/>
```

### Tag Selector Usage
```tsx
<InterestSelector
  selectedTags={selectedTags}
  onTagsChange={setSelectedTags}
  allTags={tags}
/>
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-25 | Claude | Initial comprehensive design system |
| 1.1 | 2025-11-25 | Claude | Added admin UI designs (dashboard, user management, analytics, profile history) |

---

## Summary of Admin Features Added

This update adds comprehensive UI designs for the admin/superuser system:

**New Pages**:
- 4.10: Profile History (User View) - Timeline of profile versions
- 4.11: Admin Dashboard - System overview with stats cards
- 4.12: Admin User List - Paginated table with filters
- 4.13: Admin User Detail - User info with profile history
- 4.14: Admin Analytics - Popular tags and system metrics

**New Components**:
- 5.8: Admin Data Table - Sortable, filterable table for user management
- 5.9: Admin Stats Card - Metrics display with trend indicators
- 5.10: Admin Timeline - Profile version history visualization
- 5.11: Admin Status Badge - User status indicators
- 5.12: Admin Search and Filter Bar - Combined search/filter controls

**Updated Sections**:
- 2.1: Site Map - Added admin routes
- 2.2: Navigation Structure - Admin sidebar and nav links
- 2.3: User Journeys - Admin-specific workflows
- 3.2: Color Palette - Admin UI colors (violet theme)
- 8.1: Directory Structure - Admin components and services
- 8.4: Routing Configuration - AdminRoute protection
- 8.5: Type Definitions - Admin types for users, analytics
- 8.7: Custom Hooks - Admin data fetching hooks

**Design Decisions**:
- Admin area uses violet color theme to distinguish from user area (blue)
- Sidebar navigation for admin (vs top nav for users)
- Tables convert to cards on mobile for responsive design
- Profile completeness shown as 5-dot indicator
- Timeline visualization for profile history with diff highlighting
- Comprehensive filtering for user management (status, role, profile)

---

**End of Document**
