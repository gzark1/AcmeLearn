# AcmeLearn Admin Dashboard Feature Proposal

## Document Information

| Field | Value |
|-------|-------|
| Author | Product Manager |
| Date | 2025-11-26 |
| Status | Draft Proposal |
| Version | 1.0 |

---

## Executive Summary

This document proposes admin dashboard features for AcmeLearn, an AI-powered learning recommendation platform. Based on analysis of the current database (33 users, 48 courses, 169 tags, 79 profile snapshots), the proposal focuses on **balanced operational and strategic capabilities** with **limited administrative actions**.

### Key Recommendations

1. **Dashboard Overview** - At-a-glance platform health metrics
2. **User Management** - Browse, search, and manage user accounts with profile history
3. **Analytics Hub** - Engagement patterns, profile completion, and content utilization
4. **Content Insights** - Tag popularity and course catalog analysis

### Business Value

- **Understand User Behavior**: Track profile completion rates (currently 55% complete, 15% partial, 30% empty)
- **Identify Engagement Patterns**: Monitor which users actively refine their profiles (some users have 6 versions)
- **Content Gap Analysis**: Discover which tags/skills are popular vs. underutilized
- **Platform Health**: Track user growth and identify potential issues early

---

## 1. Admin Dashboard Overview

### 1.1 Purpose

The main admin dashboard provides a quick health check of the platform, answering: "Is AcmeLearn achieving its goal of helping users find relevant courses?"

### 1.2 Wireframe Description

```
+------------------------------------------------------------------+
|  AcmeLearn Admin                                    [Exit Admin]  |
+------------------+-----------------------------------------------+
|                  |                                               |
|  Dashboard       |  Platform Overview                            |
|  Users      -->  |  +-----------+ +-----------+ +-----------+    |
|  Analytics       |  | 33        | | 55%       | | 2.4       |    |
|                  |  | Total     | | Profiles  | | Avg       |    |
|  ----------      |  | Users     | | Complete  | | Updates   |    |
|                  |  +-----------+ +-----------+ +-----------+    |
|  [Back to App]   |                                               |
|                  |  +-----------+ +-----------+ +-----------+    |
|                  |  | 0         | | 6         | | 97%       |    |
|                  |  | AI Recs   | | Signups   | | Active    |    |
|                  |  | Today     | | This Week | | Users     |    |
|                  |  +-----------+ +-----------+ +-----------+    |
|                  |                                               |
|                  |  Recent Activity                              |
|                  |  +-------------------------------------------+|
|                  |  | [Avatar] demo17@example.com updated profile|
|                  |  | [Avatar] admin@example.com updated profile |
|                  |  | [Avatar] dockertest@test.com registered    |
|                  |  +-------------------------------------------+|
|                  |                                               |
|                  |  Quick Insights                               |
|                  |  +-------------------------------------------+|
|                  |  | Top Interest: "emotional intelligence" (3) |
|                  |  | Most Active: 1 user with 6 profile updates |
|                  |  | Profile Gap: 10 users never set up profile |
|                  |  +-------------------------------------------+|
+------------------+-----------------------------------------------+
```

### 1.3 Metrics to Display

| Metric | Current Value | Why It Matters |
|--------|---------------|----------------|
| Total Users | 33 | Platform growth indicator |
| Profile Completion Rate | 55% (18/33) | Users with complete profiles get better recommendations |
| Avg Profile Updates | 2.4 | Higher = users actively refining their learning goals |
| AI Recommendations Today | 0 | Core feature usage (rate limited to 10/user/day) |
| Weekly Signups | 6 | Growth trend indicator |
| Active Users (%) | 97% (32/33) | Platform health - detect mass churn |

### 1.4 Rationale

This dashboard answers the admin's first question: "Is the platform healthy?" A learning recommendation platform succeeds when:
- Users complete their profiles (so AI can give good recommendations)
- Users actively engage (profile updates show they're refining goals)
- Users use the AI feature (recommendations generated)

---

## 2. User Management

### 2.1 Purpose

Enable admins to find, view, and manage individual users. Critical for support, troubleshooting, and identifying power users vs. dormant accounts.

### 2.2 User List Wireframe

```
+------------------------------------------------------------------+
|  Users                                        [Export CSV]        |
+------------------------------------------------------------------+
|  Search: [________________________]  Filters: [Status v] [Level v]|
+------------------------------------------------------------------+
|                                                                   |
|  Showing 33 users                                                 |
|  +---------------------------------------------------------------+|
|  | Email               | Status | Level    | Profile | Actions  ||
|  +---------------------------------------------------------------+|
|  | admin@example.com   | Active | Inter.   | 100%    | [View]   ||
|  | demo17@example.com  | Active | Inter.   | 100%    | [View]   ||
|  | dockertest@test.com | Active | -        | 0%      | [View]   ||
|  | aa@a.gr             | Active | -        | 0%      | [View]   ||
|  | ...                 | ...    | ...      | ...     | ...      ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  [< Prev]  Page 1 of 2  [Next >]                                  |
+------------------------------------------------------------------+
```

### 2.3 User Detail Wireframe

```
+------------------------------------------------------------------+
|  [< Back to Users]                                                |
+------------------------------------------------------------------+
|                                                                   |
|  User: admin@example.com                                          |
|  +---------------------------------------------------------------+|
|  |  Account Status                                               ||
|  |  +----------+ +----------+ +----------+                       ||
|  |  | Active   | | Regular  | | Unverif. |                       ||
|  |  | [Toggle] | | User     | | Email    |                       ||
|  |  +----------+ +----------+ +----------+                       ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  +---------------------------------------------------------------+|
|  |  Current Profile (v4)                                         ||
|  |  ------------------------------------------------------------ ||
|  |  Learning Goal: "i want to become a python dev"               ||
|  |  Level: Intermediate                                          ||
|  |  Time Commitment: 20+ hours/week                              ||
|  |  Interests: go, emotional intelligence, project mgmt... (+4)  ||
|  |                                                               ||
|  |  [View Profile History]                                       ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  +---------------------------------------------------------------+|
|  |  Activity Summary                                             ||
|  |  ------------------------------------------------------------ ||
|  |  Registered: Nov 25, 2025                                     ||
|  |  Last Updated: Nov 26, 2025                                   ||
|  |  Profile Updates: 4                                           ||
|  |  AI Recommendations: 0                                        ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  Actions: [Deactivate User]                                       |
+------------------------------------------------------------------+
```

### 2.4 Profile History Modal

```
+------------------------------------------------------------------+
|  Profile History - admin@example.com                    [X Close] |
+------------------------------------------------------------------+
|                                                                   |
|  v4 (Current) - Nov 26, 2025                                      |
|  +---------------------------------------------------------------+|
|  | Goal: "i want to become a python dev"                         ||
|  | Level: Intermediate | Time: 20+ hrs | Interests: 7 tags       ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  v3 - Nov 25, 2025                                                |
|  +---------------------------------------------------------------+|
|  | Goal: "learning web development"                              ||
|  | Level: Beginner | Time: 10-20 hrs | Interests: 5 tags         ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  v2 - Nov 24, 2025                                                |
|  +---------------------------------------------------------------+|
|  | Goal: "learning web development"                              ||
|  | Level: Beginner | Time: 5-10 hrs | Interests: 3 tags          ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  v1 - Nov 25, 2025 (Initial)                                      |
|  +---------------------------------------------------------------+|
|  | Goal: (empty) | Level: (empty) | Interests: 0 tags            ||
|  +---------------------------------------------------------------+|
+------------------------------------------------------------------+
```

### 2.5 User Management Features

| Feature | Description | Priority |
|---------|-------------|----------|
| User Search | Search by email (partial match) | MVP |
| Filter by Status | Active / Inactive | MVP |
| Filter by Profile Completion | Complete / Partial / Empty | MVP |
| Filter by Level | Beginner / Intermediate / Advanced | Nice-to-have |
| View User Detail | Full profile view with metadata | MVP |
| View Profile History | Timeline of all profile versions | MVP |
| Deactivate User | Soft-delete (is_active = false) | MVP |
| Export User List | CSV download for reporting | Nice-to-have |

### 2.6 Rationale

User management enables admins to:
- **Support users**: "Why can't I get recommendations?" - check if profile is complete
- **Identify engaged users**: Users with many profile updates are power users
- **Handle abuse**: Deactivate problematic accounts
- **Understand user journey**: Profile history shows how users evolve their learning goals

---

## 3. Analytics Hub

### 3.1 Purpose

Provide aggregate insights about platform usage, user engagement, and content effectiveness. Helps answer: "What trends should we be aware of?"

### 3.2 Analytics Dashboard Wireframe

```
+------------------------------------------------------------------+
|  Analytics                                                        |
+------------------------------------------------------------------+
|                                                                   |
|  User Growth (Last 30 Days)                                       |
|  +---------------------------------------------------------------+|
|  |     *                                                         ||
|  |    * *           *                                            ||
|  |   *   *         * *    *                                      ||
|  |  *     *       *   *  * *                                     ||
|  | *       * * * *     **   * *                                  ||
|  +---------------------------------------------------------------+|
|  | Oct 28                              Nov 26                    ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  Profile Completion Breakdown                                     |
|  +---------------------------------------------------------------+|
|  |  [========================================] 55% Complete (18) ||
|  |  [=============] 15% Partial (5)                              ||
|  |  [=====================] 30% Empty (10)                       ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  User Level Distribution           Time Commitment Distribution   |
|  +-----------------------------+  +-----------------------------+ |
|  | Beginner:     18% (4)       |  | 1-5 hrs:     17% (3)        | |
|  | Intermediate: 41% (9)       |  | 5-10 hrs:    33% (6)        | |
|  | Advanced:     41% (9)       |  | 10-20 hrs:   22% (4)        | |
|  +-----------------------------+  | 20+ hrs:     28% (5)        | |
|                                   +-----------------------------+ |
|                                                                   |
|  Engagement Metrics                                               |
|  +---------------------------------------------------------------+|
|  | Metric                    | Value    | Trend                  ||
|  +---------------------------------------------------------------+|
|  | Avg Profile Updates/User  | 2.4      | [chart icon]           ||
|  | Users with 3+ Updates     | 11 (33%) | [chart icon]           ||
|  | Users Never Updated       | 10 (30%) | [chart icon]           ||
|  | Recommendations Generated | 0        | [chart icon]           ||
|  +---------------------------------------------------------------+|
+------------------------------------------------------------------+
```

### 3.3 Key Analytics Metrics

#### User Engagement Metrics

| Metric | Current Value | Insight |
|--------|---------------|---------|
| Profile Completion Rate | 55% | Over half of users have complete profiles - good foundation |
| Partial Profiles | 15% (5 users) | These users started but didn't finish - potential nudge targets |
| Empty Profiles | 30% (10 users) | Never set up profile - onboarding opportunity |
| Avg Profile Updates | 2.4 per user | Users refine goals over time |
| Power Users (3+ updates) | 33% (11 users) | Highly engaged segment |
| Dormant Users (never updated) | 30% (10 users) | Potential churn risk |

#### User Distribution Metrics

| Metric | Breakdown | Insight |
|--------|-----------|---------|
| Skill Level | 18% Beginner, 41% Intermediate, 41% Advanced | Skewed toward experienced learners |
| Time Commitment | 33% want 5-10 hrs/week, 28% want 20+ hrs | Most users are moderate-time learners |
| Verification Status | 3% verified (1/33) | Email verification rarely used |

#### Content Utilization Metrics

| Metric | Value | Insight |
|--------|-------|---------|
| Tags Used in Interests | 61 unique selections | 36% of tags (61/169) are actually chosen by users |
| Most Popular Tag | "emotional intelligence" (3 users) | Soft skills are in demand |
| Most Popular Category | SOFT_SKILLS (10 selections) | Users want interpersonal skills |
| Unused Tags | 108 tags (64%) | Many tags have no user interest - catalog optimization opportunity |

### 3.4 Rationale

Analytics help admins understand:
- **Is the platform growing?** User growth chart shows trajectory
- **Are users engaged?** Profile completion and update frequency reveal engagement
- **What do users want?** Tag popularity shows content demand
- **Where are the gaps?** Empty profiles and unused tags show improvement areas

---

## 4. Content Insights (Tag & Course Analytics)

### 4.1 Purpose

Understand how the course catalog aligns with user interests. Helps answer: "Is our content meeting user needs?"

### 4.2 Content Insights Wireframe

```
+------------------------------------------------------------------+
|  Content Insights                                                 |
+------------------------------------------------------------------+
|                                                                   |
|  Popular Tags by Category                                         |
|  +---------------------------------------------------------------+|
|  | SOFT_SKILLS                                                   ||
|  | +--------------------------------------------------------+   ||
|  | | emotional intelligence ████████████ 3                  |   ||
|  | | leadership             ████████ 2                      |   ||
|  | | work-life balance      ████ 1                          |   ||
|  | +--------------------------------------------------------+   ||
|  |                                                               ||
|  | PROGRAMMING                                                   ||
|  | +--------------------------------------------------------+   ||
|  | | go                     ████████ 2                      |   ||
|  | | javascript             ████ 1                          |   ||
|  | | angular                ████ 1                          |   ||
|  | +--------------------------------------------------------+   ||
|  |                                                               ||
|  | MARKETING                                                     ||
|  | +--------------------------------------------------------+   ||
|  | | seo                    ████████ 2                      |   ||
|  | | ecommerce              ████████ 2                      |   ||
|  | +--------------------------------------------------------+   ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  Category Interest Distribution                                   |
|  +---------------------------------------------------------------+|
|  | SOFT_SKILLS:   ████████████████████████ 16%                   ||
|  | BUSINESS:      ██████████████████ 13%                         ||
|  | DATA_SCIENCE:  ██████████████████ 13%                         ||
|  | MARKETING:     ████████████████ 13%                           ||
|  | DEVOPS:        ██████████████ 11%                             ||
|  | PROGRAMMING:   ██████████████ 11%                             ||
|  | HR_TALENT:     ██████████ 10%                                 ||
|  | OTHER:         ██████████ 10%                                 ||
|  | DESIGN:        ████ 5%                                        ||
|  | SECURITY:      ████ 3%                                        ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  Course Catalog Summary                                           |
|  +---------------------------------------------------------------+|
|  | Difficulty Distribution:                                      ||
|  |   Beginner: 7 courses (15%) - Avg 26 hrs                      ||
|  |   Intermediate: 29 courses (60%) - Avg 38 hrs                 ||
|  |   Advanced: 12 courses (25%) - Avg 56 hrs                     ||
|  |                                                               ||
|  | Total Duration: ~1,900 hours of content                       ||
|  | Avg Course Duration: 40 hours                                 ||
|  +---------------------------------------------------------------+|
+------------------------------------------------------------------+
```

### 4.3 Content Metrics

| Metric | Value | Insight |
|--------|-------|---------|
| Total Tags | 169 | Comprehensive taxonomy |
| Tags with User Interest | 61 (36%) | Opportunity to promote underutilized tags |
| Tag Categories | 11 | Well-organized content structure |
| Top Category by Interest | SOFT_SKILLS | Users want leadership/communication skills |
| Course Difficulty Skew | 60% Intermediate | Good match - 41% users are intermediate |
| Beginner Courses | 7 (15%) | May be undersupplied for beginner users (18%) |

### 4.4 Rationale

Content insights reveal:
- **Demand vs. Supply**: Compare user interests with course offerings
- **Category trends**: Which skill areas are most in-demand
- **Curriculum gaps**: Where to invest in new courses
- **Tag optimization**: Which tags to promote or consolidate

---

## 5. Feature Priority Matrix

### 5.1 MVP Features (Must Have)

| Feature | Section | Effort | Impact | Notes |
|---------|---------|--------|--------|-------|
| Dashboard Stats Cards | 1 | Low | High | Quick platform health view |
| User List with Search | 2 | Medium | High | Core admin function |
| User Detail View | 2 | Medium | High | Support and troubleshooting |
| Profile History View | 2 | Low | Medium | Understand user journey |
| Deactivate User | 2 | Low | Medium | Account management |
| Profile Completion Chart | 3 | Low | High | Key engagement metric |
| Popular Tags List | 4 | Low | Medium | Content utilization insight |

### 5.2 Nice-to-Have Features (Phase 2)

| Feature | Section | Effort | Impact | Notes |
|---------|---------|--------|--------|-------|
| User Growth Chart | 3 | Medium | Medium | Trend visualization |
| Export to CSV | 2 | Low | Low | Reporting capability |
| Filter by Level | 2 | Low | Low | Advanced filtering |
| Category Breakdown Chart | 4 | Medium | Medium | Content strategy |
| Recent Activity Feed | 1 | Medium | Medium | Real-time awareness |
| Engagement Metrics Table | 3 | Medium | Medium | Deep engagement analysis |

### 5.3 Future Considerations (Phase 3)

| Feature | Section | Effort | Impact | Notes |
|---------|---------|--------|--------|-------|
| AI Recommendations Analytics | 3 | High | High | Track AI feature usage |
| User Cohort Analysis | 3 | High | Medium | Compare user segments |
| Course Recommendation Effectiveness | 4 | High | High | Did users like suggestions? |
| Email Notifications | 2 | Medium | Medium | Alert on key events |
| Audit Log | 2 | Medium | Low | Track admin actions |

---

## 6. Technical Implementation Notes

### 6.1 New Backend Endpoints Required

```
GET  /admin/dashboard/overview
     Returns: { total_users, profile_completion_rate, avg_updates,
                weekly_signups, active_rate, recent_activity[] }

GET  /admin/users
     Params: search, status, profile_status, level, page, limit
     Returns: { users[], total, page, limit }

GET  /admin/users/{user_id}
     Returns: { user, profile, activity_summary }

GET  /admin/users/{user_id}/profile-history
     Returns: { snapshots[] }

PATCH /admin/users/{user_id}/deactivate
     Returns: { success, user }

GET  /admin/analytics/engagement
     Returns: { completion_breakdown, level_distribution,
                time_commitment_distribution, engagement_metrics }

GET  /admin/analytics/content
     Returns: { popular_tags[], category_breakdown[],
                course_summary }
```

### 6.2 Database Queries for Key Metrics

All metrics can be derived from existing tables:
- `user` table: User counts, status breakdown
- `user_profiles` table: Profile completion, level/time distribution
- `user_profile_snapshots` table: Profile version counts, history
- `user_interests` + `tags` tables: Tag popularity, category breakdown
- `courses` table: Course difficulty distribution

### 6.3 Frontend Components

Reuse existing design system components:
- `StatsCard` - For dashboard metrics
- `Table` - For user list
- `Badge` - For status indicators
- `Modal` - For profile history
- `Button` - For actions

New components needed:
- `AdminSidebar` - Navigation for admin section
- `ProfileCompleteness` - Progress bar indicator
- `SimpleBarChart` - For tag popularity visualization
- `ActivityFeed` - Recent activity list

---

## 7. Success Metrics for Admin Dashboard

How do we know the admin dashboard is successful?

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to Find User | < 10 seconds | Admin can search and find specific user quickly |
| Profile Issue Resolution | < 2 minutes | Admin can identify why user has no recommendations |
| Adoption | 80% of admin logins use dashboard | Track page views |
| Actionable Insights | 1+ per session | Admin takes action based on data |

---

## 8. Appendix: Current Data Summary

### Database Statistics (as of 2025-11-26)

| Table | Count | Notes |
|-------|-------|-------|
| Users | 33 | 1 superuser, 32 regular users |
| User Profiles | 33 | 1:1 with users |
| Profile Snapshots | 79 | Avg 2.4 versions per user |
| Courses | 48 | Read-only catalog |
| Tags | 169 | 11 categories |
| Skills | 230 | Linked to courses |
| User Interests | ~100 | Tag selections by users |
| Recommendations | 0 | AI feature not yet used |

### Profile Completion Analysis

| Status | Count | Percentage |
|--------|-------|------------|
| Complete | 18 | 55% |
| Partial | 5 | 15% |
| Empty | 10 | 30% |

### Tag Category Distribution (by User Interest)

| Category | Selections | % of Total |
|----------|------------|------------|
| SOFT_SKILLS | 10 | 16% |
| BUSINESS | 8 | 13% |
| DATA_SCIENCE | 8 | 13% |
| MARKETING | 8 | 13% |
| DEVOPS | 7 | 11% |
| PROGRAMMING | 7 | 11% |
| HR_TALENT | 6 | 10% |
| OTHER | 5 | 8% |
| DESIGN | 3 | 5% |
| SECURITY | 2 | 3% |

---

## 9. Conclusion

The proposed admin dashboard provides AcmeLearn administrators with the tools they need to:

1. **Monitor Platform Health**: Quick overview of key metrics
2. **Support Users**: Find and troubleshoot user issues efficiently
3. **Understand Engagement**: Track how users interact with the platform
4. **Optimize Content**: Identify popular and underutilized topics

The MVP focuses on essential user management and key metrics, with a clear path to advanced analytics in future phases. All features are designed specifically for a learning recommendation platform, not generic admin functions.

### Recommended Implementation Order

1. **Week 1**: Dashboard overview + User list with search
2. **Week 2**: User detail + Profile history + Deactivate action
3. **Week 3**: Analytics page with engagement metrics
4. **Week 4**: Content insights + Polish

---

*Document prepared by Product Manager based on database analysis and stakeholder requirements.*
