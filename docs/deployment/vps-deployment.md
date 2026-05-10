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
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d
sh scripts/migrate.sh
sh scripts/seed.sh
```

## Healthcheck

```bash
curl http://localhost/api/v1/system/health
```

## Production Notes

- Use HTTPS before public access.
- Keep PostgreSQL private.
- Store secrets outside Git.
- Test restore before relying on backups.
