"""Idempotent demo seed for CampusEats (AG-012).

Creates two demo accounts (an orderer and a runner) and a couple of OPEN demo
orders so a fresh environment has something to click through immediately.

Re-runnable and idempotent:
  * Existing demo accounts are reused (duplicate-email registration is caught).
  * Demo OPEN orders are only created when the orderer currently has none, so
    repeated runs do not pile up identical orders.

It NEVER flushes the database — it upserts against the configured Redis, which
may be the production data store. Honors REDIS_HOST / REDIS_PORT / REDIS_DB /
REDIS_PASSWORD (and JWT_SECRET_KEY) via the app config.

Usage (from the repo root):
    python -m scripts.seed
    python scripts/seed.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Allow `python scripts/seed.py` (no package context) to import the app package.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import HTTPException  # noqa: E402

from app.redis_client import close_redis, init_redis  # noqa: E402
from app.services.auth_service import AuthService  # noqa: E402
from app.services.order_service import OrderService  # noqa: E402

DEMO_PASSWORD = "demo1234"

DEMO_ORDERER = {
    "email": "demo-orderer@campuseats.app",
    "password": DEMO_PASSWORD,
    "name": "示範訂餐者",
}

DEMO_RUNNER = {
    "email": "demo-runner@campuseats.app",
    "password": DEMO_PASSWORD,
    "name": "示範帶餐者",
}

# Realistic zh-Hant demo orders. expected_time is computed at seed time as the
# next occurrence of a fixed campus meal window (Asia/Taipei), so the demo feed
# always shows an *upcoming* deadline — even when the seed is re-run days later.
DEMO_ORDERS = [
    {
        "restaurant": "二餐自助餐",
        "meal": "排骨便當 + 滷蛋，醬汁分開裝",
        "pickup_location": "資工系館 1F 大廳",
        "pickup_window": (12, 30),  # lunch
        "delivery_fee": 20,
    },
    {
        "restaurant": "麥當勞 清大店",
        "meal": "大麥克套餐（可樂去冰）",
        "pickup_location": "綜合大樓門口",
        "pickup_window": (18, 15),  # dinner
        "delivery_fee": 30,
    },
]


async def _ensure_account(email: str, password: str, name: str) -> dict:
    """Register the demo account if absent; reuse it on duplicate email."""
    try:
        user = await AuthService.register(email=email, password=password, name=name)
        return {"user": user, "created": True}
    except HTTPException as exc:
        # register() raises 409 when the email already exists — that is the
        # idempotent path; look the existing account up instead.
        if exc.status_code != 409:
            raise
        from app.repositories.user_repo import UserRepository

        user = await UserRepository.get_user_by_email(email)
        return {"user": user, "created": False}


async def _count_open_orders(customer_id: str) -> int:
    orders = await OrderService.list_my_orders(customer_id, role="customer")
    return sum(1 for o in orders if o["status"] == "OPEN")


async def seed() -> None:
    await init_redis()

    try:
        orderer = await _ensure_account(**DEMO_ORDERER)
        runner = await _ensure_account(**DEMO_RUNNER)

        orderer_id = orderer["user"]["id"]

        existing_open = await _count_open_orders(orderer_id)

        created_orders = []
        if existing_open == 0:
            for spec in DEMO_ORDERS:
                order = await OrderService.create_order(
                    customer_id=orderer_id,
                    restaurant=spec["restaurant"],
                    meal=spec["meal"],
                    pickup_location=spec["pickup_location"],
                    # Always a real, upcoming datetime (create_order serializes
                    # via .timestamp()/.isoformat()).
                    expected_time=_next_occurrence(*spec["pickup_window"]),
                    delivery_fee=spec["delivery_fee"],
                )
                created_orders.append(order)

        _print_summary(orderer, runner, existing_open, created_orders)
    finally:
        await close_redis()


def _next_occurrence(hour: int, minute: int):
    """The next Asia/Taipei datetime at ``hour:minute`` that is still in the
    future — today's window if it hasn't passed, otherwise tomorrow's."""
    from datetime import datetime, timedelta, timezone

    taipei = timezone(timedelta(hours=8))
    now = datetime.now(taipei)
    target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if target <= now:
        target += timedelta(days=1)
    return target


def _print_summary(orderer, runner, existing_open, created_orders) -> None:
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_db = os.getenv("REDIS_DB", "0")

    print("=" * 56)
    print("CampusEats demo seed complete")
    print(f"  Redis: {redis_host} (db {redis_db})")
    print("-" * 56)

    print("Demo accounts (password for both: {}):".format(DEMO_PASSWORD))
    print(
        "  orderer  {}  [{}]".format(
            DEMO_ORDERER["email"],
            "created" if orderer["created"] else "existing",
        )
    )
    print(
        "  runner   {}  [{}]".format(
            DEMO_RUNNER["email"],
            "created" if runner["created"] else "existing",
        )
    )
    print("-" * 56)

    if created_orders:
        print(f"Created {len(created_orders)} OPEN demo order(s):")
        for order in created_orders:
            print(f"  {order['id']}  {order['restaurant']} — {order['meal']}")
    else:
        print(
            "Orderer already had {} OPEN order(s); skipped creating demo "
            "orders (idempotent).".format(existing_open)
        )
    print("=" * 56)


if __name__ == "__main__":
    asyncio.run(seed())
