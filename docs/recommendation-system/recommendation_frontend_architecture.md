# AcmeLearn Recommendations Feature - Frontend Architecture

## Document Overview

This document provides a complete technical architecture for implementing the AI-powered course recommendations feature in the AcmeLearn React frontend. It follows bulletproof-react patterns and integrates with the existing codebase structure.

**Related Documentation**:
- `docs/recommendation-system/03-UI-DESIGN.md` - UI/UX specifications and wireframes
- `docs/UI_DESIGN_SYSTEM.md` - Visual design system
- `docs/FRONTEND_ARCHITECTURE.md` - General frontend architecture
- `backend/api/users.py` - Recommendation API endpoints
- `backend/schemas/recommendation.py` - Response schemas

**Status**: Ready for Implementation
**Last Updated**: 2025-11-28
**Author**: Claude (React Specialist)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Feature Structure](#2-feature-structure)
3. [TypeScript Types](#3-typescript-types)
4. [API Layer](#4-api-layer)
5. [Component Architecture](#5-component-architecture)
6. [State Management](#6-state-management)
7. [Error Handling](#7-error-handling)
8. [Accessibility](#8-accessibility)
9. [Performance Considerations](#9-performance-considerations)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. Architecture Overview

### 1.1 Backend API Contract

The recommendations feature communicates with three backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/users/me/recommendations` | POST | Generate new recommendations |
| `/api/v1/users/me/recommendations` | GET | Fetch recommendation history |
| `/api/v1/users/me/recommendation-quota` | GET | Check remaining quota |

**Response Types**:
- `RecommendationRead` - Successful recommendations with courses and learning path
- `ClarificationResponse` - User's query needs clarification (vague/irrelevant)
- Error responses - Rate limit (429), Profile issues (400), LLM timeout (504)

### 1.2 User Flow

```
User lands on /app/recommendations
    ↓
Load quota indicator (7/10 remaining)
    ↓
User submits query OR "Recommend based on profile"
    ↓
POST /users/me/recommendations
    ↓
Three possible outcomes:
    1. Success → Display recommendations + learning path
    2. Clarification needed → Show helpful message + profile suggestions
    3. Error → Show error banner with retry option
    ↓
User can:
    - View course details (click course card)
    - Expand "Explain this recommendation"
    - View learning path sequence
    - Submit new query (if quota remaining)
```

### 1.3 Design Principles

Following the UI design document:

1. **Query-First Architecture**: User's request drives recommendations; profile enriches
2. **Conversational UI**: Chat-like interface with message bubbles (user + AI)
3. **Progressive Disclosure**: Show essential info first, expandable details
4. **Trust Through Transparency**: Always explain WHY each course was recommended
5. **Desktop-First**: Mobile is NOT a priority for MVP

---

## 2. Feature Structure

```
frontend/src/features/recommendations/
├── api/
│   ├── generate-recommendations.ts   # POST mutation
│   ├── get-recommendations.ts        # GET query (history)
│   ├── get-quota.ts                  # GET query
│   └── index.ts                      # Barrel export
│
├── components/
│   ├── recommendation-chat.tsx       # Main container (chat UI)
│   ├── user-message.tsx              # User query bubble
│   ├── ai-response.tsx               # AI response bubble (container)
│   ├── profile-analysis-summary.tsx  # Skill level, gaps, confidence badges
│   ├── profile-feedback-banner.tsx   # Optional profile improvement tips
│   ├── recommendation-card.tsx       # Single course recommendation
│   ├── explain-recommendation.tsx    # Expandable deep dive (accordion)
│   ├── learning-path-preview.tsx     # Collapsible 2-3 course sequence
│   ├── course-comparison-modal.tsx   # Side-by-side comparison (lazy loaded)
│   ├── ai-loading-state.tsx          # Animated brain + progress messages
│   ├── rate-limit-indicator.tsx      # Quota display (header)
│   ├── clarification-message.tsx     # Vague/irrelevant query handling
│   └── index.ts                      # Barrel export
│
├── types/
│   └── index.ts                      # All TypeScript types
│
├── hooks/
│   └── use-recommendation-messages.ts  # Chat message state management
│
└── index.ts                          # Public feature exports
```

**Component Hierarchy**:
```
RecommendationChat
├─ RateLimitIndicator (header)
├─ Message History (scrollable)
│  ├─ UserMessage (right-aligned, blue-50 bg)
│  └─ AIResponse (left-aligned, white bg)
│     ├─ ProfileAnalysisSummary
│     ├─ ProfileFeedbackBanner (conditional)
│     ├─ RecommendationCard[] (multiple)
│     │  └─ ExplainRecommendation (expandable)
│     └─ LearningPathPreview (collapsible)
├─ AILoadingState (conditional)
├─ ClarificationMessage (conditional)
└─ Input Area (sticky bottom)
   ├─ Textarea
   └─ Buttons (Get Recommendations, Recommend Based on Profile)

CourseComparisonModal (separate, lazy loaded)
```

---

## 3. TypeScript Types

### 3.1 API Response Types

Match backend schemas exactly:

```typescript
// src/features/recommendations/types/index.ts

// ============================================================
// Core Recommendation Types
// ============================================================

export type RecommendedCourse = {
  course_id: string; // UUID as string
  title: string;
  match_score: number; // 0.0 to 1.0
  explanation: string;
  skill_gaps_addressed: string[]; // Max 2
  estimated_weeks: number | null;
};

export type LearningPathStep = {
  order: number; // 1, 2, or 3
  course_id: string;
  title: string;
  rationale: string;
};

export type ProfileAnalysisSummary = {
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  skill_gaps: string[]; // Max 3
  confidence: number; // 0.0 to 1.0
};

export type RecommendationRead = {
  type: 'recommendations';
  id: string; // UUID
  query: string | null;
  profile_analysis: ProfileAnalysisSummary | null;
  profile_feedback: string | null; // Optional feedback to improve profile
  courses: RecommendedCourse[];
  learning_path: LearningPathStep[];
  overall_summary: string | null;
  created_at: string; // ISO datetime
};

export type ClarificationResponse = {
  type: 'clarification_needed';
  intent: 'vague' | 'irrelevant';
  message: string;
  query: string | null;
};

export type RecommendationQuota = {
  used: number;
  limit: number;
  remaining: number;
};

// ============================================================
// API Request Types
// ============================================================

export type RecommendationRequest = {
  query?: string; // Optional (null = profile-based)
  num_recommendations?: number; // 3-10, default 5
};

// ============================================================
// UI State Types
// ============================================================

export type ChatMessage =
  | {
      type: 'user';
      query: string;
      timestamp: Date;
    }
  | {
      type: 'ai-recommendations';
      data: RecommendationRead;
      timestamp: Date;
    }
  | {
      type: 'ai-clarification';
      data: ClarificationResponse;
      timestamp: Date;
    };

export type ExpandedState = {
  explanations: Set<string>; // course_id set
  learningPath: boolean;
  comparison: {
    isOpen: boolean;
    selectedCourseIds: string[];
  };
};
```

---

## 4. API Layer

### 4.1 Generate Recommendations (Mutation)

```typescript
// src/features/recommendations/api/generate-recommendations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useNotifications } from '@/stores/notifications';
import type {
  RecommendationRequest,
  RecommendationRead,
  ClarificationResponse,
} from '../types';

type GenerateRecommendationsResponse = RecommendationRead | ClarificationResponse;

export const generateRecommendations = async (
  data: RecommendationRequest
): Promise<GenerateRecommendationsResponse> => {
  return api.post('/api/v1/users/me/recommendations', data);
};

export const useGenerateRecommendations = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: generateRecommendations,
    onSuccess: (data) => {
      // Only invalidate quota if successful recommendation
      if (data.type === 'recommendations') {
        queryClient.invalidateQueries({ queryKey: ['recommendation-quota'] });
      }
    },
    onError: (error: any) => {
      // Handle specific error cases
      const status = error?.response?.status;
      const message = error?.response?.data?.detail || 'Failed to generate recommendations';

      if (status === 429) {
        // Rate limit handled by UI component
        return;
      }

      if (status === 504) {
        addNotification({
          type: 'error',
          title: 'Timeout',
          message: 'The AI took too long to respond. Please try again.',
        });
        return;
      }

      // Generic error
      addNotification({
        type: 'error',
        title: 'Error',
        message,
      });
    },
  });
};
```

### 4.2 Get Quota (Query)

```typescript
// src/features/recommendations/api/get-quota.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { RecommendationQuota } from '../types';

export const getQuota = async (): Promise<RecommendationQuota> => {
  return api.get('/api/v1/users/me/recommendation-quota');
};

export const useQuota = () => {
  return useQuery({
    queryKey: ['recommendation-quota'],
    queryFn: getQuota,
    refetchInterval: 60000, // Poll every 60 seconds
    staleTime: 30000, // Consider stale after 30s
  });
};
```

### 4.3 Get Recommendation History (Query)

```typescript
// src/features/recommendations/api/get-recommendations.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { RecommendationRead } from '../types';

type RecommendationListResponse = {
  recommendations: RecommendationRead[];
  count: number;
};

export const getRecommendations = async (): Promise<RecommendationListResponse> => {
  return api.get('/api/v1/users/me/recommendations');
};

export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations-history'],
    queryFn: getRecommendations,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
```

---

## 5. Component Architecture

### 5.1 RecommendationChat (Main Container)

**Purpose**: Conversational chat interface for AI recommendations

**File**: `src/features/recommendations/components/recommendation-chat.tsx`

**Key Features**:
- Chat-like scrollable message history
- User input with textarea + buttons
- Loading states with animated progress
- Empty state with welcome message
- Rate limit handling

**Props**: None (self-contained page component)

**State**:
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [inputQuery, setInputQuery] = useState('');
const [expanded, setExpanded] = useState<ExpandedState>({
  explanations: new Set(),
  learningPath: false,
  comparison: { isOpen: false, selectedCourseIds: [] },
});
```

**Hooks**:
```typescript
const { data: quota, isLoading: quotaLoading } = useQuota();
const generateMutation = useGenerateRecommendations();
```

**Layout**:
```jsx
<div className="mx-auto max-w-4xl px-4 py-8">
  {/* Header with quota */}
  <div className="mb-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold text-slate-900">AI Course Recommendations</h1>
    <RateLimitIndicator quota={quota} />
  </div>

  {/* Chat area */}
  <div className="min-h-[600px] rounded-lg border border-slate-200 bg-white shadow-sm">
    {/* Messages (scrollable) */}
    <div className="max-h-[600px] overflow-y-auto p-6">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        messages.map((msg, idx) => (
          <div key={idx}>
            {msg.type === 'user' && <UserMessage {...msg} />}
            {msg.type === 'ai-recommendations' && (
              <AIResponse data={msg.data} expanded={expanded} setExpanded={setExpanded} />
            )}
            {msg.type === 'ai-clarification' && <ClarificationMessage {...msg.data} />}
          </div>
        ))
      )}
      {generateMutation.isPending && <AILoadingState />}
    </div>

    {/* Input area (sticky bottom) */}
    <div className="border-t border-slate-200 bg-slate-50 p-4">
      <RecommendationInput
        value={inputQuery}
        onChange={setInputQuery}
        onSubmit={handleSubmit}
        onProfileBased={handleProfileBased}
        disabled={generateMutation.isPending || quota?.remaining === 0}
      />
    </div>
  </div>
</div>
```

### 5.2 UserMessage

**Purpose**: Display user's query as chat bubble

**File**: `src/features/recommendations/components/user-message.tsx`

**Props**:
```typescript
type UserMessageProps = {
  query: string;
  timestamp: Date;
};
```

**Styling**:
- Right-aligned (`ml-auto`)
- Max width 70% of container
- Background: `bg-blue-50 border border-blue-200`
- Border radius: `rounded-2xl rounded-br-sm` (speech bubble effect)

**Component**:
```tsx
export const UserMessage = ({ query, timestamp }: UserMessageProps) => {
  return (
    <div className="mb-6 ml-auto max-w-[70%]">
      <div className="rounded-2xl rounded-br-sm border border-blue-200 bg-blue-50 p-4">
        <p className="text-base leading-relaxed text-slate-900">{query}</p>
      </div>
      <p className="mt-1 text-right text-sm text-slate-500">
        {formatDistanceToNow(timestamp, { addSuffix: true })}
      </p>
    </div>
  );
};
```

### 5.3 AIResponse

**Purpose**: Display AI recommendation response with nested components

**File**: `src/features/recommendations/components/ai-response.tsx`

**Props**:
```typescript
type AIResponseProps = {
  data: RecommendationRead;
  expanded: ExpandedState;
  setExpanded: (state: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => void;
};
```

**Styling**:
- Left-aligned
- Max width 85% of container
- Background: `bg-white border border-slate-200 shadow-sm`
- Border radius: `rounded-2xl rounded-bl-sm`

**Component**:
```tsx
export const AIResponse = ({ data, expanded, setExpanded }: AIResponseProps) => {
  return (
    <div className="mb-8 max-w-[85%]">
      <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white p-6 shadow-sm">
        {/* Profile Analysis Summary */}
        {data.profile_analysis && (
          <ProfileAnalysisSummary analysis={data.profile_analysis} />
        )}

        {/* Profile Feedback Banner (optional) */}
        {data.profile_feedback && (
          <ProfileFeedbackBanner message={data.profile_feedback} />
        )}

        {/* Overall Summary */}
        {data.overall_summary && (
          <p className="mb-4 text-base leading-relaxed text-slate-700">
            {data.overall_summary}
          </p>
        )}

        {/* Recommendation Cards */}
        <div className="space-y-4">
          {data.courses.map((course, idx) => (
            <RecommendationCard
              key={course.course_id}
              course={course}
              index={idx + 1}
              isExpanded={expanded.explanations.has(course.course_id)}
              onToggleExpand={() => {
                setExpanded((prev) => {
                  const newSet = new Set(prev.explanations);
                  if (newSet.has(course.course_id)) {
                    newSet.delete(course.course_id);
                  } else {
                    newSet.add(course.course_id);
                  }
                  return { ...prev, explanations: newSet };
                });
              }}
              isSelectedForComparison={expanded.comparison.selectedCourseIds.includes(
                course.course_id
              )}
              onToggleComparison={() => {
                setExpanded((prev) => ({
                  ...prev,
                  comparison: {
                    ...prev.comparison,
                    selectedCourseIds: prev.comparison.selectedCourseIds.includes(
                      course.course_id
                    )
                      ? prev.comparison.selectedCourseIds.filter((id) => id !== course.course_id)
                      : [...prev.comparison.selectedCourseIds, course.course_id],
                  },
                }));
              }}
            />
          ))}
        </div>

        {/* Comparison Button */}
        {expanded.comparison.selectedCourseIds.length >= 2 && (
          <Button
            variant="secondary"
            onClick={() =>
              setExpanded((prev) => ({
                ...prev,
                comparison: { ...prev.comparison, isOpen: true },
              }))
            }
            className="mt-4"
          >
            Compare Selected ({expanded.comparison.selectedCourseIds.length})
          </Button>
        )}

        {/* Learning Path Preview */}
        {data.learning_path.length > 0 && (
          <LearningPathPreview
            steps={data.learning_path}
            courses={data.courses}
            isExpanded={expanded.learningPath}
            onToggle={() =>
              setExpanded((prev) => ({ ...prev, learningPath: !prev.learningPath }))
            }
          />
        )}
      </div>

      <p className="mt-1 text-sm text-slate-500">
        {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
      </p>
    </div>
  );
};
```

### 5.4 RecommendationCard

**Purpose**: Display single course recommendation with explanation

**File**: `src/features/recommendations/components/recommendation-card.tsx`

**Props**:
```typescript
type RecommendationCardProps = {
  course: RecommendedCourse;
  index: number; // 1, 2, 3, etc. for display
  isExpanded: boolean;
  onToggleExpand: () => void;
  isSelectedForComparison: boolean;
  onToggleComparison: () => void;
};
```

**Match Score Color Scale**:
```typescript
const getMatchScoreColor = (score: number): string => {
  if (score >= 0.9) return 'text-emerald-600'; // Excellent
  if (score >= 0.75) return 'text-blue-600'; // Good
  return 'text-amber-600'; // Moderate
};
```

**Component Structure**:
```tsx
export const RecommendationCard = ({
  course,
  index,
  isExpanded,
  onToggleExpand,
  isSelectedForComparison,
  onToggleComparison,
}: RecommendationCardProps) => {
  const matchScoreColor = getMatchScoreColor(course.match_score);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            {index}. {course.title}
          </h3>
          <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${matchScoreColor}`}>
            <StarIcon className="h-4 w-4" />
            {Math.round(course.match_score * 100)}% Match
          </p>
        </div>
        {/* Comparison Checkbox */}
        <input
          type="checkbox"
          checked={isSelectedForComparison}
          onChange={onToggleComparison}
          className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          aria-label={`Select ${course.title} for comparison`}
        />
      </div>

      {/* Explanation */}
      <div className="mb-3">
        <p className="text-sm font-medium text-slate-700">Why this course?</p>
        <p className="mt-1 text-base leading-relaxed text-slate-600">{course.explanation}</p>
      </div>

      {/* Skill Gaps Addressed */}
      {course.skill_gaps_addressed.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-slate-700">✓ Addresses your skill gaps:</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
            {course.skill_gaps_addressed.map((gap, idx) => (
              <li key={idx}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
        {course.estimated_weeks && (
          <span className="italic">~{course.estimated_weeks} weeks</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <Button
          variant="primary"
          size="sm"
          asChild
        >
          <Link to={`/app/courses/${course.course_id}`}>View Course Details</Link>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleExpand}
          icon={isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        >
          Explain This Recommendation
        </Button>
      </div>

      {/* Expandable Deep Dive */}
      {isExpanded && <ExplainRecommendation course={course} />}
    </div>
  );
};
```

### 5.5 AILoadingState

**Purpose**: Animated loading experience during LLM processing

**File**: `src/features/recommendations/components/ai-loading-state.tsx`

**Props**: None

**Animation Sequence**:
```typescript
const LOADING_MESSAGES = [
  { time: 0, message: 'Analyzing your learning goals...' },
  { time: 2000, message: 'Matching courses to your interests...' },
  { time: 4000, message: 'Crafting personalized recommendations...' },
  { time: 6000, message: "This is taking longer than usual... we're being extra thorough!" },
];
```

**Component**:
```tsx
export const AILoadingState = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    LOADING_MESSAGES.forEach((msg, idx) => {
      if (idx > 0) {
        timers.push(setTimeout(() => setMessageIndex(idx), msg.time));
      }
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <div className="mx-auto h-16 w-16 animate-pulse text-blue-500">
        <SparklesIcon className="h-16 w-16" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-slate-900">
        Finding your perfect courses...
      </h3>
      <p
        className="mt-4 min-h-[1.5rem] text-base text-slate-600"
        role="status"
        aria-live="polite"
      >
        {LOADING_MESSAGES[messageIndex].message}
      </p>
      <p className="mt-6 text-sm italic text-slate-500">Usually takes 3-5 seconds</p>
    </div>
  );
};
```

### 5.6 RateLimitIndicator

**Purpose**: Display remaining recommendation quota

**File**: `src/features/recommendations/components/rate-limit-indicator.tsx`

**Props**:
```typescript
type RateLimitIndicatorProps = {
  quota: RecommendationQuota | undefined;
};
```

**Color States**:
```typescript
const getQuotaColor = (remaining: number, limit: number): string => {
  const percentage = (remaining / limit) * 100;
  if (percentage >= 70) return 'blue'; // Healthy
  if (percentage >= 30) return 'amber'; // Warning
  return 'red'; // Critical
};
```

**Component**:
```tsx
export const RateLimitIndicator = ({ quota }: RateLimitIndicatorProps) => {
  if (!quota) return null;

  const color = getQuotaColor(quota.remaining, quota.limit);
  const percentage = (quota.remaining / quota.limit) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium text-${color}-700`}>
        {quota.remaining}/{quota.limit} remaining
      </span>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full bg-${color}-500 transition-all`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={quota.remaining}
          aria-valuemin={0}
          aria-valuemax={quota.limit}
        />
      </div>
    </div>
  );
};
```

### 5.7 ClarificationMessage

**Purpose**: Handle vague or irrelevant queries gracefully

**File**: `src/features/recommendations/components/clarification-message.tsx`

**Props**:
```typescript
type ClarificationMessageProps = ClarificationResponse;
```

**Component**:
```tsx
export const ClarificationMessage = ({ intent, message, query }: ClarificationMessageProps) => {
  return (
    <div className="mb-8 max-w-[85%] rounded-2xl rounded-bl-sm border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <LightBulbIcon className="h-6 w-6 flex-shrink-0 text-amber-500" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            {intent === 'vague'
              ? "I'd love to help you find the perfect courses!"
              : 'I specialize in course recommendations!'}
          </h3>
          <p className="mt-2 text-base leading-relaxed text-slate-700">{message}</p>

          {intent === 'vague' && (
            <>
              <p className="mt-4 text-sm font-medium text-slate-700">Try being more specific:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm italic text-slate-600">
                <li>"I want to learn Python for data analysis"</li>
                <li>"Help me improve my leadership communication skills"</li>
                <li>"Show me beginner courses in machine learning"</li>
              </ul>
            </>
          )}

          <div className="mt-4">
            <Button variant="primary" asChild>
              {intent === 'vague' ? (
                <Link to="/app/profile">Complete Your Profile</Link>
              ) : (
                <Link to="/app/courses">Browse All Courses</Link>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 6. State Management

### 6.1 Server State (TanStack Query)

**Queries**:
- `['recommendation-quota']` - Current quota status (polled every 60s)
- `['recommendations-history']` - Past recommendations (cached 5 min)

**Mutations**:
- `generateRecommendations` - POST new recommendation request

**Cache Invalidation**:
```typescript
// On successful recommendation generation
queryClient.invalidateQueries({ queryKey: ['recommendation-quota'] });
```

### 6.2 Local Component State

**Chat Messages** (useState):
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
```

**Input Value** (useState):
```typescript
const [inputQuery, setInputQuery] = useState('');
```

**Expanded State** (useState):
```typescript
const [expanded, setExpanded] = useState<ExpandedState>({
  explanations: new Set<string>(), // Which cards have expanded details
  learningPath: false, // Learning path preview expanded
  comparison: {
    isOpen: false, // Comparison modal open
    selectedCourseIds: [], // Selected courses for comparison
  },
});
```

### 6.3 No Global State Needed

This feature is **self-contained**:
- No cross-feature dependencies
- State doesn't persist across navigation
- No shared UI state with other features

---

## 7. Error Handling

### 7.1 Error Types and Handling

| Error | Status | Handling Strategy |
|-------|--------|-------------------|
| **Rate Limit** | 429 | Display rate limit banner with countdown timer; disable input |
| **Profile Missing** | 400 | Show error + redirect to profile page |
| **LLM Timeout** | 504 | Show friendly "Try again" message with retry button |
| **Network Error** | - | Show offline banner with retry button |
| **Clarification Needed** | 200 | NOT an error - display `ClarificationMessage` component |

### 7.2 Error Component Examples

**Rate Limit Banner**:
```tsx
{quota?.remaining === 0 && (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
    <h3 className="font-semibold text-red-900">Daily limit reached</h3>
    <p className="mt-1 text-sm text-red-700">
      You've used all 10 recommendations for today. Your quota resets in{' '}
      <strong>{timeUntilReset}</strong>.
    </p>
    <div className="mt-3 flex gap-2">
      <Button variant="secondary" size="sm" asChild>
        <Link to="/app/courses">Browse Courses</Link>
      </Button>
      <Button variant="secondary" size="sm" asChild>
        <Link to="/app/profile">Edit Profile</Link>
      </Button>
    </div>
  </div>
)}
```

**Mutation Error Handling**:
```tsx
{generateMutation.isError && (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
    <h3 className="font-semibold text-red-900">Error</h3>
    <p className="mt-1 text-sm text-red-700">
      {generateMutation.error?.response?.data?.detail || 'Failed to generate recommendations'}
    </p>
    <Button
      variant="secondary"
      size="sm"
      onClick={() => generateMutation.reset()}
      className="mt-3"
    >
      Dismiss
    </Button>
  </div>
)}
```

---

## 8. Accessibility

### 8.1 WCAG 2.1 AA Compliance

**Keyboard Navigation**:
- All interactive elements focusable via Tab/Shift+Tab
- Enter/Space to submit form, expand accordions, toggle checkboxes
- Escape to close modals
- Logical tab order (top to bottom, left to right)

**Screen Reader Support**:
- Semantic HTML (`<article>`, `<button>`, `<input>`)
- ARIA labels for icon-only buttons
- ARIA live regions for loading states
- ARIA expanded/collapsed for accordions

**Color Contrast**:
- All text meets 4.5:1 minimum (or 3:1 for large text)
- Focus indicators have 3:1 contrast
- Match score colors tested for contrast

**Focus Management**:
- Visible focus rings (2px blue-500 ring)
- Focus trapped in modals
- Focus returned to trigger after modal close

### 8.2 Component-Specific ARIA

**RecommendationChat**:
```tsx
<div role="main" aria-label="Course recommendation interface">
```

**UserMessage / AIResponse**:
```tsx
<article aria-label={`Your message: ${query}`}>
<article aria-labelledby="ai-response-heading">
```

**AILoadingState**:
```tsx
<div role="status" aria-live="polite" aria-label="Loading recommendations">
```

**ExplainRecommendation (Accordion)**:
```tsx
<button
  aria-expanded={isExpanded}
  aria-controls={`explanation-${course.course_id}`}
>
<div
  id={`explanation-${course.course_id}`}
  aria-hidden={!isExpanded}
>
```

**CourseComparisonModal**:
```tsx
<Dialog role="dialog" aria-modal="true" aria-labelledby="comparison-title">
```

### 8.3 Motion Preferences

Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
  .transition-all {
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Performance Considerations

### 9.1 Code Splitting

Lazy load comparison modal (not always needed):
```tsx
const CourseComparisonModal = lazy(() => import('./course-comparison-modal'));

// Usage
<Suspense fallback={<Spinner />}>
  {expanded.comparison.isOpen && (
    <CourseComparisonModal
      courses={selectedCourses}
      onClose={() => setExpanded((prev) => ({ ...prev, comparison: { ...prev.comparison, isOpen: false } }))}
    />
  )}
</Suspense>
```

### 9.2 Optimistic Updates

Append user message immediately on submit:
```tsx
const handleSubmit = async (query: string) => {
  // Optimistic update
  setMessages((prev) => [
    ...prev,
    { type: 'user', query, timestamp: new Date() },
  ]);

  try {
    const result = await generateMutation.mutateAsync({ query });

    // Append AI response
    setMessages((prev) => [
      ...prev,
      {
        type: result.type === 'recommendations' ? 'ai-recommendations' : 'ai-clarification',
        data: result,
        timestamp: new Date(),
      },
    ]);
  } catch (error) {
    // Remove optimistic message on error
    setMessages((prev) => prev.slice(0, -1));
  }
};
```

### 9.3 Debouncing

No debouncing needed for this feature (explicit submit button).

### 9.4 Virtualization

Not needed for MVP (max 10 conversations per day = ~20 messages).

---

## 10. Implementation Checklist

### Phase 1: Types and API Layer

- [ ] **10.1.1** Create types file (`features/recommendations/types/index.ts`)
  - Define all response types matching backend schemas
  - Define UI state types (ChatMessage, ExpandedState)
  - Export all types

- [ ] **10.1.2** Create `generate-recommendations` API hook
  - Mutation function with proper error handling
  - Quota invalidation on success
  - Custom error handling for 429, 504

- [ ] **10.1.3** Create `get-quota` API hook
  - Query with 60s polling
  - Proper typing for quota response

- [ ] **10.1.4** Create `get-recommendations` API hook (history)
  - Query with 5-minute stale time
  - Proper typing for list response

### Phase 2: Core UI Components

- [ ] **10.2.1** Create `rate-limit-indicator` component
  - Display quota with color-coded progress bar
  - Tooltip with reset time and tips

- [ ] **10.2.2** Create `ai-loading-state` component
  - Animated brain icon (SparklesIcon with pulse)
  - Timed message progression (4 stages)
  - Accessibility: role="status", aria-live="polite"

- [ ] **10.2.3** Create `user-message` component
  - Right-aligned blue bubble
  - Relative timestamp
  - Accessible article role

- [ ] **10.2.4** Create `profile-analysis-summary` component
  - Skill level badge
  - Skill gaps list (max 3)
  - Confidence indicator

- [ ] **10.2.5** Create `profile-feedback-banner` component
  - Blue info banner with icon
  - Link to profile page
  - Conditional rendering

### Phase 3: Recommendation Components

- [ ] **10.3.1** Create `recommendation-card` component
  - Match score with color coding
  - Explanation text
  - Skill gaps addressed list
  - Metadata row (estimated weeks)
  - Action buttons (View Course, Explain)
  - Comparison checkbox

- [ ] **10.3.2** Create `explain-recommendation` component
  - Expandable accordion
  - Deep dive sections (alignment, skill development, time assessment)
  - Smooth expand/collapse animation
  - Accessible ARIA attributes

- [ ] **10.3.3** Create `learning-path-preview` component
  - Collapsed state preview (3 courses, total weeks)
  - Expanded state with vertical flow
  - Numbered step badges
  - Rationale for each step
  - Summary footer

### Phase 4: Main Chat Interface

- [ ] **10.4.1** Create `ai-response` component
  - Container for AI response bubble
  - Compose all sub-components
  - Manage expanded state
  - Timestamp display

- [ ] **10.4.2** Create `clarification-message` component
  - Amber warning banner
  - Different messages for vague vs irrelevant
  - Helpful examples and CTAs
  - Friendly, non-scolding tone

- [ ] **10.4.3** Create `recommendation-chat` component
  - Chat container with header + messages + input
  - Message state management
  - Optimistic updates
  - Empty state
  - Submit handlers (query + profile-based)
  - Scroll to bottom on new message

### Phase 5: Advanced Features

- [ ] **10.5.1** Create `course-comparison-modal` component (lazy loaded)
  - Side-by-side table comparison
  - Max 3 courses
  - Modal with focus trap
  - Accessible dialog role

- [ ] **10.5.2** Add comparison selection to recommendation cards
  - Checkbox for selection
  - Show "Compare Selected (N)" button when 2+ selected
  - Open modal with selected courses

### Phase 6: Page Integration

- [ ] **10.6.1** Create recommendations page route
  - Use RecommendationChat as main component
  - Add to router configuration
  - Update navigation links

- [ ] **10.6.2** Add SEO/meta tags
  - Page title: "AI Course Recommendations"
  - Meta description

### Phase 7: Testing

- [ ] **10.7.1** Write component tests
  - RecommendationCard: match score colors, expand/collapse
  - RateLimitIndicator: color states, accessibility
  - AILoadingState: message progression

- [ ] **10.7.2** Write integration tests with MSW
  - Submit query → loading → success flow
  - Submit query → rate limit error
  - Submit query → clarification response
  - Profile-based recommendation flow

- [ ] **10.7.3** Manual accessibility testing
  - Keyboard navigation through entire flow
  - Screen reader testing (VoiceOver/NVDA)
  - Color contrast verification
  - Focus management in modals

### Phase 8: Polish

- [ ] **10.8.1** Add loading skeletons
  - Skeleton for recommendation cards while loading

- [ ] **10.8.2** Add empty state
  - Welcome message
  - Quick example queries
  - "Recommend based on profile" CTA

- [ ] **10.8.3** Add animations
  - Smooth message slide-in
  - Accordion expand/collapse
  - Modal fade-in

- [ ] **10.8.4** Error state refinements
  - Friendly error messages
  - Retry buttons
  - Helpful suggestions

---

## Appendix: Integration with Existing Codebase

### Existing Components to Reuse

| Component | Location | Usage |
|-----------|----------|-------|
| Button | `components/ui/button` | All CTAs and actions |
| Badge | `components/ui/badge` | Skill level, difficulty, confidence |
| Card | `components/ui/card` | Base for recommendation cards |
| Modal | `components/ui/modal` | Comparison modal |
| Link | `components/ui/link` | Navigation to courses |
| Spinner | `components/ui/spinner` | Loading fallbacks |

### Existing Hooks to Reuse

| Hook | Location | Usage |
|------|----------|-------|
| useNotifications | `stores/notifications` | Error toasts |
| useDisclosure | `hooks/use-disclosure` | Modal open/close state |

### Existing Utilities to Reuse

| Utility | Location | Usage |
|---------|----------|-------|
| cn | `utils/cn` | Class name merging |
| formatDistanceToNow | date-fns | Relative timestamps |

### API Client Configuration

The existing `lib/api-client.ts` already handles:
- JWT token attachment
- 401 redirect to login
- Global error notifications

**Recommendation API calls will automatically benefit from these interceptors.**

---

**Document Version**: 1.0
**Author**: Claude (React Specialist)
**Status**: Ready for Implementation
**Next Steps**: Implement Phase 1 (Types and API Layer), then proceed sequentially through the checklist.
