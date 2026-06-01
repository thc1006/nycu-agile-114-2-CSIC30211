"""AG-007 two-way rating tests.

Rules: only COMPLETED orders can be rated; 1-5 stars only; each participant
rates a given order exactly once; ratings are immutable; only the two
participants may rate; per-user aggregate (average + count) is exposed.
"""


def _user_id(client, headers):
    return client.get("/auth/me", headers=headers).json()["id"]


def _complete_order(client, auth_headers, create_order):
    """Drive an order all the way to COMPLETED, returning ids + headers."""
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")

    order_id = create_order(headers=buyer).json()["id"]

    assert client.post(f"/orders/{order_id}/accept", headers=runner).status_code == 200
    assert client.post(f"/orders/{order_id}/start", headers=runner).status_code == 200
    assert client.post(f"/orders/{order_id}/deliver", headers=runner).status_code == 200
    assert client.post(f"/orders/{order_id}/confirm", headers=buyer).status_code == 200

    return order_id, buyer, runner


def test_both_parties_can_rate_and_ratee_is_the_other(client, auth_headers, create_order):
    order_id, buyer, runner = _complete_order(client, auth_headers, create_order)
    buyer_id = _user_id(client, buyer)
    runner_id = _user_id(client, runner)

    by_buyer = client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": 5})
    assert by_buyer.status_code == 201
    assert by_buyer.json()["stars"] == 5
    assert by_buyer.json()["rater_id"] == buyer_id
    assert by_buyer.json()["ratee_id"] == runner_id

    by_runner = client.post(f"/orders/{order_id}/ratings", headers=runner, json={"stars": 4})
    assert by_runner.status_code == 201
    assert by_runner.json()["rater_id"] == runner_id
    assert by_runner.json()["ratee_id"] == buyer_id


def test_cannot_rate_before_completed(client, auth_headers, create_order):
    # Order only accepted (not completed) -> rating rejected.
    buyer = auth_headers(email="buyer@test.com", password="123456", name="小美")
    runner = auth_headers(email="runner@test.com", password="123456", name="阿翔")
    order_id = create_order(headers=buyer).json()["id"]
    client.post(f"/orders/{order_id}/accept", headers=runner)

    resp = client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": 5})
    assert resp.status_code == 409


def test_rating_must_be_between_1_and_5(client, auth_headers, create_order):
    order_id, buyer, runner = _complete_order(client, auth_headers, create_order)

    assert client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": 0}).status_code == 422
    assert client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": 6}).status_code == 422


def test_cannot_rate_same_order_twice(client, auth_headers, create_order):
    order_id, buyer, runner = _complete_order(client, auth_headers, create_order)

    first = client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": 5})
    second = client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": 3})

    assert first.status_code == 201
    assert second.status_code == 409


def test_non_participant_cannot_rate(client, auth_headers, create_order):
    order_id, buyer, runner = _complete_order(client, auth_headers, create_order)
    stranger = auth_headers(email="stranger@test.com", password="123456", name="路人")

    resp = client.post(f"/orders/{order_id}/ratings", headers=stranger, json={"stars": 5})
    assert resp.status_code == 403


def test_rating_requires_login(client, auth_headers, create_order):
    order_id, buyer, runner = _complete_order(client, auth_headers, create_order)

    resp = client.post(f"/orders/{order_id}/ratings", json={"stars": 5})
    assert resp.status_code == 401


def test_user_aggregate_averages_across_orders(client, auth_headers, create_order):
    # Same buyer rates the same runner across two completed orders: 5 then 3.
    order1, buyer, runner = _complete_order(client, auth_headers, create_order)
    order2, buyer, runner = _complete_order(client, auth_headers, create_order)
    runner_id = _user_id(client, runner)

    assert client.post(f"/orders/{order1}/ratings", headers=buyer, json={"stars": 5}).status_code == 201
    assert client.post(f"/orders/{order2}/ratings", headers=buyer, json={"stars": 3}).status_code == 201

    agg = client.get(f"/users/{runner_id}/rating", headers=buyer).json()
    assert agg["count"] == 2
    assert agg["average"] == 4.0


def test_unrated_user_has_zero_aggregate(client, auth_headers):
    headers = auth_headers(email="nobody@test.com", password="123456", name="無人評")
    user_id = _user_id(client, headers)

    agg = client.get(f"/users/{user_id}/rating", headers=headers).json()
    assert agg["count"] == 0
    assert agg["average"] == 0.0


def test_aggregate_rounds_non_integer_average(client, auth_headers, create_order):
    # 5 + 4 + 4 over three orders -> 13 / 3 = 4.333... -> rounded to 4.33.
    order1, buyer, runner = _complete_order(client, auth_headers, create_order)
    order2, buyer, runner = _complete_order(client, auth_headers, create_order)
    order3, buyer, runner = _complete_order(client, auth_headers, create_order)
    runner_id = _user_id(client, runner)

    for order_id, stars in [(order1, 5), (order2, 4), (order3, 4)]:
        assert client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": stars}).status_code == 201

    agg = client.get(f"/users/{runner_id}/rating", headers=buyer).json()
    assert agg["count"] == 3
    assert agg["average"] == 4.33


def test_both_aggregates_credited_to_the_correct_user(client, auth_headers, create_order):
    # Bilateral: buyer rates runner 5, runner rates buyer 3 — each lands on the
    # OTHER party's aggregate, not the rater's.
    order_id, buyer, runner = _complete_order(client, auth_headers, create_order)
    buyer_id = _user_id(client, buyer)
    runner_id = _user_id(client, runner)

    client.post(f"/orders/{order_id}/ratings", headers=buyer, json={"stars": 5})
    client.post(f"/orders/{order_id}/ratings", headers=runner, json={"stars": 3})

    runner_agg = client.get(f"/users/{runner_id}/rating", headers=buyer).json()
    buyer_agg = client.get(f"/users/{buyer_id}/rating", headers=runner).json()

    assert runner_agg["count"] == 1 and runner_agg["average"] == 5.0
    assert buyer_agg["count"] == 1 and buyer_agg["average"] == 3.0


def test_user_rating_requires_login(client, auth_headers):
    headers = auth_headers(email="someone@test.com", password="123456", name="某人")
    user_id = _user_id(client, headers)

    resp = client.get(f"/users/{user_id}/rating")
    assert resp.status_code == 401
