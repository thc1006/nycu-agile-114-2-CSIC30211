import json

from app.redis_client import get_redis


class UserRepository:
    @staticmethod
    async def create_user(user: dict) -> dict:
        redis_client = get_redis()

        user_key = f"user:{user['id']}"
        email_key = f"email_to_user:{user['email']}"

        await redis_client.set(user_key, json.dumps(user))
        await redis_client.set(email_key, user["id"])

        return user

    @staticmethod
    async def get_user_by_id(user_id: str) -> dict | None:
        redis_client = get_redis()

        raw = await redis_client.get(f"user:{user_id}")

        if raw is None:
            return None

        return json.loads(raw)

    @staticmethod
    async def get_user_by_email(email: str) -> dict | None:
        redis_client = get_redis()

        user_id = await redis_client.get(f"email_to_user:{email}")

        if user_id is None:
            return None

        return await UserRepository.get_user_by_id(user_id)