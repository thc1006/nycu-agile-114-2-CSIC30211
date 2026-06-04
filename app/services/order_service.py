import json
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.repositories.order_repo import OrderRepository


# Hand-rolled finite-state-machine table for runner/orderer-driven status
# transitions (AG-005 / AG-006). Each action is a forward-only edge with the
# single role allowed to fire it. A library (python-statemachine / transitions)
# is overkill at this scale — see ADR-0007.
#   OPEN -> ACCEPTED   : POST /orders/{id}/accept  (runner; handled separately
#                        because it also claims the order under a lock)
#   ACCEPTED -> BUYING : "start"    (runner)
#   BUYING -> DELIVERED: "deliver"  (runner)
#   DELIVERED -> COMPLETED: "confirm" (orderer / customer)
# CANCELLED (OPEN -> CANCELLED, AG-008) is creator-only and lives in
# OrderService.cancel_order — it is not a generic FSM edge (only OPEN orders
# can be cancelled), so it stays out of this table.
TRANSITIONS: dict[str, dict[str, str]] = {
    "start": {"from": "ACCEPTED", "to": "BUYING", "actor": "runner"},
    "deliver": {"from": "BUYING", "to": "DELIVERED", "actor": "runner"},
    "confirm": {"from": "DELIVERED", "to": "COMPLETED", "actor": "customer"},
}


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
    async def get_order_authorized(order_id: str, requester_id: str) -> dict:
        """Read a single order with object-level authorization (fixes IDOR).

        OPEN orders are public — they are listed in the runner feed so any
        authenticated user can inspect one before accepting. Once an order is
        accepted/in-progress/completed, only its two participants (the customer
        and the assigned runner) may read its details (pickup location, etc.).
        Order existence is checked first so the 404 path is unchanged.
        """
        order = await OrderService.get_order(order_id)

        if order["status"] == "OPEN":
            return order

        if requester_id in (order["customer_id"], order.get("runner_id")):
            return order

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this order",
        )

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

        lock_acquired = await OrderRepository.acquire_order_lock(
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
            await OrderRepository.release_order_lock(
                order_id=order_id,
                lock_value=lock_value,
            )

    @staticmethod
    async def cancel_order(order_id: str, user_id: str) -> dict:
        """Cancel an OPEN order (AG-008): OPEN -> CANCELLED.

        Only the order creator may cancel, and only while the order is still
        OPEN (no runner has claimed it). Runs under the same per-order lock as
        accept/transition so a cancel cannot race an in-flight accept.

        Check order: 404 (missing) -> 403 (not the creator) -> 409 (not OPEN).
        Ownership is verified *before* status so a non-creator can never learn
        whether the order has progressed past OPEN (it would be a small IDOR
        info-leak — consistent with the object-level authz in
        ``get_order_authorized``). It also matches AG-008's "非訂單建立者不可取消"
        scenario, which expects 403 for a stranger irrespective of state.
        """
        lock_value = f"{user_id}:{uuid4().hex}"

        lock_acquired = await OrderRepository.acquire_order_lock(
            order_id=order_id,
            lock_value=lock_value,
        )

        if not lock_acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Order is being updated by another request",
            )

        try:
            order = await OrderRepository.get_order_by_id(order_id)

            if order is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Order not found",
                )

            if order["customer_id"] != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the order creator can cancel this order",
                )

            if order["status"] != "OPEN":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="訂單已被接單，無法取消",
                )

            order["status"] = "CANCELLED"
            order["updated_at"] = datetime.now(timezone.utc)

            await OrderRepository.save_order(order)
            await OrderRepository.remove_from_open_orders(order_id)

            return order

        finally:
            await OrderRepository.release_order_lock(
                order_id=order_id,
                lock_value=lock_value,
            )

    @staticmethod
    async def list_my_orders(user_id: str, role: str) -> list[dict]:
        """Return the current user's own order history (AG-010), newest first.

        ``role="customer"`` lists orders they created; ``role="runner"`` lists
        orders they accepted. Object-level authz is implicit — the index is
        always keyed on the caller's own id, so no order belonging to another
        user can ever be returned.
        """
        if role == "customer":
            orders = await OrderRepository.list_customer_orders(user_id)
        else:
            orders = await OrderRepository.list_runner_orders(user_id)

        return sorted(orders, key=lambda order: order["created_at"], reverse=True)

    @staticmethod
    async def transition(order_id: str, action: str, user_id: str) -> dict:
        """Advance an order one step along the status FSM (AG-005 / AG-006).

        Enforces, under a per-order lock: fixed forward-only order (no
        skipping, terminal states rejected -> 409), and the single role
        allowed to fire the action (wrong actor / non-participant -> 403).
        """
        rule = TRANSITIONS[action]

        lock_value = f"{user_id}:{uuid4().hex}"

        lock_acquired = await OrderRepository.acquire_order_lock(
            order_id=order_id,
            lock_value=lock_value,
        )

        if not lock_acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Order is being updated by another request",
            )

        try:
            order = await OrderRepository.get_order_by_id(order_id)

            if order is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Order not found",
                )

            # State first (409): enforce the fixed forward-only order, reject
            # skips/terminal states, AND guarantee runner_id is populated
            # before the role check below (it is only set once ACCEPTED).
            if order["status"] != rule["from"]:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"Cannot '{action}' an order in status "
                        f"'{order['status']}'"
                    ),
                )

            # Role next (403): only the designated participant may fire it.
            is_runner = order.get("runner_id") == user_id
            is_customer = order["customer_id"] == user_id

            if rule["actor"] == "runner" and not is_runner:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the runner can update this order's status",
                )

            if rule["actor"] == "customer" and not is_customer:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the orderer can confirm receipt of this order",
                )

            order["status"] = rule["to"]
            order["updated_at"] = datetime.now(timezone.utc)

            await OrderRepository.save_order(order)

            return order

        finally:
            await OrderRepository.release_order_lock(
                order_id=order_id,
                lock_value=lock_value,
            )

    @staticmethod
    async def rate_order(order_id: str, rater_id: str, stars: int) -> dict:
        """Submit a one-time, immutable 1-5 star rating for a completed order.

        Only the two participants may rate; the ratee is the *other* party.
        Enforces order completed (409), participant-only (403), and
        one-per-user-per-order via an atomic HSETNX guard (duplicate -> 409).
        """
        order = await OrderRepository.get_order_by_id(order_id)

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )

        if order["status"] != "COMPLETED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Order must be completed before it can be rated",
            )

        customer_id = order["customer_id"]
        runner_id = order.get("runner_id")

        if rater_id == customer_id:
            ratee_id = runner_id
        elif rater_id == runner_id:
            ratee_id = customer_id
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only participants of this order can rate it",
            )

        created_at = datetime.now(timezone.utc)

        rating = {
            "order_id": order_id,
            "rater_id": rater_id,
            "ratee_id": ratee_id,
            "stars": stars,
            "created_at": created_at,
        }

        rating_json = json.dumps({**rating, "created_at": created_at.isoformat()})

        is_first = await OrderRepository.submit_rating(
            order_id=order_id,
            rater_id=rater_id,
            ratee_id=ratee_id,
            stars=stars,
            rating_json=rating_json,
        )

        if not is_first:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already rated this order",
            )

        return rating

    @staticmethod
    async def get_user_rating(user_id: str) -> dict:
        aggregate = await OrderRepository.get_user_rating(user_id)

        return {
            "user_id": user_id,
            "average": aggregate["average"],
            "count": aggregate["count"],
        }