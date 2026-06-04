# Changelog

All notable changes to CampusEats are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-06-05

First production release: the MVP transaction loop is feature-complete and
verified end to end on [campuseat.hsuan.app](https://campuseat.hsuan.app) for
both the orderer (訂餐者) and runner (帶餐者) roles.

### Added

- **Accounts & auth** — email registration and login with JWT bearer tokens;
  bcrypt password hashing; startup-enforced JWT secret strength (AG-001).
- **Orders** — post an order, browse the open-order feed, and an explicit,
  server-enforced lifecycle `OPEN → ACCEPTED → BUYING → DELIVERED → COMPLETED`,
  plus `OPEN → CANCELLED` (AG-002–006).
- **Concurrency safety** — per-order Redis lock so two runners cannot accept the
  same order; a runner cannot accept their own order.
- **Bilateral ratings** — one-shot, immutable 1–5★ rating between the two
  participants after completion, with an atomic per-user aggregate (AG-007).
- **Order history & earnings** — `GET /orders/mine?role=…`, plus a runner
  earnings view derived from completed-order fees (AG-010).
- **Frontend** — React 19 + Vite SPA: landing, login/register, orderer dashboard,
  runner feed, post-order, order tracking, order detail, my-orders, rating,
  reviews, earnings, and profile pages; a typed API client generated from the
  OpenAPI contract; per-tab sessions; 4–5 s polling for cross-role sync.
- **In-app About page** (`/about`) surfacing version, description, course, links,
  and license; reachable from the footer, profile, and landing nav.
- **Deployment** — Docker images on GHCR, Kubernetes/Kustomize manifests, TLS
  ingress, and a build-and-reconcile GitOps pipeline (AG-011).
- **Architecture documentation** — [`docs/architecture.md`](docs/architecture.md)
  and Architecture Decision Records [`docs/adr/`](docs/adr/).

### Changed

- Object-level authorization on `GET /orders/{id}` — open orders are public to
  authenticated users; non-open orders are restricted to participants.
- Cancel checks ownership (`403`) before order state (`409`) to avoid leaking
  order existence to non-participants.
- Order tracking shows no stray action under `CANCELLED`.
- Login token now persists per-tab (`sessionStorage`) with a `localStorage`
  mirror, so an orderer and a runner can be signed in side-by-side in two tabs.

### Removed

- **Demo / test accounts (AG-012 descoped).** Removed the "使用測試帳號 (免註冊)"
  quick-login shortcut and the `scripts/seed.py` seeder. Email self-registration
  is the only path; a clean environment stays empty rather than being re-seeded.

### Deferred

- **AG-009** push / email notifications — near-real-time status is provided by
  polling for the MVP.

[1.0.0]: https://github.com/thc1006/nycu-agile-114-2-CSIC30211/releases/tag/v1.0.0
