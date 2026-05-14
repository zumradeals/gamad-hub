# CLAUDE.md — Instructions souveraines pour Claude Code

## Ce que tu construis

Tu travailles sur GAMAD HUB 2.0 — une infrastructure numérique
civilisationnelle composée de deux applications et d'un backend souverain.

Ce n'est pas une application de gestion. C'est un monde numérique.

## Lecture obligatoire avant tout travail

Lis ces fichiers dans cet ordre exact avant d'écrire la moindre ligne de code.
Sans exception. Même si tu penses déjà savoir.
docs/00-civilization/constitution.md
docs/00-civilization/identity-doctrine.md
docs/00-civilization/zumara-doctrine.md
docs/00-civilization/ontology.md
docs/00-civilization/sovereignty-laws.md
docs/01-foundation/civilization-model.md
docs/01-foundation/citizenship-model.md
docs/01-foundation/visibility-model.md
docs/02-core/core-specification.md
docs/02-core/data-model.md

## Stack — non négociable

| Couche | Technologie |
|---|---|
| Backend API | NestJS 10 + TypeScript |
| ORM | Prisma 5 + PostgreSQL 16 |
| Auth | jsonwebtoken (JWT) + bcrypt |
| Validation | class-validator + class-transformer |
| Frontend Core | Next.js 15 App Router + TypeScript |
| Frontend Portal | Next.js 15 App Router + TypeScript |
| Monorepo | npm workspaces |
| Conteneurs | Docker + Docker Compose |
| Reverse proxy | Nginx |

Prisma binaryTargets obligatoire :
`["native", "linux-musl-openssl-3.0.x"]`

## Les trois applications

| App | URL | Nature |
|---|---|---|
| `apps/portal` | gamad.net | Portail public — carrefour universel incognito |
| `apps/core` | hub.gamad.net | Espace souverain des citoyens GAMAD |
| `api/core` | api interne | Backend NestJS — l'autorité absolue |

## Règles absolues — jamais violées

1. Le backend est l'autorité. Jamais le frontend ne décide des permissions.
2. Toute action critique produit un AuditEvent. Sans exception.
3. Aucun module ne gère sa propre identité — tout passe par Identity Core.
4. Les AuditEvent sont append-only. Jamais modifiés, jamais supprimés.
5. Aucune permission implicite — tout droit doit être explicitement accordé.
6. Aucun secret hardcodé — tout depuis les variables d'environnement.
7. Prisma migrate deploy en production — jamais migrate dev.
8. main.ts doit toujours avoir ValidationPipe avec whitelist: true.

## Ce qui ne doit JAMAIS apparaître sur apps/portal

- Les mots : CORE, HCG, Zumara, Mouvement, Confrérie, souverain
- La structure hiérarchique interne
- Les niveaux de citoyenneté
- Les doctrines internes
- Tout lien direct vers des pages internes du CORE
  (sauf "Espace membre" → /connexion → redirect hub.gamad.net)

## Niveaux de citoyenneté dans apps/core

| Niveau | Accès |
|---|---|
| PENDING (2) | Espace limité, en attente de validation |
| ACTIVE (3) | Accès citoyen complet |
| RESPONSABLE (4) | + Gouvernance, gestion membres |
| HCG (5) | + Audit complet, paramètres souverains |

## Ordre des prompts de développement

Les prompts sont dans docs/07-prompts/ — les lire et les suivre dans l'ordre :
00-bootstrap.md    → Structure monorepo complète
01-identity.md     → Backend Identity + Auth
02-organization.md → Backend Organization + Zumara
03-formation.md    → Module Formation
04-communication.md → Discussions + forums
05-activity.md     → Activités et workflows
06-knowledge.md    → Documents et mémoire
07-cotisation.md   → Cotisations
08-frontend-core.md → Interface CORE (monde vivant)
09-frontend-portal.md → Portail public
10-deployment.md   → Déploiement VPS

## Convention de commits
feat(module): description courte
fix(module): ce qui était cassé
chore: tâche technique sans fonctionnalité
docs: modification documentation

Push sur main après chaque tâche complétée.

## Contact en cas d'ambiguïté

Si une décision technique n'est pas couverte par les docs,
applique la règle du moindre privilège et de la traçabilité maximale.
En cas de doute réel, arrête et pose la question — ne suppose pas.