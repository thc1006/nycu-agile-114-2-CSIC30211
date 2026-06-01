from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# CORS — allow the browser frontend (Vite dev / preview) to call the API with
# credentials. Origins are an explicit allow-list (never "*"), configured via
# CORS_ORIGINS. Required for the frontend integration (#12).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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