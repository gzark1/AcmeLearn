# Technical Assessment: AI-Powered Learning Platform

## Overview
Build **AcmeLearn**, an AI-driven learning recommendation system that helps users discover courses from a curated catalog. Users can browse available courses, set their learning preferences, and receive personalized AI recommendations. Course content is provided via JSON and is read-only. We encourage you to showcase your strengths and use technologies you're comfortable with.

**Timeline:** 1 week from start (not expected to be full-time commitment)  
**Submission Format:** Version-controlled repository with documented codebase

## Project Requirements

### Minimum Viable Product (MVP) - Required

#### Backend
* RESTful API with proper HTTP methods and status codes
* User authentication and session management (any approach welcome - auth frameworks, simple JWT, etc.)
* Data persistence for user profiles and recommendations
* Course browsing from read-only catalog (imported from JSON)
* Search and filtering capabilities by difficulty, tags, etc.
* User profile management (learning goals and preferences)
* LLM-powered recommendation generation
* **Technologies:** Python preferred (with any framework - FastAPI, Flask, Django, etc.), but any backend language/framework accepted
* **Note:** Courses are read-only for users - **no course management features needed**

#### Frontend
* User authentication interface (login/register) - can use any auth approach
* Course catalog browser with search and filtering
* User profile page with these fields:
  - **Learning Goal** (text): What do you want to achieve? (e.g., "Become a full-stack developer")
  - **Current Level** (select): Beginner, Intermediate, or Advanced
  - **Interests** (multi-select tags): Topics you're interested in
  - **Time Commitment** (select): Hours per week available
* AI recommendation interface:
  - View personalized course suggestions
  - Ask for recommendations based on specific queries
  - See explanation for why courses were recommended
* **Technologies:** React preferred (with any setup - Vite, Next.js, Create React App, etc.), but any modern framework accepted

#### LLM Integration
Integrate an LLM (OpenAI, Claude, Gemini, etc.) to generate course recommendations. Your implementation must include:

* Dynamic context engineering (not just static prompts):
  - User's learning goal and context
  - Current skill level with relevant experience
  - Areas of interest mapped to course taxonomy
  - Time availability

### Course Data
The `courses.json` file in this repository contains 50 courses. Each course follows this schema:
```json
{
  "title": "string",
  "description": "string",
  "difficulty": "beginner|intermediate|advanced",
  "duration": "number (hours)",
  "tags": ["string"],
  "skills_covered": ["string"],
  "contents": "string (course content outline)"
}
```

**Your task:** Import this data into your chosen persistence layer. These courses are **read-only** - users can browse and receive recommendations but cannot create, edit, or delete courses.

### Nice-to-Have Features (Optional)
Choose any that demonstrate your skills:
* **Advanced AI/LLM Features:**
  - Multi-agent system (e.g., one agent for skill assessment, another for recommendations)
  - Conversational interface for refining recommendations (e.g., "
  - Recommendation explanations with confidence scores
* **Or anything else you want to showcase** - we're interested in seeing your unique approach and technical strengths

## Deliverables

### Required
1. **README.md** with:
   * Technology choices and rationale
   * Setup instructions (step-by-step)
   * Trade-offs and future improvements

2. **Working Application:**
   * Complete setup instructions for running locally
   * All necessary configuration files and dependencies documented
   * Database setup and data import process clearly explained
   * Environment variables properly documented (`.env.example` or similar)
   * The application must run successfully following your instructions

### Optional
* **Deployed Application:** Live demo URL with the application running (free options: Vercel, Netlify, Render, Koyeb, AWS Free Tier, etc.)
* **Docker Setup:** Containerized application with docker-compose for easy local setup

## Submission

1. Develop your solution in a public GitHub repository with clear commit history
2. Ensure all sensitive data (especially API keys) are excluded from commits
3. Update the README.md with your documentation
4. Test that your application runs successfully following your setup instructions

**When ready, email:** chrys@wayfor.ai  
**CC:** ryan@wayfor.ai, marios@wayfor.ai  
**Subject:** Technical Assessment - [Your Name]

**Include:**
* Confirmation that your solution is ready for review
* Brief summary of your approach (2-3 paragraphs)
* Any setup considerations or dependencies
* If anything is incomplete or missing, please explain why (time constraints, technical challenges, etc.)

**Questions?** Don't hesitate to reach out - we're happy to clarify anything!

We're excited to see your unique solution and learn about your technical approach. Good luck!