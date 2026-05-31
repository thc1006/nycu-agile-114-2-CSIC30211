"""Additional AG-005 / AG-006 / AG-007 tests closing coverage & test-SOP gaps
identified in the review of PR #9.

These complement tests/test_status.py and tests/test_ratings.py. They cover the
branches and behaviours the original suite left untested:

* rating a non-existent order -> 404 (order_service.rate_order order-missing path)
* the ``deliver`` and ``confirm`` role guards (only ``start`` was role-tested)
* a *real* concurrent accept race (the original suite only monkeypatched the lock)
* the per-order lock is actually released (compare-and-delete) after a transition
* rating response contract + 1/5 boundary values + non-integer / missing payloads
* cross-user visibility of a rating aggregate (pins current behaviour)
"""


def _uid(client, headers):
    return client.get("/auth/me", headers=headers).json()["id"]


def _accepted(client, auth_headers, create_order):
    """Buyer creates an order; runner accepts it. Returns (order_id, buyer, runner)."""
    buyer = auth_headers(email="buyer@test.com", password="123456", name="買家")
    runner = auth_headers(email="runner@test.com", password="123456", name="跑腿")

    order_id = create_order(headers=buyer).json()["id"]

    assert client.post(f"/orders/{order_id}/accept", headers=runner).status_code == 200

    return order_id, buyer, runner


def _completed(client, auth_headers, create_order):
    order_id, buyer, runner = _accepted(client, auth_headers, create_order)

    assert client.post(f"/orders/{order_id}/start", headers=runner).status_code == 200
    assert client.post(f"/orders/{order_id}/deliver", headers=runner).status_code == 200
    assert client.post(f"/orders/{order_id}/confirm", headers=buyer).status_code == 200

    return order_id, buyer, runner


# --- transition role guards (PR only tested the 'start' role) ---


def test_only_runner_can_deliver(client, auth_headers, create_order):
    # State is valid for `deliver` (BUYING), so this exercises the ROLE guard (403),
    # not the state guard (409).
    order_id, buyer, runner = _accepted(client, auth_headers, create_order)
    assert client.post(f"/orders/{order_id}/start", headers=runner).status_code == 200

    resp = client.post(f"/orders/{order_id}/deliver", headers=buyer)
    assert resp.status_code == 403


def test_non_participant_cannot_confirm(client, auth_headers, create_order):
    order_id, buyer, runner = _accepted(client, auth_headers, create_order)
    client.post(f"/orders/{order_id}/start", headers=runner)
    client.post(f"/orders/{order_id}/deliver", headers=runner)

    stranger = auth_headers(email="stranger@test.com", password="123456", name="路人")
    resp = client.post(f"/orders/{order_id}/confirm", headers=stranger)
    assert resp.status_code == 403


# --- rating: missing order 404 (uncovered branch) ---


def test_rate_nonexistent_order_returns_404(client, auth_headers):
    headers = auth_headers(email="solo@test.com", password="123456", name="獨行")
    resp = client.post(
        "/orders/o_does_not_exist/ratings", headers=headers, json={"stars": 5}
    )
    assert resp.status_code == 404


# --- rating contract + input validation ---


def test_rating_response_contract(client, auth_headers, create_order):
    order_id, buyer, runner = _completed(client, auth_headers, create_order)

    resp = client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": 5})
    assert resp.status_code == 201

    body = resp.json()
    assert set(body) >= {"order_id", "rater_id", "ratee_id", "stars", "created_at"}
    assert body["order_id"] == order_id
    assert body["rater_id"] == _uid(client, buyer)
    assert body["ratee_id"] == _uid(client, runner)
    assert body["stars"] == 5


def test_rating_boundary_values_accepted(client, auth_headers, create_order):
    o1, buyer, runner = _completed(client, auth_headers, create_order)
    assert (
        client.post(f"/orders/{o1}/ratings", headers=buyer, json={"stars": 1}).status_code
        == 201
    )

    o2, buyer2, _ = _completed(client, auth_headers, create_order)
    assert (
        client.post(f"/orders/{o2}/ratings", headers=buyer2, json={"stars": 5}).status_code
        == 201
    )


def test_rating_rejects_non_integer_or_missing_stars(client, auth_headers, create_order):
    order_id, buyer, runner = _completed(client, auth_headers, create_order)

    # Includes a fractional float (3.5) — pydantic rejects non-integral ints.
    for bad in ({"stars": "abc"}, {"stars": None}, {"stars": [5]}, {"stars": 3.5}, {}):
        resp = client.post(f"/orders/{order_id}/ratings", headers=buyer, json=bad)
        assert resp.status_code == 422, f"expected 422 for {bad}, got {resp.status_code}"


# --- concurrency: real lock contention + lock release ---


def test_accept_blocked_when_order_lock_already_held(
    client, auth_headers, create_order, redis_client
):
    # Deterministic distributed-lock test exercising the REAL acquire path
    # (SET NX), not a monkeypatch: a foreign holder owns the per-order lock, so
    # the runner's accept must lose the race and get 409.
    buyer = auth_headers(email="buyer@test.com", password="123456", name="買家")
    runner = auth_headers(email="runner@test.com", password="123456", name="跑腿")

    order_id = create_order(headers=buyer).json()["id"]

    assert (
        redis_client.set(f"lock:order:{order_id}", "held-by-other", nx=True, ex=5) is True
    )

    resp = client.post(f"/orders/{order_id}/accept", headers=runner)
    assert resp.status_code == 409
    assert "being accepted" in resp.json()["detail"]


def test_transition_blocked_when_order_lock_already_held(
    client, auth_headers, create_order, redis_client
):
    # Same, for a status transition: contention is reported as 409 with the
    # "being updated" detail (distinct from the state-conflict 409).
    order_id, buyer, runner = _accepted(client, auth_headers, create_order)

    assert (
        redis_client.set(f"lock:order:{order_id}", "held-by-other", nx=True, ex=5) is True
    )

    resp = client.post(f"/orders/{order_id}/start", headers=runner)
    assert resp.status_code == 409
    assert "being updated" in resp.json()["detail"]


def test_lock_key_released_after_transition(
    client, auth_headers, create_order, redis_client
):
    order_id, buyer, runner = _accepted(client, auth_headers, create_order)
    assert client.post(f"/orders/{order_id}/start", headers=runner).status_code == 200

    # The per-order mutation lock must be compare-and-deleted, never left dangling.
    assert redis_client.exists(f"lock:order:{order_id}") == 0


# --- rating aggregate visibility (pins current behaviour; see security note) ---


def test_any_authenticated_user_can_read_rating_aggregate(
    client, auth_headers, create_order
):
    order_id, buyer, runner = _completed(client, auth_headers, create_order)
    runner_id = _uid(client, runner)

    client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": 5})

    other = auth_headers(email="other@test.com", password="123456", name="他人")
    resp = client.get(f"/users/{runner_id}/rating", headers=other)

    assert resp.status_code == 200
    assert resp.json()["count"] == 1
    assert resp.json()["average"] == 5.0
