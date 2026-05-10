#!/usr/bin/env sh
set -eu

timestamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups
docker compose -f docker/docker-compose.yml exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "backups/postgres-$timestamp.sql"
tar -czf "backups/uploads-$timestamp.tar.gz" storage 2>/dev/null || true
echo "Backup created: $timestamp"
