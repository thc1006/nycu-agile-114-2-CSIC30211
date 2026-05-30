# CampusEats Development

## Prerequisites

- Docker with Docker Compose
- Optional local setup: Node.js 22 or newer and npm

## Run the frontend with Docker

The frontend app lives in `./frontend`. Docker Compose mounts that directory into
the container, so source changes trigger Vite hot reload.

```bash
docker compose up -d frontend
```

Open the dev server:

```text
http://localhost:5173/
```

View logs:

```bash
docker compose logs -f frontend
```

Stop the dev server:

```bash
docker compose down
```

If dependencies change in `frontend/package.json` or
`frontend/package-lock.json`, recreate the frontend container:

```bash
docker compose up -d --force-recreate frontend
```

## Run the frontend locally

```bash
cd frontend
npm ci
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Build check

```bash
cd frontend
npm run build
```

## Production deployment notes

The build in `frontend/dist` is a single-page app served from `index.html`.
Two host requirements matter for the backend/integration teams:

1. **SPA history fallback (required).** Any unknown path must serve
   `index.html` so deep links (`/feed`, `/post-order`) and legacy `.html`
   links (`/dashboard.html`) resolve through React Router. `frontend/public/_redirects`
   covers Netlify / Cloudflare Pages automatically. For nginx use
   `try_files $uri $uri/ /index.html;`; for Vercel add a catch-all rewrite to
   `/index.html`. Without this, refreshing a deep link 404s. In-app navigation
   already stays client-side (no full reloads) via the `CampusEats.go` →
   `window.__campusNavigate` hook installed by `PageChrome`.
2. **Content-Security-Policy.** The shared legacy runtime and each page's inline
   scripts execute via `Function()` (a deliberate wrapper around the original
   `campus-web.js`), so a strict CSP must allow `script-src 'unsafe-eval'`, or
   the app will not boot. If a stricter CSP is required, the legacy runtime must
   first be ported to an ES module (tracked as future work).

## Quality checks (lint, types, tests)

All checks run from `./frontend` and mirror what CI enforces:

```bash
cd frontend

npm run lint        # ESLint (TS/React + jsx-a11y; legacy JS linted too)
npm run typecheck   # tsc project type-check
npm run build       # production build (tsc -b && vite build)
npm test            # Vitest unit + component tests
npm run test:cov    # the above, with a coverage report
npm run test:e2e    # Playwright end-to-end flows (builds + previews the app)
```

`npm run test:watch` runs Vitest in watch mode during development. The first
`npm run test:e2e` needs browsers installed once with
`npx playwright install --with-deps chromium`.

## Continuous integration

`.github/workflows/frontend-ci.yml` runs on pushes and on pull requests to
`main` that touch `frontend/**`. It executes install → lint → typecheck →
build → unit/component tests, then a gated Playwright E2E job. The `paths`
filter keeps it independent from the backend CI. Failures block merges, and
every check is reproducible locally with the commands above.
