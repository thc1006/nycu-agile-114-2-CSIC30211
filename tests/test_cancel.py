"""AG-008 cancel-order tests.

OPEN -> CANCELLED, creator-only. Check order is 404 -> 403 -> 409: ownership is
verified before status, so a non-creator always gets 403 (never learning whether
the order moved past OPEN), and only the creator sees the 409 "already accepted".
"""


def test_creator_can_cancel_open_order(client, auth_headers, create_order):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")

    order_id = create_order(headers=buyer).json()["id"]

    resp = client.post(f"/orders/{order_id}/cancel", headers=buyer)

    assert resp.status_code == 200

    data = resp.json()
    assert data["id"] == order_id
    assert data["status"] == "CANCELLED"


def test_cancelled_order_disappears_from_open_list(client, auth_headers, create_order):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")

    order_id = create_order(headers=buyer).json()["id"]

    before = client.get("/orders/open", headers=runner)
    assert before.status_code == 200
    assert len(before.json()) == 1

    cancel = client.post(f"/orders/{order_id}/cancel", headers=buyer)
    assert cancel.status_code == 200

    after = client.get("/orders/open", headers=runner)
    assert after.status_code == 200
    assert after.json() == []


def test_non_creator_cannot_cancel_open_order(client, auth_headers, create_order):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    stranger = auth_headers(email="stranger@test.com", password="123456", name="路人")

    order_id = create_order(headers=buyer).json()["id"]

    resp = client.post(f"/orders/{order_id}/cancel", headers=stranger)

    assert resp.status_code == 403
    assert resp.json()["detail"] == "Only the order creator can cancel this order"


def test_cannot_cancel_accepted_order(client, auth_headers, create_order):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")

    order_id = create_order(headers=buyer).json()["id"]

    accept = client.post(f"/orders/{order_id}/accept", headers=runner)
    assert accept.status_code == 200

    resp = client.post(f"/orders/{order_id}/cancel", headers=buyer)

    assert resp.status_code == 409
    assert resp.json()["detail"] == "訂單已被接單，無法取消"


def test_non_creator_cannot_cancel_accepted_order(client, auth_headers, create_order):
    # A stranger must get 403 (not 409): ownership is checked before status, so
    # they never learn the order has been accepted.
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")
    stranger = auth_headers(email="stranger@test.com", password="123456", name="路人")

    order_id = create_order(headers=buyer).json()["id"]
    assert client.post(f"/orders/{order_id}/accept", headers=runner).status_code == 200

    resp = client.post(f"/orders/{order_id}/cancel", headers=stranger)

    assert resp.status_code == 403
    assert resp.json()["detail"] == "Only the order creator can cancel this order"


def test_cancel_unknown_order_returns_404(client, auth_headers):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")

    resp = client.post("/orders/o_nonexistent/cancel", headers=buyer)

    assert resp.status_code == 404


def test_cancel_requires_login(client, auth_headers, create_order):
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    order_id = create_order(headers=buyer).json()["id"]

    resp = client.post(f"/orders/{order_id}/cancel")

    assert resp.status_code == 401


def test_cancelled_order_is_not_in_my_open_orders_again(client, auth_headers, create_order):
    # A cancelled order must not reappear in the open feed even after a fresh
    # list call (the open-index entry was removed, not just filtered once).
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")

    order_id = create_order(headers=buyer).json()["id"]
    client.post(f"/orders/{order_id}/cancel", headers=buyer)

    # Two independent reads to ensure persistence, not a one-shot filter.
    first = client.get("/orders/open", headers=runner)
    second = client.get("/orders/open", headers=runner)

    assert first.json() == []
    assert second.json() == []
