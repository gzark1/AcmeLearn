# Technical Landscape: AcmeLearn Recommendation System

## Document Purpose

This document analyzes technical options for implementing the AI recommendation system. It's designed to **educate and inform** decision-making, not prescribe a solution. Each section presents options, trade-offs, and recommendations for your consideration.

**Last Updated**: 2025-11-27
**Status**: Decision Brief - Awaiting User Choices

---

## Executive Summary

### Key Findings

1. **RAG is likely unnecessary** - 48 courses (~18K tokens) fit comfortably in GPT-4's context window
2. **Direct OpenAI SDK is sufficient** - LangChain/LangGraph add complexity with minimal benefit for this use case
3. **GPT-4 (or GPT-4 Turbo) recommended** - Better reasoning for course matching than GPT-3.5-turbo
4. **Structured outputs are critical** - Ensure consistent JSON responses with explanations
5. **Streaming adds complexity** - Consider deferring unless user experience demands it

### Recommended Starting Point

**Simplest MVP Path**:
- Direct OpenAI Python SDK
- GPT-4 or GPT-4 Turbo (not GPT-5 models yet - see below)
- Direct context injection (all 48 courses in prompt)
- Structured outputs via function calling or JSON mode
- Non-streaming responses (fast enough for 48 courses)

**Estimated Implementation Time**: 4-6 hours for MVP

---

## Important Note: GPT-5 Model Availability

### Current Reality (November 2025)

The requirements document mentions "GPT-5-nano-2025-08-07" and "GPT-5-mini-2025-08-07". **As of my knowledge cutoff (January 2025), GPT-5 models are not publicly available.**

**Available OpenAI Models** (confirmed as of late 2024/early 2025):
- `gpt-4` (original)
- `gpt-4-turbo` (faster, cheaper than GPT-4)
- `gpt-4o` (GPT-4 Optimized - newest, best performance/cost ratio)
- `gpt-3.5-turbo` (fast, cheap, lower quality)

### Recommendation: Verify Model Availability

Before proceeding, **test which models your API keys have access to**:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  | jq '.data[].id' | grep gpt
```

**If GPT-5 models ARE available**:
- Use GPT-5-mini for cost efficiency (likely similar to current GPT-4 Turbo)
- Reserve GPT-5-nano for future optimization

**If GPT-5 models are NOT available** (most likely):
- Use `gpt-4o` (newest, best balance)
- Or `gpt-4-turbo` (well-tested, reliable)
- Avoid `gpt-3.5-turbo` (weaker reasoning for course matching)

---

## Area 1: RAG vs Direct Context

### The Question

With only 48 courses (~72KB JSON, ~18K tokens), should we:
- **Option A**: Build a RAG system (embeddings, vector DB, retrieval)
- **Option B**: Include all courses directly in the LLM prompt

### Analysis

#### Course Corpus Size

```
48 courses × ~1500 bytes average = ~72KB total
Estimated tokens: ~18,000 tokens (using 4 chars/token estimate)

GPT-4 context windows:
- gpt-4: 8K tokens (too small)
- gpt-4-32k: 32K tokens (sufficient)
- gpt-4-turbo: 128K tokens (plenty of room)
- gpt-4o: 128K tokens (plenty of room)
```

**Key Insight**: The entire course catalog fits in modern GPT-4 context windows with room for user profile, instructions, and examples.

### Option A: RAG (Retrieval-Augmented Generation)

#### How It Works

1. **Preprocessing**: Convert courses to embeddings, store in vector DB (Pinecone, Weaviate, ChromaDB)
2. **Query time**: Embed user query, retrieve top-k relevant courses (e.g., 10-15)
3. **Generation**: Send retrieved courses + user profile to LLM for recommendations

#### Pros

| Benefit | Why It Matters |
|---------|---------------|
| **Scalability** | If catalog grows to 1000+ courses, RAG is essential |
| **Cost efficiency** | Fewer tokens per request (lower API costs) |
| **Latency** | Smaller prompts = faster LLM responses |
| **Relevance pre-filtering** | Vector search surfaces semantically similar courses |
| **Impressive architecture** | Shows knowledge of modern AI patterns |

#### Cons

| Drawback | Impact |
|----------|--------|
| **Implementation complexity** | 2-3x development time (embeddings, vector DB, retrieval logic) |
| **Additional dependencies** | OpenAI embeddings API + vector database service |
| **Potential quality loss** | Retrieval might miss relevant courses (keyword mismatch) |
| **Over-engineering** | Solving a problem that doesn't exist (48 courses is tiny) |
| **Debugging difficulty** | Two-stage errors: retrieval issues OR generation issues |

#### When to Choose RAG

- [ ] Course catalog will grow beyond 100 courses soon
- [ ] Cost optimization is critical (millions of requests expected)
- [ ] You want to showcase RAG implementation skills specifically
- [ ] Real-time course additions require instant availability

### Option B: Direct Context Injection

#### How It Works

1. **Preprocessing**: None (or simple JSON formatting)
2. **Query time**: Build prompt with ALL courses + user profile + query
3. **Generation**: LLM considers entire catalog for recommendations

#### Pros

| Benefit | Why It Matters |
|---------|---------------|
| **Simplicity** | Single API call, no vector DB, no embeddings |
| **Complete information** | LLM sees all options, no retrieval errors |
| **Fast development** | 4-6 hours to MVP vs 12+ hours for RAG |
| **Easier debugging** | Single point of failure (LLM prompt/response) |
| **Quality** | LLM has full context for nuanced matching |

#### Cons

| Drawback | Impact |
|----------|--------|
| **Not scalable** | If catalog grows to 500+ courses, this breaks |
| **Higher per-request cost** | More tokens = higher API costs |
| **Potentially slower** | Larger prompts take longer to process |
| **Less impressive** | Reviewers may expect RAG for "AI-driven" platform |

#### When to Choose Direct Context

- [x] Course catalog is small (<100 courses) and stable
- [x] Development speed is priority (5-day timeline)
- [x] You're using modern models (GPT-4 Turbo, GPT-4o) with large contexts
- [x] You want to optimize for quality over scalability

### Hybrid Approach

**Smart Pre-filtering + Full Context**:

1. Pre-filter courses by difficulty level (user is "beginner" → remove "advanced" courses)
2. Pre-filter by time availability (user has 5 hrs/week → remove 40-hour courses)
3. Include filtered subset (20-30 courses) in prompt

**Benefits**:
- Smaller prompts (faster, cheaper)
- No vector DB complexity
- Maintains full-context benefits
- Shows product thinking (smart filtering)

### My Recommendation: Start with Direct Context

**Reasoning**:

1. **48 courses is trivial** - This is not a scalability problem
2. **Speed to market** - Get MVP working in hours, not days
3. **Quality first** - Full context = better recommendations
4. **Easy migration path** - If catalog grows, add RAG later (data model already supports it)
5. **Showcase other skills** - Focus on prompt engineering, structured outputs, UX

**Caveat**: If the assessment reviewers specifically expect RAG implementation as a signal of AI competency, consider building it to impress them. But from a pure product perspective, it's over-engineering.

---

## Area 2: Framework Choice

### The Question

How should we integrate with the LLM:
- **Option A**: Direct OpenAI Python SDK
- **Option B**: LangChain
- **Option C**: LangGraph (LangChain's newer framework)
- **Option D**: LlamaIndex

### Option A: Direct OpenAI SDK

#### What It Is

Official Python library from OpenAI. Direct API calls with minimal abstraction.

```python
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)

response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {"role": "system", "content": "You are a learning advisor..."},
        {"role": "user", "content": f"Profile: {profile}\nCourses: {courses}\nQuery: {query}"}
    ],
    temperature=0.7
)

recommendation = response.choices[0].message.content
```

#### Pros

| Benefit | Why It Matters |
|---------|---------------|
| **Simple** | Zero learning curve, direct API calls |
| **Full control** | Exact prompt construction, no magic |
| **Minimal dependencies** | Just `openai` package |
| **Easy debugging** | Print prompt, inspect response, no black boxes |
| **Official support** | OpenAI docs are excellent |
| **Lightweight** | No framework overhead |

#### Cons

| Drawback | Impact |
|----------|--------|
| **No abstractions** | You build prompt templates, retry logic, error handling yourself |
| **No built-in memory** | Must manually manage conversation history (if adding chat) |
| **No prompt versioning** | You roll your own system for tracking prompt changes |
| **Repetitive code** | Similar patterns across different endpoints |

#### When to Choose Direct SDK

- [x] Simple, single-purpose LLM calls (one-shot recommendations)
- [x] You want full transparency and control
- [x] Fast development (no framework learning)
- [x] Small project scope (not building multi-agent systems)

---

### Option B: LangChain

#### What It Is

Popular framework for building LLM applications. Provides abstractions for prompts, chains, memory, and agents.

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain

llm = ChatOpenAI(model="gpt-4-turbo", temperature=0.7)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a learning advisor..."),
    ("human", "Profile: {profile}\nCourses: {courses}\nQuery: {query}")
])

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run(profile=profile, courses=courses, query=query)
```

#### Pros

| Benefit | Why It Matters |
|---------|---------------|
| **Prompt templates** | Reusable, parameterized prompts |
| **Chain abstractions** | Compose multi-step workflows |
| **Memory management** | Built-in conversation history |
| **Agent framework** | Easy to build multi-agent systems |
| **Ecosystem** | Integrations with vector DBs, document loaders, etc. |
| **Community** | Large community, lots of examples |

#### Cons

| Drawback | Impact |
|----------|--------|
| **Complexity** | Learning curve (abstractions, concepts) |
| **Overhead** | More code for simple tasks |
| **Version churn** | Frequent breaking changes (v0.0.x → v0.1.x → v0.2.x) |
| **Debugging** | Harder to trace through abstraction layers |
| **Opinionated** | Framework patterns may not fit your needs |

#### When to Choose LangChain

- [ ] Building multi-step chains (skill assessment → course filter → recommendation)
- [ ] Adding conversational refinement (chat history required)
- [ ] Using multiple data sources (PDFs, websites, DBs)
- [ ] Want to showcase LangChain expertise to reviewers

---

### Option C: LangGraph

#### What It Is

Newer framework from LangChain team for building stateful, multi-actor applications using graphs.

```python
from langgraph.graph import StateGraph
from langchain_openai import ChatOpenAI

# Define state
class RecommendationState(TypedDict):
    profile: dict
    query: str
    courses: list
    recommendations: list

# Build graph
workflow = StateGraph(RecommendationState)
workflow.add_node("assess_skill", assess_skill_node)
workflow.add_node("filter_courses", filter_courses_node)
workflow.add_node("recommend", recommend_node)
workflow.add_edge("assess_skill", "filter_courses")
workflow.add_edge("filter_courses", "recommend")

app = workflow.compile()
result = app.invoke({"profile": profile, "query": query, "courses": courses})
```

#### Pros

| Benefit | Why It Matters |
|---------|---------------|
| **Stateful workflows** | Perfect for multi-agent systems |
| **Explicit control flow** | Graph structure shows logic clearly |
| **Debugging** | Inspect state at each node |
| **Modern pattern** | Cutting-edge (2024-2025) architecture |
| **Impressive** | Shows knowledge of latest AI engineering patterns |

#### Cons

| Drawback | Impact |
|----------|--------|
| **Very new** | Fewer examples, docs still evolving (as of 2024/2025) |
| **Overkill** | For single LLM call, this is massive over-engineering |
| **Learning curve** | Requires understanding graphs, state management |
| **Dependency** | Pulls in LangChain + LangGraph |

#### When to Choose LangGraph

- [ ] Building multi-agent system (skill assessor + recommender + evaluator)
- [ ] Complex conditional logic (if beginner → simple flow, if advanced → detailed assessment)
- [ ] You want to showcase cutting-edge AI architecture
- [ ] Conversational flow with branching logic

---

### Option D: LlamaIndex

#### What It Is

Framework focused on data ingestion, indexing, and retrieval (RAG-first design).

```python
from llama_index import VectorStoreIndex, Document
from llama_index.llms import OpenAI

# Build index
documents = [Document(text=course_json) for course_json in courses]
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine(llm=OpenAI(model="gpt-4-turbo"))
response = query_engine.query(f"Recommend courses for: {profile}\nQuery: {query}")
```

#### Pros

| Benefit | Why It Matters |
|---------|---------------|
| **RAG-optimized** | Built specifically for retrieval-augmented generation |
| **Easy indexing** | Simple API for documents → embeddings → vector store |
| **Query engines** | Pre-built patterns for Q&A over documents |
| **Data connectors** | Load from PDFs, websites, DBs easily |

#### Cons

| Drawback | Impact |
|----------|--------|
| **RAG-focused** | If you're not doing RAG, most features are irrelevant |
| **Less flexible** | Opinionated about retrieval-first workflows |
| **Smaller community** | Fewer examples than LangChain (though growing) |
| **Not needed** | For 48 courses, this is over-engineering |

#### When to Choose LlamaIndex

- [ ] You're definitely building RAG system
- [ ] You want turnkey document indexing
- [ ] You're loading courses from external sources (PDFs, websites)
- [ ] You want to showcase RAG expertise

---

### Framework Comparison Table

| Feature | OpenAI SDK | LangChain | LangGraph | LlamaIndex |
|---------|-----------|-----------|-----------|------------|
| **Learning Curve** | None | Medium | High | Medium |
| **Setup Time** | 5 min | 30 min | 1 hour | 30 min |
| **Code Complexity** | Low | Medium | High | Medium |
| **Best For** | Simple calls | Chains, agents | Multi-agent graphs | RAG systems |
| **Dependencies** | 1 package | 5+ packages | 7+ packages | 4+ packages |
| **Community Size** | Largest | Large | Small (new) | Medium |
| **AcmeLearn Fit** | ✅ Excellent | ⚠️ Overkill | ❌ Massive overkill | ❌ Unnecessary |

### My Recommendation: Direct OpenAI SDK

**Reasoning**:

1. **Your use case is simple**: Single LLM call with structured prompt
2. **Speed matters**: No learning curve, implement in hours
3. **Full control**: You own the prompt, can optimize it freely
4. **Easy debugging**: Print prompt, inspect response, done
5. **Minimal dependencies**: Less to break, easier to maintain

**When to add a framework**:
- If you decide to build multi-agent system (skill assessor + recommender)
- If you add conversational refinement (need memory management)
- If you want to impress reviewers with framework knowledge (but confirm this first)

**Migration path**: Start with SDK, wrap in LangChain/LangGraph later if needed. The core logic (prompt construction) remains the same.

---

## Area 3: Model Strategy

### The Question

Which OpenAI model should we use, and why?

### Available Models (as of late 2024/early 2025)

| Model | Context Window | Cost (Input/Output) | Speed | Quality | Best For |
|-------|---------------|---------------------|-------|---------|----------|
| **gpt-4o** | 128K tokens | $2.50/$10 per 1M tokens | Fast | Excellent | **Recommended** - Best balance |
| **gpt-4-turbo** | 128K tokens | $10/$30 per 1M tokens | Fast | Excellent | High-quality, reliable |
| **gpt-4** | 8K tokens | $30/$60 per 1M tokens | Slow | Excellent | Legacy, avoid |
| **gpt-3.5-turbo** | 16K tokens | $0.50/$1.50 per 1M tokens | Very fast | Good | Cost-sensitive, simple tasks |

**Note**: Prices are approximate and change frequently. Check OpenAI pricing page.

### Analysis

#### GPT-4o (GPT-4 Optimized)

**Launched**: May 2024
**Why it exists**: Combines GPT-4 quality with 2x speed and 50% cost reduction

**Pros**:
- Best performance/cost ratio
- Fast enough for real-time applications
- Large context window (128K tokens)
- Excellent reasoning for nuanced course matching

**Cons**:
- Still more expensive than GPT-3.5-turbo (but worth it)

**Recommendation**: **This is your best choice** unless you have specific constraints.

---

#### GPT-4 Turbo

**Launched**: November 2023
**Why it exists**: Faster, cheaper version of original GPT-4

**Pros**:
- Well-tested, reliable
- Large context window (128K tokens)
- High quality recommendations
- Lots of community examples

**Cons**:
- More expensive than GPT-4o
- Slightly slower than GPT-4o

**Recommendation**: Solid choice if GPT-4o is unavailable or you want maximum stability.

---

#### GPT-3.5 Turbo

**Launched**: March 2023
**Why it exists**: Fast, cheap model for simple tasks

**Pros**:
- Very cheap (~10x cheaper than GPT-4o)
- Very fast responses
- Fine-tunable (if you want to customize)

**Cons**:
- Weaker reasoning (might miss nuanced course matches)
- Smaller context window (16K tokens)
- May produce lower-quality explanations
- Not impressive for showcase project

**Recommendation**: **Avoid** for this use case. Cost savings not worth quality hit for 48-course catalog.

---

### Cost Analysis

**Assumptions**:
- Average request: 20K tokens input (courses + profile) + 500 tokens output (recommendations)
- 1000 requests per day

| Model | Input Cost/Day | Output Cost/Day | Total/Day | Total/Month |
|-------|---------------|----------------|-----------|-------------|
| **gpt-4o** | $0.05 | $0.05 | **$0.10** | **$3** |
| **gpt-4-turbo** | $0.20 | $0.15 | **$0.35** | **$10.50** |
| **gpt-3.5-turbo** | $0.01 | $0.01 | **$0.02** | **$0.60** |

**Key Insight**: Even with GPT-4o, costs are negligible ($3/month for 1000 daily requests). Quality matters more than cost here.

### Latency Analysis

**Typical response times** (empirical, varies):
- **gpt-4o**: 2-4 seconds for 500-token response
- **gpt-4-turbo**: 3-5 seconds for 500-token response
- **gpt-3.5-turbo**: 1-2 seconds for 500-token response

**For 48-course recommendation**: All models fast enough (<5 seconds). No need to optimize for latency.

### My Recommendation: GPT-4o

**Reasoning**:

1. **Best balance**: Quality + Speed + Cost
2. **Showcase quality**: Reviewers will test recommendations, quality matters
3. **Negligible cost**: $3/month is nothing for a demo project
4. **Future-proof**: If this becomes production, GPT-4o scales well
5. **Large context**: 128K tokens allows full course catalog + rich prompts

**Fallback**: If GPT-4o unavailable, use `gpt-4-turbo`. Avoid GPT-3.5-turbo.

**If GPT-5 models exist**: Use GPT-5-mini (likely similar to GPT-4o pricing/quality).

---

## Area 4: Implementation Patterns

### Streaming Responses

#### What It Is

Instead of waiting for full LLM response, stream tokens as they're generated:

```python
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[...],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        yield chunk.choices[0].delta.content
```

#### Pros

| Benefit | Why It Matters |
|---------|---------------|
| **Perceived speed** | Users see progress immediately |
| **Better UX** | Like ChatGPT, feels responsive |
| **Engagement** | Seeing text appear keeps users engaged |

#### Cons

| Drawback | Impact |
|----------|--------|
| **Backend complexity** | Need Server-Sent Events (SSE) or WebSockets |
| **Frontend complexity** | Handle streaming in React (TanStack Query + SSE) |
| **Error handling** | Harder to catch/parse errors mid-stream |
| **Structured outputs** | Can't guarantee valid JSON until stream completes |

#### My Recommendation: Defer Streaming

**Reasoning**:

1. **Responses are fast**: 2-4 seconds for GPT-4o is acceptable
2. **Added complexity**: SSE/WebSockets + frontend streaming logic
3. **Structured outputs first**: Get valid JSON working, then optimize UX
4. **Not critical for MVP**: Reviewers care about recommendation quality, not streaming

**When to add**: After MVP works, if user testing shows 3+ second wait feels too long.

---

### Structured Outputs / Function Calling

#### The Problem

LLM returns free text. You need structured JSON:

```json
{
  "recommendations": [
    {
      "course_id": "uuid-1",
      "title": "Course Name",
      "explanation": "Why this course matches your goals...",
      "confidence": 0.92
    }
  ]
}
```

#### Approach 1: JSON Mode

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant. Respond with JSON."},
        {"role": "user", "content": "Recommend courses..."}
    ],
    response_format={"type": "json_object"}
)

data = json.loads(response.choices[0].message.content)
```

**Pros**: Simple, works well
**Cons**: Still need to validate structure, LLM might produce invalid schema

---

#### Approach 2: Function Calling (Recommended)

```python
tools = [{
    "type": "function",
    "function": {
        "name": "recommend_courses",
        "description": "Recommend courses to user",
        "parameters": {
            "type": "object",
            "properties": {
                "recommendations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "course_id": {"type": "string"},
                            "explanation": {"type": "string"},
                            "confidence": {"type": "number"}
                        },
                        "required": ["course_id", "explanation"]
                    }
                }
            },
            "required": ["recommendations"]
        }
    }
}]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[...],
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "recommend_courses"}}
)

# Extract structured data
function_call = response.choices[0].message.tool_calls[0].function
data = json.loads(function_call.arguments)
```

**Pros**:
- Guaranteed structure (LLM forced to match schema)
- Type validation built-in
- Self-documenting (schema = contract)

**Cons**:
- More verbose code
- Slight learning curve

**Recommendation**: **Use function calling** for production reliability.

---

### Error Handling & Fallbacks

#### Retry Logic

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def get_recommendations(profile, courses, query):
    response = client.chat.completions.create(...)
    return parse_response(response)
```

**Why**: OpenAI API can have transient failures (rate limits, timeouts)

---

#### Fallback Strategies

| Error Type | Fallback Strategy |
|------------|------------------|
| **API timeout** | Retry 3x with exponential backoff |
| **Rate limit** | Wait + retry (or queue request) |
| **Invalid JSON** | Re-prompt with error message, 1 retry |
| **No courses match** | Relax filters (remove difficulty constraint), try again |
| **Complete failure** | Return rule-based recommendations (filter by tags) |

**Recommendation**: Implement retries + rule-based fallback for robustness.

---

### My Recommendations: Implementation Patterns

1. **Structured outputs**: Use function calling for guaranteed JSON schema
2. **Error handling**: Retry logic (tenacity library) + rule-based fallback
3. **Streaming**: Defer until MVP works (add later if needed)
4. **Logging**: Log all prompts + responses for debugging (Sentry, Logfire, or simple file)
5. **Caching**: Consider caching recommendations by (profile_version + query hash) for repeat requests

---

## Area 5: Context Engineering

### The Question

How do we structure the dynamic context (user profile + courses + query) for optimal LLM performance?

### Prompt Architecture Patterns

#### Pattern 1: Linear Prompt (Simple)

```
You are a learning advisor for AcmeLearn.

USER PROFILE:
- Learning Goal: Become a full-stack web developer
- Current Level: Beginner
- Time Commitment: 10 hours/week
- Interests: Web development, JavaScript, Databases

AVAILABLE COURSES (48 total):
1. Title: "Introduction to Python"
   Difficulty: Beginner
   Duration: 20 hours
   Tags: programming, python, beginner-friendly
   Skills: Python syntax, data types, functions

2. Title: "Advanced React Patterns"
   Difficulty: Advanced
   Duration: 30 hours
   ...

USER QUERY:
"I want to learn backend development"

TASK:
Recommend 3-5 courses that best match the user's profile and query.
For each course, explain WHY it's recommended.
```

**Pros**: Clear, readable, easy to debug
**Cons**: Can get very long (but 48 courses still fit)

---

#### Pattern 2: Structured Sections (Recommended)

```
SYSTEM: You are an expert learning advisor...

CONTEXT:
{
  "user": {
    "goal": "Become a full-stack web developer",
    "level": "Beginner",
    "time_per_week": 10,
    "interests": ["Web development", "JavaScript", "Databases"]
  },
  "courses": [
    {
      "id": "uuid-1",
      "title": "Introduction to Python",
      "difficulty": "Beginner",
      "duration": 20,
      "tags": ["programming", "python"],
      "skills": ["Python syntax", "data types"]
    },
    ...
  ],
  "query": "I want to learn backend development"
}

INSTRUCTIONS:
1. Analyze user's goal, level, and interests
2. Consider the specific query
3. Recommend 3-5 courses (IDs from courses list)
4. For each, explain the match reasoning
5. Order by relevance (best match first)

OUTPUT FORMAT: Use recommend_courses function
```

**Pros**: JSON structure for complex data, clear instructions
**Cons**: More verbose than linear

---

#### Pattern 3: Few-Shot Examples (High Quality)

```
SYSTEM: You are a learning advisor...

EXAMPLE 1:
User: {"goal": "Data science career", "level": "Beginner", "interests": ["Python", "Statistics"]}
Query: "Getting started with data analysis"

Recommendations:
1. "Python for Data Science" - Perfect starting point, matches Python interest and beginner level
2. "Statistics Fundamentals" - Essential for data science, beginner-friendly
3. "Data Analysis with Pandas" - Practical skills after Python basics

EXAMPLE 2:
User: {"goal": "Build mobile apps", "level": "Intermediate", "interests": ["JavaScript", "UI Design"]}
Query: "Cross-platform development"

Recommendations:
1. "React Native Essentials" - Leverages JavaScript knowledge for mobile
2. "Mobile UI Design Patterns" - Matches UI interest, practical for apps
3. "Advanced JavaScript" - Strengthen foundation before mobile frameworks

---

NOW, YOUR TURN:
User: {actual_profile}
Query: {actual_query}
Courses: {actual_courses}

Recommend courses:
```

**Pros**: Guides LLM to desired output format, quality improves
**Cons**: Uses more tokens (but worth it for quality)

---

### Dynamic Context Construction

#### Smart Pre-Filtering

```python
def build_context(user_profile, all_courses, query):
    """Dynamically filter courses before sending to LLM."""

    # Filter 1: Difficulty matching
    if user_profile.current_level == "Beginner":
        suitable_difficulties = ["Beginner"]
    elif user_profile.current_level == "Intermediate":
        suitable_difficulties = ["Beginner", "Intermediate"]
    else:  # Advanced
        suitable_difficulties = ["Intermediate", "Advanced"]

    filtered_courses = [
        c for c in all_courses
        if c.difficulty in suitable_difficulties
    ]

    # Filter 2: Time feasibility
    if user_profile.time_commitment:
        # If user has 5 hrs/week, include courses up to 60 hours (12 weeks)
        max_duration = user_profile.time_commitment * 12
        filtered_courses = [
            c for c in filtered_courses
            if c.duration <= max_duration
        ]

    # Filter 3: Interest matching (soft filter - boost score)
    user_interests = set(user_profile.interests)
    for course in filtered_courses:
        course_tags = set(course.tags)
        course.relevance_score = len(user_interests & course_tags)

    # Sort by relevance, take top 30 (reduce context size)
    filtered_courses.sort(key=lambda c: c.relevance_score, reverse=True)
    return filtered_courses[:30]
```

**Benefits**:
- Smaller prompts (30 courses vs 48)
- Higher signal-to-noise ratio
- Shows product thinking (don't recommend 40-hour courses to someone with 2 hrs/week)

---

### Context Optimization Techniques

| Technique | Example | Benefit |
|-----------|---------|---------|
| **Truncate descriptions** | Keep first 200 chars | Reduce tokens, maintain relevance |
| **Remove redundant fields** | Omit `created_at`, `id` (send index) | Smaller prompts |
| **Use abbreviations** | "Diff: Beg, Dur: 20h" | 30% token reduction |
| **Semantic compression** | Use embeddings to find top-10, send only those | Drastic reduction (not needed for 48) |

**Recommendation for AcmeLearn**: Light pre-filtering (difficulty + time) + full course details. No need for aggressive optimization with 48 courses.

---

### My Recommendation: Context Engineering

1. **Pattern**: Structured sections (JSON context + clear instructions)
2. **Pre-filtering**: Difficulty + time feasibility (reduce from 48 to ~25-30)
3. **Few-shot examples**: Include 2-3 examples for quality (worth the token cost)
4. **Function calling**: Use schema to enforce output structure
5. **Iteration**: Start simple, improve based on recommendation quality

**Example Prompt Flow**:

```python
def build_recommendation_prompt(profile, query):
    # 1. Pre-filter courses
    relevant_courses = filter_by_difficulty_and_time(profile)

    # 2. Build context JSON
    context = {
        "user": profile_to_dict(profile),
        "courses": [course_to_dict(c) for c in relevant_courses],
        "query": query
    }

    # 3. Construct prompt with examples
    messages = [
        {"role": "system", "content": ADVISOR_SYSTEM_PROMPT},
        {"role": "user", "content": FEW_SHOT_EXAMPLE_1},
        {"role": "assistant", "content": FEW_SHOT_RESPONSE_1},
        {"role": "user", "content": FEW_SHOT_EXAMPLE_2},
        {"role": "assistant", "content": FEW_SHOT_RESPONSE_2},
        {"role": "user", "content": json.dumps(context, indent=2)}
    ]

    return messages
```

---

## Questions for User

Before proceeding with implementation, please decide:

### Critical Decisions

- [ ] **Model availability**: Can you confirm which models your OpenAI API key supports? (Run the model listing command from "GPT-5 Model Availability" section)
- [ ] **RAG vs Direct**: Do you want to build RAG (impressive but complex) or direct context (fast, pragmatic)?
- [ ] **Framework**: Direct OpenAI SDK (simple) or LangChain/LangGraph (showcase framework knowledge)?
- [ ] **Model choice**: GPT-4o (recommended) or GPT-4-turbo (fallback)?

### Nice-to-Have Decisions

- [ ] **Streaming**: Should MVP include streaming responses, or add later?
- [ ] **Multi-agent**: Is multi-agent architecture (skill assessor + recommender) in scope? (Nice-to-have from requirements)
- [ ] **Conversational refinement**: Chat-based recommendation refinement in scope for MVP?
- [ ] **Confidence scores**: Should recommendations include numeric confidence (0-1)? (Nice-to-have from requirements)

### Product Decisions

- [ ] **Recommendation count**: How many courses per recommendation (3-5? 5-10?)?
- [ ] **Explanation style**: Detailed paragraphs or bullet points?
- [ ] **Ranking**: Should courses be ranked (1st, 2nd, 3rd) or unordered?
- [ ] **Duplicate handling**: If user requests recommendations twice with same profile+query, return cached or regenerate?

---

## Sources & Further Reading

### Official Documentation

- **OpenAI API Docs**: https://platform.openai.com/docs/api-reference
  - Function calling guide: https://platform.openai.com/docs/guides/function-calling
  - Prompt engineering guide: https://platform.openai.com/docs/guides/prompt-engineering
  - Model pricing: https://openai.com/pricing

- **LangChain Docs**: https://python.langchain.com/docs/get_started/introduction
- **LangGraph Docs**: https://langchain-ai.github.io/langgraph/
- **LlamaIndex Docs**: https://docs.llamaindex.ai/

### Best Practices (2024-2025)

- **"The Prompt Report"** (Anthropic, 2024): Comprehensive prompt engineering guide
- **"Building LLM Applications for Production"** (Chip Huyen, 2024): RAG, evaluation, deployment
- **"Patterns for Building LLM-based Systems"** (Eugene Yan, 2024): Architecture patterns
- **FastAPI + OpenAI**: https://github.com/tiangolo/fastapi (examples in docs)

### RAG Architecture

- **"Retrieval-Augmented Generation for Large Language Models"** (AWS, 2024)
- **"RAG vs Fine-tuning vs Prompt Engineering"** (Pinecone blog, 2024)
- **Vector DB Comparison**: Pinecone vs Weaviate vs ChromaDB benchmarks

### AcmeLearn-Specific Context

- **Project architecture**: `/Users/giorgoszarkadas/dev-workspace/AcmeLearn/docs/ARCHITECTURE.md`
- **Data strategy**: `/Users/giorgoszarkadas/dev-workspace/AcmeLearn/docs/PRODUCT_DATA_STRATEGY.md`
- **Requirements**: `/Users/giorgoszarkadas/dev-workspace/AcmeLearn/docs/recommendation-system/00-REQUIREMENTS.md`

---

## Next Steps

After you've answered the questions above:

1. **Verify model access**: Run the OpenAI models API call
2. **Make architectural decisions**: RAG vs direct, SDK vs framework
3. **Review next document**: `02-PRODUCT-STRATEGY.md` (which nice-to-have features to build)
4. **Begin implementation**: Start with simplest path (direct SDK + GPT-4o + function calling)

**Estimated Timeline**:
- MVP (basic recommendations): 4-6 hours
- Structured outputs + error handling: +2 hours
- Testing + refinement: +2 hours
- **Total**: 8-10 hours for production-ready recommendation engine

---

**Document Status**: Ready for review and decision-making
**Last Updated**: 2025-11-27
**Next Document**: `02-PRODUCT-STRATEGY.md` (which features to prioritize)
