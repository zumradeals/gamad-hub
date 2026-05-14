# Documentation GAMAD HUB 2.0

> Source de vérité officielle. Tout ce qui n'est pas ici n'est pas officiel.
> Lire dans l'ordre des couches. Ne jamais sauter une couche.

---

## Pyramide de lecture

```
00-civilization    Lois du monde — invariants absolus — lire en premier
00-foundation      Modèles humains et civils
01-core            Spécifications techniques du noyau
02-ui              Fondations visuelles et design system
03-ecosystem       Architecture écosystème et portail public
04-build           Stratégie de construction et décisions techniques
05-infra           Infrastructure, déploiement, Nginx
06-prompts         Prompts Claude Code séquentiels
api/               Contrats API par domaine
deployment/        Documentation opérationnelle VPS
roadmap/           Futur et exclusions du MVP
```

---

## 00-civilization — Lois du monde (invariants)

Ces documents ne changent pas avec les itérations techniques.
En cas de contradiction avec un document technique, la doctrine prime.

| Fichier | Rôle |
|---|---|
| `constitution-of-the-world.md` | Lois fondatrices et invariants absolus |
| `identity-doctrine.md` | Nature du GAMAD ID : existence, réputation, appartenance |
| `zumara-doctrine.md` | Nature et cycle de vie des cellules Zumara |
| `ontology.md` | Ce qui peut exister dans le monde GAMAD |
| `sovereignty-laws.md` | Ce que le Core contrôle absolument |

---

## 00-foundation — Modèles civils

| Fichier | Rôle |
|---|---|
| `constitution-technique-gamad-hub.md` | Constitution technique fondatrice |
| `gamad-civilization-model-v0.1.md` | Vision civilisationnelle — nation numérique |
| `gamad-digital-citizenship-model-v0.1.md` | 5 niveaux + 3 relations JE SUIS / TRAVAILLE |
| `gamad-visibility-sovereignty-model-v0.1.md` | Visibilité asymétrique — fruits vs racines |

---

## 01-core — Spécifications techniques

| Fichier | Rôle |
|---|---|
| `gamad-hub-core-specification-v0.1.md` | 7 domaines, frontières, règles absolues |
| `gamad-hub-data-model-v0.1.md` | Toutes les entités et leurs relations |
| `gamad-hub-permission-model-v0.1.md` | RBAC + contexte organisationnel |
| `gamad-hub-event-model-v0.1.md` | Événements système et audit |
| `gamad-hub-api-contracts-v0.1.md` | Contrats API par domaine |
| `gamad-hub-mvp-scope-v0.1.md` | Ce qui est dans le MVP, ce qui est futur |
| `gamad-hub-reference-architecture-v0.1.md` | Architecture de référence globale |

---

## 02-ui — Design system

| Fichier | Rôle |
|---|---|
| `gamad-design-system-specification-v0.1.md` | Palette, typographie, tokens |
| `gamad-ui-foundation-v0.1.md` | Composants, layouts, comportements |
| `gamad-public-portal-information-architecture-v0.1.md` | Architecture info du portail |

---

## 03-ecosystem — Écosystème et portail

| Fichier | Rôle |
|---|---|
| `gamad-ecosystem-architecture-v0.1.md` | Les 5 couches du monde GAMAD |
| `gamad-public-portal-specification-v0.1.md` | Doctrine du portail public |

---

## 04-build — Construction

| Fichier | Rôle |
|---|---|
| `gamad-hub-build-spec-v0.1.md` | Backlog, user stories, critères |
| `gamad-hub-implementation-strategy-v0.1.md` | Méthode, Git, CI/CD |
| `gamad-hub-tech-stack-decision-v0.1.md` | Décisions techniques officielles |
| `gamad-public-portal-design-build-v0.1.md` | Build du portail public |

---

## 05-infra — Infrastructure

| Fichier | Rôle |
|---|---|
| `nginx-config.md` | Documentation des configs Nginx |
| `docker-setup.md` | Structure Docker et docker-compose |
| `vps-checklist.md` | Checklist de mise en production |

---

## 06-prompts — Prompts Claude Code

À utiliser dans l'ordre. Un prompt = une session Claude Code = un commit.

| Fichier | Module |
|---|---|
| `00-bootstrap.md` | Monorepo + Prisma schema complet |
| `01-identity.md` | Backend Identity + Auth JWT |
| `02-organization.md` | Backend Organization + Zumara |
| `03-formation.md` | Module Formation |
| `04-communication.md` | Threads, forums, messagerie |
| `05-activity.md` | Activités et workflows |
| `06-knowledge.md` | Documents et mémoire |
| `07-cotisation.md` | Cotisations et paiements |
| `08-public-api.md` | Endpoints publics pour le portail |
| `09-frontend-core.md` | Interface CORE — monde vivant |
| `10-frontend-portal.md` | Portail public — G-SEARCH et carrefour |
| `11-deployment.md` | Docker, Nginx, VPS, HTTPS |

---

## api/ — Contrats API par domaine

| Fichier | Domaine |
|---|---|
| `identity-api.md` | GAMAD ID, auth, profils |
| `organization-api.md` | Unités, Zumara, membres |
| `knowledge-api.md` | Documents, versions, validation |
| `activity-api.md` | Activités, tâches, workflows |
| `communication-api.md` | Annonces, messages, notifications |
| `audit-api.md` | Événements d'audit, export |

---

## Règles de contribution

1. Tout nouveau document va dans la couche correspondant à sa nature.
2. Un document de doctrine (00-civilization) ne contient jamais de détails techniques.
3. Un contrat API (api/) ne contient jamais de logique de déploiement.
4. Les prompts (06-prompts) ne sont jamais des références d'architecture.
5. Toute modification d'un doc 01-core doit être versionnée (v0.2, etc.).
6. Aucun secret, mot de passe ou clé API dans ce dossier.
