# **📘 GAMAD HUB TECH STACK DECISION v0.1**

## **Choix technique contrôlé du GAMAD HUB CORE**

---

# **0\. Principe**

Le choix technique ne doit jamais précéder l’architecture.

Maintenant que la Constitution, le Core, les modèles et les contrats existent, la stack peut être choisie.

Objectif :

une stack durable,  
portable,  
sécurisée,  
documentable,  
déployable sur VPS,  
compatible Git,  
et reconstructible.  
---

# **1\. Décision stratégique**

Pour le **MVP GAMAD HUB CORE**, la stack recommandée est :

| Couche | Choix |
| ----- | ----- |
| Frontend | React / Next.js |
| Backend | NestJS |
| Base de données | PostgreSQL |
| ORM | Prisma |
| Auth | Auth interne contrôlée \+ JWT/session sécurisée |
| Stockage documents | S3-compatible / stockage local évolutif |
| API | REST v1 d’abord |
| Audit | PostgreSQL append-only au départ |
| Déploiement | Docker |
| Serveur | VPS Ubuntu |
| Reverse proxy | Nginx |
| CI/CD | GitHub Actions |
| Documentation | Markdown versionné dans Git |

---

# **2\. Pourquoi cette stack**

## **2.1 Next.js**

Pour :

* portail public ;  
* espace membre ;  
* dashboard ;  
* SEO ;  
* interface web moderne ;  
* future compatibilité mobile/PWA.

---

## **2.2 NestJS**

Pour :

* architecture modulaire ;  
* séparation claire des domaines ;  
* API robuste ;  
* permissions ;  
* événements ;  
* tests ;  
* structure backend propre.

C’est adapté au modèle :

Identity  
Organization  
Activity  
Knowledge  
Communication  
Audit  
---

## **2.3 PostgreSQL**

Pour :

* données relationnelles fortes ;  
* hiérarchie ;  
* rôles ;  
* permissions ;  
* audit ;  
* intégrité ;  
* transactions.

Le GAMAD HUB est un système de gouvernance.  
 Il a besoin d’une base relationnelle solide.

---

## **2.4 Prisma**

Pour :

* migrations propres ;  
* schéma lisible ;  
* typage ;  
* cohérence avec Git ;  
* génération contrôlée.

---

## **2.5 Docker**

Pour :

* portabilité ;  
* VPS ;  
* ILC ;  
* staging ;  
* production ;  
* reconstruction.

---

# **3\. Architecture technique MVP**

gamad-hub/  
│  
├── apps/  
│   └── web/  
│  
├── api/  
│   └── nestjs-core/  
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
│   ├── constitution/  
│   ├── architecture/  
│   └── api/  
│  
├── docker/  
│  
└── README.md  
---

# **4\. Modules backend NestJS**

api/src/modules/  
│  
├── identity/  
├── organization/  
├── permissions/  
├── activity/  
├── knowledge/  
├── communication/  
├── audit/  
└── system/

Chaque module doit contenir :

controller  
service  
repository  
dto  
policy  
events  
tests  
---

# **5\. Base de données**

PostgreSQL doit porter les entités :

gamad\_ids  
accounts  
profiles  
roles  
permissions  
role\_permissions  
member\_roles  
organization\_units  
memberships  
activities  
tasks  
documents  
document\_versions  
messages  
notifications  
audit\_events  
---

# **6\. API**

Format :

/api/v1/identity  
/api/v1/organization  
/api/v1/activities  
/api/v1/documents  
/api/v1/audit

Règle :

aucune route sans permission explicite  
---

# **7\. Sécurité minimale**

Obligatoire dès le MVP :

* hash sécurisé des mots de passe ;  
* JWT ou session sécurisée ;  
* rate limiting ;  
* validation stricte des entrées ;  
* audit des actions critiques ;  
* permissions côté backend ;  
* séparation DEV / STAGING / PROD ;  
* secrets hors Git.

---

# **8\. Déploiement cible initial**

VPS Ubuntu  
│  
├── Nginx  
├── Docker  
├── PostgreSQL  
├── API NestJS  
├── App Next.js  
├── Stockage fichiers  
└── Backups  
---

# **9\. Ce qu’on évite au MVP**

Ne pas commencer avec :

* microservices complets ;  
* blockchain ;  
* wallet ;  
* Kubernetes ;  
* streaming vidéo ;  
* IA agentique avancée ;  
* marketplace ;  
* réseau social massif.

Ces couches viendront après stabilisation du CORE.

---

# **10\. Décision finale**

La stack officielle recommandée pour **GAMAD HUB CORE MVP** est :

Next.js  
\+  
NestJS  
\+  
PostgreSQL  
\+  
Prisma  
\+  
Docker  
\+  
Nginx  
\+  
VPS Ubuntu  
\+  
GitHub Actions  
