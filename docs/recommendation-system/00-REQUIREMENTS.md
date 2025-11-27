# AcmeLearn Recommendation System - Requirements

## Document Purpose

This document extracts and organizes all requirements for the AI recommendation system from `assessment.md`. It serves as the **source of truth** for what must be built (MVP) vs what could be built (nice-to-have).

**Source**: `/assessment.md` (Technical Assessment: AI-Powered Learning Platform)

---

## Project Context

### What is AcmeLearn?

> "AcmeLearn, an AI-driven learning recommendation system that helps users discover courses from a curated catalog. Users can browse available courses, set their learning preferences, and receive personalized AI recommendations."

### Assessment Philosophy

> "We encourage you to showcase your strengths and use technologies you're comfortable with."

> "Or anything else you want to showcase - we're interested in seeing your unique approach and technical strengths"

**Key Insight**: This is a showcase project. The goal is to impress reviewers while meeting requirements.

---

## MVP Requirements (MUST HAVE)

These are explicitly required in the assessment.

### LLM Integration

> "Integrate an LLM (OpenAI, Claude, Gemini, etc.) to generate course recommendations."

**Our Choice**: OpenAI GPT-5-nano-2025-08-07 (primary), possibly GPT-5-mini-2025-08-07

### Dynamic Context Engineering

> "Your implementation must include: Dynamic context engineering (not just static prompts)"

This is explicitly called out as a requirement. Static prompts are NOT acceptable.

**Required Context Elements** (verbatim from assessment):

| Element | Assessment Quote |
|---------|------------------|
| Learning Goal | "User's learning goal and context" |
| Skill Level | "Current skill level with relevant experience" |
| Interests | "Areas of interest mapped to course taxonomy" |
| Time | "Time availability" |

### AI Recommendation Interface

The frontend must support these capabilities:

| Feature | Assessment Quote |
|---------|------------------|
| View Suggestions | "View personalized course suggestions" |
| Query-Based | "Ask for recommendations based on specific queries" |
| Explanations | "See explanation for why courses were recommended" |

---

## Nice-to-Have Features (OPTIONAL)

> "Choose any that demonstrate your skills"

### Advanced AI/LLM Features

| Feature | Assessment Quote | Notes |
|---------|------------------|-------|
| Multi-Agent | "Multi-agent system (e.g., one agent for skill assessment, another for recommendations)" | Explicitly mentioned as example |
| Conversational | "Conversational interface for refining recommendations" | Quote is cut off in assessment but intent is clear |
| Confidence Scores | "Recommendation explanations with confidence scores" | Combines with required explanations |

### Open-Ended Showcase

> "Or anything else you want to showcase - we're interested in seeing your unique approach and technical strengths"

This gives freedom to add impressive features beyond the listed options.

---

## Existing System Context

### What's Already Built

| Component | Status | Details |
|-----------|--------|---------|
| Backend API | Complete | FastAPI, PostgreSQL, JWT auth |
| User Authentication | Complete | Registration, login, JWT tokens |
| User Profiles | Complete | Learning goal, level, interests, time commitment |
| Course Catalog | Complete | 48 courses, tags, skills, filtering |
| Admin Panel | Complete | User management, analytics |
| Frontend | Complete | React + TypeScript, all pages except recommendations |

### Available User Data for Context

From `user_profiles` table:
- `learning_goal` (text) - What user wants to achieve
- `current_level` (enum) - Beginner / Intermediate / Advanced
- `time_commitment` (int) - Hours per week available
- `interests` (many-to-many with tags) - Topics user is interested in

### Available Course Data

From `courses` table (48 courses):
- `title` - Course name
- `description` - What the course covers
- `difficulty` - beginner / intermediate / advanced
- `duration` - Hours to complete
- `tags` - Topic categories (169 unique tags)
- `skills_covered` - What you'll learn (230 unique skills)
- `contents` - Course outline/modules

---

## Technical Constraints

### Given
- OpenAI API keys available (GPT-5-nano-2025-08-07, GPT-5-mini-2025-08-07)
- 48 courses in catalog (small corpus - entire catalog fits in context)
- No budget constraints
- Fast development with Claude Code

### Existing Rate Limiting (from UI_DESIGN_SYSTEM.md)
- 10 AI recommendations per user per 24 hours (already designed in UI)

---

## Success Criteria

### Must Achieve (MVP)
1. User can request recommendations with a text query
2. User can get recommendations based on their profile
3. Recommendations include explanations for WHY each course is suggested
4. Context is dynamically built from user profile data
5. System uses LLM (not rule-based)

### Should Achieve (Impressive)
1. Fast, responsive experience (streaming or quick response)
2. High-quality, relevant recommendations
3. Clear, helpful explanations
4. Professional UI/UX

### Could Achieve (Standout)
1. Multi-agent architecture
2. Conversational refinement
3. Confidence scores
4. Unique/creative features that showcase technical skill

---

## Questions to Answer

These will be addressed in subsequent documents:

### Technical (→ 01-TECHNICAL-LANDSCAPE.md)
- [ ] RAG vs direct context injection for 48 courses?
- [ ] LangChain/LangGraph/LlamaIndex vs direct OpenAI SDK?
- [ ] Streaming vs batch responses?
- [ ] How to structure dynamic context/prompts?

### Product (→ 02-PRODUCT-STRATEGY.md)
- [ ] Which nice-to-have features provide best ROI?
- [ ] What would most impress reviewers?
- [ ] What's our "unique approach"?
- [ ] How to handle the UX of waiting for LLM response?

### Design (→ 04-UI-DESIGN.md)
- [ ] Fresh UI design or adapt existing wireframes?
- [ ] Mobile-first or desktop-first?
- [ ] How to present explanations effectively?

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-27 | Claude | Initial extraction from assessment.md |
