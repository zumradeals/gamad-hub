# Documentation GAMAD HUB

> Source de vérité officielle du projet. Tout ce qui n'est pas ici n'est pas officiel.

---

## Principe de lecture

Cette documentation est organisée en couches hiérarchiques strictes.
Chaque couche dépend de celle qui la précède. Ne jamais lire une couche technique
sans avoir compris la couche doctrinale qui la gouverne.

```text
00-civilization    <- Les lois du monde (invariants absolus)
00-foundation      <- Les modèles humains et civils
01-core            <- Les spécifications techniques du noyau
02-ui              <- Les fondations visuelles et interfaces
03-ecosystem       <- L'architecture de l'écosystème public
04-build           <- La stratégie et les spécifications de construction
05-repository      <- Le blueprint Git officiel
api/               <- Les contrats API par domaine
deployment/        <- La documentation opérationnelle
qa/                <- Les rapports de qualité et tests
roadmap/           <- Le futur et les exclusions MVP
```

Les prompts de développement IA sont volontairement isolés hors de `docs/`, dans `tools/prompts/`.
Ils sont des outils de travail, pas des références d'architecture ou de doctrine.

---

## Couche 00-civilization — Les lois du monde

**Ces documents ne changent pas avec les itérations techniques.**
Ils définissent ce que GAMAD est, pas comment il fonctionne.

| Fichier | Rôle |
|---|---|
| `constitution-of-the-world.md` | Lois fondatrices invariantes du système GAMAD |
| `ontology.md` | Ce qui peut exister dans le monde GAMAD (entités, relations) |
| `identity-doctrine.md` | Nature réelle du GAMAD ID : existence, réputation, appartenance |
| `sovereignty-laws.md` | Ce que le Core contrôle absolument, frontières inviolables |
| `zumara-doctrine.md` | Nature, cycle de vie et rôle des cellules Zumara |

> Toute décision d'architecture ou d'implémentation doit rester cohérente
> avec ces documents. En cas de contradiction, la doctrine prime.

---

## Couche 00-foundation — Les modèles civils

Ces documents décrivent comment GAMAD s'organise en tant que civilisation numérique :
citoyenneté, visibilité, niveaux d'appartenance.

| Fichier | Rôle |
|---|---|
| `gamad-civilization-model-v0.1.md` | Vision civilisationnelle globale de GAMAD |
| `gamad-digital-citizenship-model-v0.1.md` | Niveaux d'appartenance et cycle de vie citoyen |
| `gamad-visibility-sovereignty-model-v0.1.md` | Ce qui est public, discret, souverain ou interne |

---

## Couche 01-core — Spécifications techniques du noyau

Ces documents traduisent la doctrine en architecture technique concrète.
Ils définissent le MVP opérationnel.

| Fichier | Rôle |
|---|---|
| `gamad-hub-core-specification-v0.1.md` | Spécification complète du GAMAD HUB CORE |
| `gamad-hub-data-model-v0.1.md` | Modèle de données officiel (entités, relations, contraintes) |
| `gamad-hub-permission-model-v0.1.md` | RBAC, rôles, permissions, contexte organisationnel |
| `gamad-hub-event-model-v0.1.md` | Événements système, audit, correlation_id, causation_id |
| `gamad-hub-api-contracts-v0.1.md` | Contrats API complets par domaine |
| `gamad-hub-mvp-scope-v0.1.md` | Périmètre officiel du MVP - ce qui est inclus et exclu |

> Le frontend ne décide jamais des permissions.
> Le backend est l'autorité. Ces documents définissent les règles du backend.

---

## Couche 02-ui — Fondations visuelles

| Fichier | Rôle |
|---|---|
| `gamad-design-system-specification-v0.1.md` | Palette, typographie, tokens, doctrine visuelle |
| `gamad-ui-foundation-v0.1.md` | Composants, layouts, comportements UI |
| `gamad-public-portal-information-architecture-v0.1.md` | Architecture informationnelle du portail public |

---

## Couche 03-ecosystem — Architecture de l'écosystème

| Fichier | Rôle |
|---|---|
| `gamad-ecosystem-architecture-v0.1.md` | Cartographie des couches, satellites, GAMAD ID transversal |
| `gamad-public-portal-specification-v0.1.md` | Vision et doctrine du portail public mondial |

---

## Couche 04-build — Stratégie de construction

Ces documents guident les décisions techniques et le séquencement du développement.

| Fichier | Rôle |
|---|---|
| `gamad-hub-build-spec-v0.1.md` | Backlog, user stories, critères d'acceptation, sprints |
| `gamad-hub-implementation-strategy-v0.1.md` | Méthode de développement, Git, CI/CD, releases |
| `gamad-hub-tech-stack-decision-v0.1.md` | Choix techniques officiels (Next.js, NestJS, PostgreSQL, Prisma) |
| `gamad-public-portal-design-build-v0.1.md` | Build du portail public (document futur, post-stabilisation Core) |

---

## Couche 05-repository — Blueprint Git

| Fichier | Rôle |
|---|---|
| `gamad-hub-repository-blueprint-v0.1.md` | Structure officielle du dépôt, conventions, branches, commits |

---

## Dossier api/ — Contrats API par domaine

Documentation de référence rapide pour chaque domaine API.

| Fichier | Domaine |
|---|---|
| `identity-api.md` | GAMAD ID, comptes, authentification, profils |
| `organization-api.md` | Unités, Zumara, membres, responsables |
| `knowledge-api.md` | Documents, versions, validation, export |
| `activity-api.md` | Activités, tâches, workflows |
| `communication-api.md` | Annonces, messages, notifications |
| `audit-api.md` | Événements d'audit, export |

---

## Dossier deployment/ — Documentation opérationnelle

| Fichier | Rôle |
|---|---|
| `vps-deployment.md` | Déploiement sur VPS Ubuntu avec Docker |
| `backup-restore.md` | Procédures de sauvegarde et restauration |
| `environment-variables.md` | Variables d'environnement requises |
| `logging.md` | Commandes de consultation des logs |

---

## Dossier qa/ — Qualité et tests

| Fichier | Rôle |
|---|---|
| `mvp-test-report.md` | État des tests, critères bloquants, prochains travaux QA |

---

## Dossier roadmap/ — Futur et exclusions

| Fichier | Rôle |
|---|---|
| `future-roadmap.md` | Phases de développement post-MVP |
| `excluded-from-mvp.md` | Modules explicitement exclus du MVP (Wallet, TV, Marketplace, etc.) |

---

## Prompts IA

Les prompts de développement IA sont conservés dans `tools/prompts/`.
Ils ne font pas partie de la documentation officielle du projet.

| Fichier | Rôle |
|---|---|
| `tools/prompts/gamad-hub-prompt-pack-v0.1.md` | 13 prompts séquentiels pour construire le MVP module par module |

---

## Modules inclus dans le MVP

- Identity Core
- Permission Engine
- Organization Core
- Audit & Event Engine
- Knowledge Core
- Activity Core
- Communication minimale
- Frontend MVP
- Docker / VPS

## Modules exclus du MVP

- ZAHAB Wallet
- Marketplace / G-Market
- GAMAD TV / GAMADTUBE
- IA avancée
- Blockchain
- Publicité publique
- Réseau social complet
- Gamification massive

Ces modules attendent la stabilisation complète du Core.
Voir `roadmap/excluded-from-mvp.md` pour les détails.

---

## Règles de contribution documentaire

1. Tout nouveau document doit être placé dans la couche correspondant à sa nature.
2. Un document de doctrine (`00-civilization`) ne contient jamais de détails techniques.
3. Un contrat API (`api/`) ne contient jamais de logique de déploiement.
4. Les prompts IA (`tools/prompts/`) ne sont jamais des références d'architecture.
5. Toute modification d'un document `01-core` doit être versionnée (`v0.2`, etc.).
6. Aucun secret, mot de passe ou clé API ne doit apparaître dans ce dossier.

---

*Ce README est la carte de navigation du projet GAMAD HUB CORE.*
*En cas de doute sur le positionnement d'un document, revenir à la pyramide des couches.*
