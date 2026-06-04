"""AG-010 "my orders" history tests.

GET /orders/mine?role=customer|runner -> list[OrderResponse], newest first.
Object-level authz is implicit (the index is keyed on the caller's own id), so
the suite also asserts no cross-user leakage.
"""


def test_customer_sees_their_created_orders(client, auth_headers, create_order):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")

    create_order(headers=buyer, expected_time="2026-06-01T12:00:00+08:00")
    create_order(headers=buyer, expected_time="2026-06-01T13:00:00+08:00")

    resp = client.get("/orders/mine?role=customer", headers=buyer)

    assert resp.status_code == 200

    data = resp.json()
    assert len(data) == 2
    assert all(o["status"] == "OPEN" for o in data)


def test_my_orders_sorted_newest_first(client, auth_headers, create_order):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")

    first_id = create_order(headers=buyer).json()["id"]
    second_id = create_order(headers=buyer).json()["id"]

    data = client.get("/orders/mine?role=customer", headers=buyer).json()

    # Sorted by created_at desc -> the most recently created order leads.
    assert [o["id"] for o in data] == [second_id, first_id]


def test_customer_history_survives_status_changes(client, auth_headers, create_order):
    # An order the customer created still shows in their history after it has
    # been accepted (and is no longer OPEN).
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")

    order_id = create_order(headers=buyer).json()["id"]
    client.post(f"/orders/{order_id}/accept", headers=runner)

    data = client.get("/orders/mine?role=customer", headers=buyer).json()

    assert len(data) == 1
    assert data[0]["id"] == order_id
    assert data[0]["status"] == "ACCEPTED"


def test_runner_sees_accepted_orders(client, auth_headers, create_order):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")

    order_id = create_order(headers=buyer).json()["id"]
    client.post(f"/orders/{order_id}/accept", headers=runner)

    data = client.get("/orders/mine?role=runner", headers=runner).json()

    assert len(data) == 1
    assert data[0]["id"] == order_id
    assert data[0]["runner_id"] is not None


def test_customer_role_does_not_leak_others_orders(client, auth_headers, create_order):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    other = auth_headers(email="other@test.com", password="123456", name="小華")

    create_order(headers=buyer)
    other_order_id = create_order(headers=other).json()["id"]

    data = client.get("/orders/mine?role=customer", headers=buyer).json()

    ids = [o["id"] for o in data]
    assert other_order_id not in ids
    assert len(ids) == 1


def test_runner_role_empty_before_accepting(client, auth_headers, create_order):
    # A user who has created orders but accepted none has an empty runner list.
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    create_order(headers=buyer)

    data = client.get("/orders/mine?role=runner", headers=buyer).json()

    assert data == []


def test_my_orders_empty_when_none(client, auth_headers):
    fresh = auth_headers(email="fresh@test.com", password="123456", name="新人")

    resp = client.get("/orders/mine?role=customer", headers=fresh)

    assert resp.status_code == 200
    assert resp.json() == []


def test_my_orders_invalid_role_returns_422(client, auth_headers):
    user = auth_headers(email="user@test.com", password="123456", name="某人")

    resp = client.get("/orders/mine?role=bogus", headers=user)

    assert resp.status_code == 422


def test_my_orders_missing_role_returns_422(client, auth_headers):
    user = auth_headers(email="user@test.com", password="123456", name="某人")

    resp = client.get("/orders/mine", headers=user)

    assert resp.status_code == 422


def test_my_orders_requires_login(client):
    resp = client.get("/orders/mine?role=customer")

    assert resp.status_code == 401


def test_mine_route_not_shadowed_by_order_id(client, auth_headers):
    # Regression guard: "/orders/mine" must resolve to the history endpoint,
    # not be matched as GET /orders/{order_id="mine"} (which would 404/403).
    user = auth_headers(email="user@test.com", password="123456", name="某人")

    resp = client.get("/orders/mine?role=customer", headers=user)

    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
