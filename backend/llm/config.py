"""
LangChain LLM configuration.

Uses LangChain v1.0 patterns with OpenAI GPT-5-nano.
"""

import logging
from functools import lru_cache

from langchain_openai import ChatOpenAI

from core.config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_llm() -> ChatOpenAI:
    """
    Get configured LangChain LLM instance (singleton).

    Always uses GPT-5-nano. User tests with mini manually when needed.

    Returns:
        ChatOpenAI instance configured for recommendations

    Raises:
        ValueError: If OPENAI_API_KEY not configured
    """
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not configured in environment")

    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        temperature=settings.OPENAI_TEMPERATURE,
        timeout=settings.OPENAI_TIMEOUT_SECONDS,
        api_key=settings.OPENAI_API_KEY,
    )

    if settings.LLM_DEBUG_MODE:
        logger.info(
            f"LLM initialized: model={settings.OPENAI_MODEL}, "
            f"temp={settings.OPENAI_TEMPERATURE}"
        )

    return llm
