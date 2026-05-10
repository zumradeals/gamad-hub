#!/usr/bin/env sh
set -eu

if [ "${CONFIRM_RESTORE:-}" != "yes" ]; then
  echo "Set CONFIRM_RESTORE=yes to run restore."
  exit 1
fi

if [ -z "${POSTGRES_BACKUP_FILE:-}" ]; then
  echo "POSTGRES_BACKUP_FILE is required."
  exit 1
fi

docker compose -f docker/docker-compose.yml exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$POSTGRES_BACKUP_FILE"
echo "Restore complete."
