"""
LLM callback handlers for metrics and logging.

Captures token usage, timing, and other metrics from LangChain LLM calls.
"""

import logging
import time
from typing import Any, Dict, List, Optional
from uuid import UUID

from langchain_core.callbacks import BaseCallbackHandler

logger = logging.getLogger(__name__)


class LLMMetricsCallback(BaseCallbackHandler):
    """
    Callback handler to capture LLM metrics.

    Logs token usage, timing, and operation info for each LLM call.
    Metrics are stored on the callback instance for later retrieval.
    """

    def __init__(self, operation: str, user_id: Optional[str] = None):
        """
        Initialize the callback.

        Args:
            operation: Name of the operation (e.g., 'profile_analysis', 'course_recommendation')
            user_id: Optional user ID for logging context
        """
        super().__init__()
        self.operation = operation
        self.user_id = user_id
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None
        self.tokens_input: int = 0
        self.tokens_output: int = 0
        self.model: Optional[str] = None
        self.error: Optional[str] = None

    @property
    def duration_ms(self) -> int:
        """Get duration in milliseconds."""
        if self.start_time and self.end_time:
            return int((self.end_time - self.start_time) * 1000)
        return 0

    @property
    def tokens_total(self) -> int:
        """Get total token count."""
        return self.tokens_input + self.tokens_output

    def on_llm_start(
        self,
        serialized: Dict[str, Any],
        prompts: List[str],
        **kwargs: Any,
    ) -> None:
        """Called when LLM starts processing."""
        self.start_time = time.time()
        self.model = serialized.get("kwargs", {}).get("model_name") or serialized.get("name")

    def on_llm_end(self, response: Any, **kwargs: Any) -> None:
        """Called when LLM completes successfully."""
        self.end_time = time.time()

        # Extract token usage from response
        # LangChain stores this in llm_output for OpenAI models
        if hasattr(response, "llm_output") and response.llm_output:
            usage = response.llm_output.get("token_usage", {})
            self.tokens_input = usage.get("prompt_tokens", 0)
            self.tokens_output = usage.get("completion_tokens", 0)

        # Log the metrics
        logger.info(
            "LLM call completed",
            extra={
                "operation": self.operation,
                "user_id": self.user_id,
                "model": self.model,
                "duration_ms": self.duration_ms,
                "tokens_input": self.tokens_input,
                "tokens_output": self.tokens_output,
                "tokens_total": self.tokens_total,
                "status": "success",
            },
        )

    def on_llm_error(self, error: BaseException, **kwargs: Any) -> None:
        """Called when LLM encounters an error."""
        self.end_time = time.time()
        self.error = str(error)

        logger.error(
            "LLM call failed",
            extra={
                "operation": self.operation,
                "user_id": self.user_id,
                "model": self.model,
                "duration_ms": self.duration_ms,
                "status": "error",
                "error": self.error,
            },
        )

    def get_metrics(self) -> Dict[str, Any]:
        """
        Get metrics as a dictionary for storage.

        Returns:
            Dict with all captured metrics
        """
        return {
            "operation": self.operation,
            "user_id": self.user_id,
            "model": self.model,
            "duration_ms": self.duration_ms,
            "tokens_input": self.tokens_input,
            "tokens_output": self.tokens_output,
            "tokens_total": self.tokens_total,
            "status": "error" if self.error else "success",
            "error": self.error,
        }
