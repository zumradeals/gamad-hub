# GAMAD HUB 2.0

Infrastructure numérique civilisationnelle du Mouvement GAMAD.

**Deux applications. Un backend souverain. Une doctrine.**

| Application | Domaine | Description |
|---|---|---|
| `apps/portal` | gamad.net | Portail web public — carrefour universel |
| `apps/core` | hub.gamad.net | Espace souverain des citoyens GAMAD |
| `api/core` | interne | Backend NestJS — l'autorité |

---

## Démarrage rapide

```bash
cp .env.example .env
# Remplir les valeurs dans .env

docker compose -f docker/docker-compose.yml --env-file .env up -d
docker compose -f docker/docker-compose.yml --env-file .env exec api npx prisma migrate deploy --schema prisma/schema.prisma
docker compose -f docker/docker-compose.yml --env-file .env exec api npx tsx prisma/seed.ts
```

Le portail public répond sur http://gamad.net (port 80 via Nginx).
Le Core répond sur http://hub.gamad.net (port 80 via Nginx).
L'API répond sur http://localhost:4000/api/v1.

---

## Stack

- **Backend :** NestJS 10 + TypeScript + Prisma 5 + PostgreSQL 16
- **Frontend :** Next.js 15 App Router + TypeScript (les deux apps)
- **Auth :** JWT (jsonwebtoken) + bcrypt
- **Infra :** Docker + Docker Compose + Nginx

---

## Structure du dépôt

```
apps/
  portal/          Portail web public (gamad.net)
  core/            Hub interne citoyens (hub.gamad.net)
api/
  core/            Backend NestJS modulaire
packages/
  contracts/       Contrats API et événements
  shared-types/    Types TypeScript partagés
  design-tokens/   Couleurs, typographie, tokens GAMAD
  validators/      Validateurs partagés
prisma/
  schema.prisma    Schéma de données
  migrations/      Migrations générées
  seed.ts          Données initiales
docker/            Dockerfiles et docker-compose
infra/
  nginx/           Configurations Nginx (HTTP et HTTPS)
  deploy/          Scripts de déploiement
scripts/           Scripts reproductibles (migrate, seed, backup)
docs/              Source de vérité — lire avant tout
CLAUDE.md          Instructions pour Claude Code
```

---

## Documentation

La documentation complète est dans `docs/`. Lire dans l'ordre indiqué dans `docs/README.md`.

**Commencer par :** `docs/00-civilization/constitution-of-the-world.md`

---

## Déploiement VPS

Voir `docs/deployment/vps-deployment.md` et `infra/nginx/`.

Pour HTTPS avec Let's Encrypt :
```bash
# Voir infra/nginx/gamad-hub-tls.conf
certbot certonly --webroot -w /var/www/certbot \
  -d gamad.net -d www.gamad.net -d hub.gamad.net -d www.hub.gamad.net
```

---

## Règles fondatrices

- Le backend porte la logique métier et les permissions.
- Le frontend consomme les API — il ne décide jamais des droits.
- Toute action critique produit un événement d'audit immuable.
- Aucun secret ne doit être versionné.
- `prisma migrate deploy` en production. Jamais `migrate dev`.
