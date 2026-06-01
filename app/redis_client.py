import redis.asyncio as redis

from app.config import settings


redis_client: redis.Redis | None = None


async def init_redis() -> None:
    global redis_client

    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        password=settings.REDIS_PASSWORD or None,
        decode_responses=True,
    )

    try:
        await redis_client.ping()
    except Exception as exc:
        redis_client = None
        raise RuntimeError("Failed to connect to Redis") from exc


async def close_redis() -> None:
    global redis_client

    if redis_client is not None:
        await redis_client.aclose()
        redis_client = None


def get_redis() -> redis.Redis:
    if redis_client is None:
        raise RuntimeError("Redis client is not initialized")
    return redis_client