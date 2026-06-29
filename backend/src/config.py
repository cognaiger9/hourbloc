from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "HourBloc API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""  # Anon key for client-side operations
    SUPABASE_SERVICE_KEY: str = ""  # Service role key for admin operations

    # Access control
    INVITE_CODE: str = ""  # Secret code users must redeem to gain access

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            # Handle comma-separated string from .env
            return [origin.strip() for origin in v.split(",")]
        elif isinstance(v, list):
            return v
        return []

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()


