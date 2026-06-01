"""CORS gate (#12): the browser frontend must be allowed to call the API.

These assert the CORSMiddleware is wired with an explicit origin allow-list
(never "*"), including the preflight path.
"""

ALLOWED_ORIGIN = "http://localhost:5173"


def test_cors_allows_configured_frontend_origin(client):
    res = client.get("/", headers={"Origin": ALLOWED_ORIGIN})
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == ALLOWED_ORIGIN


def test_cors_preflight_for_login(client):
    res = client.options(
        "/auth/login",
        headers={
            "Origin": ALLOWED_ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert res.status_code in (200, 204)
    assert res.headers.get("access-control-allow-origin") == ALLOWED_ORIGIN


def test_cors_rejects_unknown_origin(client):
    res = client.get("/", headers={"Origin": "http://evil.example"})
    # Starlette omits the allow-origin header entirely for disallowed origins.
    assert res.headers.get("access-control-allow-origin") != "http://evil.example"
