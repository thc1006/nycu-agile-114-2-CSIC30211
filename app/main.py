from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.redis_client import init_redis, close_redis, get_redis
from app.api.auth import router as auth_router
from app.api.orders import router as orders_router
from app.api.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    yield
    await close_redis()


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
)

# Important: register API routers
app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(users_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to CampusEats API",
        "env": settings.APP_ENV,
    }


@app.get("/health")
async def health_check():
    redis_client = get_redis()
    await redis_client.ping()

    return {
        "status": "ok",
        "redis": "connected",
    }