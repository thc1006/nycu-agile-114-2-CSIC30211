def test_register_success(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "buyer@test.com",
            "password": "123456",
            "name": "小美",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == "buyer@test.com"
    assert data["name"] == "小美"
    assert data["id"].startswith("u_")


def test_register_duplicate_email(client):
    payload = {
        "email": "buyer@test.com",
        "password": "123456",
        "name": "小美",
    }

    first_response = client.post("/auth/register", json=payload)
    second_response = client.post("/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Email already registered"


def test_login_success(client, register_user):
    register_user(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "buyer@test.com",
            "password": "123456",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, register_user):
    register_user(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "buyer@test.com",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_get_current_user_success(client, auth_headers):
    headers = auth_headers(
        email="buyer@test.com",
        password="123456",
        name="小美",
    )

    response = client.get("/auth/me", headers=headers)

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == "buyer@test.com"
    assert data["name"] == "小美"
    assert data["id"].startswith("u_")


def test_get_current_user_without_token(client):
    response = client.get("/auth/me")

    assert response.status_code == 401