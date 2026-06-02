# CampusEats backend — FastAPI / uvicorn on :8000.
# Build context = repo root (the FastAPI app lives in ./app, deps in ./requirements.txt).
#   docker build -f deploy/docker/backend.Dockerfile -t campuseats-backend:latest .
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install runtime deps first for layer caching. requirements.txt also lists a few
# test-only packages (pytest/httpx) which are harmless in the image; keep the
# build simple by installing the single pinned file.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Application code.
COPY app ./app

# Run as a non-root user.
RUN useradd --create-home --uid 10001 appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
