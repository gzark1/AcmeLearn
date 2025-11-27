"""
Application configuration.

Settings for database connections and other app-wide configs.
"""
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings must be provided via .env file.
    """
    # Database
    DATABASE_URL: str

    # Authentication
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Superuser (optional - creates admin on startup)
    SUPERUSER_EMAIL: Optional[str] = None
    SUPERUSER_PASSWORD: Optional[str] = None

    # Demo User Seeding (for assessment/demos)
    SEED_DEMO_USERS: bool = False
    DEMO_USER_PASSWORD: Optional[str] = None

    # OpenAI / LLM Configuration
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-5-nano"
    OPENAI_TEMPERATURE: float = 0.3  # Lower for more consistent outputs
    OPENAI_TIMEOUT_SECONDS: int = 120

    # LLM Feature Flags
    LLM_ENABLED: bool = True
    LLM_DEBUG_MODE: bool = False  # Log prompts/responses when True

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AcmeLearn API"

    class Config:
        env_file = "../.env"  # Load from project root
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars (like POSTGRES_*)


settings = Settings()
