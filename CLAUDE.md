# CLAUDE.md — Instructions souveraines pour Claude Code

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Il prime sur tout autre contexte. Lis-le intégralement avant d'agir.

---

## Ce que tu construis

GAMAD HUB 2.0 est une infrastructure numérique civilisationnelle.
Deux applications publiques, un backend souverain, une monnaie native, une doctrine claire.

Ce n'est pas une application de gestion. Ce n'est pas un panneau admin.
C'est un monde numérique avec ses lois, ses citoyens, sa mémoire et son économie.

| Application | Domaine | Nature |
|---|---|---|
| `apps/portal` | gamad.net | Portail web public — écosystème GAFAM-like, compte universel |
| `apps/core` | hub.gamad.net | Monde souverain invisible des citoyens GAMAD |
| `api/core` | api interne | Backend NestJS — l'autorité absolue |

---

## Vision fondamentale — à lire avant tout code

### Le Portail (apps/portal)
Le portail est un **écosystème numérique complet** qui rivalise avec les GAFAM.
Ce n'est pas une vitrine. C'est un monde vivant avec :
- Un compte utilisateur universel (GAMAD ID silencieux)
- Un feed social avec modération par réputation
- Un blog éditorial rémunéré
- Une économie interne (ZAHAB)
- Des services (mail, cloud, market — à venir)
- Un espace auteur/créateur

Tout utilisateur qui s'inscrit au portail reçoit **silencieusement un GAMAD ID** (statut `PORTAL_USER`).
Il n'a pas besoin de connaître l'existence du Core pour utiliser le portail.

### Le Core (apps/core)
Le Core est un **monde invisible guidé par une idéologie**.
Il est inaccessible depuis le portail. Aucun lien direct ne le révèle.
Le seul passage : le pipeline "Rejoindre le Réseau" → formulaire minimal → validation manuelle → email avec lien Core.

### ZAHAB
ZAHAB est la **monnaie officielle et civilisationnelle de GAMAD**.
- Présente dans le portail (récompenses, réputation, wallet)
- Présente dans le Core (cotisations, services internes)
- Destinée à devenir un stablecoin décentralisé sur **Stellar blockchain**
- Adossable à l'or à terme

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
docs/07-zahab/zahab-specification-v0.1.md
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
| Blockchain ZAHAB | Stellar Network | — |

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
5. **Les ZahabTransaction sont append-only.** Jamais modifiées, jamais supprimées.
6. **Aucune permission implicite.** Tout droit doit être explicitement accordé.
7. **Aucun secret hardcodé.** Tout depuis les variables d'environnement.
8. **`prisma migrate deploy` en production.** Jamais `migrate dev`.
9. **Mobile-first.** Le portail public doit fonctionner sur connexion faible.
10. **Le Core est invisible depuis le portail.** Zéro lien direct. Zéro mot interdit.

---

## Mots interdits sur apps/portal

Ne jamais faire apparaître sur le portail public :
- CORE, HCG, Zumara, Mouvement, Confrérie, souverain, noyau, citoyen GAMAD
- La structure hiérarchique interne (niveaux, rangs)
- Les doctrines internes et idéologie explicite
- Tout lien direct vers hub.gamad.net ou une page interne du CORE
- Les GAMAD ID des membres

**Seul passage vers le Core :** bouton "Rejoindre le Réseau" → /rejoindre → pipeline contrôlé

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
| `portal-auth` | Inscription/connexion portail, pipeline candidature |
| `portal-feed` | Feed social public — posts, réactions, modération |
| `zahab` | Wallet, transactions, réputation, récompenses automatiques |

---

## Pipeline d'identité portail

```
Visiteur
  └─ /inscription          → PORTAL_USER créé (GAMAD ID silencieux)
       └─ /dashboard        → Compte portail actif
            └─ /rejoindre   → PortalApplication soumise
                 └─ Email   → Formulaire Core avancé
                      └─ Validation HCG → Lien hub.gamad.net envoyé
```

Statuts `ApplicationStatus` : SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED

---

## Système ZAHAB — règles de récompense

| Événement | Récompense | Bénéficiaire |
|---|---|---|
| Inscription | +10 Z | Nouveau membre |
| Publication de contenu | +5 Z | Auteur |
| Commentaire posté | +1 Z | Auteur commentaire |
| Réaction reçue | +0.5 Z | Auteur du post |
| Parrainage | à définir | Parrain |
| Crédit manuel | montant variable | Opérateur |

## Système de réputation — seuils TrustLevel

| Niveau | Seuil (pts) | Effet modération |
|---|---|---|
| NEWCOMER | 0 | Publications soumises à modération |
| MEMBER | 50 | Modération accélérée |
| TRUSTED | 200 | Publication directe sans modération |
| VETERAN | 1 000 | Accès modérateur |
| GUARDIAN | 5 000 | Autorité éditoriale |

---

## Niveaux de citoyenneté (apps/core — usage interne uniquement)

| Niveau | Statut | Accès |
|---|---|---|
| 1 | PENDING | Espace limité, en attente de validation |
| 2 | ACTIVE | Accès citoyen complet |
| 3 | RESPONSABLE | + Gouvernance, gestion membres et structures |
| 4 | HCG | + Audit complet, paramètres souverains |

---

## Architecture du portail public (apps/portal) — implémentée

```
/                       Accueil — Hero, piliers, services, articles
/vision                 Mission et valeurs GAMAD
/services               Écosystème complet (4 catégories, badges disponible/bientôt)
/blog                   Articles éditoriaux GAMAD Blog
/blog/[slug]            Article individuel
/ressources             Bibliothèque publique
/feed                   Feed social — composer (connecté) ou CTA connexion
/inscription            Formulaire d'inscription portail → auto-login → /dashboard
/connexion              Connexion portail JWT (portal-auth séparé du Core)
/rejoindre              Formulaire minimal de candidature Réseau
/dashboard              Espace compte unifié — raccourcis, statut candidature, infos
/dashboard/wallet       Wallet ZAHAB — solde, réputation, historique transactions
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

## Design system portail (implémenté)

**Polices :**
- Inter : interface utilisateur principale
- JetBrains Mono : montants ZAHAB, identifiants techniques

**Palette officielle GAMAD :**
```css
--gold:   #E5C100   /* Or civilisationnel — CTA primaire */
--blue:   #1696D2   /* Bleu souverain — liens, info */
--green:  #0E9F4B   /* Vert croissance — succès, gains */
--navy:   #071326   /* Marine profond — header, balances */
--muted:  #6B7280   /* Gris texto secondaire */
--border: #E5E7EB   /* Bordures subtiles */
```

---

## Prompts de développement

```
docs/06-prompts/00-bootstrap.md       Monorepo complet + Prisma schema étendu
docs/06-prompts/01-identity.md        Backend Identity + Auth JWT
docs/06-prompts/02-organization.md    Backend Organization + Zumara
docs/06-prompts/03-formation.md       Module Formation
docs/06-prompts/04-communication.md   Threads, forums, messagerie
docs/06-prompts/05-activity.md        Activités et workflows
docs/06-prompts/06-knowledge.md       Documents et mémoire
docs/06-prompts/07-cotisation.md      Cotisations et paiements
docs/06-prompts/08-public.md          Endpoints publics pour le portail
docs/06-prompts/09-frontend-core.md   Interface CORE (monde vivant, fond sombre)
docs/06-prompts/10-frontend-portal.md Portail public — refonte GAFAM-like
docs/06-prompts/11-deployment.md      Docker, Nginx, VPS, HTTPS
docs/06-prompts/12-creator-dashboard.md  Phase B — Dashboard créateur, blog monétisé
docs/06-prompts/13-moderation.md         Phase C — Système de modération et IA
docs/06-prompts/14-stellar-zahab.md      Phase D — Intégration Stellar, ZAHAB Coin
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
