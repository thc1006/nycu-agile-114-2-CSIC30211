#!/usr/bin/env bash
#
# Cross-platform backend test runner (used by the pre-push hook and locally).
#
# Strategy, in order:
#   1. NATIVE fast path — if a local virtualenv exists (Unix .venv/bin OR
#      Windows .venv/Scripts), its deps import, and a Redis is reachable, run
#      pytest with that interpreter. Best for macOS/Linux devs with brew Redis.
#   2. DOCKER fallback — otherwise, if Docker is available, run the suite in
#      throwaway redis:7-alpine + python:3.12-slim containers. Works on
#      Windows/macOS/Linux without any local Python/Redis setup.
#   3. Otherwise — fail with guidance.
#
# Exit code is the pytest exit code, so the pre-push hook blocks on failure.

cd "$(dirname "$0")/.." || exit 1

echo "Running backend tests..."

# --- 1. locate a local Python interpreter (prefer a venv, either layout) ---
PY=""
if [ -x ".venv/bin/python" ]; then
  PY=".venv/bin/python"
elif [ -x ".venv/Scripts/python.exe" ]; then
  PY=".venv/Scripts/python.exe"
fi

native_viable() {
  [ -n "$PY" ] || return 1
  "$PY" -c "import pytest, redis, fastapi" >/dev/null 2>&1 || return 1
  "$PY" - >/dev/null 2>&1 <<'PYCHK' || return 1
import os, redis
redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
).ping()
PYCHK
}

if native_viable; then
  echo "Using local venv + reachable Redis."
  exec "$PY" -m pytest -q
fi

# --- 2. Docker fallback (cross-platform) ---
if command -v docker >/dev/null 2>&1; then
  echo "No local venv/Redis detected — running tests in Docker..."

  NET="campuseats-prepush-net"
  RDS="campuseats-prepush-redis"
  # 'pwd -W' yields a Windows path (C:/...) under Git Bash; falls back to a
  # POSIX path on macOS/Linux. Needed so the Docker volume mount resolves.
  HOSTDIR="$(pwd -W 2>/dev/null || pwd)"

  docker network create "$NET" >/dev/null 2>&1 || true
  docker rm -f "$RDS" >/dev/null 2>&1 || true
  docker run -d --name "$RDS" --network "$NET" redis:7-alpine >/dev/null || exit 1

  i=0
  while [ "$i" -lt 20 ]; do
    [ "$(docker exec "$RDS" redis-cli ping 2>/dev/null)" = "PONG" ] && break
    i=$((i + 1))
    sleep 0.4
  done

  # MSYS_NO_PATHCONV=1 stops Git Bash from mangling the ':/app' / '-w /app' args.
  MSYS_NO_PATHCONV=1 docker run --rm --network "$NET" \
    -v "${HOSTDIR}:/app" -w /app \
    -e REDIS_HOST="$RDS" -e REDIS_DB=15 -e JWT_SECRET_KEY=prepush-test-secret-key \
    python:3.12-slim bash -lc "pip install -q -r requirements.txt && python -m pytest -q"
  RC=$?

  docker rm -f "$RDS" >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
  exit $RC
fi

echo "Error: cannot run tests."
echo "Provide ONE of:"
echo "  - a local .venv with deps installed + a reachable Redis (localhost:6379), or"
echo "  - Docker (the script will run Redis + pytest in containers)."
exit 1
