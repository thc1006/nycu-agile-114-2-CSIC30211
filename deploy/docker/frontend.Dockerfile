# CampusEats frontend — Vite/React build served by nginx on :80.
# Build context = repo ROOT (so we can pull both ./frontend and ./deploy/docker/nginx.conf):
#   docker build -f deploy/docker/frontend.Dockerfile \
#     --build-arg VITE_API_BASE=/api -t campuseats-frontend:latest .
FROM node:22-alpine AS build

WORKDIR /app

# VITE_* vars are inlined at build time (import.meta.env). Default to "/api" so
# the browser talks to the backend through the Ingress on the same host.
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- serve ---
FROM nginx:alpine AS serve

COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback so client-side routes (react-router) resolve to index.html.
COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
