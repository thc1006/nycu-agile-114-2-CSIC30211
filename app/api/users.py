from fastapi import APIRouter, Depends

from app.schemas.order import UserRatingResponse
from app.services.order_service import OrderService
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/{user_id}/rating",
    response_model=UserRatingResponse,
)
async def get_user_rating(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Aggregate rating (average + count) for a user, for profile display. AG-007."""
    return await OrderService.get_user_rating(user_id)
