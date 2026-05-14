#!/usr/bin/env sh
set -eu

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_DIR"

BRANCH="${1:-main}"

echo "[deploy-staging] Checking out branch: $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "[deploy-staging] Building images (HTTP only)..."
docker compose -f docker/docker-compose.yml build --no-cache

echo "[deploy-staging] Restarting containers..."
docker compose -f docker/docker-compose.yml down --remove-orphans
docker compose -f docker/docker-compose.yml up -d

echo "[deploy-staging] Waiting for API to be ready..."
RETRIES=15
until docker exec gamad_api curl -sf http://localhost:4000/api/v1/health > /dev/null 2>&1 || [ "$RETRIES" -eq 0 ]; do
  RETRIES=$((RETRIES - 1))
  echo "[deploy-staging] Waiting... ($RETRIES retries left)"
  sleep 4
done

if [ "$RETRIES" -eq 0 ]; then
  echo "[deploy-staging] ERROR: API did not become healthy."
  docker compose -f docker/docker-compose.yml logs api --tail=50
  exit 1
fi

echo "[deploy-staging] Done. Staging is live on branch: $BRANCH"
