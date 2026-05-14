#!/bin/sh
set -e

echo "[api] Running database migrations…"
npx prisma migrate deploy --schema /app/prisma/schema.prisma

echo "[api] Starting NestJS…"
exec node /app/api/core/dist/main.js
