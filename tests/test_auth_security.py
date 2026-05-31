"""JWT / authentication boundary tests (closing the security-test gaps from the
PR #9 review).

The original suite asserted "missing token -> 401" only on /auth/me. Production
auth code must also reject expired, forged (wrong-secret), and tampered tokens,
and protect the order/rating endpoints. Tokens are minted with the app's *own*
secret/algorithm read at runtime so the tests stay correct if config changes.
"""

from datetime import datetime, timedelta, timezone

import jwt

from app.config import settings

PROTECTED_GET = "/orders/open"


def _mint(payload, *, secret=None, algorithm=None):
    return jwt.encode(
        payload,
        secret or settings.JWT_SECRET_KEY,
        algorithm=algorithm or settings.JWT_ALGORITHM,
    )


def test_protected_route_requires_a_token(client):
    assert client.get(PROTECTED_GET).status_code == 401


def test_malformed_bearer_token_rejected(client):
    resp = client.get(PROTECTED_GET, headers={"Authorization": "Bearer not-a-jwt"})
    assert resp.status_code == 401


def test_expired_token_rejected(client, auth_headers):
    headers = auth_headers(email="exp@test.com", password="123456", name="過期")
    uid = client.get("/auth/me", headers=headers).json()["id"]

    expired = _mint({"sub": uid, "exp": datetime.now(timezone.utc) - timedelta(hours=1)})
    resp = client.get(PROTECTED_GET, headers={"Authorization": f"Bearer {expired}"})
    assert resp.status_code == 401


def test_token_signed_with_wrong_secret_rejected(client, auth_headers):
    headers = auth_headers(email="forge@test.com", password="123456", name="偽簽")
    uid = client.get("/auth/me", headers=headers).json()["id"]

    forged = _mint(
        {"sub": uid, "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        secret="attacker-controlled-secret",
    )
    resp = client.get(PROTECTED_GET, headers={"Authorization": f"Bearer {forged}"})
    assert resp.status_code == 401


def test_tampered_token_rejected(client, auth_headers):
    headers = auth_headers(email="tamper@test.com", password="123456", name="竄改")
    token = headers["Authorization"].split(" ", 1)[1]

    tampered = token[:-2] + ("aa" if not token.endswith("aa") else "bb")
    resp = client.get(PROTECTED_GET, headers={"Authorization": f"Bearer {tampered}"})
    assert resp.status_code == 401


def test_token_with_no_subject_rejected(client):
    # A validly-signed token that lacks the `sub` claim must not authenticate.
    no_sub = _mint({"exp": datetime.now(timezone.utc) + timedelta(hours=1)})
    resp = client.get(PROTECTED_GET, headers={"Authorization": f"Bearer {no_sub}"})
    assert resp.status_code == 401
