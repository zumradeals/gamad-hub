#!/usr/bin/env bash
# =============================================================================
#  GAMAD HUB — Mise à jour sur VPS existant
#  À lancer après avoir mergé une PR sur main.
#
#  Usage : bash infra/setup/update.sh [--no-build]
# =============================================================================
set -euo pipefail

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

log()   { echo -e "${BLUE}[GAMAD]${RESET} $*"; }
ok()    { echo -e "${GREEN}[OK]${RESET} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${RESET} $*"; }
error() { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }

INSTALL_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
NO_BUILD=false
[[ "${1:-}" == "--no-build" ]] && NO_BUILD=true

cd "$INSTALL_DIR"

# Charger .env
[ -f .env ] || error ".env introuvable dans $INSTALL_DIR"
set -a; source .env; set +a

# Détecter le mode TLS
if [ -f docker/docker-compose.tls.yml ] && docker volume ls | grep -q certbot_certs; then
  COMPOSE_CMD="docker compose -f docker/docker-compose.yml -f docker/docker-compose.tls.yml"
  log "Mode : HTTPS (TLS)"
else
  COMPOSE_CMD="docker compose -f docker/docker-compose.yml"
  log "Mode : HTTP"
fi

echo -e "\n${BOLD}━━━ Mise à jour GAMAD HUB ━━━${RESET}\n"

log "Récupération du code depuis git..."
git fetch origin
git pull origin "$(git branch --show-current)"
ok "Code à jour : $(git log -1 --format='%h %s')"

if [ "$NO_BUILD" = "false" ]; then
  log "Reconstruction des images Docker..."
  $COMPOSE_CMD build --no-cache
  ok "Images reconstruites"
fi

log "Redémarrage des conteneurs..."
$COMPOSE_CMD down --remove-orphans
$COMPOSE_CMD up -d

log "Attente PostgreSQL..."
RETRIES=20
until docker exec gamad_postgres pg_isready -U "${POSTGRES_USER:-gamad_user}" > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  [ "$RETRIES" -eq 0 ] && error "PostgreSQL non disponible"
  sleep 2
done

log "Attente API..."
RETRIES=20
until docker exec gamad_api curl -sf http://localhost:4000/api/v1/system/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  [ "$RETRIES" -eq 0 ] && { docker logs gamad_api --tail=20; error "API non disponible"; }
  sleep 3
done

log "Application des migrations Prisma..."
docker exec gamad_api npx prisma migrate deploy --schema /app/prisma/schema.prisma
ok "Migrations appliquées"

log "Nettoyage Docker..."
docker image prune -f > /dev/null

echo ""
ok "Mise à jour terminée. Commit déployé : $(git log -1 --format='%h — %s')"
echo -e "  Logs : docker logs gamad_api -f"
