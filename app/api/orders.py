from fastapi import APIRouter, Depends, status

from app.schemas.order import (
    CreateOrderRequest,
    OpenOrderResponse,
    OrderResponse,
    RateOrderRequest,
    RatingResponse,
)
from app.services.order_service import OrderService
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    request: CreateOrderRequest,
    current_user: dict = Depends(get_current_user),
):
    order = await OrderService.create_order(
        customer_id=current_user["id"],
        restaurant=request.restaurant,
        meal=request.meal,
        pickup_location=request.pickup_location,
        expected_time=request.expected_time,
        delivery_fee=request.delivery_fee,
    )

    return order


@router.get(
    "/open",
    response_model=list[OpenOrderResponse],
)
async def list_open_orders(
    current_user: dict = Depends(get_current_user),
):
    return await OrderService.list_open_orders()


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await OrderService.get_order(order_id)


@router.post(
    "/{order_id}/accept",
    response_model=OrderResponse,
)
async def accept_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await OrderService.accept_order(
        order_id=order_id,
        runner_id=current_user["id"],
    )


@router.post(
    "/{order_id}/start",
    response_model=OrderResponse,
)
async def start_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Runner starts buying the meal (ACCEPTED -> BUYING). AG-005."""
    return await OrderService.transition(
        order_id=order_id,
        action="start",
        user_id=current_user["id"],
    )


@router.post(
    "/{order_id}/deliver",
    response_model=OrderResponse,
)
async def deliver_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Runner marks the meal as delivered (BUYING -> DELIVERED). AG-005."""
    return await OrderService.transition(
        order_id=order_id,
        action="deliver",
        user_id=current_user["id"],
    )


@router.post(
    "/{order_id}/confirm",
    response_model=OrderResponse,
)
async def confirm_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Orderer confirms receipt (DELIVERED -> COMPLETED). AG-006."""
    return await OrderService.transition(
        order_id=order_id,
        action="confirm",
        user_id=current_user["id"],
    )


@router.post(
    "/{order_id}/ratings",
    response_model=RatingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def rate_order(
    order_id: str,
    request: RateOrderRequest,
    current_user: dict = Depends(get_current_user),
):
    """Submit a one-time 1-5 star rating for a completed order. AG-007."""
    return await OrderService.rate_order(
        order_id=order_id,
        rater_id=current_user["id"],
        stars=request.stars,
    )