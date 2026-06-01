from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Known weak/placeholder values that must never be used to sign real tokens.
_WEAK_JWT_SECRETS = frozenset(
    {"dev-secret-key", "change-this-in-production", "secret", "changeme", ""}
)


class Settings(BaseSettings):
    APP_NAME: str = "CampusEats API"
    APP_ENV: str = "development"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str | None = None

    # No insecure default (#8): the JWT signing key MUST be supplied via the
    # environment / a secrets manager. Startup fails loudly if it is missing,
    # a known placeholder, or shorter than 32 bytes (HS256 minimum, RFC 7518
    # §3.2) — the app must never silently sign tokens with a guessable key.
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Comma-separated list of browser origins allowed to call the API (CORS).
    # Defaults cover the Vite dev server (5173) and the preview/build server (4173)
    # used by the frontend E2E. Override via the CORS_ORIGINS env var in prod (#12).
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:4173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def _reject_weak_jwt_secret(cls, v: str) -> str:
        if v in _WEAK_JWT_SECRETS:
            raise ValueError(
                "JWT_SECRET_KEY is a known placeholder; set a unique secret"
            )
        if len(v.encode("utf-8")) < 32:
            raise ValueError(
                "JWT_SECRET_KEY must be at least 32 bytes for HS256 (RFC 7518 §3.2)"
            )
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()