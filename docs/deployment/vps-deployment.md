# VPS Deployment — GAMAD HUB

**Environnement cible :** Ubuntu 22.04 / 24.04 LTS  
**Accès requis :** root ou sudo

---

## Installation sur un VPS vierge (une seule commande)

```bash
curl -fsSL https://raw.githubusercontent.com/zumradeals/gamad-hub/main/infra/setup/setup-vps.sh | bash
```

Ou, si vous avez déjà cloné le repo :

```bash
bash infra/setup/setup-vps.sh
```

### Ce que fait le script

| Étape | Action |
|---|---|
| 1 | Vérifie OS, RAM (≥ 512 Mo), disque (≥ 5 Go) |
| 2 | Crée un swap 2 Go si RAM < 2 Go |
| 3 | Installe Docker CE, Git, UFW via dépôts officiels |
| 4 | Configure le pare-feu (ports 22, 80, 443) |
| 5 | Clone ou met à jour le dépôt dans `/opt/gamad-hub` |
| 6 | Génère `docker/.env` interactivement (secrets auto-générés via openssl) |
| 7 | Obtient les certificats Let's Encrypt (optionnel, si DNS prêt) |
| 8 | Build et démarre tous les conteneurs Docker |
| 9 | Applique les migrations Prisma via l'entrypoint API (au démarrage du conteneur) |
| 10 | Vérifie la santé de l'API et affiche un résumé |

---

## Prérequis DNS

Avant de lancer le script avec Let's Encrypt, vos enregistrements DNS doivent pointer vers l'IP du VPS :

```
gamad.net         A  → <IP_VPS>
www.gamad.net     A  → <IP_VPS>
hub.gamad.net     A  → <IP_VPS>
www.hub.gamad.net A  → <IP_VPS>
```

La propagation DNS peut prendre jusqu'à 48h (généralement < 1h).

---

## Variables d'environnement générées

Le script génère automatiquement :

| Variable | Généré comment |
|---|---|
| `POSTGRES_PASSWORD` | `openssl rand -base64 24` |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `ADMIN_PASSWORD` | `openssl rand -base64 12` |

Les autres variables sont saisies interactivement (domaines, email admin).

**Le fichier `docker/.env` est protégé en `chmod 600`** — il n'est jamais versionné.

---

## Mise à jour (après merge d'une PR)

```bash
bash /opt/gamad-hub/infra/setup/update.sh
```

Ce script :
1. `git pull` depuis la branche courante
2. Rebuild les images Docker
3. Redémarre les conteneurs
4. Applique les nouvelles migrations
5. Nettoie les images inutilisées

Option `--no-build` pour redémarrer sans rebuild (si seul le code Next.js a changé via SSR) :

```bash
bash /opt/gamad-hub/infra/setup/update.sh --no-build
```

---

## Commandes utiles sur le VPS

```bash
# Statut de tous les conteneurs
docker compose -f /opt/gamad-hub/docker/docker-compose.yml ps

# Logs en temps réel
docker logs gamad_api -f
docker logs gamad_portal -f
docker logs gamad_core -f
docker logs gamad_nginx -f

# Health check API
curl http://localhost/api/v1/system/health

# Ouvrir un shell dans l'API
docker exec -it gamad_api sh

# Lancer une migration manuellement
docker exec gamad_api npx prisma migrate deploy --schema /app/prisma/schema.prisma

# Inspecter la base de données
docker exec -it gamad_postgres psql -U gamad -d gamad_hub

# Renouvellement manuel des certificats Let's Encrypt
docker exec gamad_certbot certbot renew
```

---

## Architecture des conteneurs

```
VPS (Ubuntu 22.04/24.04)
├── gamad_nginx      → Nginx 1.27-alpine — reverse proxy (ports 80/443)
├── gamad_api        → NestJS — API backend (port interne 4000)
├── gamad_portal     → Next.js — portail public gamad.net (port interne 3001)
├── gamad_core       → Next.js — espace Core hub.gamad.net (port interne 3000)
├── gamad_postgres   → PostgreSQL 16 (port interne 5432, jamais exposé)
└── gamad_certbot    → Certbot — renouvellement auto Let's Encrypt (mode TLS)

Réseau interne : gamad_internal (bridge Docker isolé)
```

---

## Recommandations de sécurité post-déploiement

```bash
# 1. Désactiver la connexion root SSH
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd

# 2. Activer les mises à jour de sécurité automatiques
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 3. Vérifier les permissions du .env
ls -la /opt/gamad-hub/docker/.env   # doit afficher -rw------- (600)

# 4. Sauvegardes automatiques PostgreSQL (cron quotidien)
echo '0 3 * * * root docker exec gamad_postgres pg_dump -U gamad_user gamad_hub | gzip > /opt/gamad-hub/backups/$(date +\%Y\%m\%d).sql.gz' >> /etc/cron.d/gamad-backup
```

---

## Notes techniques

- **Prisma `migrate deploy`** — uniquement utilisé en production (jamais `migrate dev`)
- **Volumes Docker persistants** — `postgres_data`, `uploads_data`, `backups_data` (données survivent aux redémarrages)
- **Certbot** — renouvellement automatique toutes les 12h via le conteneur certbot
- **Nginx upstreams** — blocs `upstream {}` statiques (`api:4000`, `portal:3001`, `core:3000`) résolus via le DNS interne Docker (`127.0.0.11`)
- **Next.js standalone** — les `node_modules` du workspace root sont copiés dans l'image finale pour garantir la disponibilité de toutes les dépendances runtime en contexte monorepo
