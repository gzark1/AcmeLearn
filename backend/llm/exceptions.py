"""
Custom exceptions for LLM operations.

Provides semantic error types for different failure modes.
"""


class LLMError(Exception):
    """Base exception for all LLM-related errors."""

    pass


class LLMTimeoutError(LLMError):
    """LLM request exceeded timeout (default 30s)."""

    def __init__(self, message: str = "LLM request timed out"):
        self.message = message
        super().__init__(self.message)


class LLMValidationError(LLMError):
    """LLM returned response that failed Pydantic validation."""

    def __init__(self, message: str = "LLM returned invalid response"):
        self.message = message
        super().__init__(self.message)


class LLMEmptyProfileError(LLMError):
    """User profile too empty for meaningful recommendations."""

    def __init__(
        self, message: str = "Profile needs more information for recommendations"
    ):
        self.message = message
        super().__init__(self.message)


class LLMNoCoursesError(LLMError):
    """No courses match after pre-filtering."""

    def __init__(self, message: str = "No courses match your current preferences"):
        self.message = message
        super().__init__(self.message)
