import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Project
    PROJECT_NAME: str = 'Just a Drop'
    VERSION: str = '1.0.0'
    ENVIRONMENT: str = 'development'
    
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10
    
    # Security
    SECRET_KEY: str
    ALLOWED_ORIGINS: List[str] = ['http://localhost:3000', 'http://localhost:8000']
    
    # API
    API_PREFIX: str = '/api'
    
    model_config = SettingsConfigDict(
        env_file='.env',
        case_sensitive=True,
        extra='ignore'  # Ignore extra environment variables
    )


# Initialize settings
settings = Settings()

