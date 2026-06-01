"""Object-level authorization for GET /orders/{id} (IDOR regression — OWASP A01).

Before the fix, any authenticated user could read any order's full details
(customer, runner, pickup location). These pin the participant-only rule while
keeping OPEN orders publicly readable (they are listed in the runner feed).
"""


def _create_order_id(client, headers) -> str:
    res = client.post(
        "/orders",
        headers=headers,
        json={
            "restaurant": "二餐",
            "meal": "雞腿便當",
            "pickup_location": "資工系館",
            "expected_time": "2026-06-01T12:30:00+08:00",
            "delivery_fee": 20,
        },
    )
    assert res.status_code == 201
    return res.json()["id"]


def test_open_order_is_readable_by_any_authenticated_user(client, auth_headers):
    customer = auth_headers(email="customer@test.com")
    stranger = auth_headers(email="stranger@test.com")
    order_id = _create_order_id(client, customer)

    # OPEN orders are public — a runner must be able to inspect before accepting.
    assert client.get(f"/orders/{order_id}", headers=stranger).status_code == 200


def test_accepted_order_readable_by_customer_and_runner(client, auth_headers):
    customer = auth_headers(email="customer@test.com")
    runner = auth_headers(email="runner@test.com")
    order_id = _create_order_id(client, customer)
    assert client.post(f"/orders/{order_id}/accept", headers=runner).status_code == 200

    assert client.get(f"/orders/{order_id}", headers=customer).status_code == 200
    assert client.get(f"/orders/{order_id}", headers=runner).status_code == 200


def test_accepted_order_hidden_from_non_participant(client, auth_headers):
    customer = auth_headers(email="customer@test.com")
    runner = auth_headers(email="runner@test.com")
    stranger = auth_headers(email="stranger@test.com")
    order_id = _create_order_id(client, customer)
    assert client.post(f"/orders/{order_id}/accept", headers=runner).status_code == 200

    # The IDOR: a non-participant must NOT see an accepted order's details.
    assert client.get(f"/orders/{order_id}", headers=stranger).status_code == 403


def test_missing_order_still_returns_404(client, auth_headers):
    headers = auth_headers()
    assert client.get("/orders/o_does_not_exist", headers=headers).status_code == 404
