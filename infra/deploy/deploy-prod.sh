#!/usr/bin/env sh
set -eu

echo "Production deployment must be reviewed before use."
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d
sh scripts/migrate.sh
