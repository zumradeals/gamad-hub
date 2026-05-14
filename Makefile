.PHONY: dev build up down logs migrate seed certbot help

COMPOSE = docker compose -f docker/docker-compose.yml
COMPOSE_TLS = $(COMPOSE) -f docker/docker-compose.tls.yml

## ── Local development ────────────────────────────────────────────────────────

dev:
	npm run dev

## ── Docker (HTTP) ────────────────────────────────────────────────────────────

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f --tail=100

## ── Docker (HTTPS / production) ──────────────────────────────────────────────

build-tls:
	$(COMPOSE_TLS) build

up-tls:
	$(COMPOSE_TLS) up -d

## ── Database ─────────────────────────────────────────────────────────────────

migrate:
	$(COMPOSE) exec api npx prisma migrate deploy --schema /app/prisma/schema.prisma

seed:
	$(COMPOSE) exec api node -e "require('./dist/prisma/seed.js')" || \
	$(COMPOSE) exec api npx ts-node prisma/seed.ts

## ── Certbot (Let's Encrypt) ──────────────────────────────────────────────────

certbot-init:
	docker run --rm -v gamad_certbot_certs:/etc/letsencrypt \
	  -v gamad_certbot_www:/var/www/certbot \
	  certbot/certbot certonly --webroot \
	  -w /var/www/certbot \
	  -d gamad.net -d www.gamad.net -d hub.gamad.net \
	  --email $(CERTBOT_EMAIL) --agree-tos --non-interactive

## ── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "  make dev           — démarrer tous les services en mode développement"
	@echo "  make build         — construire les images Docker (HTTP)"
	@echo "  make up            — démarrer les conteneurs (HTTP)"
	@echo "  make up-tls        — démarrer les conteneurs (HTTPS + certbot)"
	@echo "  make down          — arrêter les conteneurs"
	@echo "  make logs          — suivre les logs"
	@echo "  make migrate       — appliquer les migrations Prisma"
	@echo "  make seed          — lancer le seed initial"
	@echo "  make certbot-init  — obtenir les certificats Let's Encrypt"
	@echo "    CERTBOT_EMAIL=you@example.com make certbot-init"
	@echo ""
