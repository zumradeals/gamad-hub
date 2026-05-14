#!/bin/sh
set -e

echo "[api] Running database migrations…"
npx prisma migrate deploy --schema /app/prisma/schema.prisma

echo "[api] Création du compte super-admin si nécessaire…"
node /app/scripts/seed-admin.js

echo "[api] Starting NestJS…"
exec node /app/api/core/dist/main.js
