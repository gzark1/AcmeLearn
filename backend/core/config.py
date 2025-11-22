"""
Application configuration.

Settings for database connections and other app-wide configs.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Defaults are suitable for local development.
    """
    # Database
    DATABASE_URL: str = "sqlite:///./acmelearn.db"

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AcmeLearn API"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
