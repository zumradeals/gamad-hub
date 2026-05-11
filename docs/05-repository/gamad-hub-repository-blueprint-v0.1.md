# **📘 GAMAD HUB REPOSITORY BLUEPRINT v0.1**

## **Arborescence Git, dossiers, fichiers initiaux, conventions et base de code**

---

# **0\. Objectif**

Ce document définit la structure officielle du dépôt Git du **GAMAD HUB CORE MVP**.

Le dépôt doit être :

lisible,  
modulaire,  
documenté,  
versionné,  
reconstructible.  
---

# **1\. Nom du dépôt**

gamad-hub-core  
---

# **2\. Structure racine**

gamad-hub-core/  
│  
├── apps/  
│   └── web/  
│  
├── api/  
│   └── core/  
│  
├── packages/  
│   ├── contracts/  
│   ├── shared-types/  
│   └── validators/  
│  
├── prisma/  
│   ├── schema.prisma  
│   └── migrations/  
│  
├── docs/  
│   ├── 00-constitution/  
│   ├── 01-core-specification/  
│   ├── 02-reference-architecture/  
│   ├── 03-data-model/  
│   ├── 04-permission-model/  
│   ├── 05-event-model/  
│   ├── 06-api-contracts/  
│   ├── 07-mvp-scope/  
│   ├── 08-build-spec/  
│   ├── 09-implementation-strategy/  
│   ├── 10-tech-stack-decision/  
│   └── 11-repository-blueprint/  
│  
├── docker/  
│   ├── Dockerfile.api  
│   ├── Dockerfile.web  
│   └── docker-compose.yml  
│  
├── infra/  
│   ├── nginx/  
│   ├── backups/  
│   └── deploy/  
│  
├── scripts/  
│   ├── setup.sh  
│   ├── migrate.sh  
│   └── backup.sh  
│  
├── .github/  
│   └── workflows/  
│       ├── ci.yml  
│       └── deploy-staging.yml  
│  
├── .env.example  
├── .gitignore  
├── README.md  
├── CHANGELOG.md  
└── LICENSE  
---

# **3\. Dossier `apps/web`**

## **Rôle**

Contient l’interface web :

* portail public minimal ;  
* login ;  
* dashboard ;  
* gestion membres ;  
* gestion structures ;  
* documents ;  
* activités ;  
* audit.

---

## **Structure**

apps/web/  
│  
├── app/  
│   ├── login/  
│   ├── dashboard/  
│   ├── members/  
│   ├── organization/  
│   ├── documents/  
│   ├── activities/  
│   └── audit/  
│  
├── components/  
│   ├── layout/  
│   ├── forms/  
│   ├── tables/  
│   └── ui/  
│  
├── lib/  
│   ├── api-client.ts  
│   ├── auth.ts  
│   └── permissions.ts  
│  
├── public/  
│  
└── README.md  
---

# **4\. Dossier `api/core`**

## **Rôle**

Contient le backend NestJS du CORE.

---

## **Structure**

api/core/  
│  
├── src/  
│   ├── main.ts  
│   ├── app.module.ts  
│   │  
│   ├── modules/  
│   │   ├── identity/  
│   │   ├── organization/  
│   │   ├── permissions/  
│   │   ├── activity/  
│   │   ├── knowledge/  
│   │   ├── communication/  
│   │   ├── audit/  
│   │   └── system/  
│   │  
│   ├── common/  
│   │   ├── guards/  
│   │   ├── decorators/  
│   │   ├── filters/  
│   │   ├── interceptors/  
│   │   └── policies/  
│   │  
│   └── config/  
│  
├── test/  
└── README.md  
---

# **5\. Structure standard d’un module backend**

Chaque module doit suivre la même forme.

identity/  
│  
├── identity.controller.ts  
├── identity.service.ts  
├── identity.repository.ts  
├── identity.module.ts  
├── dto/  
├── policies/  
├── events/  
└── tests/

Règle :

aucun module critique sans policies, events et tests.  
---

# **6\. Dossier `packages/contracts`**

## **Rôle**

Contient les contrats du système.

packages/contracts/  
│  
├── api/  
│   ├── identity.contract.ts  
│   ├── organization.contract.ts  
│   ├── activity.contract.ts  
│   ├── knowledge.contract.ts  
│   └── audit.contract.ts  
│  
├── events/  
│   ├── identity.events.ts  
│   ├── organization.events.ts  
│   ├── activity.events.ts  
│   ├── knowledge.events.ts  
│   └── security.events.ts  
│  
├── permissions/  
│   └── permissions.catalog.ts  
│  
└── schemas/  
   └── response.schema.ts  
---

# **7\. Dossier `packages/shared-types`**

## **Rôle**

Types partagés entre frontend et backend.

packages/shared-types/  
│  
├── identity.types.ts  
├── organization.types.ts  
├── activity.types.ts  
├── document.types.ts  
├── audit.types.ts  
└── index.ts  
---

# **8\. Dossier `packages/validators`**

## **Rôle**

Validation commune des entrées.

packages/validators/  
│  
├── identity.validators.ts  
├── organization.validators.ts  
├── activity.validators.ts  
├── document.validators.ts  
└── index.ts  
---

# **9\. Dossier `prisma`**

## **Rôle**

Source de vérité du schéma de base de données.

prisma/  
│  
├── schema.prisma  
├── migrations/  
└── seed.ts

⚠️ Toute modification base doit passer par migration.

---

# **10\. Dossier `docs`**

## **Rôle**

Mémoire technique officielle.

Chaque document stratégique doit être conservé en Markdown.

Exemple :

docs/03-data-model/gamad-hub-data-model-v0.1.md  
---

# **11\. Dossier `docker`**

## **Rôle**

Contient les fichiers de conteneurisation.

docker/  
│  
├── Dockerfile.api  
├── Dockerfile.web  
└── docker-compose.yml  
---

# **12\. Dossier `infra`**

## **Rôle**

Contient les fichiers d’infrastructure.

infra/  
│  
├── nginx/  
│   └── gamad-hub.conf  
│  
├── backups/  
│   └── backup-policy.md  
│  
└── deploy/  
   └── deploy-staging.sh  
---

# **13\. Dossier `scripts`**

## **Rôle**

Scripts reproductibles.

scripts/  
│  
├── setup.sh  
├── migrate.sh  
├── seed.sh  
├── backup.sh  
└── restore.sh  
---

# **14\. Fichier `.env.example`**

Doit contenir uniquement des exemples.

DATABASE\_URL=postgresql://user:password@localhost:5432/gamad\_hub  
JWT\_SECRET=change\_me  
APP\_ENV=development  
API\_PORT=4000  
WEB\_PORT=3000  
STORAGE\_DRIVER=local  
STORAGE\_PATH=./storage

⚠️ Aucun vrai secret dans Git.

---

# **15\. Fichier `README.md`**

Doit contenir :

* description du projet ;  
* architecture ;  
* installation locale ;  
* commandes utiles ;  
* conventions ;  
* liens docs ;  
* avertissements sécurité.

---

# **16\. Conventions de nommage**

## **Dossiers**

kebab-case

Exemple :

organization-unit

## **Fichiers TypeScript**

kebab-case.ts

## **Classes**

PascalCase

## **Variables**

camelCase

## **Permissions**

module.action

Exemple :

document.validate  
---

# **17\. Branches Git**

main  
develop  
feature/\*  
fix/\*  
release/\*  
hotfix/\*  
---

# **18\. Commits**

Format :

type: description

Exemples :

feat: add gamad id creation  
fix: prevent unauthorized audit export  
docs: add permission model  
test: add document validation tests  
---

# **19\. CI minimale**

Le pipeline doit exécuter :

install  
lint  
test  
build  
contract-check  
---

# **20\. Règle finale**

Le dépôt Git doit devenir :

la mémoire technique vivante  
du GAMAD HUB CORE.

Aucun développement sérieux ne doit commencer hors de cette structure.

