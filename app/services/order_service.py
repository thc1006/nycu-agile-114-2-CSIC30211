from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.repositories.order_repo import OrderRepository


class OrderService:
    @staticmethod
    async def create_order(
        customer_id: str,
        restaurant: str,
        meal: str,
        pickup_location: str,
        expected_time: datetime,
        delivery_fee: int,
    ) -> dict:
        now = datetime.now(timezone.utc)

        order = {
            "id": f"o_{uuid4().hex[:12]}",
            "customer_id": customer_id,
            "runner_id": None,
            "restaurant": restaurant,
            "meal": meal,
            "pickup_location": pickup_location,
            "expected_time": expected_time,
            "delivery_fee": delivery_fee,
            "status": "OPEN",
            "created_at": now,
            "updated_at": now,
        }

        return await OrderRepository.create_order(order)

    @staticmethod
    async def get_order(order_id: str) -> dict:
        order = await OrderRepository.get_order_by_id(order_id)

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )

        return order

    @staticmethod
    async def list_open_orders() -> list[dict]:
        orders = await OrderRepository.list_open_orders()

        return [
            {
                "id": order["id"],
                "restaurant": order["restaurant"],
                "meal_summary": order["meal"][:50],
                "pickup_location": order["pickup_location"],
                "expected_time": order["expected_time"],
                "delivery_fee": order["delivery_fee"],
                "status": order["status"],
            }
            for order in orders
        ]

    @staticmethod
    async def accept_order(order_id: str, runner_id: str) -> dict:
        lock_value = f"{runner_id}:{uuid4().hex}"

        lock_acquired = await OrderRepository.acquire_accept_lock(
            order_id=order_id,
            lock_value=lock_value,
        )

        if not lock_acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Order is being accepted by another user",
            )

        try:
            order = await OrderRepository.get_order_by_id(order_id)

            if order is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Order not found",
                )

            if order["status"] != "OPEN":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Order has already been accepted",
                )

            if order["customer_id"] == runner_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Customer cannot accept their own order",
                )

            order["runner_id"] = runner_id
            order["status"] = "ACCEPTED"
            order["updated_at"] = datetime.now(timezone.utc)

            await OrderRepository.save_order(order)
            await OrderRepository.remove_from_open_orders(order_id)
            await OrderRepository.add_runner_order(runner_id, order_id)

            return order

        finally:
            await OrderRepository.release_accept_lock(
                order_id=order_id,
                lock_value=lock_value,
            )