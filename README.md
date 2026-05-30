# nycu-agile-114-2-CSIC30211

CampusEats backend for AG-000 to AG-004.

This backend currently supports:

* AG-000: Project setup, FastAPI app, Redis connection, health check
* AG-001: Email registration and login
* AG-002: Create order
* AG-003: List open orders
* AG-004: Accept order with basic concurrency protection
* AG-005: Update order status (start buying / mark delivered)
* AG-006: Confirm receipt
* AG-007: Two-way star rating with per-user aggregate

---

## Features

* FastAPI backend
* Redis data storage
* Email register
* Email login
* JWT authentication
* Create order
* List open orders
* Accept order
* Update order status (start buying / mark delivered)
* Confirm receipt
* Two-way star rating (1-5) with per-user aggregate
* Automated API tests with pytest
* Git pre-push hook to block push if tests fail

---

## Project Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── redis_client.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── orders.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── order.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   └── order_service.py
│   │
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── user_repo.py
│   │   └── order_repo.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── security.py
│       └── auth.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_health.py
│   ├── test_auth.py
│   └── test_orders.py
│
├── scripts/
│   └── run-tests.sh
│
├── .githooks/
│   └── pre-push
│
├── requirements.txt
├── .env
├── docker-compose.yml
└── README.md
```

---

## Requirements

* Python 3.12 is recommended
* Redis
* Homebrew, if running Redis locally on macOS

---

## Setup

### 1. Create virtual environment

Run this in the project root:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

If `python3.12` is not available, use:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Check that the virtual environment is active:

```bash
which python
which pip
python --version
pip --version
```

The paths should point to `.venv`, for example:

```text
.../nycu-agile-114-2-CSIC30211/.venv/bin/python
.../nycu-agile-114-2-CSIC30211/.venv/bin/pip
```

---

### 2. Upgrade pip

```bash
python -m pip install --upgrade pip setuptools wheel
```

---

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

Do not use global `pip install` directly. Always install packages inside the virtual environment.

---

## Redis Setup without Docker

Install Redis:

```bash
brew install redis
```

Start Redis:

```bash
brew services start redis
```

Check Redis:

```bash
redis-cli ping
```

Expected output:

```text
PONG
```

---

## Optional: Redis Setup with Docker

This project mainly uses local Redis through Homebrew, but a Docker Compose file is also included for teammates who prefer Docker.

```bash
docker compose up -d
```

If your Docker version does not support `docker compose`, use local Redis through Homebrew instead.

---

## Environment Variables

Create a `.env` file in the project root:

```env
APP_NAME=CampusEats API
APP_ENV=development

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

JWT_SECRET_KEY=campuseats-local-development-secret-key-please-change-later
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## Start Backend

Make sure the virtual environment is active:

```bash
source .venv/bin/activate
```

Make sure Redis is running:

```bash
brew services start redis
redis-cli ping
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

---

## Health Check

In another terminal, run:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "redis": "connected"
}
```

---

## API Docs

Open Swagger UI:

```text
http://127.0.0.1:8000/docs
```

---

## Test Flow with curl

### 1. Register buyer

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@test.com",
    "password": "123456",
    "name": "小美"
  }'
```

---

### 2. Register runner

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "runner@test.com",
    "password": "123456",
    "name": "阿翔"
  }'
```

---

### 3. Login buyer

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@test.com",
    "password": "123456"
  }'
```

Copy the returned `access_token`.

---

### 4. Create order

Replace `BUYER_TOKEN` with the buyer token.

```bash
curl -X POST http://127.0.0.1:8000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -d '{
    "restaurant": "二餐",
    "meal": "雞腿便當",
    "pickup_location": "資工系館",
    "expected_time": "2026-06-01T12:30:00+08:00",
    "delivery_fee": 20
  }'
```

Copy the returned `id` as `ORDER_ID`.

---

### 5. Login runner

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "runner@test.com",
    "password": "123456"
  }'
```

Copy the returned `access_token`.

---

### 6. List open orders

Replace `RUNNER_TOKEN` with the runner token.

```bash
curl http://127.0.0.1:8000/orders/open \
  -H "Authorization: Bearer RUNNER_TOKEN"
```

---

### 7. Accept order

Replace `ORDER_ID` and `RUNNER_TOKEN`.

```bash
curl -X POST http://127.0.0.1:8000/orders/ORDER_ID/accept \
  -H "Authorization: Bearer RUNNER_TOKEN"
```

Expected result:

```text
status = ACCEPTED
```

After accepting the order, the order should disappear from `/orders/open`.

---

### 8. Update status: start buying (runner)

```bash
curl -X POST http://127.0.0.1:8000/orders/ORDER_ID/start \
  -H "Authorization: Bearer RUNNER_TOKEN"
```

`status` becomes `BUYING`.

---

### 9. Update status: mark delivered (runner)

```bash
curl -X POST http://127.0.0.1:8000/orders/ORDER_ID/deliver \
  -H "Authorization: Bearer RUNNER_TOKEN"
```

`status` becomes `DELIVERED`. Transitions are forward-only: skipping a step
(e.g. accept then deliver) returns `409`.

---

### 10. Confirm receipt (buyer)

```bash
curl -X POST http://127.0.0.1:8000/orders/ORDER_ID/confirm \
  -H "Authorization: Bearer BUYER_TOKEN"
```

`status` becomes `COMPLETED`. Only the orderer can confirm; only the runner can
`start` / `deliver` (otherwise `403`).

---

### 11. Rate the order (each party once)

```bash
curl -X POST http://127.0.0.1:8000/orders/ORDER_ID/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -d '{ "stars": 5 }'
```

Only after `COMPLETED`; the runner rates back with `RUNNER_TOKEN`. Each
participant may rate once, ratings are immutable, and `stars` must be 1-5.

---

### 12. View a user's aggregate rating

```bash
curl http://127.0.0.1:8000/users/USER_ID/rating \
  -H "Authorization: Bearer ANY_TOKEN"
```

Returns e.g. `{ "user_id": "u_...", "average": 5.0, "count": 1 }`.

---

## Automated Tests

This project uses `pytest` for automated API testing.

The tests cover:

* Health check
* User registration
* Duplicate email registration
* Login
* Invalid login
* Get current user
* Create order
* Reject invalid order input
* List open orders
* Sort open orders by expected time
* Accept order
* Reject accepting own order
* Reject accepting the same order twice
* Remove accepted order from open order list
* Update status: start buying / mark delivered (runner only)
* Reject illegal / skipped status transitions and updates on terminal orders
* Confirm receipt (orderer only)
* Two-way rating after completion (1-5, once per user, immutable)
* Reject rating before completion or by non-participants
* Per-user rating aggregate (average + count)

The tests use Redis DB 15 to avoid modifying development data in Redis DB 0.

---

### Run tests

Make sure Redis is running:

```bash
brew services start redis
redis-cli ping
```

Run tests:

```bash
source .venv/bin/activate
python -m pytest -q
```

Expected result:

```text
35 passed
```

Warnings may appear, but they do not mean the tests failed. The important part is that all tests pass.

---

## Pre-push Test Hook

This project uses a Git pre-push hook to prevent pushing broken code.

Before every `git push`, the hook runs:

```bash
python -m pytest -q
```

If any test fails, the push will be aborted.

---

### Hook file structure

```text
.githooks/
└── pre-push

scripts/
└── run-tests.sh
```

---

### Enable Git hooks

Run this once in the project root:

```bash
git config core.hooksPath .githooks
```

Check the setting:

```bash
git config core.hooksPath
```

Expected output:

```text
.githooks
```

---

### Make hook scripts executable

Run:

```bash
chmod +x scripts/run-tests.sh
chmod +x .githooks/pre-push
```

This is necessary. Otherwise, you may see:

```text
zsh: permission denied: ./scripts/run-tests.sh
```

---

### Run tests manually through the script

```bash
./scripts/run-tests.sh
```

Expected result:

```text
35 passed
```

---

### Test pre-push hook

Run:

```bash
git push
```

Before pushing, Git will automatically run the test script.

If tests pass:

```text
Tests passed. Push allowed.
```

If tests fail:

```text
Tests failed. Push aborted.
```

---

## Daily Development Commands

### Start backend

```bash
cd ~/Downloads/nycu-agile-114-2-CSIC30211
source .venv/bin/activate
brew services start redis
uvicorn app.main:app --reload
```

---

### Run tests

```bash
cd ~/Downloads/nycu-agile-114-2-CSIC30211
source .venv/bin/activate
brew services start redis
python -m pytest -q
```

---

### Run tests through pre-push script

```bash
./scripts/run-tests.sh
```

---

## Current Story Status

| ID     | Story                    | Priority | Sprint   | Estimate | Status |
| ------ | ------------------------ | -------- | -------- | -------- | ------ |
| AG-000 | Project Setup / 產品探索文件整理 | P0       | Sprint 0 | M        | Done   |
| AG-001 | Email 註冊與登入              | P0       | Sprint 1 | M        | Done   |
| AG-002 | 發布訂單                     | P0       | Sprint 1 | M        | Done   |
| AG-003 | 瀏覽待接訂單列表                 | P0       | Sprint 1 | S        | Done   |
| AG-004 | 接單                       | P0       | Sprint 2 | M        | Done   |
| AG-005 | 更新訂單狀態                   | P0       | Sprint 2 | M        | Done   |
| AG-006 | 確認收餐                     | P0       | Sprint 3 | S        | Done   |
| AG-007 | 雙向評價                     | P1       | Sprint 3 | M        | Done   |

---

## Notes

* Use the virtual environment before running the backend or tests.
* Redis must be running before starting the backend or running tests.
* Tests use Redis DB 15.
* Development uses Redis DB 0.
* Do not commit `.venv`.
* Do not commit real production secrets.
