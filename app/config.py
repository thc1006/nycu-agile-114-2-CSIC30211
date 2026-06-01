from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "CampusEats API"
    APP_ENV: str = "development"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str | None = None

    JWT_SECRET_KEY: str = "dev-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Comma-separated list of browser origins allowed to call the API (CORS).
    # Defaults cover the Vite dev server (5173) and the preview/build server (4173)
    # used by the frontend E2E. Override via the CORS_ORIGINS env var in prod (#12).
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:4173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()