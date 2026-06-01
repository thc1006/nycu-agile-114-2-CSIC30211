def test_create_order_success(client, auth_headers):
    buyer_headers = auth_headers(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    response = client.post(
        "/orders",
        headers=buyer_headers,
        json={
            "restaurant": "二餐",
            "meal": "雞腿便當",
            "pickup_location": "資工系館",
            "expected_time": "2026-06-01T12:30:00+08:00",
            "delivery_fee": 20,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["id"].startswith("o_")
    assert data["restaurant"] == "二餐"
    assert data["meal"] == "雞腿便當"
    assert data["pickup_location"] == "資工系館"
    assert data["delivery_fee"] == 20
    assert data["status"] == "OPEN"
    assert data["runner_id"] is None


def test_create_order_requires_login(client):
    response = client.post(
        "/orders",
        json={
            "restaurant": "二餐",
            "meal": "雞腿便當",
            "pickup_location": "資工系館",
            "expected_time": "2026-06-01T12:30:00+08:00",
            "delivery_fee": 20,
        },
    )

    assert response.status_code == 401


def test_create_order_rejects_negative_delivery_fee(client, auth_headers):
    buyer_headers = auth_headers(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    response = client.post(
        "/orders",
        headers=buyer_headers,
        json={
            "restaurant": "二餐",
            "meal": "雞腿便當",
            "pickup_location": "資工系館",
            "expected_time": "2026-06-01T12:30:00+08:00",
            "delivery_fee": -10,
        },
    )

    assert response.status_code == 422


def test_list_open_orders_success(client, auth_headers):
    buyer_headers = auth_headers(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    runner_headers = auth_headers(
        email="runner@test.com",
        password="123456",
        name="阿翔",
    )

    client.post(
        "/orders",
        headers=buyer_headers,
        json={
            "restaurant": "三餐",
            "meal": "牛肉麵",
            "pickup_location": "交大圖書館",
            "expected_time": "2026-06-01T13:00:00+08:00",
            "delivery_fee": 30,
        },
    )

    client.post(
        "/orders",
        headers=buyer_headers,
        json={
            "restaurant": "二餐",
            "meal": "雞腿便當",
            "pickup_location": "資工系館",
            "expected_time": "2026-06-01T12:30:00+08:00",
            "delivery_fee": 20,
        },
    )

    response = client.get("/orders/open", headers=runner_headers)

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    # Should be sorted by expected_time ascending
    assert data[0]["restaurant"] == "二餐"
    assert data[1]["restaurant"] == "三餐"

    assert data[0]["status"] == "OPEN"
    assert data[1]["status"] == "OPEN"


def test_accept_order_success(client, auth_headers, create_order):
    buyer_headers = auth_headers(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    runner_headers = auth_headers(
        email="runner@test.com",
        password="123456",
        name="阿翔",
    )

    create_response = create_order(headers=buyer_headers)
    assert create_response.status_code == 201

    order_id = create_response.json()["id"]

    accept_response = client.post(
        f"/orders/{order_id}/accept",
        headers=runner_headers,
    )

    assert accept_response.status_code == 200

    data = accept_response.json()

    assert data["id"] == order_id
    assert data["status"] == "ACCEPTED"
    assert data["runner_id"] is not None


def test_customer_cannot_accept_own_order(client, auth_headers, create_order):
    buyer_headers = auth_headers(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    create_response = create_order(headers=buyer_headers)
    assert create_response.status_code == 201

    order_id = create_response.json()["id"]

    accept_response = client.post(
        f"/orders/{order_id}/accept",
        headers=buyer_headers,
    )

    assert accept_response.status_code == 400
    assert accept_response.json()["detail"] == "Customer cannot accept their own order"


def test_cannot_accept_order_twice(client, auth_headers, create_order):
    buyer_headers = auth_headers(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    runner_headers = auth_headers(
        email="runner@test.com",
        password="123456",
        name="阿翔",
    )

    another_runner_headers = auth_headers(
        email="another@test.com",
        password="123456",
        name="小明",
    )

    create_response = create_order(headers=buyer_headers)
    assert create_response.status_code == 201

    order_id = create_response.json()["id"]

    first_accept_response = client.post(
        f"/orders/{order_id}/accept",
        headers=runner_headers,
    )

    second_accept_response = client.post(
        f"/orders/{order_id}/accept",
        headers=another_runner_headers,
    )

    assert first_accept_response.status_code == 200
    assert second_accept_response.status_code == 409
    assert second_accept_response.json()["detail"] == "Order has already been accepted"


def test_accepted_order_disappears_from_open_list(client, auth_headers, create_order):
    buyer_headers = auth_headers(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    runner_headers = auth_headers(
        email="runner@test.com",
        password="123456",
        name="阿翔",
    )

    create_response = create_order(headers=buyer_headers)
    assert create_response.status_code == 201

    order_id = create_response.json()["id"]

    before_accept_response = client.get(
        "/orders/open",
        headers=runner_headers,
    )

    assert before_accept_response.status_code == 200
    assert len(before_accept_response.json()) == 1

    accept_response = client.post(
        f"/orders/{order_id}/accept",
        headers=runner_headers,
    )

    assert accept_response.status_code == 200

    after_accept_response = client.get(
        "/orders/open",
        headers=runner_headers,
    )

    assert after_accept_response.status_code == 200
    assert after_accept_response.json() == []