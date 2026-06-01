import json
from datetime import datetime
from typing import Any

from app.redis_client import get_redis


# Atomic compare-and-delete: only release the lock if we still own it.
# Plain GET-then-DELETE is racy (our TTL may expire and another client may
# re-acquire the lock before our DELETE lands). See ADR-0007 — this resolves
# the non-atomic-release tech debt flagged in ADR-0005.
_RELEASE_LOCK_LUA = """
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
else
    return 0
end
"""

# One immutable rating per (order, rater) via HSETNX, and — only on the first
# write — atomically bump the ratee's running aggregate. Running the whole
# compound op as a single Lua script makes it atomic, so a crash between the
# guard and the aggregate update cannot double-count. See ADR-0008.
_SUBMIT_RATING_LUA = """
if redis.call('HSETNX', KEYS[1], ARGV[1], ARGV[2]) == 1 then
    redis.call('HINCRBY', KEYS[2], 'count', 1)
    redis.call('HINCRBYFLOAT', KEYS[2], 'sum', ARGV[3])
    return 1
else
    return 0
end
"""


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
    async def acquire_order_lock(order_id: str, lock_value: str) -> bool:
        """Acquire the per-order mutation lock (accept / status transitions).

        ``lock_value`` must be unique per caller so release can verify
        ownership. Returns ``True`` only if the lock was acquired.
        """
        redis_client = get_redis()

        result = await redis_client.set(
            f"lock:order:{order_id}",
            lock_value,
            nx=True,
            ex=5,
        )

        return result is True

    @staticmethod
    async def release_order_lock(order_id: str, lock_value: str) -> None:
        """Release the lock atomically (compare-and-delete via Lua)."""
        redis_client = get_redis()

        script = redis_client.register_script(_RELEASE_LOCK_LUA)
        await script(keys=[f"lock:order:{order_id}"], args=[lock_value])

    @staticmethod
    async def submit_rating(
        order_id: str,
        rater_id: str,
        ratee_id: str,
        stars: int,
        rating_json: str,
    ) -> bool:
        """Store one immutable rating and bump the ratee aggregate atomically.

        Returns ``True`` on first submission, ``False`` if this rater has
        already rated this order (HSETNX returned 0).
        """
        redis_client = get_redis()

        script = redis_client.register_script(_SUBMIT_RATING_LUA)
        result = await script(
            keys=[f"rating:order:{order_id}", f"user:{ratee_id}:rating"],
            args=[rater_id, rating_json, stars],
        )

        return result == 1

    @staticmethod
    async def get_user_rating(user_id: str) -> dict[str, Any]:
        """Return the running rating aggregate for a user.

        ``{"count": int, "sum": float, "average": float}`` — zeros if the
        user has never been rated.
        """
        redis_client = get_redis()

        data = await redis_client.hgetall(f"user:{user_id}:rating")

        count = int(data.get("count", 0))
        total = float(data.get("sum", 0.0))
        average = round(total / count, 2) if count else 0.0

        return {"count": count, "sum": total, "average": average}