import json
from datetime import datetime
from typing import Any

from app.redis_client import get_redis


class OrderRepository:
    @staticmethod
    def _serialize_order(order: dict[str, Any]) -> dict[str, Any]:
        data = order.copy()

        for key in ["expected_time", "created_at", "updated_at"]:
            if isinstance(data.get(key), datetime):
                data[key] = data[key].isoformat()

        return data

    @staticmethod
    def _deserialize_order(order: dict[str, Any]) -> dict[str, Any]:
        data = order.copy()

        for key in ["expected_time", "created_at", "updated_at"]:
            if isinstance(data.get(key), str):
                data[key] = datetime.fromisoformat(data[key])

        return data

    @staticmethod
    async def create_order(order: dict[str, Any]) -> dict[str, Any]:
        redis_client = get_redis()

        serialized = OrderRepository._serialize_order(order)

        order_key = f"order:{order['id']}"
        customer_orders_key = f"orders:by_customer:{order['customer_id']}"

        await redis_client.set(order_key, json.dumps(serialized))
        await redis_client.sadd(customer_orders_key, order["id"])

        score = order["expected_time"].timestamp()
        await redis_client.zadd("orders:open", {order["id"]: score})

        return order

    @staticmethod
    async def get_order_by_id(order_id: str) -> dict[str, Any] | None:
        redis_client = get_redis()

        raw = await redis_client.get(f"order:{order_id}")

        if raw is None:
            return None

        return OrderRepository._deserialize_order(json.loads(raw))

    @staticmethod
    async def save_order(order: dict[str, Any]) -> dict[str, Any]:
        redis_client = get_redis()

        serialized = OrderRepository._serialize_order(order)
        await redis_client.set(f"order:{order['id']}", json.dumps(serialized))

        return order

    @staticmethod
    async def list_open_orders() -> list[dict[str, Any]]:
        redis_client = get_redis()

        order_ids = await redis_client.zrange("orders:open", 0, -1)

        orders: list[dict[str, Any]] = []

        for order_id in order_ids:
            order = await OrderRepository.get_order_by_id(order_id)

            if order is None:
                await redis_client.zrem("orders:open", order_id)
                continue

            if order["status"] != "OPEN":
                await redis_client.zrem("orders:open", order_id)
                continue

            orders.append(order)

        return orders

    @staticmethod
    async def remove_from_open_orders(order_id: str) -> None:
        redis_client = get_redis()
        await redis_client.zrem("orders:open", order_id)

    @staticmethod
    async def add_runner_order(runner_id: str, order_id: str) -> None:
        redis_client = get_redis()
        await redis_client.sadd(f"orders:by_runner:{runner_id}", order_id)

    @staticmethod
    async def acquire_accept_lock(order_id: str, lock_value: str) -> bool:
        redis_client = get_redis()

        result = await redis_client.set(
            f"lock:order:{order_id}:accept",
            lock_value,
            nx=True,
            ex=5,
        )

        return result is True

    @staticmethod
    async def release_accept_lock(order_id: str, lock_value: str) -> None:
        redis_client = get_redis()

        lock_key = f"lock:order:{order_id}:accept"
        current_value = await redis_client.get(lock_key)

        if current_value == lock_value:
            await redis_client.delete(lock_key)