# **📘 GAMAD HUB REFERENCE ARCHITECTURE**

## **Version fondatrice v0.1**

---

# **0\. Objet du document**

Cette architecture de référence transforme la **Constitution Technique** et le **GAMAD HUB CORE** en structure système concrète.

Elle définit :

* les couches techniques ;  
* les services principaux ;  
* les flux ;  
* les frontières ;  
* les données ;  
* les APIs ;  
* la sécurité ;  
* le déploiement.

⚠️ Ce document ne choisit pas encore une stack précise.  
 Il fixe l’architecture avant les outils.

---

# **1\. Principe directeur**

Le GAMAD HUB doit être conçu comme :

un noyau d’identité et de coordination  
autour duquel les futurs modules GAMAD se branchent.

Le système ne doit jamais être pensé comme une simple interface.

---

# **2\. Vue générale**

UTILISATEURS  
   │  
   ▼  
PORTAIL WEB / MOBILE  
   │  
   ▼  
API GATEWAY  
   │  
   ▼  
CORE SERVICES  
   │  
   ├── Identity Service  
   ├── Organization Service  
   ├── Activity Service  
   ├── Knowledge Service  
   ├── Communication Service  
   └── Audit Service  
   │  
   ▼  
DATA LAYER  
   │  
   ├── Identity Database  
   ├── Organization Database  
   ├── Activity Database  
   ├── Document Storage  
   ├── Audit Logs  
   └── Search Index  
---

# **3\. Architecture en couches**

## **Couche 1 — Interface**

Rôle :

* portail public ;  
* espace membre ;  
* tableau de bord ;  
* accès mobile ;  
* consultation documentaire ;  
* participation aux activités.

⚠️ L’interface ne doit contenir aucune logique critique.

Elle consomme les APIs.

---

## **Couche 2 — API Gateway**

Rôle :

* point d’entrée unique ;  
* routage ;  
* authentification ;  
* limitation des abus ;  
* journalisation ;  
* contrôle d’accès initial.

---

## **Couche 3 — Core Services**

Rôle :

* porter la logique métier ;  
* appliquer les règles ;  
* protéger les frontières ;  
* produire les événements ;  
* générer les logs d’audit.

---

## **Couche 4 — Data Layer**

Rôle :

* stocker les données ;  
* préserver l’historique ;  
* garantir l’intégrité ;  
* permettre la restauration.

---

## **Couche 5 — Infrastructure**

Rôle :

* exécution ;  
* sauvegarde ;  
* monitoring ;  
* déploiement ;  
* réplication ;  
* résilience.

---

# **4\. Services de référence**

## **4.1 Identity Service**

Service critique absolu.

Responsabilités :

* GAMAD ID ;  
* comptes ;  
* authentification ;  
* sessions ;  
* rôles ;  
* permissions ;  
* sécurité ;  
* validation des accès.

Règle :

Aucun autre service ne crée sa propre identité.  
---

## **4.2 Organization Service**

Responsabilités :

* HCG ;  
* départements ;  
* coordinations ;  
* sections ;  
* Zumara ;  
* organigrammes ;  
* rattachements ;  
* responsabilités.

---

## **4.3 Activity Service**

Responsabilités :

* projets ;  
* tâches ;  
* événements ;  
* workflows ;  
* validations ;  
* rapports ;  
* cycles d’activité.

---

## **4.4 Knowledge Service**

Responsabilités :

* documents ;  
* bibliothèque ;  
* médias ;  
* archives ;  
* versions ;  
* classifications.

---

## **4.5 Communication Service**

Responsabilités :

* annonces ;  
* notifications ;  
* messages ;  
* discussions ;  
* communications internes.

---

## **4.6 Audit Service**

Responsabilités :

* logs ;  
* historique ;  
* actions critiques ;  
* sécurité ;  
* preuves ;  
* traçabilité.

⚠️ Ce service doit être difficile à altérer.

---

# **5\. Frontières des services**

Chaque service possède :

* sa responsabilité ;  
* ses données ;  
* ses règles ;  
* ses APIs ;  
* ses événements.

Exemple :

Activity Service ne modifie pas directement les rôles.  
Il demande au Identity Service si l’utilisateur a le droit.  
---

# **6\. Flux principal utilisateur**

## **Création d’un membre**

Utilisateur remplit formulaire  
   ↓  
Identity Service crée GAMAD ID  
   ↓  
Profil initial créé  
   ↓  
Statut \= PENDING  
   ↓  
Validation hiérarchique  
   ↓  
Statut \= ACTIVE  
   ↓  
Audit Event enregistré  
---

# **7\. Flux organisationnel**

## **Affectation à un Zumara**

Responsable propose affectation  
   ↓  
Organization Service vérifie structure  
   ↓  
Identity Service vérifie permission  
   ↓  
Affectation validée  
   ↓  
Audit Service journalise  
---

# **8\. Flux documentaire**

## **Ajout d’un document stratégique**

Utilisateur soumet document  
   ↓  
Knowledge Service vérifie classification  
   ↓  
Identity Service vérifie permission  
   ↓  
Document stocké  
   ↓  
Version créée  
   ↓  
Audit Event enregistré  
---

# **9\. Modèle de données de référence**

Entités minimales :

GAMAD\_ID  
ACCOUNT  
PROFILE  
ROLE  
PERMISSION  
ORGANIZATION\_UNIT  
MEMBERSHIP  
ZUMARA  
ACTIVITY  
TASK  
WORKFLOW  
DOCUMENT  
DOCUMENT\_VERSION  
MESSAGE  
NOTIFICATION  
AUDIT\_EVENT  
---

# **10\. Relations principales**

GAMAD\_ID  
├── ACCOUNT  
├── PROFILE  
├── ROLES  
├── MEMBERSHIPS  
└── AUDIT\_EVENTS

ORGANIZATION\_UNIT  
├── PARENT\_UNIT  
├── MEMBERS  
├── ACTIVITIES  
└── DOCUMENTS

ACTIVITY  
├── TASKS  
├── WORKFLOW  
├── DOCUMENTS  
└── AUDIT\_EVENTS  
---

# **11\. Architecture API**

## **APIs minimales**

/auth  
/identity  
/members  
/organization  
/activities  
/documents  
/communications  
/audit

## **Règles**

Chaque API doit être :

* versionnée ;  
* documentée ;  
* sécurisée ;  
* testable ;  
* auditée.

Exemple :

/api/v1/identity  
/api/v1/organization  
/api/v1/documents  
---

# **12\. Architecture événementielle**

Chaque action critique produit un événement.

Exemples :

USER\_CREATED  
USER\_VALIDATED  
ROLE\_ASSIGNED  
ORGANIZATION\_UNIT\_CREATED  
MEMBER\_ATTACHED\_TO\_ZUMARA  
DOCUMENT\_UPLOADED  
DOCUMENT\_VALIDATED  
ACTIVITY\_CREATED  
ACTIVITY\_COMPLETED  
PERMISSION\_CHANGED  
---

# **13\. Sécurité de référence**

## **Règles minimales**

* authentification forte ;  
* MFA pour rôles sensibles ;  
* sessions révocables ;  
* permissions explicites ;  
* journalisation obligatoire ;  
* chiffrement des données sensibles ;  
* séparation des environnements ;  
* sauvegarde régulière.

---

# **14\. Permissions de référence**

Le modèle doit combiner :

RBAC \+ contexte organisationnel

C’est-à-dire :

* rôle global ;  
* rôle local ;  
* structure d’appartenance ;  
* type de ressource ;  
* niveau de classification.

Exemple :

Un responsable de Coordination peut gérer ses sections,  
mais pas celles d’une autre Coordination.  
---

# **15\. Données et stockage**

## **Séparation recommandée**

| Donnée | Stockage logique |
| ----- | ----- |
| Identité | base critique |
| Organisation | base relationnelle |
| Activités | base métier |
| Documents | stockage fichiers |
| Audit | stockage immuable |
| Recherche | index dédié |

---

# **16\. Infrastructure cible**

Architecture minimale :

Frontend  
   ↓  
API Gateway  
   ↓  
Backend Core  
   ↓  
Database  
   ↓  
Storage  
   ↓  
Backups

Architecture évolutive :

Frontend  
   ↓  
API Gateway  
   ↓  
Services séparés  
   ↓  
Event Bus  
   ↓  
Databases spécialisées  
   ↓  
Storage distribué  
   ↓  
Monitoring \+ Backups \+ Replication  
---

# **17\. Déploiement de référence**

Environnements obligatoires :

DEV  
TEST  
STAGING  
PROD

Règle :

Aucune expérimentation directe en production.  
---

# **18\. Rôle de HAMAYNI**

HAMAYNI peut devenir la couche :

* déploiement ;  
* manifests ;  
* contrats ;  
* vérification ;  
* reconstruction ;  
* rollback ;  
* preuve d’exécution.

Mais HAMAYNI ne remplace pas :

* GAMAD ID ;  
* gouvernance ;  
* métier ;  
* mémoire institutionnelle.

---

# **19\. MVP technique recommandé**

Le premier MVP doit contenir uniquement :

1. création GAMAD ID ;  
2. connexion ;  
3. profils membres ;  
4. rôles et permissions ;  
5. structure organisationnelle ;  
6. Zumara ;  
7. documents ;  
8. activités simples ;  
9. audit logs ;  
10. tableau de bord minimal.

Pas de wallet.  
 Pas de marketplace.  
 Pas de TV.  
 Pas de super réseau social.

---

# **20\. Déclaration finale**

La Reference Architecture du GAMAD HUB fixe une règle :

Le système doit naître petit,  
mais avec une architecture capable de devenir grand.  
