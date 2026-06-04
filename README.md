# CampusEats 🍱

[![Backend CI](https://github.com/thc1006/nycu-agile-114-2-CSIC30211/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/thc1006/nycu-agile-114-2-CSIC30211/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/thc1006/nycu-agile-114-2-CSIC30211/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/thc1006/nycu-agile-114-2-CSIC30211/actions/workflows/frontend-ci.yml)
[![Release](https://img.shields.io/github/v/release/thc1006/nycu-agile-114-2-CSIC30211?sort=semver)](https://github.com/thc1006/nycu-agile-114-2-CSIC30211/releases)
[![License](https://img.shields.io/github/license/thc1006/nycu-agile-114-2-CSIC30211)](LICENSE)
![Python](https://img.shields.io/badge/python-3.12-blue)
![React](https://img.shields.io/badge/react-19-149eca)

> A peer-to-peer **campus meal-pickup** platform — a student who needs a meal brought to them is matched with a student already heading to a restaurant. *Students helping students.*
>
> 校園帶餐媒合平台 — 把「需要帶餐」與「順路帶餐」的同學媒合在一起。

**🔗 Live:** **[campuseat.hsuan.app](https://campuseat.hsuan.app)** · **📖 API docs:** [`/api/docs`](https://campuseat.hsuan.app/api/docs)

---

## About

CampusEats is the MVP built for **NYCU CSIC30211 — Agile Software Engineering (114-2)**. It is two things at once:

1. **A working product** — a full-stack web app (React frontend + FastAPI/Redis backend) deployed to Kubernetes, where students post and fulfil meal-pickup requests end to end.
2. **A worked example of Agile/Scrum** — the repo carries the full process trail: product backlog with user stories and acceptance criteria, story map, sprint slicing, Definition of Done, and Architecture Decision Records.

The core loop is one bilateral transaction between two **per-login roles** — an **orderer (訂餐者)** who posts a request and a **runner (帶餐者)** who fulfils it — carried from posting through to a two-way rating. Anyone signs up with an email and uses either role; there are **no shared/demo accounts**.

| | |
|---|---|
| **Status** | v1.0.0 — MVP, live-verified end to end |
| **Course** | NYCU CSIC30211 · Agile Software Engineering · Spring 2026 (114-2) |
| **License** | [GPL-3.0-or-later](LICENSE) |
| **Live** | https://campuseat.hsuan.app |

## Highlights

- **Complete MVP transaction loop** — sign up → post → browse → accept → status updates → confirm → two-way rating.
- **FastAPI + Redis backend** — JWT auth, an explicit order state machine, per-order accept lock against double-accept races, object-level authorization, and immutable bilateral ratings.
- **React 19 + Vite frontend** — a typed API client generated from the OpenAPI contract, per-tab sessions, role as a UI mode, and 4–5 s polling for near-real-time cross-role sync.
- **Production deployment** — Docker images on GHCR, Kubernetes manifests (Kustomize), TLS ingress, and a GitOps build-and-reconcile pipeline.
- **Quality gates in CI** — backend pytest with a 90 % branch-coverage gate, ruff/mypy/bandit/pip-audit, frontend ESLint/tsc/Vitest, Playwright e2e (desktop + mobile + a11y), and gitleaks secret scanning.
- **Full Scrum + ADR trail** — see [`docs/`](docs/) and [`docs/adr/`](docs/adr/).

## The MVP flow

```
                ┌─────────── orderer (訂餐者) ───────────┐        ┌─────── runner (帶餐者) ───────┐
 register/login │  post order ──▶ track ──▶ confirm ──▶ rate │      │ browse open ▶ accept ▶ buy ▶ deliver ▶ rate │
                └────────────────────────────────────────┘        └──────────────────────────────┘

 order lifecycle (server-enforced state machine):
   OPEN ──accept──▶ ACCEPTED ──start──▶ BUYING ──deliver──▶ DELIVERED ──confirm──▶ COMPLETED ──▶ ⭐ two-way rating
     └── cancel ──▶ CANCELLED            (runner)            (runner)              (orderer)
   (orderer, only while OPEN)
```

Each forward transition is restricted to exactly one actor (runner or orderer); a wrong actor gets `403`, a wrong state gets `409`. See [`docs/architecture.md`](docs/architecture.md) for the full design.

## Architecture

```
                         Cloudflare (TLS)
                                │
                    ┌───────────▼────────────┐  Ingress (campuseat.hsuan.app)
                    │   /            ──▶ frontend (nginx, React SPA)            │
                    │   /api/...     ──▶ backend  (uvicorn/FastAPI, /api strip) │
                    └───────────┬────────────┘
                                │
                         ┌──────▼──────┐
                         │   backend   │  FastAPI · JWT · order FSM · per-order lock
                         │ (2 replicas)│  layers: api ▸ services ▸ repositories
                         └──────┬──────┘
                                │
                         ┌──────▼──────┐
                         │    Redis    │  primary datastore (StatefulSet + PVC, AOF)
                         └─────────────┘
```

- **Backend** — layered FastAPI (`api ▸ services ▸ repositories`) over Redis as the single datastore. Stateless pods; all state (users, orders, ratings, locks) lives in Redis. JWT bearer auth; order mutations take a short per-order Redis lock; ratings are written with an atomic Lua script so the per-user aggregate can never double-count.
- **Frontend** — a React 19 SPA (Vite + TypeScript, react-router 7). A hand-rolled, fully-typed `apiFetch` client talks to `/api`; types are generated from `docs/api/openapi.json`. The JWT lives in `sessionStorage` (per-tab) with a `localStorage` mirror (persistence), so an orderer and a runner can be signed in side-by-side in two tabs. "Role" is a per-login **UI mode** (URL `?role=` + localStorage), not a backend attribute. Live data is kept fresh by polling (order tracking 4 s; feeds/lists 5 s).
- **Infrastructure** — multi-stage Docker images (backend: `python:3.12-slim` + uvicorn; frontend: Node build → nginx with SPA fallback) pushed to GHCR, deployed via Kubernetes + Kustomize (Redis StatefulSet, backend Deployment + HPA, frontend Deployment, ingress). Pushing to `main` builds images, bumps the Kustomize image tags, and an in-cluster reconciler applies the result.

> Deep dive: **[`docs/architecture.md`](docs/architecture.md)** (system, backend, frontend, data model & Redis schema, deployment) and the **[Architecture Decision Records](docs/adr/)**.

## Tech stack

| Layer | Choices |
|---|---|
| **Backend** | Python 3.12 · FastAPI · Redis · PyJWT · bcrypt (passlib) · pydantic-settings · pytest |
| **Frontend** | React 19 · Vite 8 · TypeScript · react-router 7 · Vitest · Playwright |
| **Infra / CI** | Docker · Kubernetes + Kustomize · nginx · GitHub Actions · GHCR |

## Repository layout

A single monorepo:

```
.
├── app/                 # FastAPI backend (api ▸ services ▸ repositories ▸ utils)
├── frontend/            # React + Vite SPA (src/pages, src/lib/api, e2e)
├── tests/               # backend pytest suite (83 tests)
├── docs/                # product + process docs, ADRs, OpenAPI spec, architecture
├── deploy/docker/       # backend + frontend Dockerfiles, nginx config
├── k8s/                 # Kubernetes manifests (kustomize): redis, backend, frontend, ingress
├── .github/workflows/   # CI: backend-ci, frontend-ci, build-images, secret-scan
├── docker-compose.yaml  # local dev: Redis + Vite dev server
├── pyproject.toml       # backend project metadata + tooling (ruff, pytest, mypy)
└── README.md
```

## Quick start (local development)

**Prerequisites:** Python 3.12, Node 20+, and Redis (local or via Docker).

### 1. Backend (FastAPI)

```bash
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt

# a JWT secret is required (>= 32 bytes) — generate one:
export JWT_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"

uvicorn app.main:app --reload          # API at http://127.0.0.1:8000 (docs at /docs)
pytest -q                              # run the backend test suite
```

Redis defaults to `localhost:6379`. Copy `.env.example` to `.env` to override host/port/CORS.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm ci
npm run dev                            # http://localhost:5173 (proxies /api → :8000)
```

`npm run gen:api` regenerates the typed client from `docs/api/openapi.json` after the backend contract changes.

### 3. Or run Redis + frontend with Docker Compose

```bash
docker compose up        # Redis on :6379, Vite dev server on :5173
```

## API overview

All endpoints are under `/api` in production (e.g. `POST /api/auth/login`). Auth is a JWT bearer token from login.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/register` | – | Create an account |
| `POST` | `/auth/login` | – | Obtain a JWT |
| `GET` | `/auth/me` | ✓ | Current user |
| `POST` | `/orders` | ✓ | Post an order (orderer) |
| `GET` | `/orders/open` | ✓ | Open-order feed (runner) |
| `GET` | `/orders/mine?role=customer\|runner` | ✓ | Order history |
| `GET` | `/orders/{id}` | ✓ | Order detail (participants / open) |
| `POST` | `/orders/{id}/accept` | ✓ | Accept (runner) |
| `POST` | `/orders/{id}/start` · `/deliver` | ✓ | Advance status (runner) |
| `POST` | `/orders/{id}/confirm` | ✓ | Confirm receipt (orderer) |
| `POST` | `/orders/{id}/cancel` | ✓ | Cancel while OPEN (orderer) |
| `POST` | `/orders/{id}/ratings` | ✓ | Rate the other party |
| `GET` | `/users/{id}/rating` | ✓ | Aggregate rating |
| `GET` | `/health` | – | Liveness + Redis check |

Full contract: [`docs/api/openapi.json`](docs/api/openapi.json) (also served at `/api/docs`).

## Testing

```bash
pytest -q                       # backend (83 tests; CI gates at 90% branch coverage)
cd frontend
npm run test                    # Vitest unit/component tests
npm run test:e2e                # Playwright (desktop + mobile, incl. a11y)
```

## Deployment & releases

- **Images** — `ghcr.io/thc1006/campuseats-backend` and `ghcr.io/thc1006/campuseats-frontend`, built by [`build-images.yml`](.github/workflows/build-images.yml) on every push to `main` (tagged `sha-…` + `latest`) and on `v*` tags (tagged `vX.Y.Z`).
- **Kubernetes** — manifests in [`k8s/`](k8s/) (Kustomize). On `main`, CI rewrites the image tags in `k8s/kustomization.yaml` and the cluster reconciler applies them. See [`k8s/README.md`](k8s/README.md).
- **Releases** — versioned with semver git tags (`vX.Y.Z`). See the [Releases page](https://github.com/thc1006/nycu-agile-114-2-CSIC30211/releases) and [`CHANGELOG.md`](CHANGELOG.md).

## Documentation

- **Architecture** → [`docs/architecture.md`](docs/architecture.md) — system, backend, frontend, data model, deployment
- **Decisions** → [`docs/adr/`](docs/adr/) — Architecture Decision Records
- **Product & process** → [`docs/`](docs/) — [brief](docs/initial-spec.md), [backlog](docs/backlog.md), [story map](docs/story-map-sprint-slicing.md), [user journeys](docs/user-journey-map.md), [acceptance criteria](docs/acceptance-criteria-example-mapping.md), [Scrum templates](docs/scrum-working-docs.md)
- **Backend setup** → [`docs/backend.md`](docs/backend.md)
- **Changelog** → [`CHANGELOG.md`](CHANGELOG.md)

## License

Licensed under the **GNU General Public License v3.0 (or later)** — see [LICENSE](LICENSE).
