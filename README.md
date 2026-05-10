# GAMAD HUB CORE

Noyau MVP du GAMAD HUB: identite, gouvernance, documentation, activites, communication minimale et audit.

Ce depot suit les documents Markdown de `docs/` comme source de verite. Le MVP n'est pas une super-app: pas de wallet, marketplace, TV, blockchain, IA avancee ou reseau social massif.

## Stack

- Frontend: Next.js dans `apps/web`
- Backend: NestJS dans `api/core`
- Base de donnees: PostgreSQL avec Prisma
- Deploiement cible: Docker, Nginx, VPS Ubuntu
- CI/CD: GitHub Actions

## Structure

```text
apps/web                 Frontend Next.js
api/core                 Backend NestJS modulaire
packages/contracts       Contrats API, events, permissions, schemas
packages/shared-types    Types partages
packages/validators      Validateurs partages
prisma                   Schema et migrations Prisma
docker                   Dockerfiles et compose
infra                    Nginx, backups, deploiement
scripts                  Scripts reproductibles
docs                     Documentation officielle Markdown
```

## Installation locale

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

## Commandes utiles

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run prisma:validate
npm run prisma:generate
```

## Regles fondatrices

- Le backend porte la logique metier et les permissions.
- Le frontend consomme les API et ne decide jamais des droits reels.
- Toute action critique doit produire un audit.
- Toute action metier importante doit produire un evenement.
- Aucun vrai secret ne doit etre versionne.
