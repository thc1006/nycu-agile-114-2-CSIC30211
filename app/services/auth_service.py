from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.repositories.user_repo import UserRepository
from app.utils.security import (
    create_access_token,
    hash_password,
    verify_password,
)


class AuthService:
    @staticmethod
    async def register(email: str, password: str, name: str) -> dict:
        existing_user = await UserRepository.get_user_by_email(email)

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = {
            "id": f"u_{uuid4().hex[:12]}",
            "email": email,
            "password_hash": hash_password(password),
            "name": name,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        created_user = await UserRepository.create_user(user)

        return {
            "id": created_user["id"],
            "email": created_user["email"],
            "name": created_user["name"],
        }

    @staticmethod
    async def login(email: str, password: str) -> str:
        user = await UserRepository.get_user_by_email(email)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not verify_password(password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = create_access_token(
            data={
                "sub": user["id"],
                "email": user["email"],
            }
        )

        return token