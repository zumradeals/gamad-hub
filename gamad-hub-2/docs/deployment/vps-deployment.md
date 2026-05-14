# VPS Deployment

## Prerequisites

- Ubuntu VPS
- Docker and Docker Compose
- Git
- `.env` configured from `.env.example`

## Deploy

```bash
git pull
cp .env.example .env
docker compose -f docker/docker-compose.yml build --no-cache api
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d
sh scripts/migrate.sh
sh scripts/seed.sh
```

## Healthcheck

```bash
curl http://localhost/api/v1/system/health
```

The API image uses Debian Bookworm with OpenSSL 3 and Prisma generates the
`debian-openssl-3.0.x` query engine during the Docker build. Do not install
OpenSSL manually inside a running API container; rebuild the image from Git.

## Production Notes

- Use HTTPS before public access.
- Keep PostgreSQL private.
- Store secrets outside Git.
- Test restore before relying on backups.
