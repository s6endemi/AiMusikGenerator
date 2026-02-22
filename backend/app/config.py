from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Google Cloud / Vertex AI
    google_cloud_project: str = ""
    google_application_credentials: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id: str = ""

    # App
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"

    # Limits
    max_video_duration_seconds: int = 30
    max_video_size_mb: int = 50
    free_credits_on_signup: int = 3

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
