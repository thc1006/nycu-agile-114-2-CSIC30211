# CampusEats on Kubernetes

Manifests to run CampusEats on a cluster: a Redis datastore (StatefulSet + PVC),
the FastAPI backend (Deployment), and the React/nginx frontend (Deployment),
fronted by a single Ingress.

```
  Ingress (campuseat.hsuan.app, TLS)
    /        -> frontend (nginx :80)
    /api/... -> backend  (uvicorn :8000)   # /api prefix stripped by rewrite
                   |
                   v
                redis (StatefulSet :6379, 1Gi PVC)
```

## Layout

| Path | What |
|------|------|
| `namespace.yaml` | `campuseats` namespace |
| `redis/` | Redis StatefulSet + headless Service |
| `backend/` | Deployment, Service, ConfigMap, HPA, `secret.example.yaml` |
| `frontend/` | Deployment, Service |
| `ingress.yaml` | nginx Ingress routing `/` and `/api` |
| `kustomization.yaml` | ties it together; image tags auto-bumped by CI |

## Images

Built and pushed to GHCR by `.github/workflows/build-images.yml` on every push to
`main`:

- `ghcr.io/<owner>/campuseats-backend`
- `ghcr.io/<owner>/campuseats-frontend`

That workflow also rewrites the `images:` tags in `kustomization.yaml` to the new
git sha, so the manifests always track the latest build.

Build locally (context = repo root for both):

```bash
docker build -f deploy/docker/backend.Dockerfile  -t campuseats-backend:dev .
docker build -f deploy/docker/frontend.Dockerfile --build-arg VITE_API_BASE=/api -t campuseats-frontend:dev .
```

## Deploy

1. Create the JWT secret (never committed):

   ```bash
   cp k8s/backend/secret.example.yaml k8s/backend/secret.yaml
   # generate a strong key:
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   # paste it into JWT_SECRET_KEY, then:
   kubectl create namespace campuseats --dry-run=client -o yaml | kubectl apply -f -
   kubectl -n campuseats apply -f k8s/backend/secret.yaml
   ```

2. Apply everything else:

   ```bash
   kubectl apply -k k8s/
   ```

3. Reach it. Point `campuseat.hsuan.app` at the Ingress controller's external IP
   (real DNS A/AAAA record in production; `/etc/hosts` for a local cluster):

   ```bash
   # local cluster only — adjust the IP to your ingress controller:
   echo "127.0.0.1 campuseat.hsuan.app" | sudo tee -a /etc/hosts
   open https://campuseat.hsuan.app
   curl https://campuseat.hsuan.app/api/health
   ```

## Notes

- The backend won't start without a strong `JWT_SECRET_KEY` (>=32 bytes); see
  `app/config.py`.
- An init container waits for Redis before the backend starts.
- Update `CORS_ORIGINS` in `backend/configmap.yaml` to the real public host.
- Requires an ingress-nginx controller in the cluster (`ingressClassName: nginx`).
