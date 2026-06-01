import os

# Must be set before importing app.main
os.environ["REDIS_DB"] = "15"
# A >=32-byte, non-placeholder secret so config validation passes under test.
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-ci-0123456789abcdef"

import pytest
import redis
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def redis_client():
    client = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", "6379")),
        db=int(os.getenv("REDIS_DB", "15")),
        password=os.getenv("REDIS_PASSWORD") or None,
        decode_responses=True,
    )

    client.flushdb()
    yield client
    client.flushdb()


@pytest.fixture()
def client(redis_client):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def register_user(client):
    def _register_user(
        email: str = "user@test.com",
        password: str = "123456",
        name: str = "Test User",
    ):
        response = client.post(
            "/auth/register",
            json={
                "email": email,
                "password": password,
                "name": name,
            },
        )
        return response

    return _register_user


@pytest.fixture()
def login_user(client):
    def _login_user(
        email: str = "user@test.com",
        password: str = "123456",
    ):
        response = client.post(
            "/auth/login",
            json={
                "email": email,
                "password": password,
            },
        )
        return response

    return _login_user


@pytest.fixture()
def auth_headers(register_user, login_user):
    def _auth_headers(
        email: str = "user@test.com",
        password: str = "123456",
        name: str = "Test User",
    ):
        register_user(email=email, password=password, name=name)
        login_response = login_user(email=email, password=password)

        assert login_response.status_code == 200

        token = login_response.json()["access_token"]

        return {
            "Authorization": f"Bearer {token}",
        }

    return _auth_headers


@pytest.fixture()
def create_order(client):
    def _create_order(headers: dict, expected_time: str = "2026-06-01T12:30:00+08:00"):
        response = client.post(
            "/orders",
            headers=headers,
            json={
                "restaurant": "二餐",
                "meal": "雞腿便當",
                "pickup_location": "資工系館",
                "expected_time": expected_time,
                "delivery_fee": 20,
            },
        )
        return response

    return _create_order