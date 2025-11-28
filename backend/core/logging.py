"""
Structured JSON logging configuration.

Configures Python logging to output JSON format for better observability.
"""

import logging
import sys
from pythonjsonlogger import jsonlogger


def setup_logging(level: str = "INFO") -> None:
    """
    Configure JSON-structured logging for the application.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
    """
    # Create handler that writes to stdout
    handler = logging.StreamHandler(sys.stdout)

    # JSON formatter with standard fields
    formatter = jsonlogger.JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    handler.setFormatter(formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.handlers = []  # Remove any existing handlers
    root_logger.addHandler(handler)
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Set specific loggers to appropriate levels
    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    logging.info("JSON logging initialized", extra={"level": level})
