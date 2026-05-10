#!/usr/bin/env sh
set -eu

npm run prisma:generate
npm run prisma:migrate
