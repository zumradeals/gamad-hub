#!/usr/bin/env sh
set -eu

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_DIR"

echo "[deploy-prod] Pulling latest changes..."
git pull origin main

echo "[deploy-prod] Building images..."
docker compose -f docker/docker-compose.yml -f docker/docker-compose.tls.yml build --no-cache

echo "[deploy-prod] Stopping old containers..."
docker compose -f docker/docker-compose.yml -f docker/docker-compose.tls.yml down --remove-orphans

echo "[deploy-prod] Starting containers..."
docker compose -f docker/docker-compose.yml -f docker/docker-compose.tls.yml up -d

echo "[deploy-prod] Waiting for API health check..."
RETRIES=15
until docker exec gamad_api curl -sf http://localhost:4000/api/v1/health > /dev/null 2>&1 || [ "$RETRIES" -eq 0 ]; do
  RETRIES=$((RETRIES - 1))
  echo "[deploy-prod] Waiting... ($RETRIES retries left)"
  sleep 4
done

if [ "$RETRIES" -eq 0 ]; then
  echo "[deploy-prod] ERROR: API did not become healthy in time."
  docker compose -f docker/docker-compose.yml logs api --tail=50
  exit 1
fi

echo "[deploy-prod] Cleaning up unused Docker resources..."
docker image prune -f

echo "[deploy-prod] Done. Production is live."
