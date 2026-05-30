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
