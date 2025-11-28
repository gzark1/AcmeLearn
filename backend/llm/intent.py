"""
Query intent classification for recommendation system.

Uses a brief LLM call to classify intent - handles nuance better than keywords.
"""

from enum import Enum
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from llm.config import get_llm


class QueryIntent(Enum):
    """Classification of user query intent."""

    SPECIFIC = "specific"  # Clear learning request with topic
    VAGUE = "vague"  # Wants to learn but no clear direction
    NO_QUERY = "no_query"  # Empty or None
    IRRELEVANT = "irrelevant"  # Not learning-related


class IntentClassification(BaseModel):
    """LLM output for intent classification."""

    intent: str = Field(
        description="One of: 'specific', 'vague', 'irrelevant'. "
        "'specific' = clear topic (e.g., 'I want to learn sales'). "
        "'vague' = wants to learn but unclear what (e.g., 'not sure what to learn'). "
        "'irrelevant' = not about learning (e.g., 'what's the weather')."
    )


INTENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Classify this learning platform query. Return ONE word:

- "specific": Clear learning topic (e.g., "teach me Python", "sales skills", "data science")
- "vague": Wants to learn but unclear what (e.g., "not sure what to learn", "help me decide", "recommend something")
- "irrelevant": Greetings, chitchat, or non-learning (e.g., "hey", "hiii", "hello", "sup", "what's the weather", "thanks")

Greetings like "hi", "hey", "heyyyy", "yo", "sup" are IRRELEVANT - they're not learning requests."""),
    ("human", "{query}")
])


async def classify_intent(query: Optional[str]) -> QueryIntent:
    """
    Classify query intent using a brief LLM call.

    Args:
        query: User's recommendation query (may be None or empty)

    Returns:
        QueryIntent classification
    """
    # Fast path: empty queries don't need LLM
    if not query or not query.strip():
        return QueryIntent.NO_QUERY

    query_clean = query.strip()

    # Use LLM for all non-empty queries
    try:
        llm = get_llm()
        chain = INTENT_PROMPT | llm.with_structured_output(IntentClassification)
        result = await chain.ainvoke({"query": query_clean})

        intent_map = {
            "specific": QueryIntent.SPECIFIC,
            "vague": QueryIntent.VAGUE,
            "irrelevant": QueryIntent.IRRELEVANT,
        }
        return intent_map.get(result.intent.lower(), QueryIntent.VAGUE)

    except Exception:
        # On LLM failure, default to SPECIFIC (let the pipeline handle it)
        return QueryIntent.SPECIFIC


# Response messages for edge cases (used when no profile to fall back on)
INTENT_MESSAGES = {
    QueryIntent.IRRELEVANT: (
        "I'm your learning advisor at AcmeLearn! I help you discover courses "
        "that match your goals.\n\n"
        "What would you like to learn? For example:\n"
        "- 'I want to improve my leadership skills'\n"
        "- 'Help me learn data science'\n"
        "- 'I'm interested in sales and negotiation'"
    ),
    QueryIntent.VAGUE: (
        "I'd love to help you find the perfect course! "
        "Could you tell me more about what you'd like to learn?\n\n"
        "For example, are you interested in:\n"
        "- Technology (programming, data, AI)\n"
        "- Business (sales, marketing, management)\n"
        "- Personal development (leadership, communication)"
    ),
}


def get_intent_message(intent: QueryIntent) -> Optional[str]:
    """Get the redirect message for an intent, if applicable."""
    return INTENT_MESSAGES.get(intent)
