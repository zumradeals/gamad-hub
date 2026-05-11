#!/usr/bin/env sh
set -eu

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema prisma/schema.prisma

echo "Generating Prisma client..."
npx prisma generate --schema prisma/schema.prisma

echo "Migrations complete."
