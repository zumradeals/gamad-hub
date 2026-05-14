# Prompt 00 — Bootstrap GAMAD HUB 2.0

> Premier prompt. À envoyer en tout début de session Claude Code.
> Crée l'intégralité de la structure du monorepo depuis zéro.

---

## Instruction à Claude Code

```
Lis dans l'ordre COMPLET ces fichiers avant de toucher au code :

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
docs/01-core/gamad-hub-api-contracts-v0.1.md
CLAUDE.md

Confirme ta compréhension en répondant :
"J'ai lu la doctrine. GAMAD HUB est [résumé en 3 phrases].
Je suis prêt à construire."
Attends ma confirmation avant de créer quoi que ce soit.
```

---

## Tâche 1 — package.json racine (npm workspaces)

```json
{
  "name": "gamad-hub",
  "version": "2.0.0",
  "private": true,
  "workspaces": [
    "apps/portal",
    "apps/core",
    "api/core",
    "packages/contracts",
    "packages/shared-types",
    "packages/design-tokens",
    "packages/validators"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace api/core\" \"npm run dev --workspace apps/core\" \"npm run dev --workspace apps/portal\"",
    "build": "npm run build --workspaces",
    "lint": "npm run lint --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "prisma:generate": "npx prisma generate --schema prisma/schema.prisma",
    "prisma:validate": "npx prisma validate --schema prisma/schema.prisma"
  },
  "devDependencies": {
    "concurrently": "^9.0.0",
    "typescript": "^5.5.0"
  }
}
```

---

## Tâche 2 — prisma/schema.prisma COMPLET

Le schéma doit inclure TOUTES ces entités dans l'ordre exact.
Ne pas simplifier. Ne pas en omettre.

**Entités Identity :**
GamadId, Account, Profile, Role, Permission, RolePermission, MemberRole

**Entités Organization :**
OrganizationUnit, Membership, Zumara

**Entités Formation :**
Formation, FormationModule, FormationEnrollment, ModuleCompletion

**Entités Communication :**
Thread, Post, PostReaction, Announcement, Message, Notification

**Entités Activity :**
Activity, Task, ActivityReport

**Entités Knowledge :**
Document, DocumentVersion

**Entités Cotisation :**
CotisationPeriod, CotisationPayment

**Entité Audit (append-only) :**
AuditEvent

**Entités Portail public :**
Article, ArticleCategory, Video, VideoCategory

**Règles Prisma obligatoires :**
- generator : `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`
- Chaque table : `id String @id @default(uuid())`
- Chaque table sauf AuditEvent : `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt`
- AuditEvent : `createdAt DateTime @default(now())` UNIQUEMENT (append-only)
- GamadId.publicCode : `@unique`
- Account.email : `@unique`

---

## Tâche 3 — Structure api/core (NestJS)

Créer les modules suivants avec leur structure complète
(module.ts, service.ts, controller.ts, repository.ts, dto/) :

identity, organization, formation, communication,
activity, knowledge, cotisation, public, audit, permissions, system

**main.ts OBLIGATOIRE :**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.API_PORT ?? 4000);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.enableCors({ origin: process.env.CORS_ORIGINS?.split(',') ?? '*' });
  await app.listen(port);
}
void bootstrap();
```

**Dépendances api/core/package.json :**
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@prisma/client": "^5.22.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "jsonwebtoken": "^9.0.2",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.0.0",
    "prisma": "^5.22.0",
    "ts-node": "^10.9.2",
    "tsx": "^4.0.0"
  }
}
```

---

## Tâche 4 — Structure apps/core (Next.js 15)

Route groups :
- `(auth)` : login uniquement
- `(world)` : espace citoyen connecté
- `(governance)` : espace responsables et HCG

Pages minimales à créer (contenu placeholder) :
```
app/(auth)/login/page.tsx
app/(world)/layout.tsx         — sidebar contextuelle selon niveau
app/(world)/home/page.tsx
app/(world)/identity/page.tsx
app/(world)/my-zumara/page.tsx
app/(world)/formation/page.tsx
app/(world)/discussions/page.tsx
app/(world)/activities/page.tsx
app/(world)/knowledge/page.tsx
app/(world)/cotisation/page.tsx
app/(governance)/members/page.tsx
app/(governance)/organization/page.tsx
app/(governance)/audit/page.tsx
```

**Design apps/core :**
Fond sombre (#0d1117). Institutionnel. Sobre.
Police : 'IBM Plex Sans' ou 'DM Sans'. Jamais Inter/Roboto.
Le GAMAD ID s'affiche en couleur ambre/dorée — c'est une existence.

---

## Tâche 5 — Structure apps/portal (Next.js 15)

Pages à créer :
```
app/page.tsx                  — Accueil avec G-SEARCH central
app/recherche/page.tsx        — Résultats G-SEARCH
app/blog/page.tsx             — Liste articles
app/blog/[slug]/page.tsx      — Article individuel
app/tv/page.tsx               — Catalogue vidéos
app/formations/page.tsx       — Formations publiques
app/ressources/page.tsx       — Bibliothèque publique
app/services/page.tsx         — Carte écosystème
app/rejoindre/page.tsx        — Formulaire candidature
app/connexion/page.tsx        — Redirect hub.gamad.net
```

**Design apps/portal :**
Fond clair (#f8f7f4). Universel. Neutre.
Police display : 'Fraunces' ou 'DM Serif Display'.
Police corps : 'DM Sans' ou 'Plus Jakarta Sans'.
G-SEARCH : barre centrale large, sobre, avec icône loupe.
AUCUNE référence à la structure interne GAMAD.

---

## Tâche 6 — docker/docker-compose.yml

Services : postgres, api, core (port 3000), portal (port 3001), nginx
Volumes : postgres_data, uploads_data, backups_data
Réseau interne : gamad_internal

---

## Tâche 7 — prisma/seed.ts

Créer dans l'ordre :
1. Permissions pour tous les modules (identity.read, identity.create, etc.)
2. Rôles : SUPER_ADMINISTRATOR, RESPONSABLE_HCG, RESPONSABLE_DEPT, RESPONSABLE_ZUMARA, CITOYEN_ACTIVE, CANDIDAT
3. Attribution permissions aux rôles
4. Compte admin depuis les variables d'environnement ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DISPLAY_NAME
5. 2 catégories d'articles (Actualités, Technologie)
6. 1 article de test publié

---

## Commit attendu

```
chore: bootstrap GAMAD HUB 2.0 — monorepo, prisma schema, structure apps
```

Push sur main.
