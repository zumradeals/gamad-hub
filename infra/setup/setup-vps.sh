#!/usr/bin/env bash
# =============================================================================
#  GAMAD HUB — Bootstrap VPS vierge
#  Ubuntu 22.04 / 24.04 LTS
#
#  Usage :
#    curl -fsSL https://raw.githubusercontent.com/zumradeals/gamad-hub/main/infra/setup/setup-vps.sh | bash
#  ou, après avoir cloné le repo :
#    bash infra/setup/setup-vps.sh
#
#  Ce script :
#    1. Vérifie les prérequis (root, OS, RAM, disque)
#    2. Crée un swap si RAM < 2 Go
#    3. Installe Docker CE + Docker Compose plugin + Git + UFW
#    4. Configure le pare-feu (22, 80, 443)
#    5. Clone le dépôt si nécessaire
#    6. Génère le fichier .env de façon interactive
#    7. Obtient les certificats Let's Encrypt (optionnel)
#    8. Construit et démarre tous les conteneurs
#    9. Applique les migrations Prisma
#   10. Vérifie la santé de l'API et affiche un résumé
# =============================================================================
set -euo pipefail

# ── Couleurs ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

log()    { echo -e "${BLUE}[GAMAD]${RESET} $*"; }
ok()     { echo -e "${GREEN}[OK]${RESET} $*"; }
warn()   { echo -e "${YELLOW}[WARN]${RESET} $*"; }
error()  { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }
section(){ echo -e "\n${BOLD}━━━ $* ━━━${RESET}\n"; }

# ── Repo par défaut ───────────────────────────────────────────────────────────
REPO_URL="${GAMAD_REPO_URL:-https://github.com/zumradeals/gamad-hub.git}"
INSTALL_DIR="${GAMAD_INSTALL_DIR:-/opt/gamad-hub}"
BRANCH="${GAMAD_BRANCH:-main}"

# =============================================================================
# 1. PRÉREQUIS
# =============================================================================
section "Vérification des prérequis"

# Root requis
[ "$(id -u)" -eq 0 ] || error "Ce script doit être exécuté en tant que root (sudo bash setup-vps.sh)"

# OS supporté
if [ -f /etc/os-release ]; then
  . /etc/os-release
  if [[ "$ID" != "ubuntu" ]]; then
    warn "OS détecté : $ID $VERSION_ID. Ce script est optimisé pour Ubuntu 22.04/24.04."
    read -rp "Continuer quand même ? [y/N] " yn </dev/tty
    [[ "$yn" =~ ^[Yy]$ ]] || exit 1
  fi
fi

# RAM minimale (512 Mo)
TOTAL_RAM_MB=$(awk '/MemTotal/ {printf "%d", $2/1024}' /proc/meminfo)
log "RAM détectée : ${TOTAL_RAM_MB} Mo"
[ "$TOTAL_RAM_MB" -ge 512 ] || error "RAM insuffisante (${TOTAL_RAM_MB} Mo < 512 Mo minimum)"

# Disque (5 Go minimum)
FREE_DISK_GB=$(df / --output=avail -BG | tail -1 | tr -d 'G ')
log "Espace disque disponible : ${FREE_DISK_GB} Go"
[ "$FREE_DISK_GB" -ge 5 ] || error "Espace disque insuffisant (${FREE_DISK_GB} Go < 5 Go minimum)"

ok "Prérequis OK"

# =============================================================================
# 2. SWAP (si RAM < 2 Go)
# =============================================================================
section "Gestion du swap"

if [ "$TOTAL_RAM_MB" -lt 2048 ]; then
  if ! swapon --show | grep -q .; then
    log "RAM < 2 Go et pas de swap. Création d'un swap de 2 Go..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    ok "Swap 2 Go créé et activé"
  else
    log "Swap déjà configuré — ignoré"
  fi
else
  log "RAM suffisante (${TOTAL_RAM_MB} Mo) — swap non nécessaire"
fi

# =============================================================================
# 3. DÉPENDANCES SYSTÈME
# =============================================================================
section "Installation des dépendances système"

export DEBIAN_FRONTEND=noninteractive

log "Mise à jour de apt..."
apt-get update -qq

log "Installation des paquets de base..."
apt-get install -y -qq \
  curl \
  git \
  ufw \
  ca-certificates \
  gnupg \
  lsb-release \
  openssl \
  unzip \
  net-tools

# Docker CE — installation officielle
if ! command -v docker &>/dev/null; then
  log "Installation de Docker CE..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  ok "Docker installé : $(docker --version)"
else
  ok "Docker déjà installé : $(docker --version)"
fi

# Vérifier docker compose plugin
docker compose version &>/dev/null || error "docker compose plugin introuvable. Réinstaller Docker CE."

ok "Dépendances installées"

# =============================================================================
# 4. PARE-FEU
# =============================================================================
section "Configuration du pare-feu (UFW)"

ufw --force reset > /dev/null
ufw default deny incoming > /dev/null
ufw default allow outgoing > /dev/null
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable > /dev/null

ok "Pare-feu configuré (22, 80, 443 ouverts)"
ufw status | grep -E "^(Status|22|80|443)"

# =============================================================================
# 5. CLONE / MISE À JOUR DU DÉPÔT
# =============================================================================
section "Récupération du code source"

if [ -d "$INSTALL_DIR/.git" ]; then
  log "Dépôt existant détecté dans $INSTALL_DIR — mise à jour..."
  cd "$INSTALL_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
  ok "Code mis à jour"
else
  log "Clonage de $REPO_URL (branche: $BRANCH)..."
  git clone --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  ok "Dépôt cloné dans $INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# =============================================================================
# 6. CONFIGURATION — fichier .env
# =============================================================================
section "Configuration de l'environnement"

configure_env=false

if [ -f "$INSTALL_DIR/docker/.env" ]; then
  warn ".env existant détecté."
  read -rp "Reconfigurer le .env ? [y/N] " reconf </dev/tty
  if [[ "$reconf" =~ ^[Yy]$ ]]; then
    configure_env=true
  else
    log ".env conservé tel quel"
  fi
else
  configure_env=true
fi

if [ "$configure_env" = "true" ]; then
  echo ""
  echo -e "${BOLD}Configuration interactive de GAMAD HUB${RESET}"
  echo "Appuyez sur Entrée pour accepter la valeur par défaut [entre crochets]."
  echo ""

  read -rp "  Domaine principal du portail [gamad.net] : " INPUT_PORTAL_DOMAIN </dev/tty
  PORTAL_DOMAIN="${INPUT_PORTAL_DOMAIN:-gamad.net}"

  read -rp "  Domaine du Core GAMAD [hub.gamad.net] : " INPUT_CORE_DOMAIN </dev/tty
  CORE_DOMAIN="${INPUT_CORE_DOMAIN:-hub.gamad.net}"

  read -rp "  Nom de la base de données [gamad_hub] : " INPUT_PG_DB </dev/tty
  PG_DB="${INPUT_PG_DB:-gamad_hub}"

  read -rp "  Utilisateur PostgreSQL [gamad_user] : " INPUT_PG_USER </dev/tty
  PG_USER="${INPUT_PG_USER:-gamad_user}"

  # Génération automatique des secrets
  PG_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
  JWT_SECRET=$(openssl rand -base64 48)

  read -rp "  Email administrateur GAMAD [admin@${PORTAL_DOMAIN}] : " INPUT_ADMIN_EMAIL </dev/tty
  ADMIN_EMAIL="${INPUT_ADMIN_EMAIL:-admin@${PORTAL_DOMAIN}}"

  ADMIN_PASS=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | head -c 16)
  echo ""
  echo -e "  ${YELLOW}Mot de passe admin généré : ${BOLD}${ADMIN_PASS}${RESET}"
  echo -e "  ${YELLOW}↳ Notez-le maintenant, il ne sera plus affiché.${RESET}"
  echo ""
  read -rp "  Appuyez sur Entrée pour continuer..." _ </dev/tty

  cat > "$INSTALL_DIR/docker/.env" <<ENVEOF
# ─── Généré par setup-vps.sh le $(date '+%Y-%m-%d %H:%M:%S') ─────────────────
APP_ENV=production

# ─── Domaines ────────────────────────────────────────────────────────────────
PORTAL_DOMAIN=${PORTAL_DOMAIN}
CORE_DOMAIN=${CORE_DOMAIN}

# ─── Base de données ─────────────────────────────────────────────────────────
DATABASE_URL=postgresql://${PG_USER}:${PG_PASS}@postgres:5432/${PG_DB}
POSTGRES_DB=${PG_DB}
POSTGRES_USER=${PG_USER}
POSTGRES_PASSWORD=${PG_PASS}

# ─── Auth JWT ────────────────────────────────────────────────────────────────
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h

# ─── Ports internes ──────────────────────────────────────────────────────────
API_PORT=4000
CORE_PORT=3000
PORTAL_PORT=3001

# ─── URLs publiques ──────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://${PORTAL_DOMAIN}/api/v1
NEXT_PUBLIC_CORE_URL=https://${CORE_DOMAIN}
CORS_ORIGINS=https://${PORTAL_DOMAIN},https://${CORE_DOMAIN}

# ─── Compte admin initial ─────────────────────────────────────────────────────
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASS}
ADMIN_DISPLAY_NAME="Super Admin GAMAD"

# ─── Backup ──────────────────────────────────────────────────────────────────
BACKUP_RETENTION_DAYS=14
ENVEOF

  chmod 600 "$INSTALL_DIR/docker/.env"
  ok ".env généré avec succès"
fi

# Charger les variables pour usage dans ce script
set -a
# shellcheck source=/dev/null
source "$INSTALL_DIR/docker/.env"
set +a

PORTAL_DOMAIN="${PORTAL_DOMAIN:-gamad.net}"
CORE_DOMAIN="${CORE_DOMAIN:-hub.gamad.net}"

# =============================================================================
# 7. LET'S ENCRYPT (optionnel)
# =============================================================================
section "Certificats TLS (Let's Encrypt)"

USE_TLS=false

read -rp "Obtenir les certificats Let's Encrypt maintenant ? (DNS doit déjà pointer vers ce serveur) [y/N] : " want_tls </dev/tty
if [[ "$want_tls" =~ ^[Yy]$ ]]; then

  read -rp "  Email pour Let's Encrypt (notifications expiration) : " LE_EMAIL </dev/tty
  [ -n "$LE_EMAIL" ] || error "Email requis pour Let's Encrypt"

  # Préparer les dossiers webroot et certs sur l'hôte
  mkdir -p "$INSTALL_DIR/certbot/www/.well-known/acme-challenge"
  mkdir -p "$INSTALL_DIR/certbot/certs"

  # Démarrer nginx en HTTP seul pour le challenge ACME
  # nginx monte ../certbot/www:/var/www/certbot — les fichiers challenge seront servis
  log "Démarrage de nginx en mode HTTP pour le challenge ACME..."
  docker compose -f docker/docker-compose.yml up -d nginx postgres api || true
  sleep 5

  log "Obtention des certificats pour $PORTAL_DOMAIN et $CORE_DOMAIN..."
  if docker run --rm \
    -v "$INSTALL_DIR/certbot/certs:/etc/letsencrypt" \
    -v "$INSTALL_DIR/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$LE_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$PORTAL_DOMAIN" \
    -d "www.$PORTAL_DOMAIN" \
    -d "$CORE_DOMAIN" \
    -d "www.$CORE_DOMAIN"; then
    USE_TLS=true
    ok "Certificats obtenus pour $PORTAL_DOMAIN et $CORE_DOMAIN"
  else
    warn "Échec obtention certificats. Déploiement en HTTP uniquement."
  fi
else
  log "Certificats ignorés — déploiement HTTP uniquement"
fi

# =============================================================================
# 8. BUILD ET DÉMARRAGE
# =============================================================================
section "Construction et démarrage des conteneurs"

log "Arrêt des conteneurs existants..."
docker compose -f docker/docker-compose.yml down --remove-orphans 2>/dev/null || true

if [ "$USE_TLS" = "true" ]; then
  log "Build en mode HTTPS (TLS)..."
  docker compose -f docker/docker-compose.yml -f docker/docker-compose.tls.yml build
  log "Démarrage en mode HTTPS..."
  docker compose -f docker/docker-compose.yml -f docker/docker-compose.tls.yml up -d
else
  log "Build en mode HTTP..."
  docker compose -f docker/docker-compose.yml build
  log "Démarrage en mode HTTP..."
  docker compose -f docker/docker-compose.yml up -d
fi

ok "Conteneurs démarrés"

# =============================================================================
# 9. ATTENTE DÉMARRAGE API (migrations déjà appliquées par l'entrypoint)
# =============================================================================
section "Vérification du démarrage"

log "Attente que PostgreSQL soit prêt..."
RETRIES=30
until docker exec gamad_postgres pg_isready -U "${POSTGRES_USER:-gamad_user}" > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  [ "$RETRIES" -eq 0 ] && error "PostgreSQL ne répond pas après 30 tentatives"
  sleep 2
done
ok "PostgreSQL prêt"

log "Attente que l'API soit prête (migrations + seed inclus)..."
RETRIES=40
until docker exec gamad_api wget -qO/dev/null http://localhost:4000/api/v1/system/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  [ "$RETRIES" -eq 0 ] && {
    warn "L'API n'est pas encore prête. Logs des 40 dernières lignes :"
    docker logs gamad_api --tail=40
    warn "L'API démarre toujours — continuer manuellement avec: docker logs gamad_api -f"
    break
  }
  sleep 3
done

# Vérifier le statut final
if docker exec gamad_api wget -qO/dev/null http://localhost:4000/api/v1/system/health > /dev/null 2>&1; then
  ok "API prête"
else
  warn "API pas encore accessible via health check — vérifier: docker logs gamad_api"
fi

log "Statut des conteneurs :"
docker compose -f docker/docker-compose.yml ps

# =============================================================================
# 11. NETTOYAGE DOCKER
# =============================================================================
log "Nettoyage des images inutilisées..."
docker image prune -f > /dev/null

# =============================================================================
# RÉSUMÉ
# =============================================================================
echo ""
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}${GREEN}  GAMAD HUB déployé avec succès !                     ${RESET}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════${RESET}"
echo ""
if [ "$USE_TLS" = "true" ]; then
  echo -e "  ${BOLD}Portail public :${RESET}  https://${PORTAL_DOMAIN}"
  echo -e "  ${BOLD}Espace Core :${RESET}     https://${CORE_DOMAIN}"
  echo -e "  ${BOLD}API Health :${RESET}      https://${PORTAL_DOMAIN}/api/v1/system/health"
else
  SERVER_IP=$(hostname -I | awk '{print $1}')
  echo -e "  ${BOLD}Portail public :${RESET}  http://${SERVER_IP}  (HTTP uniquement)"
  echo -e "  ${BOLD}Pour activer HTTPS :${RESET} relancer ce script et répondre 'y' à la question Let's Encrypt"
fi
echo ""
echo -e "  ${BOLD}Installation :${RESET}    $INSTALL_DIR"
echo -e "  ${BOLD}Logs API :${RESET}        docker logs gamad_api -f"
echo -e "  ${BOLD}Redéployer :${RESET}      bash $INSTALL_DIR/infra/setup/update.sh"
echo ""
echo -e "  ${YELLOW}${BOLD}Sécurité — à faire maintenant :${RESET}"
echo -e "  ${YELLOW}  1. Vérifier que .env n'est pas exposé (chmod 600 .env) ✓${RESET}"
echo -e "  ${YELLOW}  2. Configurer les sauvegardes automatiques de PostgreSQL${RESET}"
echo -e "  ${YELLOW}  3. Activer les mises à jour de sécurité automatiques (unattended-upgrades)${RESET}"
echo -e "  ${YELLOW}  4. Désactiver la connexion root SSH si ce n'est pas déjà fait${RESET}"
echo ""
