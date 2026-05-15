# Prompt 15 — Module Zumara (portail + Core)

> Lire avant de coder :
> - `docs/00-civilization/zumara-doctrine.md`
> - `docs/00-civilization/core-access-doctrine.md`
> - `docs/01-core/zumara-lifecycle-model-v0.1.md`

---

## Objectif

Implémenter le module Zumara complet :
- Backend API (Core NestJS) : gestion souveraine des demandes et Zumara
- Backend API (portail) : endpoints publics pour créer, rejoindre, consulter
- Frontend Core : pages de gouvernance Zumara pour le HCG
- Frontend portail : création, profil, rejoindre une Zumara
- Module Révélation : accès Core et RevelationEvent

---

## Étape 1 — Migration Prisma

Ajouter au schéma Prisma (`api/core/prisma/schema.prisma`) :

### Nouveaux modèles

```
ZumaraRequest       Demande de création depuis le portail
ZumaraFounder       Co-dirigeants associés à une demande
Zumara              Zumara créée et active
ZumaraMembership    Appartenance d'un membre à une Zumara
ZumaraProject       Projets publiés par une Zumara
ZumaraTransaction   Mouvements ZAHAB du wallet Zumara
ZumaraFundingCampaign  Campagnes de financement communautaire
RevelationEvent     Trace immuable de chaque accès Core accordé
```

### Extensions

```
IdentityStatus      Ajouter : MISSIONARY, ILLUMINATED
```

Voir schéma complet dans `docs/01-core/zumara-lifecycle-model-v0.1.md`.

Créer la migration :
```bash
npx prisma migrate dev --name add_zumara_revelation_modules
```

---

## Étape 2 — Module `zumara` (Core API)

Créer `api/core/src/modules/zumara/`.

### Structure

```
zumara/
  dto/
    create-zumara-request.dto.ts
    pre-validate.dto.ts
    reject-request.dto.ts
    update-zumara.dto.ts
  zumara.controller.ts
  zumara.service.ts
  zumara.repository.ts
  zumara.module.ts
```

### Endpoints HCG (PermissionGuard)

```typescript
GET    /zumara/requests                 // Liste toutes les demandes (filtres : status, country)
GET    /zumara/requests/:id             // Détail d'une demande
POST   /zumara/requests/:id/pre-validate // { deadlineDays?: number } → PRE_VALIDATED
POST   /zumara/requests/:id/reject       // { reason: string } → REJECTED
POST   /zumara/requests/:id/activate     // Activation manuelle si besoin
GET    /zumara                           // Liste toutes les Zumara
GET    /zumara/:id                       // Détail complet
PATCH  /zumara/:id                       // Modifier (status, visibility, cotisation)
POST   /zumara/:id/suspend               // { reason: string }
POST   /zumara/:id/promote-elite         // Promouvoir niveau Core (visibilité CORE)
```

### Règles service

- `preValidate()` : vérifie statut SUBMITTED, calcule deadline, crée AuditEvent
- `reject()` : crée AuditEvent, envoie notification portail (future)
- `activate()` : vérifie 5 fondateurs + formation complète + frais payés
- `promoteElite()` : change `visibility` à `CORE`, crée AuditEvent spécial
- Tous les changements de statut → AuditEvent obligatoire

---

## Étape 3 — Module `portal-zumara` (endpoints portail)

Créer `api/core/src/modules/portal-zumara/`.

Protégés par `PortalJwtGuard` (utilisateur portail authentifié).

### Endpoints publics (sans auth)

```typescript
GET    /portal/zumara                    // Liste Zumara publiques (visibility = PUBLIC)
GET    /portal/zumara/:slug              // Profil public d'une Zumara
GET    /portal/zumara/suggestions        // Zumara qui recrutent dans ta localité
```

### Endpoints authentifiés (PortalJwtGuard)

```typescript
POST   /portal/zumara/requests           // Soumettre une demande
GET    /portal/zumara/requests/mine      // Mes demandes
GET    /portal/zumara/requests/:id       // Statut d'une demande
POST   /portal/zumara/:id/join           // Demander à rejoindre
GET    /portal/zumara/mine               // Mes Zumara (membre ou dirigeant)
```

### DTO `CreateZumaraRequestDto`

```typescript
name: string (min 3)
objective: string (min 50) // Pourquoi cette Zumara ?
type: ZumaraType // LOCAL | DIGITAL | HYBRID
country: string
city?: string
```

---

## Étape 4 — Module `revelation` (Core API)

Créer `api/core/src/modules/revelation/`.

### Endpoints HCG

```typescript
GET    /revelation/events                        // Historique complet
POST   /revelation/grant                         // { gamadId, path, note? } → accès Core direct
GET    /revelation/candidates                    // Profils portail proches du seuil THRESHOLD
```

### Endpoint citoyen Core (PermissionGuard)

```typescript
POST   /revelation/sponsor                       // { gamadId, note } → parrainage
```

### Service `RevelationService`

```typescript
async grantAccess(gamadId: string, path: RevelationPath, actorId: string, note?: string) {
  // 1. Vérifier que le gamadId est PORTAL_USER ou PENDING
  // 2. Mettre à jour statut → ACTIVE
  // 3. Créer RevelationEvent (immuable)
  // 4. Créer AuditEvent
  // 5. Envoyer notification (email ou message interne)
}

async checkThresholds() {
  // Cron job : évaluer les PORTAL_USER contre les seuils silencieux
  // Si seuil atteint → grantAccess(path: THRESHOLD)
}
```

### Seuils THRESHOLD (configurables depuis Core)

```typescript
interface ThresholdConfig {
  minZahabReputation: number;       // Réputation ZAHAB minimum
  minFormationCompleted: number;    // Formations GAMAD complétées
  minZumaraMonths: number;          // Mois en tant que dirigeant Zumara active
  minCommunityContributions: number; // Publications / réactions communauté
}
```

---

## Étape 5 — Frontend Core (gouvernance Zumara)

### Pages à créer sous `apps/core/app/(world)/governance/`

```
zumara/page.tsx             Liste toutes les demandes + Zumara
zumara/requests/page.tsx    File des demandes à traiter (statut SUBMITTED)
zumara/[id]/page.tsx        Détail d'une demande — actions pré-valider / rejeter
revelation/page.tsx         Tableau de bord révélation — historique + accorder accès
```

### Composants clés

- **RequestCard** : affiche une demande avec statut, fondateur, objectif, localisation
- **ZumaraCard** : affiche une Zumara avec membres, statut, cotisation, wallet
- **RevelationModal** : formulaire accorder accès (sélection chemin + note)
- **ThresholdDashboard** : candidats proches du seuil THRESHOLD

---

## Étape 6 — Frontend portail (création + profil Zumara)

### Pages à créer sous `apps/portal/app/`

```
zumara/page.tsx             Annuaire public des Zumara (liste + recherche)
zumara/[slug]/page.tsx      Profil public d'une Zumara
zumara/creer/page.tsx       Formulaire de création (authentifié)
dashboard/zumara/page.tsx   Mes Zumara + statut de ma demande
```

### UX clés

- Page annuaire : filtres par type, pays/ville, statut (ACTIVE / ESTABLISHED)
- Profil Zumara : objectif, membres, projets, campagnes, formation complétée (%)
- Formulaire création : 3 étapes (infos → objectif → confirmation)
- Dashboard : statut en temps réel de la demande + compte à rebours délai

---

## Étape 7 — Ajouter à `AppModule`

```typescript
import { ZumaraModule } from './modules/zumara/zumara.module';
import { PortalZumaraModule } from './modules/portal-zumara/portal-zumara.module';
import { RevelationModule } from './modules/revelation/revelation.module';
```

---

## Tests à vérifier

- [ ] PORTAL_USER peut soumettre une demande de création Zumara
- [ ] HCG voit la demande dans le Core et peut pré-valider avec délai
- [ ] Fondateur peut inviter 4 co-dirigeants depuis le portail
- [ ] Délai expiré → statut EXPIRED automatiquement (cron ou vérification à la volée)
- [ ] 5 dirigeants formés + frais payés → Zumara ACTIVE
- [ ] Zumara ACTIVE apparaît dans l'annuaire portail
- [ ] HCG peut promouvoir une Zumara en ELITE → disparaît du portail
- [ ] HCG peut accorder accès Core (chemin DIRECT) → RevelationEvent créé
- [ ] Citoyen Core peut parrainer → RevelationEvent créé (chemin SPONSORED)
- [ ] Seuil THRESHOLD atteint → accès accordé automatiquement
