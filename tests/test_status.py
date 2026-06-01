"""AG-005 (update status) + AG-006 (confirm receipt) status-machine tests.

Transition order is fixed and forward-only:
    OPEN -> ACCEPTED -> BUYING -> DELIVERED -> COMPLETED
Status (409) is checked before role (403); see OrderService.transition.
"""


def _setup_accepted(client, auth_headers, create_order):
    """Register buyer + runner, create an order, runner accepts it."""
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")

    order_id = create_order(headers=buyer).json()["id"]

    accept = client.post(f"/orders/{order_id}/accept", headers=runner)
    assert accept.status_code == 200

    return order_id, buyer, runner


def test_runner_can_start_then_deliver(client, auth_headers, create_order):
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)

    start = client.post(f"/orders/{order_id}/start", headers=runner)
    assert start.status_code == 200
    assert start.json()["status"] == "BUYING"

    deliver = client.post(f"/orders/{order_id}/deliver", headers=runner)
    assert deliver.status_code == 200
    assert deliver.json()["status"] == "DELIVERED"


def test_orderer_confirms_receipt(client, auth_headers, create_order):
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)
    client.post(f"/orders/{order_id}/start", headers=runner)
    client.post(f"/orders/{order_id}/deliver", headers=runner)

    confirm = client.post(f"/orders/{order_id}/confirm", headers=buyer)
    assert confirm.status_code == 200
    assert confirm.json()["status"] == "COMPLETED"


def test_cannot_skip_states(client, auth_headers, create_order):
    # ACCEPTED -> DELIVERED skips BUYING and must be rejected.
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)

    resp = client.post(f"/orders/{order_id}/deliver", headers=runner)
    assert resp.status_code == 409


def test_start_on_open_order_is_rejected(client, auth_headers, create_order):
    # An un-accepted (OPEN) order is not yet ACCEPTED -> 409 (state, not role).
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")
    order_id = create_order(headers=buyer).json()["id"]

    resp = client.post(f"/orders/{order_id}/start", headers=runner)
    assert resp.status_code == 409


def test_only_runner_can_start(client, auth_headers, create_order):
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)

    # Customer (orderer) cannot advance a runner-only transition.
    resp = client.post(f"/orders/{order_id}/start", headers=buyer)
    assert resp.status_code == 403


def test_only_orderer_can_confirm(client, auth_headers, create_order):
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)
    client.post(f"/orders/{order_id}/start", headers=runner)
    client.post(f"/orders/{order_id}/deliver", headers=runner)

    # Runner cannot confirm receipt — only the orderer can.
    resp = client.post(f"/orders/{order_id}/confirm", headers=runner)
    assert resp.status_code == 403


def test_confirm_requires_delivered(client, auth_headers, create_order):
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)
    client.post(f"/orders/{order_id}/start", headers=runner)  # now BUYING

    resp = client.post(f"/orders/{order_id}/confirm", headers=buyer)
    assert resp.status_code == 409


def test_completed_order_is_terminal(client, auth_headers, create_order):
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)
    client.post(f"/orders/{order_id}/start", headers=runner)
    client.post(f"/orders/{order_id}/deliver", headers=runner)
    client.post(f"/orders/{order_id}/confirm", headers=buyer)

    # No further transitions are possible from COMPLETED.
    resp = client.post(f"/orders/{order_id}/start", headers=runner)
    assert resp.status_code == 409


def test_non_participant_cannot_transition(client, auth_headers, create_order):
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)
    stranger = auth_headers(email="stranger@test.com", password="123456", name="路人")

    resp = client.post(f"/orders/{order_id}/start", headers=stranger)
    assert resp.status_code == 403


def test_start_twice_is_rejected(client, auth_headers, create_order):
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)

    first = client.post(f"/orders/{order_id}/start", headers=runner)
    second = client.post(f"/orders/{order_id}/start", headers=runner)

    assert first.status_code == 200
    assert second.status_code == 409  # already BUYING, no longer ACCEPTED


def test_transition_requires_login(client, auth_headers, create_order):
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)

    resp = client.post(f"/orders/{order_id}/start")
    assert resp.status_code == 401


def test_transition_unknown_order_returns_404(client, auth_headers):
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")

    resp = client.post("/orders/o_nonexistent/start", headers=runner)
    assert resp.status_code == 404


def test_transition_when_lock_busy_returns_409(client, auth_headers, create_order, monkeypatch):
    # Simulate another in-flight request holding the per-order lock: the
    # contention branch must return 409 (distinct from the state-conflict 409).
    order_id, buyer, runner = _setup_accepted(client, auth_headers, create_order)

    from app.repositories.order_repo import OrderRepository

    async def _lock_busy(*args, **kwargs):
        return False

    monkeypatch.setattr(OrderRepository, "acquire_order_lock", staticmethod(_lock_busy))

    resp = client.post(f"/orders/{order_id}/start", headers=runner)
    assert resp.status_code == 409
    assert "being updated" in resp.json()["detail"]
