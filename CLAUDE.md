# CLAUDE.md — Instructions souveraines pour Claude Code

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Il prime sur tout autre contexte. Lis-le intégralement avant d'agir.

---

## Ce que tu construis

GAMAD HUB 2.0 est une infrastructure numérique civilisationnelle.
Deux applications publiques, un backend souverain, une doctrine claire.

Ce n'est pas une application de gestion. Ce n'est pas un panneau admin.
C'est un monde numérique avec ses lois, ses citoyens, sa mémoire.

| Application | Domaine | Nature |
|---|---|---|
| `apps/portal` | gamad.net | Portail web public — carrefour universel, incognito |
| `apps/core` | hub.gamad.net | Espace souverain des citoyens GAMAD |
| `api/core` | api interne | Backend NestJS — l'autorité absolue |

---

## Lecture obligatoire avant tout travail

Lis ces fichiers dans cet ordre exact. Sans exception. Sans raccourci.

```
docs/00-civilization/constitution-of-the-world.md
docs/00-civilization/identity-doctrine.md
docs/00-civilization/zumara-doctrine.md
docs/00-civilization/ontology.md
docs/00-civilization/sovereignty-laws.md
docs/00-foundation/gamad-civilization-model-v0.1.md
docs/00-foundation/gamad-visibility-sovereignty-model-v0.1.md
docs/01-core/gamad-hub-core-specification-v0.1.md
docs/01-core/gamad-hub-data-model-v0.1.md
docs/01-core/gamad-hub-permission-model-v0.1.md
docs/06-prompts/00-bootstrap.md
```

---

## Stack technique — non négociable

| Couche | Technologie | Version |
|---|---|---|
| Backend API | NestJS + TypeScript | 10.x |
| ORM | Prisma | 5.x |
| Base de données | PostgreSQL | 16 |
| Auth | jsonwebtoken + bcrypt | — |
| Validation | class-validator + class-transformer | — |
| Frontend (les deux apps) | Next.js App Router + TypeScript | 15.x |
| Monorepo | npm workspaces | — |
| Conteneurs | Docker + Docker Compose | — |
| Reverse proxy | Nginx | 1.27-alpine |

**Prisma binaryTargets obligatoire :**
```
["native", "linux-musl-openssl-3.0.x"]
```

**main.ts obligatoire :**
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}))
app.setGlobalPrefix('api/v1')
```

---

## Règles absolues — jamais violées

1. **Le backend est l'autorité.** Jamais le frontend ne décide des permissions.
2. **Toute action critique produit un AuditEvent.** Sans exception.
3. **Aucun module ne gère sa propre identité.** Tout passe par Identity Core.
4. **Les AuditEvent sont append-only.** Jamais modifiés, jamais supprimés.
5. **Aucune permission implicite.** Tout droit doit être explicitement accordé.
6. **Aucun secret hardcodé.** Tout depuis les variables d'environnement.
7. **`prisma migrate deploy` en production.** Jamais `migrate dev`.
8. **Mobile-first.** Le portail public doit fonctionner sur connexion faible.

---

## Domaines du backend (api/core)

| Module | Responsabilité |
|---|---|
| `identity` | GAMAD ID, comptes, auth JWT, profils, sessions |
| `organization` | HCG, départements, coordinations, sections, Zumara |
| `formation` | Cours, modules, parcours, inscriptions |
| `communication` | Threads, posts, annonces, messagerie, notifications |
| `activity` | Projets, tâches, workflows de validation |
| `knowledge` | Documents, versions, bibliothèque, mémoire |
| `cotisation` | Paiements, niveaux, statuts cotisation |
| `public` | Endpoints non authentifiés pour apps/portal |
| `audit` | Traces immuables, historique, événements |
| `permissions` | RBAC, contexte organisationnel |
| `system` | Health check, infos système |

---

## Niveaux de citoyenneté (apps/core)

| Niveau | Statut | Accès |
|---|---|---|
| 1 | PENDING | Espace limité, en attente de validation |
| 2 | ACTIVE | Accès citoyen complet |
| 3 | RESPONSABLE | + Gouvernance, gestion membres et structures |
| 4 | HCG | + Audit complet, paramètres souverains |

---

## Ce qui ne doit JAMAIS apparaître sur apps/portal

- Les mots : CORE, HCG, Zumara, Mouvement, Confrérie, souverain, noyau
- La structure hiérarchique interne
- Les niveaux de citoyenneté
- Les doctrines internes
- Tout lien direct vers des pages internes du CORE
- Les GAMAD ID des membres

Un seul lien vers le CORE : "Espace membre" -> /connexion -> redirect hub.gamad.net

---

## Architecture du portail public (apps/portal)

Le portail est un carrefour universel. G-SEARCH est son identité publique.

```
/                     Accueil avec G-SEARCH central
/recherche?q=&type=   Résultats G-SEARCH filtrés
/blog                 Articles éditoriaux GAMAD Blog
/blog/[slug]          Article individuel
/tv                   Catalogue vidéos GAMAD TV
/formations           Formations publiques
/ressources           Bibliothèque publique
/services             Carte de l'écosystème GAMAD
/rejoindre            Formulaire candidature GAMAD ID
/connexion            Redirect vers hub.gamad.net
```

---

## Architecture du Core (apps/core)

```
/(auth)/login          Connexion (fond sombre, sobre, institutionnel)
/(world)/home          Tableau de bord personnalisé par niveau
/(world)/identity      Mon GAMAD ID, profil, réputation
/(world)/my-zumara     Ma cellule, membres, mémoire, discussions privées
/(world)/formation     Cours, parcours, certifications
/(world)/discussions   Forums publics et espaces Zumara
/(world)/activities    Projets et tâches
/(world)/knowledge     Bibliothèque et documents
/(world)/cotisation    Statut et paiements
/(governance)/...      Réservé niveau RESPONSABLE et HCG
```

---

## Prompts de développement

Tous les prompts sont dans docs/06-prompts/. Les lire et les suivre dans l'ordre :

```
00-bootstrap.md       Monorepo complet + Prisma schema étendu
01-identity.md        Backend Identity + Auth JWT
02-organization.md    Backend Organization + Zumara
03-formation.md       Module Formation
04-communication.md   Threads, forums, messagerie
05-activity.md        Activités et workflows
06-knowledge.md       Documents et mémoire
07-cotisation.md      Cotisations et paiements
08-public-api.md      Endpoints publics pour le portail
09-frontend-core.md   Interface CORE (monde vivant, fond sombre)
10-frontend-portal.md Portail public (G-SEARCH, blog, TV)
11-deployment.md      Docker, Nginx, VPS, HTTPS
```

---

## Conventions Git

```
feat(module): description courte
fix(module): ce qui était cassé
chore: tâche technique sans fonctionnalité
docs: modification documentation uniquement
refactor(module): restructuration sans changement fonctionnel
```

Push sur main après chaque prompt complété.

---

## Règle finale

En cas d'ambiguïté non couverte par les docs :
applique le principe du moindre privilège et de la traçabilité maximale.
Si le doute persiste — arrête et pose la question. Ne suppose pas.
