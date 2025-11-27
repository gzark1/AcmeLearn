# Technical Decisions - Recommendation System

**Last Updated**: 2025-11-27
**Status**: Decisions Finalized
**Purpose**: Technology choices, research findings, and architectural decisions

> **Implementation Details**: See `05-ARCHITECTURE.md` for Pydantic models, agent code, prompts, and API specifications.

---

## 1. Technology Decisions

### 1.1 Stack Summary

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | LangChain | Provides prompt templates, chain composition, built-in memory/agent support for future features |
| **Primary Model** | GPT-5-nano-2025-08-07 | Fast, cost-efficient - **always used** (user tests mini manually when needed) |
| **RAG** | No | 48 courses (~18K tokens) fit in context window - direct injection |
| **Structured Outputs** | Yes | LangChain + Pydantic for type-safe JSON responses |
| **Logging** | Yes | Log all prompts, responses, confidence scores for debugging |
| **Caching** | No (Phase 1) | Defer until usage patterns known, may add later |
| **Pre-filtering** | Yes (Moderate) | Filter by difficulty/tags/time before LLM (48 → ~30 courses) |
| **Few-shot Examples** | Yes | 2-3 examples in prompt to guide output quality |
| **Multi-agent** | Yes | **Enhanced 2-agent system** with profile history (see Section 10) ✅ CONFIRMED |
| **Confidence Scores** | Yes | Return numeric confidence (0-1) per recommendation |
| **Learning Path** | 2-3 courses | Clear, focused sequence ✅ CONFIRMED |

### 1.2 Model Strategy

**Always: GPT-5-nano-2025-08-07** ✅ CONFIRMED
- Fast response times (~1-2s)
- Cost-efficient for high volume
- Sufficient reasoning for recommendation tasks
- **No automatic fallback** - user will explicitly test with GPT-5-mini when needed

**GPT-5-mini-2025-08-07** (Manual Testing Only)
- Available for manual A/B testing when user requests
- Better reasoning for complex edge cases
- ~2-3x cost but better quality
- **NOT automatically triggered** - user controls when to use

**No RAG Required**
- 48 courses × ~1500 bytes = ~72KB = ~18K tokens
- GPT-5 context window: 128K tokens (plenty of room)
- Full catalog + profile + instructions + examples = ~25K tokens total
- Direct injection simpler, faster, higher quality than retrieval

### 1.3 Framework: LangChain

**Why LangChain over OpenAI SDK:**
- Prompt template management (reusable, version-controlled)
- Chain composition for multi-agent system
- Built-in support for conversation memory (Phase 3)
- Pydantic integration for structured outputs
- Easy to add streaming later (Phase 2)

**What we're NOT using (and why):**
- LangGraph: Overkill for 2-agent system, adds complexity
- LlamaIndex: RAG-focused, not needed for 48 courses
- Raw OpenAI SDK: Would require manual prompt management, memory handling

---

## 2. Architecture Overview

### 2.1 System Flow (High-Level)

**NOTE**: See Section 10 for detailed multi-agent architecture design.

```
User Request
    ↓
FastAPI Endpoint (/api/recommendations)
    ↓
RecommendationService
    ↓
┌─────────────────────────────────────────────┐
│  Multi-Agent Chain (LangChain)              │
│                                             │
│  Agent 1: Profile & Context Analyzer        │
│  - Analyzes user profile + history          │
│  - Determines skill level & gaps            │
│  - Ranks interests by relevance             │
│  - Outputs: ProfileAnalysis (structured)    │
│                                             │
│           ↓                                 │
│                                             │
│  Context-Aware Pre-Filtering (Python)       │
│  - Filter by difficulty, tags, duration     │
│  - 48 courses → 30 filtered courses         │
│                                             │
│           ↓                                 │
│                                             │
│  Agent 2: Course Recommender & Explainer    │
│  - Receives profile analysis + courses      │
│  - Generates personalized recommendations   │
│  - Rich explanations + learning path (2-3)  │
│  - Outputs: RecommendationResponse          │
│                                             │
└─────────────────────────────────────────────┘
    ↓
Pydantic Validation
    ↓
Database Logging (optional)
    ↓
JSON Response to Frontend
```

### 2.2 Data Flow

**Input:**
```python
{
  "user_profile": {
    "goal": "Become a full-stack developer",
    "current_level": "Beginner",
    "time_commitment": 10,  # hours/week
    "interests": ["JavaScript", "Web Development"]
  },
  "query": "I want to learn backend development",
  "num_recommendations": 5
}
```

**Output:**
```python
{
  "recommendations": [
    {
      "course_id": "uuid-1",
      "title": "Node.js Fundamentals",
      "explanation": "Perfect match for backend development goal...",
      "confidence": 0.92,
      "estimated_duration": 25  # hours
    },
    # ... more recommendations
  ],
  "skill_assessment": {
    "detected_level": "Beginner",
    "skill_gaps": ["Server-side programming", "Database fundamentals"],
    "reasoning": "Based on profile analysis..."
  }
}
```

---

## 3. Research Findings

### 3.1 Pydantic AI

**What is it?**
- Agent framework built on Pydantic (released late 2024)
- Focus: Type-safe LLM applications with structured outputs
- Multi-model support (OpenAI, Anthropic, Gemini, Groq)

**Key Features:**
- First-class Pydantic model validation
- Dependency injection for agents
- Built-in testing utilities
- Less abstraction overhead than LangChain

**Comparison to LangChain:**

| Aspect | Pydantic AI | LangChain |
|--------|-------------|-----------|
| **Type Safety** | Pydantic-native, excellent | Good with Pydantic integration |
| **Complexity** | Simpler, less abstraction | More comprehensive, steeper curve |
| **Ecosystem** | New (late 2024), smaller | Mature, large community |
| **Focus** | Agents + structured outputs | Broad (chains, memory, RAG, agents) |
| **Multi-agent** | Good support | Excellent support |
| **Memory/Streaming** | Basic | Advanced, production-ready |

**Should we use it?**

**NO - stick with LangChain for AcmeLearn**

**Reasoning:**
1. **Maturity**: LangChain has 2+ years of production use, better docs
2. **Features we need**: Conversation memory (Phase 3), streaming (Phase 2) - LangChain has battle-tested implementations
3. **Community**: More examples, Stack Overflow answers, tutorials
4. **Pydantic integration**: LangChain already has excellent Pydantic support via `with_structured_output()`
5. **Risk**: Pydantic AI too new for production use (late 2024 release)

**When to consider Pydantic AI:**
- If you're ONLY doing structured outputs (no memory, no streaming)
- If you want cutting-edge type safety
- For greenfield projects in 2025+

### 3.2 LangChain Logging

**Implementation:**

```python
from langchain.callbacks import FileCallbackHandler
from langchain.callbacks.manager import CallbackManager
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# LangChain callback for detailed tracing
callback_handler = FileCallbackHandler("logs/langchain.log")
callback_manager = CallbackManager([callback_handler])

# Use in chain
chain = LLMChain(
    llm=llm,
    prompt=prompt,
    callbacks=callback_manager
)
```

**What to log:**
- All prompts sent to LLM (for debugging)
- All LLM responses (raw JSON)
- Confidence scores
- Model used (nano vs mini)
- Latency per request
- Errors and retries

**Log structure:**
```json
{
  "timestamp": "2025-11-27T10:30:00Z",
  "user_id": "uuid",
  "model": "gpt-5-nano",
  "prompt_tokens": 18500,
  "completion_tokens": 450,
  "latency_ms": 1850,
  "confidence_avg": 0.87,
  "fallback_triggered": false,
  "recommendations_count": 5
}
```

**Storage:** File-based for MVP, consider Postgres/Logfire for production

---

## 4. Incremental Features

### 4.1 Streaming Responses

**Can we add later?** ✅ YES

**Current Approach (Phase 1):**
```python
# Blocking call - wait for full response
result = chain.invoke({"profile": profile, "query": query})
return result
```

**Future Approach (Phase 2):**
```python
# Streaming - yield tokens as generated
async def stream_recommendations(profile, query):
    async for chunk in chain.astream({"profile": profile, "query": query}):
        yield chunk

# FastAPI endpoint
from fastapi.responses import StreamingResponse

@router.post("/recommendations/stream")
async def stream_recs(request: RecommendationRequest):
    return StreamingResponse(
        stream_recommendations(request.profile, request.query),
        media_type="text/event-stream"
    )
```

**What to design upfront:**
- **NOTHING** - LangChain chains work identically with `.invoke()` and `.astream()`
- Same prompt templates
- Same chain structure
- Just swap method call

**Frontend changes (Phase 2):**
- Add SSE (Server-Sent Events) handling
- Display recommendations as they stream in
- TanStack Query doesn't have native SSE support, use `fetch()` + EventSource

**Recommendation:** Start with `.invoke()`, add streaming after MVP proves value

---

### 4.2 Conversational Refinement

**Can we add later?** ✅ YES

**Current Approach (Phase 1 - Stateless):**
```python
# Each request is independent
chain = prompt | llm | output_parser

result = chain.invoke({
    "profile": user_profile,
    "query": "I want to learn backend",
    "courses": filtered_courses
})
```

**Future Approach (Phase 3 - With Memory):**
```python
from langchain.memory import ConversationBufferMemory
from langchain.schema.runnable import RunnableWithMessageHistory

# Add memory to chain
memory = ConversationBufferMemory(
    return_messages=True,
    memory_key="chat_history"
)

chain_with_memory = RunnableWithMessageHistory(
    runnable=chain,
    get_session_history=lambda session_id: get_memory_for_user(session_id),
    input_messages_key="query",
    history_messages_key="chat_history"
)

# Now chain remembers previous recommendations
result = chain_with_memory.invoke(
    {"profile": user_profile, "query": "Show me more advanced ones"},
    config={"configurable": {"session_id": user.id}}
)
```

**What to design upfront:**

**Prompt must include placeholder for history:**
```python
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a learning advisor..."),
    MessagesPlaceholder(variable_name="chat_history"),  # ADD THIS
    ("user", "Profile: {profile}\nQuery: {query}\nCourses: {courses}")
])
```

**This works NOW** (empty history) and **Phase 3** (with history), no refactoring needed.

**Memory Storage Options:**
- **Phase 1**: Not needed
- **Phase 3 MVP**: In-memory (ConversationBufferMemory)
- **Phase 3 Production**: Postgres (SQLChatMessageHistory) or Redis

**Conversational Use Cases (Phase 3):**
- "Show me shorter courses" (refine previous recommendations)
- "I'm not interested in Python, show me JavaScript instead"
- "Make them more beginner-friendly"

**Recommendation:** Design prompts with `MessagesPlaceholder` now, add memory in Phase 3

---

## 5. Backend Integration

> **MOVED**: Detailed backend implementation (service layer, API endpoints, error handling) is now in **`05-ARCHITECTURE.md`**.

This section contained:
- Service layer pattern with LangChain
- API endpoint definitions
- Error handling strategy
- Retry logic implementation

**See**: `05-ARCHITECTURE.md` for complete implementation details.

---

## 6. Deployment

### 6.1 Dependencies

**Add to `backend/requirements.txt`:**
```
langchain==0.1.0
langchain-openai==0.0.5
pydantic==2.5.0
tenacity==8.2.3  # For retry logic
```

**No additional services needed:**
- No vector database (no RAG)
- No Redis (memory in Phase 3, can be in-process)
- No special infrastructure

### 6.2 Environment Variables

**Add to `.env`:**
```bash
# Already exists
OPENAI_API_KEY=sk-...
OPENAI_API_KEY2=sk-...

# Add these
OPENAI_MODEL=gpt-5-nano-2025-08-07  # Always use nano (user tests mini manually)
RECOMMENDATION_MAX_COURSES=5
RECOMMENDATION_LEARNING_PATH_SIZE=3  # 2-3 course sequences
```

### 6.3 Docker Considerations

**No changes needed to `docker-compose.yml`**

The LangChain service runs inside the existing `backend` container:
- LangChain is just a Python library (pip install)
- No separate service required
- OpenAI API calls go over HTTP (no special networking)

**Dockerfile updates (if needed):**
```dockerfile
# backend/Dockerfile
RUN pip install langchain langchain-openai tenacity
```

### 6.4 Performance Considerations

**Expected Latency:**
- GPT-5-nano: 1-2 seconds (fast)
- GPT-5-mini: 2-4 seconds (fallback)
- Pre-filtering: <50ms (in-memory)
- Total: <2.5 seconds P95

**Cost Estimates (approximate):**
- Request size: 20K input tokens + 500 output tokens
- GPT-5-nano cost: ~$0.0001 per request (assuming similar to GPT-4o)
- 1000 requests/day = $0.10/day = $3/month
- Negligible for demo/MVP

**Scaling:**
- Stateless service (no in-memory state in Phase 1)
- Can scale horizontally (multiple backend containers)
- OpenAI API handles rate limiting

---

## 7. Implementation Phases

### Phase 1: Basic Recommendations (MVP)
**Timeline: 8-10 hours**

**Features:**
- ✅ Multi-agent chain (skill assessor + recommender)
- ✅ Structured outputs (Pydantic validation)
- ✅ Pre-filtering (difficulty + time)
- ✅ Confidence scores
- ✅ Error handling + fallback
- ✅ Logging
- ✅ GPT-5-nano + mini fallback

**What's NOT included:**
- ❌ Streaming
- ❌ Conversation memory
- ❌ Caching
- ❌ Advanced analytics

**Deliverable:** FastAPI endpoint that returns JSON recommendations

---

### Phase 2: Streaming UX
**Timeline: +4 hours**

**Changes:**
- Add `.astream()` to chain invocation
- Add SSE endpoint (`/recommendations/stream`)
- Frontend: Add EventSource handling
- Display recommendations as they appear

**No backend refactoring needed** - just add new endpoint

---

### Phase 3: Conversational Refinement
**Timeline: +6 hours**

**Changes:**
- Add `ConversationBufferMemory`
- Store conversation history (in-memory or Postgres)
- Add session management
- Frontend: Add chat interface for refinement

**Prompt already prepared** (MessagesPlaceholder in place)

---

## 8. Remaining Questions

### Answered ✅
- [x] Pydantic AI vs LangChain → **LangChain** (more mature)
- [x] Can we add streaming later? → **YES** (no upfront design needed)
- [x] Can we add memory later? → **YES** (just add MessagesPlaceholder to prompt now)
- [x] How to integrate with FastAPI? → **Service layer pattern**
- [x] Docker considerations? → **None** (standard pip install)

### Open Questions ❓
None - ready to implement

---

## 9. Sources & References

### Official Documentation
- **LangChain Docs**: https://python.langchain.com/docs/get_started/introduction
- **LangChain Expression Language (LCEL)**: https://python.langchain.com/docs/expression_language/
- **Structured Outputs**: https://python.langchain.com/docs/modules/model_io/output_parsers/
- **OpenAI API**: https://platform.openai.com/docs/api-reference
- **Pydantic AI**: https://ai.pydantic.dev/ (comparison reference)

### Implementation Guides
- **LangChain + FastAPI**: https://python.langchain.com/docs/integrations/platforms/fastapi
- **Streaming with LangChain**: https://python.langchain.com/docs/expression_language/streaming
- **Memory/Chat History**: https://python.langchain.com/docs/modules/memory/
- **Multi-Agent Systems**: https://python.langchain.com/docs/use_cases/multi_agent/

### Best Practices (2024-2025)
- **"Building LLM Applications for Production"** (Chip Huyen, 2024)
- **"Patterns for Building LLM-based Systems"** (Eugene Yan, 2024)
- **OpenAI Function Calling Guide**: https://platform.openai.com/docs/guides/function-calling

### AcmeLearn Context
- **Backend Architecture**: `/docs/ARCHITECTURE.md`
- **Data Strategy**: `/docs/PRODUCT_DATA_STRATEGY.md`
- **Requirements**: `/docs/recommendation-system/00-REQUIREMENTS.md`

---

## 10. Multi-Agent Architecture Design (DETAILED)

### 10.1 Architecture Decision ✅ CONFIRMED

**Chosen Approach**: **Enhanced 2-Agent System with Context-Aware Filtering** ✅

After analyzing research from EduPlanner, GenMentor, and FACET multi-agent systems, plus AcmeLearn's specific data model and constraints, the **enhanced 2-agent architecture** was selected - balancing sophistication with pragmatic implementation.

**Why Not 3-Agent or Adversarial?**
- **3-Agent** (Assessor → Matcher → Explainer): Adds latency (3 sequential LLM calls), complexity, without proportional quality gain for 48 courses
- **Adversarial** (Recommender → Critic → Optimizer): Research-grade approach, 3x cost, 3x latency, requires fine-tuning for optimal performance
- **2-Agent Enhanced**: Optimal for MVP - sophisticated enough to showcase multi-agent patterns, fast enough for good UX (<3s total)

### 10.2 Implementation Details

> **MOVED**: Detailed agent definitions, orchestration flow, pre-filtering logic, data flow diagrams, and edge case handling are now in **`05-ARCHITECTURE.md`**.

This section contained:
- Agent 1 (Profile Analyzer) definition and prompts
- Agent 2 (Course Recommender) definition and prompts
- Orchestration flow with code
- Pre-filtering algorithm (scoring strategy)
- Data flow diagram
- Edge case handling matrix
- Agent communication protocol
- Phase 3 conversation context design

**See**: `05-ARCHITECTURE.md` for complete implementation details including:
- Full Pydantic model definitions
- Detailed prompt templates (educational style)
- Python filtering code
- API endpoint specifications
- Database schema updates

---

### 10.3 Decisions Summary ✅ ALL ANSWERED

#### Critical Questions - ANSWERED

1. **Multi-Agent Architecture Choice** ✅ **CONFIRMED**
   - **Decision**: Enhanced 2-agent system with profile history
   - **Rationale**: Optimal balance of sophistication and implementation speed

2. **Pre-Filtering Aggressiveness** ✅ **MODERATE CONFIRMED**
   - **Decision**: Moderate filtering (48 → ~30 courses)
   - **Rationale**: Balance between variety and relevance

3. **Model Strategy** ✅ **ALWAYS GPT-5-NANO**
   - **Decision**: Always use GPT-5-nano, no automatic fallback
   - **Rationale**: User will explicitly test with GPT-5-mini when needed
   - **Note**: Removed confidence-based fallback logic

4. **Learning Path Preview Depth** ✅ **2-3 COURSES**
   - **Decision**: 2-3 course learning paths
   - **Rationale**: Clearer, more focused sequences

#### Optional Questions - DEFAULTS ACCEPTED

5. **Rule-Based Fallback Sophistication** ✅ **OPTION A**
   - **Decision**: Simple tag matching + difficulty filter
   - **Rationale**: Sufficient for MVP, low complexity

6. **Profile History Depth** ✅ **3 SNAPSHOTS**
   - **Decision**: Last 3 profile snapshots
   - **Rationale**: Balance between insight and context size

---

### 10.4 Contradictions Found (None Major)

**Between TECHNICAL-LANDSCAPE.md and PRODUCT-STRATEGY.md**:

✅ **No Major Contradictions** - Both documents align on:
- Multi-agent system confirmed (2-agent system mentioned)
- Pre-filtering strategy confirmed
- Confidence scores confirmed
- Streaming deferred to Phase 2
- Conversational refinement deferred to Phase 3

**Minor Clarifications Needed**:

1. **"Skill Assessor" vs "Profile Analyzer"** (Naming)
   - TECHNICAL-LANDSCAPE uses "Skill Assessor"
   - This design uses "Profile & Context Analyzer" (more accurate - also analyzes goals, interests, time)
   - **Resolution**: Update naming to "Profile & Context Analyzer" for clarity

2. **Pre-filtering Detail** (Specificity)
   - TECHNICAL-LANDSCAPE says "filter by difficulty/time" (vague)
   - This design specifies 4-step filtering (difficulty, tags, duration, query keywords)
   - **Resolution**: This design provides the detailed specification

3. **Conversation Context Handling** (Phase 3)
   - PRODUCT-STRATEGY says "deferred to Phase 3" but doesn't specify how
   - This design includes `MessagesPlaceholder` and empty `conversation_context=[]` in Phase 1
   - **Resolution**: Phase 1 implementation will include placeholder (works with empty list), Phase 3 populates it

---

### 10.5 Implementation Checklist

> **See**: `05-ARCHITECTURE.md` for detailed implementation code and specifications.

**Phase 1 (MVP) - Core Multi-Agent System**:
- [ ] Create `backend/llm/` module structure
- [ ] Create Pydantic models (`ProfileAnalysis`, `RecommendationOutput`)
- [ ] Implement pre-filtering logic (`llm/filters.py`)
- [ ] Implement Agent 1 (`ProfileAnalyzerAgent`)
- [ ] Implement Agent 2 (`CourseRecommenderAgent`)
- [ ] Create detailed prompt templates (educational style)
- [ ] Extend `RecommendationService.generate_recommendations()`
- [ ] Create API endpoint (`POST /recommendations/generate`)
- [ ] Add database migration (JSONB columns)
- [ ] Add logging for both agents
- [ ] Test with various profile/query combinations

**Phase 2 (Streaming)**:
- [ ] Add `.astream()` to Agent 2
- [ ] Create SSE endpoint (`/recommendations/stream`)
- [ ] Frontend: Add EventSource handling

**Phase 3 (Conversational)**:
- [ ] Add `ConversationBufferMemory` to orchestration
- [ ] Implement refinement intent detection
- [ ] (Production) Migrate to `SQLChatMessageHistory`

---

### 10.6 Success Metrics

**How to Measure Multi-Agent System Quality**:

1. **Latency** (Performance):
   - Target: P95 latency < 3 seconds (total pipeline)
   - Agent 1: <1s, Agent 2: <1.5s, Filtering: <100ms
   - Monitor via logging, alert if P95 > 4s

2. **Confidence Scores** (Quality Indicator):
   - Target: Overall confidence > 0.7 for 80% of requests
   - If confidence consistently <0.6, prompts need tuning
   - Track per-agent confidence separately

3. **Error Rate** (Reliability):
   - Target: Rule-based fallback <5% (LLM should rarely fail completely)
   - No automatic model fallback (user tests mini manually)
   - High error rate = prompt issues or API problems

4. **User Actions** (Proxy for Quality):
   - Phase 1: Can't measure (no user feedback system)
   - Phase 3+: Track "View Course" clicks from recommendations
   - Target: >40% of recommendations get clicked (proxy for relevance)

5. **Cost** (Efficiency):
   - Target: Average cost per request <$0.0002 (nano pricing)
   - Always use GPT-5-nano (consistent, predictable costs)
   - Manual GPT-5-mini testing when user requests

---

## 11. Next Steps

1. ✅ **Review this multi-agent architecture design** - DONE
2. ✅ **Answer critical questions** (Section 10.9) - ALL ANSWERED
3. **Begin Phase 1 implementation**:
   - Create `backend/services/recommendation_service.py` with orchestration flow
   - Create `backend/schemas/recommendations.py` with Pydantic models
   - Create `backend/api/routes/recommendations.py` with FastAPI endpoints
   - Write Agent 1 and Agent 2 prompt templates
   - Implement context-aware pre-filtering
   - Add dependencies to `requirements.txt` (langchain, langchain-openai, tenacity)
   - Test with curl and various profile/query combinations

**Estimated Timeline** (Updated):
- Phase 1 (Enhanced 2-Agent MVP): 10-12 hours (more sophisticated than originally estimated)
- Phase 2 (Streaming): +4 hours
- Phase 3 (Conversational Memory): +6 hours
- **Total**: 20-22 hours for full feature set

**Ready to implement!**

---

**Document Status**: ✅ DECISIONS DOCUMENT - Implementation details moved to 05-ARCHITECTURE.md
**Last Updated**: 2025-11-27
**Related Documents**:
- `05-ARCHITECTURE.md` - Detailed backend implementation (Pydantic models, agents, prompts, API)
- `02-PRODUCT-STRATEGY.md` - Feature prioritization and UX decisions
