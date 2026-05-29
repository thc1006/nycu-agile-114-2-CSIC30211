from fastapi import APIRouter, Depends, status

from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(request: RegisterRequest):
    user = await AuthService.register(
        email=request.email,
        password=request.password,
        name=request.name,
    )

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(request: LoginRequest):
    token = await AuthService.login(
        email=request.email,
        password=request.password,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response_model=CurrentUserResponse,
)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
    }