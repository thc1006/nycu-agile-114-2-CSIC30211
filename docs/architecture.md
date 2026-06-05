# CampusEats — Architecture

This document describes the architecture of CampusEats as built for the v1.0.0 MVP: the system topology, the backend and frontend designs, the data model, and the deployment pipeline. For the *why* behind individual choices, see the [Architecture Decision Records](adr/).

- [1. System overview](#1-system-overview)
- [2. Backend](#2-backend)
- [3. Frontend](#3-frontend)
- [4. Order lifecycle (end to end)](#4-order-lifecycle-end-to-end)
- [5. Data model & Redis schema](#5-data-model--redis-schema)
- [6. Deployment & CI/CD](#6-deployment--cicd)
- [7. Cross-cutting concerns](#7-cross-cutting-concerns)

---

## 1. System overview

CampusEats is a single-page React app talking to a FastAPI service over a JSON/HTTP API, with Redis as the only datastore. Everything ships as containers onto Kubernetes behind one TLS ingress.

```
   Browser (React SPA)
        │  HTTPS
        ▼
   Cloudflare (TLS, WAF)
        │
        ▼
   Ingress (campuseat.hsuan.app)
     ├── /          ──▶  frontend  (nginx serving the built SPA, history fallback)
     └── /api/...   ──▶  backend   (FastAPI/uvicorn; ingress strips the /api prefix)
                              │
                              ▼
                           Redis  (StatefulSet + PVC, AOF persistence)
```

**Key properties**

- **Stateless backend, single datastore.** Backend pods hold no session state; users, orders, ratings, and locks all live in Redis. This lets the backend scale horizontally (2 replicas + HPA) behind the service.
- **One account, two roles.** The backend models only *users*; "orderer" and "runner" are a per-login **UI mode**, not a stored attribute (see [ADR-0008] context and §3). Any user can act as either.
- **Polling, not push.** Cross-role "real-time" is REST polling (4–5 s). No WebSockets — a deliberate MVP simplification (AG-009 push notifications deferred).

---

## 2. Backend

FastAPI application under `app/`, organised in three layers plus shared utilities:

```
app/
├── main.py            # app factory, lifespan (Redis connect/close), CORS, router wiring, /health
├── config.py          # pydantic-settings: env config + JWT-secret hardening
├── redis_client.py    # async Redis client lifecycle (init/close/get)
├── api/               # routers: auth.py, orders.py, users.py  (HTTP + validation only)
├── services/          # business logic: auth_service.py, order_service.py (FSM, authz, locks)
├── repositories/      # Redis access: user_repo.py, order_repo.py (keys, serialization, Lua)
├── models/            # pydantic request/response schemas
└── utils/             # security.py (bcrypt + JWT), auth.py (get_current_user dependency)
```

**Layer contract:** `api` parses/validates and shapes responses; `services` own all rules (state transitions, authorization, locking); `repositories` are the only code that touches Redis keys. Routers never call Redis directly.

### Request lifecycle

1. `main.py` `lifespan` opens the Redis connection on startup (and `ping`s it) and closes it on shutdown.
2. CORS middleware allows an explicit origin allow-list (never `*`) from `CORS_ORIGINS`, with credentials.
3. A request hits a router; protected routes depend on `get_current_user`, which decodes the JWT bearer token and loads the user from Redis (`401` if missing/expired/unknown).
4. The router calls a service method; the service enforces rules and calls repositories; the response model serializes the result.

### Authentication

- **Passwords** — bcrypt via passlib (`hash_password` / `verify_password`).
- **Tokens** — JWT (HS256). Payload: `sub` (user id), `email`, `exp`. Expiry defaults to `ACCESS_TOKEN_EXPIRE_MINUTES` (1440 = 24 h). Signing key `JWT_SECRET_KEY` must be ≥ 32 bytes; `config.py` rejects weak/known-default secrets at startup, so a misconfigured deploy fails fast.
- **Register** → `409` on duplicate email; user id is `u_<12 hex>`. **Login** → `401` on bad email *or* password (indistinguishable, to avoid user enumeration).

### Order state machine

The lifecycle is an explicit, forward-only table in `order_service.py` (see [ADR-0007]):

| Action | From → To | Actor | Endpoint |
|---|---|---|---|
| accept | `OPEN` → `ACCEPTED` | runner | `POST /orders/{id}/accept` |
| start | `ACCEPTED` → `BUYING` | runner | `POST /orders/{id}/start` |
| deliver | `BUYING` → `DELIVERED` | runner | `POST /orders/{id}/deliver` |
| confirm | `DELIVERED` → `COMPLETED` | orderer | `POST /orders/{id}/confirm` |
| cancel | `OPEN` → `CANCELLED` | orderer | `POST /orders/{id}/cancel` |

- **Wrong state → `409`**, **wrong actor → `403`**. `COMPLETED` and `CANCELLED` are terminal.
- **Concurrency** — every mutating action takes a per-order lock `lock:order:{id}` (`SET NX EX 5`) with a caller-unique value, released via an atomic compare-and-delete Lua script in a `finally`. This makes "two runners accept at once" safe: the loser gets `409` (see [ADR-0005]). A runner cannot accept their own order (`400`).
- **Object-level authorization** — `GET /orders/{id}` returns an `OPEN` order to any authenticated user (the feed needs this) but restricts non-`OPEN` orders to the customer or runner (`403` otherwise), closing an IDOR.

### Ratings

Bilateral, one-shot, immutable (see [ADR-0008]). After `COMPLETED`, each participant may rate the other once. The repository runs a Lua script that `HSETNX`-guards the per-(order, rater) entry and, only if newly inserted, bumps the ratee's aggregate (`count`, `sum`) — so a crash or retry can never double-count. A second attempt by the same rater → `409`; a non-participant → `403`. `GET /users/{id}/rating` returns `{average, count}` (zeros if never rated).

### Fees

`delivery_fee` is an integer chosen by the orderer at post time and stored verbatim; the backend does not compute or transfer money (the UI surfaces a suggested fee). Runner "earnings" are derived client-side by summing fees of completed orders.

### Configuration (env)

| Var | Default | Notes |
|---|---|---|
| `APP_NAME` / `APP_ENV` | `CampusEats API` / `development` | `production` in the cluster |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_DB` / `REDIS_PASSWORD` | `localhost` / `6379` / `0` / – | `REDIS_HOST=redis` in k8s |
| `JWT_SECRET_KEY` | — (required) | ≥ 32 bytes; weak/known values rejected at startup |
| `JWT_ALGORITHM` / `ACCESS_TOKEN_EXPIRE_MINUTES` | `HS256` / `1440` | |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:4173` | the public origin in prod |

---

## 3. Frontend

A React 19 SPA built with Vite + TypeScript and react-router 7 (`frontend/`).

```
frontend/src/
├── main.tsx, App.tsx        # entry + route table (15 pages + .html aliases + redirects)
├── pages/                   # one *Page.tsx (chrome) + a logic component each
│   └── PageChrome.tsx       # shared layout/footer, role guards, legacy-runtime bridge
├── lib/
│   ├── api/                 # client.ts (apiFetch, token), auth/orders/ratings, schema.d.ts (generated)
│   ├── session.ts           # useRequireAuth, role helpers, logout
│   ├── appInfo.ts           # app/version metadata (About)
│   └── legacy*.ts           # bridge to the vendored legacy chrome runtime
└── legacy/                  # vendored campus-web.css/js (design tokens + chrome), excluded from coverage
```

### API client & types

`apiFetch<T>` is a small hand-rolled fetch wrapper: it injects the bearer token when `auth: true`, serializes JSON, and normalizes every failure into a typed `ApiError(status, detail)` (network/CORS failures become status `0`). Request/response types come from `schema.d.ts`, **generated** from `docs/api/openapi.json` via `npm run gen:api`, so the client tracks the backend contract.

`API_BASE` is `VITE_API_BASE` — `/api` in production (same-origin, proxied by ingress), the direct backend URL in dev (Vite proxies `/api` → `:8000`).

### Session & role model

- **Token storage** — the JWT (`ce_token`) is written to *both* `sessionStorage` (per-tab) and `localStorage` (persistence), and read sessionStorage-first. This lets an orderer and a runner be logged in simultaneously in two tabs of the same browser without one clobbering the other, while still keeping a single tab logged in across reloads.
- **Role** — `orderer | runner` is a UI mode resolved from `?role=` then `localStorage('campuseats.role')`, chosen at login. It is **not** sent to or stored by the backend.
- **Auth gating** — `useRequireAuth()` fetches `/auth/me` on mount and bounces to `/login` on no-token/`401`. `PageChrome` additionally enforces role-specific deep-link guards (e.g. `/feed` is runner-only) and bounces wrong-role links home.

### Routing & the legacy bridge

The route table registers each page at both `/x` and `/x.html`, and redirects legacy `/index`, `/landing` to `/`. The app started as static HTML pages and was migrated page-by-page to React; a vendored legacy runtime (`legacy/campus-web.js`, shared CSS/design-tokens) is still used for chrome. `PageChrome` installs a navigation hook so legacy `<a href="x.html">` links route through react-router instead of full-reloading, and runs each page's one-time inline scripts safely (failures degrade to the already-rendered JSX rather than blanking the SPA).

### Live updates (polling)

| Surface | Interval |
|---|---|
| Order tracking (single order) | 4 s |
| Runner feed, dashboards, history lists | 5 s |

Intervals are cleared on unmount; in-flight updates are guarded against post-unmount state writes.

### Testing

- **Unit/component** — Vitest + Testing Library (jsdom), with an axe-core accessibility matcher; coverage gated (80 % stmts/lines/funcs, 75 % branches). The legacy runtime is excluded from coverage by design.
- **E2E** — Playwright projects: `desktop` and `mobile` (functional journeys + a11y, run in CI) and a dev-only `visual` screenshot project. Auth is seeded via a storageState token; `/auth/me` is stubbed in fixtures.

---

## 4. Order lifecycle (end to end)

A representative happy path, showing where state lives and who acts:

```
orderer                         backend (FSM + lock)                 runner
   │  POST /orders  ───────────▶  create OPEN, add to orders:open       │
   │                              order:{id}, orders:by_customer:{cust}  │
   │                                                      ◀─ GET /orders/open  (feed, 5s poll)
   │                                                         POST /orders/{id}/accept ─▶ lock, OPEN→ACCEPTED,
   │                                                                                     set runner_id,
   │                                                                                     zrem orders:open,
   │                                                                                     sadd orders:by_runner
   │  GET /orders/{id} (track,4s) ◀── status ACCEPTED                    │
   │                                                         POST .../start   ─▶ ACCEPTED→BUYING
   │                                                         POST .../deliver ─▶ BUYING→DELIVERED
   │  POST /orders/{id}/confirm ─▶ DELIVERED→COMPLETED                   │
   │  POST /orders/{id}/ratings ─▶ HSETNX + bump ratee aggregate (Lua)   │
   │                              ◀── POST /orders/{id}/ratings (runner rates orderer) ──┘
```

Cancellation is the alternate branch: `POST /orders/{id}/cancel` while `OPEN` → `CANCELLED` and removal from `orders:open` (orderer only).

---

## 5. Data model & Redis schema

All values are JSON strings unless noted. Ids: users `u_<12 hex>`, orders `o_<12 hex>`.

| Key | Type | Holds |
|---|---|---|
| `user:{id}` | string (JSON) | account: `id, email, password_hash, name, created_at` |
| `email_to_user:{email}` | string | reverse index → user id (login + dup check) |
| `order:{id}` | string (JSON) | full order incl. `status`, `customer_id`, `runner_id`, `delivery_fee`, timestamps |
| `orders:open` | sorted set | OPEN order ids, scored by `expected_time` (the runner feed) |
| `orders:by_customer:{id}` | set | order ids the user created |
| `orders:by_runner:{id}` | set | order ids the user accepted |
| `lock:order:{id}` | string (TTL 5 s) | per-order mutation lock; value `{user_id}:{uuid}` |
| `rating:order:{id}` | hash | field = rater id → JSON rating; `HSETNX` enforces one-per-rater |
| `user:{id}:rating` | hash | aggregate: `count`, `sum` (average computed on read) |

The open-order list is self-cleaning: reading `orders:open` drops entries whose order is missing or no longer `OPEN`. **Clearing all data** (e.g. a clean demo) means flushing Redis — there is no seed step; everyone self-registers.

---

## 6. Deployment & CI/CD

### Containers

- **Backend** — `python:3.12-slim`, non-root, uvicorn on `:8000` (`deploy/docker/backend.Dockerfile`).
- **Frontend** — multi-stage: Node build (`VITE_API_BASE=/api`) → nginx:alpine serving `dist/` with SPA history fallback and long-cache hashed assets (`deploy/docker/frontend.Dockerfile`, `nginx.conf`).

### Kubernetes (`k8s/`, Kustomize)

Namespace `campuseats`: Redis StatefulSet (PVC, AOF) + headless service; backend Deployment (2 replicas, wait-for-redis init container, config/secret, probes) + service + HPA; frontend Deployment + service; one ingress routing `/` and `/api`. The JWT secret is applied out-of-band (`secret.example.yaml` is a template; real secrets never land in git).

### Pipeline

- **`build-images.yml`** — on push to `main` (ignoring `k8s/**`) and on `v*` tags: builds + pushes both images to GHCR (`sha-…`, `latest`, and `vX.Y.Z` on tags). On `main` it then rewrites the image tags in `k8s/kustomization.yaml` and commits them (`[skip ci]`); the cluster's GitOps reconciler watches `main` and applies the manifests (typically within ~1–2 min).
- **`backend-ci.yml`** — ruff, mypy (advisory), pytest with `--cov-fail-under=90`, bandit, pip-audit (Redis service container).
- **`frontend-ci.yml`** — `npm audit`, ESLint, `tsc`, Vite build, Vitest (coverage), then Playwright e2e (path-filtered to `frontend/**`).
- **`secret-scan.yml`** — gitleaks over full history.

### Releases

Semver git tags `vX.Y.Z` cut a GitHub Release and produce version-tagged GHCR images (the "packages"). Production runs the `main`-built images; tagging the same commit publishes the matching versioned images and release notes. See [`CHANGELOG.md`](../CHANGELOG.md).

---

## 7. Cross-cutting concerns

- **Security** — explicit CORS allow-list; JWT secret strength enforced at startup; bcrypt password hashing; object-level authz on order reads; non-enumerating login errors; secrets out of git (gitleaks gate); dependency/SAST scans (pip-audit, bandit, npm audit) in CI.
- **Concurrency correctness** — per-order Redis lock for the accept race; atomic Lua for rating aggregation.
- **Resilience** — backend fails fast on bad config / no Redis; frontend normalizes all API/network errors to typed `ApiError` and degrades legacy-script failures to static content.
- **Observability** — `GET /health` checks liveness + Redis (used by k8s probes); structured HTTP status codes (`400/401/403/404/409/422`) make failures legible to clients.
- **Accessibility** — axe-core checks in both unit and e2e suites; skip-link and landmark structure in the shared chrome.

<!-- ADR links -->
[ADR-0005]: adr/0005-redis-lock-for-accept-concurrency.md
[ADR-0007]: adr/0007-order-state-transitions.md
[ADR-0008]: adr/0008-bilateral-rating-model.md
