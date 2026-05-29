from fastapi import APIRouter, Depends, status

from app.schemas.order import (
    CreateOrderRequest,
    OpenOrderResponse,
    OrderResponse,
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