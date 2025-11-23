"""
Application configuration.

Settings for database connections and other app-wide configs.
"""
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

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AcmeLearn API"

    class Config:
        env_file = "../.env"  # Load from project root
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars (like POSTGRES_*)


settings = Settings()
