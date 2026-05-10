# **📘 GAMAD HUB PROMPT PACK v0.1**

Objectif : transformer tous les documents précédents en **prompts de développement contrôlés**, prêts pour Replit / Claude Code / Codex, sans perdre la doctrine.

## **Ordre recommandé**

1\. Master Prompt — Architecte  
2\. Prompt Repo Bootstrap  
3\. Prompt Backend Core  
4\. Prompt Prisma Data Model  
5\. Prompt Permission Engine  
6\. Prompt Event & Audit Engine  
7\. Prompt API Contracts  
8\. Prompt Frontend Dashboard  
9\. Prompt Tests & QA  
10\. Prompt Deploy VPS

⚠️ Ce pack ne doit pas demander à l’IA de “faire une app complète d’un coup”.

Il doit imposer :

contrats  
→ modules  
→ tests  
→ validation  
→ release

## **Prompts maîtres pour construire le MVP sans dérive**

---

# **0\. Objectif**

Ce pack sert à guider une IA de développement pour construire le **GAMAD HUB CORE MVP** sans trahir :

* la Constitution Technique ;  
* le Data Model ;  
* le Permission Model ;  
* l’Event Model ;  
* les API Contracts ;  
* le MVP Scope ;  
* le Repository Blueprint.

---

# **1\. Règle absolue**

Aucun prompt ne doit demander :

Construis toute l’application d’un coup.

Chaque prompt doit produire :

* un bloc contrôlé ;  
* vérifiable ;  
* testable ;  
* compatible avec les contrats.

---

# **2\. MASTER PROMPT — Architecte**

Tu agis comme architecte logiciel senior du projet GAMAD HUB CORE.

Ta mission est de construire un MVP strictement conforme aux documents suivants :  
\- Constitution Technique du GAMAD HUB  
\- Core Specification  
\- Reference Architecture  
\- Data Model v0.1  
\- Permission Model v0.1  
\- Event Model v0.1  
\- API Contracts v0.1  
\- MVP Scope v0.1  
\- Build Spec v0.1  
\- Implementation Strategy v0.1  
\- Repository Blueprint v0.1

Règles non négociables :  
1\. Ne jamais construire une super-app complète.  
2\. Ne jamais ajouter wallet, marketplace, TV, IA avancée ou blockchain au MVP.  
3\. Respecter l’architecture modulaire.  
4\. Le backend porte la logique métier.  
5\. Le frontend ne décide jamais des permissions.  
6\. Toute action critique doit générer un audit.  
7\. Toute action métier importante doit produire un événement.  
8\. Toute API doit avoir permission, entrée, sortie, erreur, événement.  
9\. Git, contrats et documentation sont la source de vérité.  
10\. Refuser toute solution rapide qui crée une dette technique.

Avant toute génération de code :  
\- vérifier les domaines concernés ;  
\- identifier les permissions ;  
\- identifier les événements ;  
\- identifier les entités ;  
\- proposer les tests associés.  
---

# **3\. PROMPT 1 — Bootstrap du dépôt**

Crée la structure initiale du dépôt gamad-hub-core selon le Repository Blueprint v0.1.

Stack :  
\- Next.js pour apps/web  
\- NestJS pour api/core  
\- PostgreSQL  
\- Prisma  
\- Docker  
\- GitHub Actions

Contraintes :  
\- monolithe modulaire organisé ;  
\- dossiers docs, contracts, shared-types, validators ;  
\- aucun vrai secret dans Git ;  
\- .env.example obligatoire ;  
\- README initial clair ;  
\- structure prête pour tests, CI et Docker.

Ne développe pas encore les fonctionnalités métier.  
Crée seulement l’ossature propre du projet.  
---

# **4\. PROMPT 2 — Prisma Data Model**

Implémente le schéma Prisma du GAMAD HUB CORE selon le Data Model v0.1.

Entités obligatoires :  
\- GAMAD\_ID  
\- ACCOUNT  
\- PROFILE  
\- ROLE  
\- PERMISSION  
\- ROLE\_PERMISSION  
\- MEMBER\_ROLE  
\- ORGANIZATION\_UNIT  
\- MEMBERSHIP  
\- ZUMARA  
\- ACTIVITY  
\- TASK  
\- WORKFLOW  
\- WORKFLOW\_STEP  
\- DOCUMENT  
\- DOCUMENT\_VERSION  
\- MESSAGE  
\- ANNOUNCEMENT  
\- NOTIFICATION  
\- AUDIT\_EVENT

Contraintes :  
\- UUID pour les identifiants internes ;  
\- public\_code unique pour GAMAD\_ID ;  
\- relations explicites ;  
\- enums pour statuts ;  
\- audit\_events append-only conceptuellement ;  
\- document\_versions avec checksum ;  
\- aucune suppression destructrice par défaut ;  
\- migrations propres.

Ajoute un seed minimal :  
\- rôle Super Admin ;  
\- rôle HCG Validator ;  
\- permissions fondamentales ;  
\- premier compte admin de développement via variables d’environnement.

Ne crée aucune UI.  
---

# **5\. PROMPT 3 — Identity Core**

Développe le module Identity Core dans api/core.

Fonctions obligatoires :  
\- création GAMAD ID ;  
\- création ACCOUNT lié ;  
\- création PROFILE initial ;  
\- login ;  
\- gestion session/token ;  
\- lecture identité ;  
\- validation membre ;  
\- suspension membre ;  
\- mise à jour profil.

Permissions obligatoires :  
\- identity.create  
\- identity.read  
\- identity.validate  
\- identity.suspend  
\- profile.update.self

Événements à produire :  
\- GAMAD\_ID\_CREATED  
\- ACCOUNT\_CREATED  
\- MEMBER\_VALIDATED  
\- MEMBER\_SUSPENDED  
\- PROFILE\_UPDATED  
\- LOGIN\_SUCCESS  
\- LOGIN\_FAILED

Audit obligatoire :  
\- création GAMAD ID ;  
\- validation membre ;  
\- suspension membre ;  
\- login failed ;  
\- modification profil.

Contraintes :  
\- mot de passe hashé ;  
\- aucune permission côté frontend ;  
\- validation stricte DTO ;  
\- réponses API standardisées ;  
\- tests unitaires et intégration.  
---

# **6\. PROMPT 4 — Permission Engine**

Développe le moteur de permissions du GAMAD HUB CORE.

Objectif :  
implémenter RBAC \+ contexte organisationnel \+ classification ressource.

Fonctions :  
\- vérifier permission globale ;  
\- vérifier permission dans une organization\_unit ;  
\- vérifier rôle actif ;  
\- vérifier statut GAMAD ID ;  
\- refuser pending/suspended/banned ;  
\- gérer scope global / unit / module.

Règles :  
\- aucun accès critique implicite ;  
\- moindre privilège ;  
\- permission format module.action ;  
\- rôle sans permission \= aucun accès ;  
\- rôle révoqué \= accès supprimé.

À intégrer :  
\- guards NestJS ;  
\- decorators permission ;  
\- policies par module ;  
\- audit sur refus critique ;  
\- tests de permissions.

Ne crée pas de UI.  
---

# **7\. PROMPT 5 — Organization Core**

Développe le module Organization Core.

Fonctions :  
\- créer organization\_unit ;  
\- gérer hiérarchie parent/enfant ;  
\- créer Zumara comme organization\_unit spécialisée ;  
\- affecter membre à unité ;  
\- retirer membre ;  
\- affecter responsable ;  
\- archiver unité.

Permissions :  
\- organization.create  
\- organization.read  
\- organization.update  
\- organization.assign\_member  
\- organization.archive

Événements :  
\- ORGANIZATION\_UNIT\_CREATED  
\- ORGANIZATION\_UNIT\_UPDATED  
\- ORGANIZATION\_UNIT\_ARCHIVED  
\- MEMBER\_ATTACHED\_TO\_UNIT  
\- MEMBER\_REMOVED\_FROM\_UNIT  
\- ZUMARA\_CREATED  
\- RESPONSIBLE\_ASSIGNED

Audit obligatoire pour :  
\- création unité ;  
\- affectation membre ;  
\- affectation responsable ;  
\- archivage unité.

Contraintes :  
\- pas de suppression destructive ;  
\- hiérarchie cohérente ;  
\- permissions contextuelles ;  
\- tests obligatoires.  
---

# **8\. PROMPT 6 — Audit & Event Engine**

Développe le moteur Event \+ Audit du GAMAD HUB CORE.

Objectifs :  
\- créer un EventEmitter interne ;  
\- standardiser les events ;  
\- enregistrer les AUDIT\_EVENT ;  
\- supporter correlation\_id et causation\_id ;  
\- tracer actions critiques.

Fonctions :  
\- emitEvent(eventType, payload)  
\- writeAudit(actor, action, target, oldValue, newValue, context)  
\- lister audit events avec filtres  
\- exporter audit events selon permission

Contraintes :  
\- audit\_events append-only ;  
\- pas de suppression ;  
\- pas de modification silencieuse ;  
\- aucun secret dans payload ;  
\- logs critiques protégés.

Événements :  
\- AUDIT\_EXPORTED  
\- SECURITY\_ALERT\_RAISED si nécessaire

Tests :  
\- audit créé après action critique ;  
\- export refusé sans permission ;  
\- correlation\_id conservé.  
---

# **9\. PROMPT 7 — Knowledge Core**

Développe le module Knowledge Core.

Fonctions :  
\- créer document ;  
\- ajouter version document ;  
\- classification document ;  
\- soumettre document ;  
\- valider document ;  
\- archiver document ;  
\- exporter document selon permission.

Permissions :  
\- document.create  
\- document.read  
\- document.update  
\- document.validate  
\- document.archive  
\- document.export

Événements :  
\- DOCUMENT\_CREATED  
\- DOCUMENT\_VERSION\_CREATED  
\- DOCUMENT\_SUBMITTED  
\- DOCUMENT\_VALIDATED  
\- DOCUMENT\_ARCHIVED  
\- DOCUMENT\_EXPORTED

Audit obligatoire :  
\- document stratégique créé ;  
\- nouvelle version ;  
\- validation ;  
\- export confidentiel ou stratégique.

Contraintes :  
\- version validée immutable ;  
\- checksum obligatoire ;  
\- classification respectée ;  
\- pas de suppression destructive ;  
\- tests permissions \+ versions.  
---

# **10\. PROMPT 8 — Activity Core**

Développe le module Activity Core.

Fonctions :  
\- créer activité ;  
\- soumettre activité ;  
\- valider activité ;  
\- rejeter activité ;  
\- démarrer activité ;  
\- compléter activité ;  
\- archiver activité ;  
\- créer tâche ;  
\- assigner tâche ;  
\- terminer tâche ;  
\- créer rapport simple.

Permissions :  
\- activity.create  
\- activity.read  
\- activity.update  
\- activity.validate  
\- activity.archive  
\- task.create  
\- task.update

Événements :  
\- ACTIVITY\_CREATED  
\- ACTIVITY\_SUBMITTED  
\- ACTIVITY\_VALIDATED  
\- ACTIVITY\_REJECTED  
\- ACTIVITY\_STARTED  
\- ACTIVITY\_COMPLETED  
\- TASK\_CREATED  
\- TASK\_ASSIGNED  
\- TASK\_COMPLETED  
\- REPORT\_SUBMITTED

Audit obligatoire :  
\- validation activité ;  
\- rejet ;  
\- archivage ;  
\- changement critique statut.

Contraintes :  
\- transitions d’état explicites ;  
\- aucun statut magique ;  
\- validation permission contextuelle ;  
\- tests workflows.  
---

# **11\. PROMPT 9 — Communication minimale**

Développe le module Communication Core minimal.

Fonctions :  
\- créer annonce ;  
\- publier annonce ;  
\- envoyer message direct ;  
\- créer notification ;  
\- marquer notification comme lue.

Permissions :  
\- announcement.create  
\- announcement.publish  
\- message.send  
\- notification.read

Événements :  
\- ANNOUNCEMENT\_CREATED  
\- ANNOUNCEMENT\_PUBLISHED  
\- MESSAGE\_SENT  
\- NOTIFICATION\_CREATED  
\- NOTIFICATION\_READ

Contraintes :  
\- pas de feed social ;  
\- pas d’algorithme viral ;  
\- pas de réseau social complet ;  
\- communication gouvernée et traçable.  
---

# **12\. PROMPT 10 — Frontend MVP**

Construis l’interface web MVP dans apps/web.

Écrans obligatoires :  
\- login ;  
\- dashboard ;  
\- membres ;  
\- structures ;  
\- Zumara ;  
\- documents ;  
\- activités ;  
\- audit logs ;  
\- notifications.

Contraintes :  
\- le frontend consomme les APIs ;  
\- le frontend ne décide jamais des permissions ;  
\- afficher uniquement ce que l’API autorise ;  
\- UX sobre, institutionnelle, mobile-first ;  
\- pas d’animations inutiles ;  
\- pas de réseau social ;  
\- pas de wallet ;  
\- pas de marketplace.

Dashboard :  
\- identité ;  
\- structure ;  
\- activités en cours ;  
\- documents récents ;  
\- tâches ;  
\- validations en attente ;  
\- notifications.

Prévoir composants :  
\- tables ;  
\- formulaires ;  
\- badges statuts ;  
\- filtres ;  
\- pages détail.  
---

# **13\. PROMPT 11 — Tests & QA**

Établis et implémente le plan de tests du GAMAD HUB CORE MVP.

Tests obligatoires :  
\- Identity ;  
\- Permissions ;  
\- Organization ;  
\- Knowledge ;  
\- Activity ;  
\- Audit ;  
\- API contracts ;  
\- workflows ;  
\- sécurité minimale.

Critères :  
\- aucune action critique sans audit ;  
\- aucune route critique sans permission ;  
\- aucune validation sans événement ;  
\- aucun document stratégique exporté sans audit ;  
\- aucun membre suspended/banned ne peut agir ;  
\- aucun frontend ne contourne le backend.

Produis :  
\- tests unitaires ;  
\- tests intégration ;  
\- tests e2e minimaux ;  
\- rapport QA.  
---

# **14\. PROMPT 12 — Docker & Déploiement VPS**

Prépare le déploiement Docker du GAMAD HUB CORE MVP sur VPS Ubuntu.

Inclure :  
\- Dockerfile API ;  
\- Dockerfile Web ;  
\- docker-compose.yml ;  
\- PostgreSQL ;  
\- volumes persistants ;  
\- variables d’environnement ;  
\- Nginx reverse proxy ;  
\- script migration ;  
\- script backup ;  
\- procédure restore ;  
\- documentation déploiement.

Contraintes :  
\- aucun secret dans Git ;  
\- prod séparée de dev ;  
\- backups testables ;  
\- rollback documenté ;  
\- logs accessibles ;  
\- HTTPS prévu.

Ne pas ajouter Kubernetes.  
Ne pas ajouter microservices.  
---

# **15\. PROMPT 13 — Documentation finale MVP**

Rédige la documentation technique du MVP GAMAD HUB CORE.

Inclure :  
\- architecture ;  
\- installation locale ;  
\- variables d’environnement ;  
\- commandes ;  
\- migration ;  
\- seed ;  
\- tests ;  
\- déploiement VPS ;  
\- API contracts ;  
\- permissions ;  
\- événements ;  
\- limites connues ;  
\- roadmap prochaine version.

La documentation doit être en Markdown dans /docs.  
Elle doit permettre à un nouveau développeur de reprendre le projet sans dépendre de l’auteur initial.  
---

# **16\. Ordre d’exécution recommandé**

1\. Master Prompt  
2\. Repo Bootstrap  
3\. Prisma Data Model  
4\. Identity Core  
5\. Permission Engine  
6\. Organization Core  
7\. Audit & Event Engine  
8\. Knowledge Core  
9\. Activity Core  
10\. Communication minimale  
11\. Frontend MVP  
12\. Tests & QA  
13\. Docker & Déploiement VPS  
14\. Documentation finale  
---

# **17\. Règle finale du Prompt Pack**

Chaque IA de développement doit recevoir cette consigne :

Tu ne dois pas agrandir le périmètre.  
Tu dois construire le noyau.  
Toute suggestion hors MVP doit être notée dans FUTURE\_ROADMAP.md,  
mais ne doit pas être implémentée.

\----------------------------------------------------------------------------------

# **Prompt opérationnel n°1 — Bootstrap du dépôt `gamad-hub-core`**

Crée la structure initiale du dépôt gamad-hub-core selon le Repository Blueprint v0.1.

Stack officielle :  
\- Next.js pour apps/web  
\- NestJS pour api/core  
\- PostgreSQL  
\- Prisma  
\- Docker  
\- GitHub Actions

Objectif :  
Créer uniquement l’ossature propre du projet, sans développer encore les fonctionnalités métier.

Contraintes non négociables :  
1\. Monolithe modulaire organisé.  
2\. Backend séparé du frontend.  
3\. Dossiers contracts, shared-types, validators obligatoires.  
4\. Dossier docs obligatoire avec sections de documentation.  
5\. Dossier prisma avec schema.prisma initial vide ou minimal.  
6\. Dossier docker avec Dockerfile.api, Dockerfile.web et docker-compose.yml.  
7\. Dossier infra avec nginx, backups et deploy.  
8\. Dossier scripts avec setup.sh, migrate.sh, seed.sh, backup.sh, restore.sh.  
9\. Dossier .github/workflows avec ci.yml et deploy-staging.yml.  
10\. Aucun vrai secret dans Git.  
11\. Créer .env.example.  
12\. Créer README.md clair.  
13\. Créer CHANGELOG.md.  
14\. Créer .gitignore adapté Node, Next.js, NestJS, Prisma, Docker.  
15\. Ne pas ajouter wallet, marketplace, IA avancée, blockchain, TV ou réseau social.

Structure attendue :

gamad-hub-core/  
├── apps/web  
├── api/core  
├── packages/contracts  
├── packages/shared-types  
├── packages/validators  
├── prisma  
├── docs  
├── docker  
├── infra  
├── scripts  
├── .github/workflows  
├── .env.example  
├── .gitignore  
├── README.md  
├── CHANGELOG.md  
└── LICENSE

Dans api/core, préparer les modules vides :  
\- identity  
\- organization  
\- permissions  
\- activity  
\- knowledge  
\- communication  
\- audit  
\- system

Chaque module backend doit contenir une structure prête :  
\- controller  
\- service  
\- module  
\- dto  
\- policies  
\- events  
\- tests

Dans apps/web, préparer les routes ou dossiers :  
\- login  
\- dashboard  
\- members  
\- organization  
\- documents  
\- activities  
\- audit

Livrable attendu :  
\- dépôt initial fonctionnel ;  
\- commandes d’installation documentées ;  
\- structure prête pour implémentation du Prisma Data Model ;  
\- aucune logique métier avancée.

# **Prompt opérationnel n°2 — Prisma Data Model**

Implémente le schéma Prisma du GAMAD HUB CORE selon le GAMAD HUB DATA MODEL v0.1.

Contexte :  
Le dépôt gamad-hub-core existe déjà avec la structure initiale.  
Tu dois maintenant construire uniquement le modèle de données Prisma, les enums, les relations, et le seed minimal.

Stack :  
\- PostgreSQL  
\- Prisma  
\- NestJS backend dans api/core  
\- Monolithe modulaire organisé

Objectif :  
Créer le squelette relationnel officiel du GAMAD HUB CORE.

Entités obligatoires :  
\- GAMAD\_ID  
\- ACCOUNT  
\- PROFILE  
\- ROLE  
\- PERMISSION  
\- ROLE\_PERMISSION  
\- MEMBER\_ROLE  
\- ORGANIZATION\_UNIT  
\- MEMBERSHIP  
\- ZUMARA  
\- ACTIVITY  
\- TASK  
\- WORKFLOW  
\- WORKFLOW\_STEP  
\- DOCUMENT  
\- DOCUMENT\_VERSION  
\- MESSAGE  
\- ANNOUNCEMENT  
\- NOTIFICATION  
\- AUDIT\_EVENT

Contraintes générales :  
1\. Utiliser UUID pour les identifiants internes.  
2\. public\_code de GAMAD\_ID doit être unique.  
3\. email actif de ACCOUNT doit être unique.  
4\. Le mot de passe brut ne doit jamais être stocké.  
5\. Utiliser des enums Prisma pour les statuts.  
6\. Aucun modèle ne doit dépendre de logique frontend.  
7\. Les relations doivent être explicites.  
8\. Prévoir created\_at et updated\_at quand pertinent.  
9\. Aucun vrai secret dans le code.  
10\. Ne pas ajouter wallet, marketplace, blockchain, TV, IA avancée ou réseau social.

Enums obligatoires :  
\- IdentityType : PERSON, ORGANIZATION, SYSTEM  
\- IdentityStatus : PENDING, ACTIVE, LIMITED, SUSPENDED, ARCHIVED, BANNED  
\- AccountStatus : ACTIVE, LOCKED, DISABLED  
\- RoleScope : GLOBAL, UNIT, MODULE  
\- OrganizationUnitType : HCG, DEPARTMENT, COORDINATION, SECTION, ZUMARA  
\- OrganizationUnitStatus : ACTIVE, INACTIVE, ARCHIVED  
\- MembershipType : MEMBER, RESPONSIBLE, ASSISTANT, OBSERVER  
\- MembershipStatus : PENDING, ACTIVE, SUSPENDED, ARCHIVED  
\- ActivityStatus : DRAFT, SUBMITTED, VALIDATED, IN\_PROGRESS, COMPLETED, ARCHIVED  
\- ActivityPriority : LOW, NORMAL, HIGH, STRATEGIC  
\- TaskStatus : TODO, IN\_PROGRESS, BLOCKED, DONE, CANCELLED  
\- WorkflowStatus : ACTIVE, INACTIVE  
\- WorkflowTargetType : ACTIVITY, DOCUMENT, MEMBERSHIP  
\- WorkflowActionRequired : APPROVE, REJECT, REVIEW  
\- DocumentType : STATUTE, REPORT, MANUAL, PROCEDURE, MEDIA, ARCHIVE, TRAINING  
\- DocumentClassification : PUBLIC, INTERNAL, CONFIDENTIAL, STRATEGIC  
\- DocumentStatus : DRAFT, SUBMITTED, VALIDATED, ARCHIVED  
\- MessageStatus : SENT, DELIVERED, READ, ARCHIVED  
\- AnnouncementAudienceScope : PUBLIC, INTERNAL, UNIT, ROLE

Modèles et champs attendus :

1\. GamadId  
\- id UUID primary key  
\- publicCode string unique  
\- identityType IdentityType  
\- status IdentityStatus default PENDING  
\- createdAt DateTime  
\- updatedAt DateTime  
Relations :  
\- account  
\- profile  
\- memberRoles  
\- memberships  
\- ownedActivities  
\- assignedTasks  
\- ownedDocuments  
\- sentMessages  
\- receivedMessages  
\- notifications  
\- auditEventsAsActor

2\. Account  
\- id UUID primary key  
\- gamadId unique relation vers GamadId  
\- email unique  
\- phone optional  
\- passwordHash  
\- mfaEnabled boolean default false  
\- lastLoginAt optional  
\- status AccountStatus default ACTIVE  
\- createdAt  
\- updatedAt

3\. Profile  
\- id UUID primary key  
\- gamadId unique relation vers GamadId  
\- firstName optional  
\- lastName optional  
\- displayName  
\- avatarUrl optional  
\- bio optional  
\- birthDate optional  
\- country optional  
\- city optional  
\- visibility string ou enum simple  
\- createdAt  
\- updatedAt

4\. Role  
\- id UUID primary key  
\- name unique  
\- scope RoleScope  
\- description optional  
\- isSystemRole boolean default false  
\- createdAt  
Relations :  
\- rolePermissions  
\- memberRoles  
\- workflowSteps

5\. Permission  
\- id UUID primary key  
\- code unique  
\- module  
\- action  
\- description optional  
Relations :  
\- rolePermissions

6\. RolePermission  
\- roleId  
\- permissionId  
Contrainte :  
\- clé composite roleId \+ permissionId

7\. MemberRole  
\- id UUID primary key  
\- gamadId relation  
\- roleId relation  
\- organizationUnitId optional relation  
\- grantedBy optional relation vers GamadId  
\- grantedAt default now  
\- revokedAt optional  
Contrainte :  
\- conserver l’historique des rôles révoqués, ne pas supprimer.

8\. OrganizationUnit  
\- id UUID primary key  
\- name  
\- type OrganizationUnitType  
\- parentId optional self relation  
\- status OrganizationUnitStatus default ACTIVE  
\- description optional  
\- createdAt  
\- updatedAt  
Relations :  
\- parent  
\- children  
\- memberships  
\- memberRoles  
\- zumara  
\- activities  
\- documents  
\- announcements  
\- auditEvents

9\. Membership  
\- id UUID primary key  
\- gamadId relation  
\- organizationUnitId relation  
\- membershipType MembershipType  
\- status MembershipStatus default PENDING  
\- joinedAt optional/default now  
\- leftAt optional

10\. Zumara  
\- id UUID primary key  
\- organizationUnitId unique relation  
\- activityDomain  
\- mission optional  
\- visibility string ou enum simple  
\- createdAt

11\. Activity  
\- id UUID primary key  
\- title  
\- description optional  
\- organizationUnitId relation  
\- ownerId relation vers GamadId  
\- status ActivityStatus default DRAFT  
\- priority ActivityPriority default NORMAL  
\- startDate optional  
\- endDate optional  
\- createdAt  
\- updatedAt  
Relations :  
\- tasks

12\. Task  
\- id UUID primary key  
\- activityId relation  
\- title  
\- description optional  
\- assignedTo optional relation vers GamadId  
\- status TaskStatus default TODO  
\- dueDate optional  
\- createdAt  
\- updatedAt

13\. Workflow  
\- id UUID primary key  
\- name  
\- targetType WorkflowTargetType  
\- status WorkflowStatus default ACTIVE  
\- createdAt  
Relations :  
\- steps

14\. WorkflowStep  
\- id UUID primary key  
\- workflowId relation  
\- stepOrder integer  
\- requiredRoleId relation vers Role  
\- actionRequired WorkflowActionRequired  
\- createdAt

15\. Document  
\- id UUID primary key  
\- title  
\- documentType DocumentType  
\- classification DocumentClassification  
\- organizationUnitId optional relation  
\- ownerId relation vers GamadId  
\- status DocumentStatus default DRAFT  
\- createdAt  
\- updatedAt  
Relations :  
\- versions

16\. DocumentVersion  
\- id UUID primary key  
\- documentId relation  
\- versionNumber  
\- fileUrl  
\- checksum  
\- createdBy relation vers GamadId  
\- createdAt  
Contrainte :  
\- une nouvelle modification crée une nouvelle version.  
\- ne pas prévoir de suppression destructive.

17\. Message  
\- id UUID primary key  
\- senderId relation vers GamadId  
\- recipientId relation vers GamadId  
\- organizationUnitId optional relation  
\- content text/string  
\- status MessageStatus default SENT  
\- createdAt

18\. Announcement  
\- id UUID primary key  
\- title  
\- content  
\- organizationUnitId optional relation  
\- audienceScope AnnouncementAudienceScope  
\- publishedBy relation vers GamadId  
\- publishedAt optional  
\- createdAt

19\. Notification  
\- id UUID primary key  
\- gamadId relation vers GamadId  
\- type string  
\- content  
\- readAt optional  
\- createdAt

20\. AuditEvent  
\- id UUID primary key  
\- actorId optional relation vers GamadId  
\- action string  
\- targetType string  
\- targetId string  
\- organizationUnitId optional relation  
\- oldValue Json optional  
\- newValue Json optional  
\- ipAddress optional  
\- userAgent optional  
\- createdAt default now  
Contraintes :  
\- considérer comme append-only au niveau service.  
\- ne pas créer de logique de suppression.

Seed minimal obligatoire :  
1\. Créer les permissions fondamentales :  
\- identity.create  
\- identity.read  
\- identity.validate  
\- identity.suspend  
\- identity.manage\_roles  
\- profile.update.self  
\- organization.create  
\- organization.read  
\- organization.update  
\- organization.assign\_member  
\- organization.archive  
\- activity.create  
\- activity.read  
\- activity.update  
\- activity.validate  
\- activity.archive  
\- task.create  
\- task.update  
\- document.create  
\- document.read  
\- document.update  
\- document.validate  
\- document.archive  
\- document.export  
\- audit.read  
\- audit.export  
\- announcement.create  
\- announcement.publish  
\- message.send  
\- notification.read

2\. Créer les rôles système :  
\- Super Administrator  
\- HCG Validator  
\- Department Manager  
\- Coordination Manager  
\- Section Manager  
\- Zumara Manager  
\- Active Member  
\- Archivist  
\- Auditor  
\- System Agent

3\. Attribuer toutes les permissions au rôle Super Administrator.

4\. Créer une organization\_unit racine :  
\- name : Haut Conseil Général  
\- type : HCG  
\- status : ACTIVE

5\. Créer un premier compte admin de développement uniquement à partir de variables d’environnement :  
\- ADMIN\_EMAIL  
\- ADMIN\_PASSWORD  
\- ADMIN\_DISPLAY\_NAME

6\. Créer son GAMAD ID, Account, Profile et MemberRole Super Administrator.

Livrables attendus :  
\- prisma/schema.prisma complet  
\- prisma/seed.ts complet  
\- scripts de migration/seed mis à jour si nécessaire  
\- documentation courte dans docs/03-data-model/prisma-implementation-notes.md

Tests ou vérifications à prévoir :  
\- prisma validate  
\- prisma generate  
\- migration initiale  
\- seed fonctionne sans vrai secret hardcodé  
\- publicCode unique  
\- email unique  
\- relations Prisma valides

Ne développe pas encore :  
\- API Identity  
\- UI  
\- Permission Engine  
\- Activity logic  
\- Knowledge logic

Limite-toi au modèle Prisma et au seed.

# **Prompt opérationnel n°3 — Identity Core**

Développe le module Identity Core du GAMAD HUB CORE dans api/core.

Contexte :  
Le dépôt gamad-hub-core existe.  
Le schéma Prisma et le seed minimal sont déjà en place.  
Tu dois maintenant implémenter uniquement le module Identity Core.

Objectif :  
Construire le noyau d’identité du GAMAD HUB :  
\- GAMAD ID  
\- Account  
\- Profile  
\- authentification  
\- sessions/token  
\- validation membre  
\- suspension membre  
\- mise à jour profil

Contraintes non négociables :  
1\. Le backend porte toute la logique métier.  
2\. Le frontend ne décide jamais des permissions.  
3\. Aucun module ne crée sa propre identité.  
4\. Toute action critique génère un AUDIT\_EVENT.  
5\. Toute action métier importante produit un EVENT.  
6\. Les mots de passe doivent être hashés.  
7\. Aucun mot de passe brut ne doit être stocké ou logué.  
8\. Aucune donnée sensible inutile dans les events.  
9\. Réponses API standardisées.  
10\. Ne pas développer Organization, Activity, Knowledge ou UI.

Permissions concernées :  
\- identity.create  
\- identity.read  
\- identity.validate  
\- identity.suspend  
\- profile.update.self

Événements à produire :  
\- GAMAD\_ID\_CREATED  
\- ACCOUNT\_CREATED  
\- PROFILE\_UPDATED  
\- MEMBER\_VALIDATED  
\- MEMBER\_SUSPENDED  
\- LOGIN\_SUCCESS  
\- LOGIN\_FAILED

Audit obligatoire :  
\- création GAMAD ID  
\- validation membre  
\- suspension membre  
\- login failed  
\- modification profil

Endpoints à implémenter :

1\. Créer un GAMAD ID  
POST /api/v1/identity/gamad-ids

Entrée :  
{  
 "identityType": "PERSON",  
 "email": "user@example.com",  
 "phone": "+225000000000",  
 "displayName": "Nom affiché",  
 "password": "MotDePasseFort"  
}

Sortie :  
{  
 "success": true,  
 "data": {  
   "gamadId": "uuid",  
   "publicCode": "GMD-000001",  
   "status": "PENDING"  
 }  
}

2\. Login  
POST /api/v1/auth/login

Entrée :  
{  
 "email": "user@example.com",  
 "password": "MotDePasse"  
}

Sortie :  
{  
 "success": true,  
 "data": {  
   "accessToken": "...",  
   "user": {  
     "gamadId": "uuid",  
     "publicCode": "GMD-000001",  
     "displayName": "Nom affiché",  
     "status": "ACTIVE"  
   }  
 }  
}

3\. Lire une identité  
GET /api/v1/identity/gamad-ids/{id}

Permission :  
identity.read

4\. Valider un membre  
POST /api/v1/identity/gamad-ids/{id}/validate

Permission :  
identity.validate

Entrée :  
{  
 "decisionNote": "Validation approuvée"  
}

Effet :  
PENDING → ACTIVE

5\. Suspendre un membre  
POST /api/v1/identity/gamad-ids/{id}/suspend

Permission :  
identity.suspend

Entrée :  
{  
 "reason": "Motif obligatoire",  
 "durationDays": 30  
}

Effet :  
ACTIVE/LIMITED → SUSPENDED

6\. Mettre à jour son profil  
PATCH /api/v1/profiles/{gamadId}

Permission :  
profile.update.self

Entrée :  
{  
 "displayName": "Nom affiché",  
 "bio": "Présentation",  
 "city": "Abidjan",  
 "country": "Côte d’Ivoire"  
}

Architecture attendue dans api/core/src/modules/identity :

identity/  
├── identity.controller.ts  
├── identity.service.ts  
├── identity.repository.ts  
├── identity.module.ts  
├── dto/  
│   ├── create-gamad-id.dto.ts  
│   ├── login.dto.ts  
│   ├── validate-member.dto.ts  
│   ├── suspend-member.dto.ts  
│   └── update-profile.dto.ts  
├── events/  
│   └── identity.events.ts  
├── policies/  
│   └── identity.policy.ts  
└── tests/

Également prévoir :  
\- auth guard basique  
\- permission decorator  
\- current user decorator  
\- response formatter  
\- error codes standards

Gestion publicCode :  
\- générer un code unique lisible de type GMD-000001  
\- garantir l’unicité  
\- éviter collision

Règles d’erreur :  
\- AUTH\_REQUIRED  
\- PERMISSION\_DENIED  
\- VALIDATION\_ERROR  
\- RESOURCE\_NOT\_FOUND  
\- CONFLICT  
\- INTERNAL\_ERROR

Tests obligatoires :  
1\. création GAMAD ID réussie  
2\. email unique refusé  
3\. mot de passe hashé  
4\. login réussi  
5\. login failed produit audit  
6\. membre pending ne doit pas accéder aux actions non autorisées  
7\. validation membre change statut en ACTIVE  
8\. suspension membre change statut en SUSPENDED  
9\. mise à jour profil produit PROFILE\_UPDATED  
10\. route protégée refuse accès sans token

Livrables attendus :  
\- module Identity fonctionnel  
\- endpoints REST v1  
\- DTOs validés  
\- events constants  
\- audit hooks ou appels audit service provisoires  
\- tests Identity  
\- documentation courte dans docs/identity-core.md

Ne développe pas encore :  
\- Organization Core  
\- Activity Core  
\- Knowledge Core  
\- frontend dashboard  
\- wallet  
\- marketplace  
\- TV  
\- IA avancée

# **Prompt opérationnel n°4 — Permission Engine**

Développe le Permission Engine du GAMAD HUB CORE dans api/core.

Contexte :  
Le dépôt gamad-hub-core existe.  
Le Prisma Data Model est en place.  
Le module Identity Core est en place.  
Tu dois maintenant construire le moteur de permissions central.

Objectif :  
Implémenter le contrôle d’accès officiel du GAMAD HUB selon le Permission Model v0.1.

Le moteur doit combiner :  
\- statut GAMAD ID ;  
\- rôle ;  
\- permission ;  
\- contexte organisationnel ;  
\- classification de ressource si applicable.

Contraintes non négociables :  
1\. Aucun accès critique implicite.  
2\. Le backend décide toujours des permissions.  
3\. Le frontend ne doit jamais être source de vérité.  
4\. Le principe du moindre privilège est obligatoire.  
5\. Tout refus critique peut être audité.  
6\. Les rôles révoqués ne donnent plus accès.  
7\. Les statuts PENDING, SUSPENDED, BANNED doivent bloquer les actions sensibles.  
8\. Les permissions suivent le format module.action.  
9\. Ne pas développer encore Organization Core complet, Activity, Knowledge ou UI.

Permissions concernées :  
\- toutes les permissions existantes dans le seed  
\- format obligatoire : module.action

Fonctions attendues :  
1\. Vérifier si un utilisateur possède une permission globale.  
2\. Vérifier si un utilisateur possède une permission dans une organization\_unit.  
3\. Vérifier le statut du GAMAD ID.  
4\. Vérifier que le rôle est actif.  
5\. Vérifier que la permission existe.  
6\. Refuser les identités non actives selon contexte.  
7\. Supporter les scopes :  
  \- GLOBAL  
  \- UNIT  
  \- MODULE

Architecture attendue :

api/core/src/modules/permissions/  
├── permissions.module.ts  
├── permissions.service.ts  
├── permissions.repository.ts  
├── permissions.controller.ts  
├── dto/  
├── decorators/  
│   └── require-permission.decorator.ts  
├── guards/  
│   └── permission.guard.ts  
├── policies/  
│   └── permission.policy.ts  
├── events/  
│   └── permission.events.ts  
└── tests/

À prévoir dans common si nécessaire :  
api/core/src/common/  
├── decorators/current-user.decorator.ts  
├── guards/auth.guard.ts  
├── guards/permission.guard.ts  
└── types/auth-user.type.ts

Méthodes minimales à implémenter :

1\. hasPermission(params)  
Entrée :  
{  
 "gamadId": "uuid",  
 "permissionCode": "document.validate",  
 "organizationUnitId": "uuid optional"  
}

Sortie :  
true / false

2\. assertPermission(params)  
Même entrée.  
Si refus :  
\- lever PERMISSION\_DENIED  
\- produire audit si action critique

3\. getEffectivePermissions(gamadId)  
Retourne :  
\- permissions globales ;  
\- permissions contextuelles ;  
\- rôles actifs ;  
\- scopes.

4\. canAccessOrganizationUnit(gamadId, organizationUnitId)  
Vérifie accès contextuel.

Règles de statut :  
\- ACTIVE : accès selon permissions.  
\- PENDING : accès très limité.  
\- LIMITED : accès réduit selon règles futures.  
\- SUSPENDED : aucun accès aux actions métier.  
\- ARCHIVED : lecture historique seulement selon permission.  
\- BANNED : aucun accès.

Règles de rôle :  
\- revokedAt non null \= rôle inactif.  
\- rôle sans permission \= aucun accès.  
\- rôle global \= permission globale.  
\- rôle unit \= permission limitée à organizationUnitId.  
\- rôle module \= permission limitée au domaine/module.

Décorateur attendu :

@RequirePermission("document.validate")

Possibilité avec contexte :

@RequirePermission("organization.assign\_member", { contextParam: "unitId" })

Guard attendu :  
\- lit l’utilisateur courant ;  
\- lit la permission requise ;  
\- lit le contexte si fourni ;  
\- appelle PermissionsService.assertPermission ;  
\- refuse proprement si non autorisé.

Réponse erreur standard :

{  
 "success": false,  
 "error": {  
   "code": "PERMISSION\_DENIED",  
   "message": "Access denied",  
   "details": {  
     "permission": "document.validate"  
   }  
 }  
}

Événements à produire :  
\- PERMISSION\_CHECK\_FAILED si refus critique  
\- ROLE\_ASSIGNED et ROLE\_REVOKED seulement si endpoints de gestion de rôle sont déjà ou seront reliés à ce module

Audit obligatoire :  
\- refus accès sur action critique ;  
\- modification rôle ;  
\- modification permission ;  
\- accès emergency futur.

Tests obligatoires :  
1\. Super Administrator possède toutes les permissions seedées.  
2\. Active Member sans permission est refusé.  
3\. Rôle révoqué ne donne plus accès.  
4\. SUSPENDED est refusé même avec rôle.  
5\. BANNED est refusé.  
6\. Permission globale fonctionne.  
7\. Permission contextuelle fonctionne sur bonne unité.  
8\. Permission contextuelle est refusée sur autre unité.  
9\. Guard refuse sans token.  
10\. Guard refuse sans permission.  
11\. Guard accepte avec permission valide.  
12\. getEffectivePermissions retourne les permissions attendues.

Livrables attendus :  
\- Permission Engine fonctionnel.  
\- Décorateur @RequirePermission.  
\- Guard de permission.  
\- Service de vérification central.  
\- Tests unitaires et intégration.  
\- Documentation courte dans docs/04-permission-model/permission-engine-implementation.md.

Ne développe pas encore :  
\- UI permissions avancée.  
\- Marketplace.  
\- Wallet.  
\- Blockchain.  
\- TV.  
\- IA avancée.  
\- Réseau social complet.

Rappel :  
Le Permission Engine est une fondation critique.  
Il vaut mieux livrer peu, mais strict, que beaucoup, mais permissif.

# **Prompt opérationnel n°5 — Organization Core**

Développe le module Organization Core du GAMAD HUB CORE dans api/core.

Contexte :  
Le dépôt gamad-hub-core existe.  
Le Prisma Data Model est en place.  
Identity Core est en place.  
Permission Engine est en place.

Objectif :  
Construire le noyau organisationnel du GAMAD HUB :  
\- HCG  
\- Départements  
\- Coordinations  
\- Sections  
\- Zumara  
\- memberships  
\- affectation responsables  
\- hiérarchie organisationnelle

Contraintes non négociables :  
1\. Toute structure doit être une ORGANIZATION\_UNIT.  
2\. Une Zumara est une ORGANIZATION\_UNIT spécialisée.  
3\. Aucune suppression destructive.  
4\. Toute action critique doit générer un AUDIT\_EVENT.  
5\. Toute action métier importante doit produire un EVENT.  
6\. Les permissions doivent passer par Permission Engine.  
7\. Le frontend ne décide jamais des rattachements.  
8\. Respect strict de la hiérarchie parent/enfant.  
9\. Ne pas développer Activity, Knowledge ou UI avancée maintenant.

Permissions concernées :  
\- organization.create  
\- organization.read  
\- organization.update  
\- organization.assign\_member  
\- organization.archive  
\- identity.manage\_roles si affectation responsable implique rôle

Événements à produire :  
\- ORGANIZATION\_UNIT\_CREATED  
\- ORGANIZATION\_UNIT\_UPDATED  
\- ORGANIZATION\_UNIT\_ARCHIVED  
\- MEMBER\_ATTACHED\_TO\_UNIT  
\- MEMBER\_REMOVED\_FROM\_UNIT  
\- ZUMARA\_CREATED  
\- ZUMARA\_UPDATED  
\- RESPONSIBLE\_ASSIGNED  
\- RESPONSIBLE\_REVOKED

Audit obligatoire :  
\- création unité  
\- modification unité  
\- archivage unité  
\- affectation membre  
\- retrait membre  
\- affectation responsable  
\- révocation responsable

Endpoints à implémenter :

1\. Créer une unité organisationnelle  
POST /api/v1/organization/units

Entrée :  
{  
 "name": "GAMAD Technologie",  
 "type": "DEPARTMENT",  
 "parentId": "uuid optional",  
 "description": "Département Technologie"  
}

Permission :  
organization.create

Sortie :  
{  
 "success": true,  
 "data": {  
   "organizationUnitId": "uuid",  
   "name": "GAMAD Technologie",  
   "type": "DEPARTMENT",  
   "status": "ACTIVE"  
 }  
}

2\. Lire les unités  
GET /api/v1/organization/units

Permission :  
organization.read

Filtres :  
\- type  
\- parentId  
\- status

3\. Lire une unité  
GET /api/v1/organization/units/{id}

Permission :  
organization.read

4\. Modifier une unité  
PATCH /api/v1/organization/units/{id}

Permission :  
organization.update

Entrée :  
{  
 "name": "Nouveau nom",  
 "description": "Nouvelle description"  
}

5\. Archiver une unité  
POST /api/v1/organization/units/{id}/archive

Permission :  
organization.archive

Entrée :  
{  
 "reason": "Motif obligatoire"  
}

Effet :  
status \= ARCHIVED

6\. Affecter un membre à une unité  
POST /api/v1/organization/units/{unitId}/members

Permission :  
organization.assign\_member

Entrée :  
{  
 "gamadId": "uuid",  
 "membershipType": "MEMBER"  
}

7\. Retirer un membre d’une unité  
POST /api/v1/organization/units/{unitId}/members/{gamadId}/remove

Permission :  
organization.assign\_member

Entrée :  
{  
 "reason": "Motif obligatoire"  
}

Effet :  
membership.leftAt \= now  
membership.status \= ARCHIVED

8\. Créer une Zumara  
POST /api/v1/organization/zumara

Permission :  
organization.create

Entrée :  
{  
 "name": "Zumara Développement Web",  
 "parentId": "uuid section ou autre unité parente",  
 "activityDomain": "Développement Web",  
 "mission": "Créer et maintenir des outils numériques GAMAD",  
 "visibility": "internal"  
}

Effet :  
\- créer ORGANIZATION\_UNIT type ZUMARA  
\- créer ZUMARA liée

9\. Affecter un responsable à une unité  
POST /api/v1/organization/units/{unitId}/responsible

Permissions :  
organization.assign\_member  
identity.manage\_roles

Entrée :  
{  
 "gamadId": "uuid",  
 "roleId": "uuid",  
 "reason": "Nomination officielle"  
}

Effet :  
\- membership RESPONSIBLE si absent  
\- MemberRole créé avec organizationUnitId  
\- event RESPONSIBLE\_ASSIGNED  
\- audit renforcé

Architecture attendue :

api/core/src/modules/organization/  
├── organization.controller.ts  
├── organization.service.ts  
├── organization.repository.ts  
├── organization.module.ts  
├── dto/  
│   ├── create-organization-unit.dto.ts  
│   ├── update-organization-unit.dto.ts  
│   ├── archive-organization-unit.dto.ts  
│   ├── attach-member.dto.ts  
│   ├── remove-member.dto.ts  
│   ├── create-zumara.dto.ts  
│   └── assign-responsible.dto.ts  
├── policies/  
│   └── organization.policy.ts  
├── events/  
│   └── organization.events.ts  
└── tests/

Règles hiérarchiques minimales :  
\- HCG peut être racine.  
\- DEPARTMENT peut avoir parent HCG.  
\- COORDINATION peut avoir parent DEPARTMENT ou HCG selon configuration.  
\- SECTION peut avoir parent COORDINATION.  
\- ZUMARA peut avoir parent SECTION ou autre unité autorisée.  
\- Une unité ne peut pas être son propre parent.  
\- Empêcher les cycles parent/enfant.

Règles de validation :  
\- parentId doit exister si fourni.  
\- unité archivée ne peut pas recevoir de nouveaux membres.  
\- membre suspendu ou banni ne peut pas être affecté.  
\- responsable doit avoir un rôle compatible.  
\- affectation déjà active ne doit pas être dupliquée.

Réponses API :  
Utiliser le format standard :  
{  
 "success": true,  
 "data": {}  
}

Erreurs standards :  
\- VALIDATION\_ERROR  
\- AUTH\_REQUIRED  
\- PERMISSION\_DENIED  
\- RESOURCE\_NOT\_FOUND  
\- CONFLICT  
\- INTERNAL\_ERROR

Tests obligatoires :  
1\. créer département avec permission valide.  
2\. refuser création sans organization.create.  
3\. refuser parent inexistant.  
4\. refuser cycle hiérarchique.  
5\. créer Zumara crée bien organization\_unit \+ zumara.  
6\. affecter membre actif à unité.  
7\. refuser affectation membre suspended/banned.  
8\. refuser affectation à unité archived.  
9\. archiver unité ne supprime pas les données.  
10\. affecter responsable crée membership \+ memberRole.  
11\. retrait membre archive membership.  
12\. chaque action critique produit audit.  
13\. chaque action métier produit event.

Livrables attendus :  
\- Organization Core fonctionnel.  
\- Endpoints REST v1.  
\- DTOs validés.  
\- Events constants.  
\- Intégration Permission Engine.  
\- Audit hooks ou appels Audit Service provisoires.  
\- Tests Organization.  
\- Documentation courte dans docs/organization-core.md.

Ne développe pas encore :  
\- Activity Core.  
\- Knowledge Core.  
\- Frontend dashboard avancé.  
\- Wallet.  
\- Marketplace.  
\- TV.  
\- IA avancée.

# **Prompt opérationnel n°6 — Audit & Event Engine**

Développe le moteur Audit & Event du GAMAD HUB CORE dans api/core.

Contexte :  
Le dépôt gamad-hub-core existe.  
Le Prisma Data Model est en place.  
Identity Core est en place.  
Permission Engine est en place.  
Organization Core est en place.

Objectif :  
Construire le système nerveux de traçabilité et d’événements du GAMAD HUB :  
\- émission d’événements métier ;  
\- journalisation AUDIT\_EVENT ;  
\- correlation\_id ;  
\- causation\_id ;  
\- export audit contrôlé ;  
\- consultation audit filtrée ;  
\- protection des logs critiques.

Contraintes non négociables :  
1\. Toute action critique doit produire un AUDIT\_EVENT.  
2\. Toute action métier importante doit produire un EVENT.  
3\. Les AUDIT\_EVENT sont append-only.  
4\. Aucune suppression de logs critiques.  
5\. Aucun secret dans les payloads d’event.  
6\. Aucun mot de passe ou token dans les audits.  
7\. L’export audit exige permission explicite.  
8\. Le backend reste source de vérité.  
9\. Ne pas développer encore Knowledge, Activity ou UI avancée.

Permissions concernées :  
\- audit.read  
\- audit.export

Événements à supporter :  
\- AUDIT\_EXPORTED  
\- SECURITY\_ALERT\_RAISED  
\- PERMISSION\_CHECK\_FAILED  
\- DEPLOYMENT\_STARTED  
\- DEPLOYMENT\_COMPLETED  
\- DEPLOYMENT\_FAILED  
\- BACKUP\_STARTED  
\- BACKUP\_COMPLETED  
\- BACKUP\_FAILED

Architecture attendue :

api/core/src/modules/audit/  
├── audit.controller.ts  
├── audit.service.ts  
├── audit.repository.ts  
├── audit.module.ts  
├── dto/  
│   ├── create-audit-event.dto.ts  
│   ├── audit-filter.dto.ts  
│   └── export-audit.dto.ts  
├── events/  
│   └── audit.events.ts  
├── policies/  
│   └── audit.policy.ts  
└── tests/

Créer aussi si nécessaire :

api/core/src/common/events/  
├── event-bus.service.ts  
├── event.types.ts  
└── event.constants.ts

Fonctions minimales AuditService :

1\. writeAudit(params)

Entrée :  
{  
 "actorId": "uuid optional",  
 "action": "string",  
 "targetType": "string",  
 "targetId": "string",  
 "organizationUnitId": "uuid optional",  
 "oldValue": {},  
 "newValue": {},  
 "ipAddress": "string optional",  
 "userAgent": "string optional",  
 "correlationId": "string optional",  
 "causationId": "string optional"  
}

Effet :  
\- crée AUDIT\_EVENT  
\- ne modifie jamais un ancien audit

2\. listAuditEvents(filters)

Filtres :  
\- actorId  
\- action  
\- targetType  
\- targetId  
\- organizationUnitId  
\- from  
\- to  
\- page  
\- limit

Permission :  
audit.read

3\. exportAuditEvents(filters)

Permission :  
audit.export

Effet :  
\- produit export structuré JSON ou CSV  
\- génère événement AUDIT\_EXPORTED  
\- génère audit de l’export

Fonctions minimales EventBusService :

1\. emitEvent(event)

Structure event :  
{  
 "eventId": "uuid",  
 "eventType": "string",  
 "actorId": "uuid optional",  
 "targetType": "string optional",  
 "targetId": "string optional",  
 "organizationUnitId": "uuid optional",  
 "payload": {},  
 "occurredAt": "datetime",  
 "emittedAt": "datetime",  
 "correlationId": "uuid optional",  
 "causationId": "uuid optional",  
 "priority": "LOW | NORMAL | HIGH | CRITICAL | SECURITY"  
}

2\. sanitizePayload(payload)

Objectif :  
\- retirer password  
\- token  
\- secret  
\- apiKey  
\- privateKey  
\- tout champ sensible évident

3\. createCorrelationId()

Objectif :  
\- produire un UUID pour relier plusieurs événements.

Endpoints à implémenter :

1\. Lister audit events  
GET /api/v1/audit/events

Permission :  
audit.read

Query params :  
\- actorId  
\- action  
\- targetType  
\- organizationUnitId  
\- from  
\- to  
\- page  
\- limit

2\. Export audit events  
GET /api/v1/audit/events/export

Permission :  
audit.export

Query params :  
\- actorId  
\- action  
\- targetType  
\- organizationUnitId  
\- from  
\- to  
\- format=json|csv

Effets :  
\- audit exporté  
\- AUDIT\_EXPORTED produit  
\- AUDIT\_EVENT écrit pour l’export lui-même

Réponse standard succès :  
{  
 "success": true,  
 "data": {}  
}

Erreur standard :  
{  
 "success": false,  
 "error": {  
   "code": "PERMISSION\_DENIED",  
   "message": "Access denied",  
   "details": {}  
 }  
}

Règles append-only :  
\- ne pas créer d’endpoint DELETE audit.  
\- ne pas créer d’endpoint UPDATE audit.  
\- si besoin futur, prévoir seulement archive logique avec procédure spéciale.  
\- dans ce MVP, aucun update/delete audit.

Intégration attendue :  
\- Identity Core doit pouvoir appeler writeAudit.  
\- Permission Engine doit pouvoir écrire audit sur refus critique.  
\- Organization Core doit pouvoir écrire audit et émettre events.  
\- EventBusService doit être injectable dans les modules.

Tests obligatoires :  
1\. writeAudit crée un AUDIT\_EVENT.  
2\. writeAudit ne stocke pas password/token/secret dans oldValue/newValue.  
3\. listAuditEvents exige audit.read.  
4\. exportAuditEvents exige audit.export.  
5\. export produit AUDIT\_EXPORTED.  
6\. export écrit un AUDIT\_EVENT.  
7\. aucun endpoint update/delete audit n’existe.  
8\. correlationId est conservé.  
9\. causationId est conservé.  
10\. emitEvent refuse ou nettoie payload sensible.  
11\. Permission refusée sur audit export sans permission.  
12\. pagination audit fonctionne.

Livrables attendus :  
\- Audit Core fonctionnel.  
\- EventBusService interne fonctionnel.  
\- Endpoints REST v1 audit.  
\- Audit repository.  
\- DTOs validés.  
\- Tests Audit & Event.  
\- Documentation courte dans docs/05-event-model/audit-event-engine-implementation.md.

Ne développe pas encore :  
\- Knowledge Core.  
\- Activity Core.  
\- Communication Core avancé.  
\- Frontend audit dashboard.  
\- Wallet.  
\- Marketplace.  
\- TV.  
\- IA avancée.

Rappel :  
L’Audit & Event Engine n’est pas décoratif.  
Il est la mémoire opérationnelle et la preuve système du GAMAD HUB.

# **Prompt opérationnel n°7 — Knowledge Core**

Développe le module Knowledge Core du GAMAD HUB CORE dans api/core.

Contexte :  
Le dépôt gamad-hub-core existe.  
Le Prisma Data Model est en place.  
Identity Core est en place.  
Permission Engine est en place.  
Organization Core est en place.  
Audit & Event Engine est en place.

Objectif :  
Construire le noyau documentaire du GAMAD HUB :  
\- documents ;  
\- versions ;  
\- classifications ;  
\- validation documentaire ;  
\- archivage ;  
\- export contrôlé ;  
\- mémoire institutionnelle.

Contraintes non négociables :  
1\. Aucun document stratégique sans classification.  
2\. Aucune modification silencieuse d’un document validé.  
3\. Toute modification documentaire crée une nouvelle version.  
4\. Toute action critique génère un AUDIT\_EVENT.  
5\. Toute action métier importante produit un EVENT.  
6\. Les exports de documents CONFIDENTIAL ou STRATEGIC doivent être audités.  
7\. Les permissions passent toujours par Permission Engine.  
8\. Le backend reste source de vérité.  
9\. Ne pas développer Activity, Communication avancée ou UI maintenant.

Permissions concernées :  
\- document.create  
\- document.read  
\- document.update  
\- document.validate  
\- document.archive  
\- document.export

Événements à produire :  
\- DOCUMENT\_CREATED  
\- DOCUMENT\_VERSION\_CREATED  
\- DOCUMENT\_SUBMITTED  
\- DOCUMENT\_VALIDATED  
\- DOCUMENT\_REJECTED  
\- DOCUMENT\_ARCHIVED  
\- DOCUMENT\_EXPORTED  
\- DOCUMENT\_CLASSIFICATION\_CHANGED

Audit obligatoire :  
\- création document CONFIDENTIAL ou STRATEGIC  
\- ajout nouvelle version  
\- validation document  
\- rejet document  
\- changement classification  
\- export document CONFIDENTIAL ou STRATEGIC  
\- archivage document

Endpoints à implémenter :

1\. Créer un document  
POST /api/v1/documents

Permission :  
document.create

Entrée :  
{  
 "title": "Statuts GAMAD",  
 "documentType": "STATUTE",  
 "classification": "STRATEGIC",  
 "organizationUnitId": "uuid optional"  
}

Sortie :  
{  
 "success": true,  
 "data": {  
   "documentId": "uuid",  
   "status": "DRAFT"  
 }  
}

2\. Lister les documents  
GET /api/v1/documents

Permission :  
document.read

Filtres :  
\- documentType  
\- classification  
\- organizationUnitId  
\- status  
\- page  
\- limit

3\. Lire un document  
GET /api/v1/documents/{id}

Permission :  
document.read

Règle :  
respecter classification et contexte organisationnel.

4\. Ajouter une version  
POST /api/v1/documents/{id}/versions

Permission :  
document.update

Entrée :  
{  
 "versionNumber": "1.0",  
 "fileUrl": "storage/path/file.pdf",  
 "checksum": "sha256\_hash"  
}

Effet :  
\- crée DOCUMENT\_VERSION  
\- ne modifie pas une version existante  
\- produit DOCUMENT\_VERSION\_CREATED  
\- audit obligatoire

5\. Soumettre un document  
POST /api/v1/documents/{id}/submit

Permission :  
document.update

Effet :  
DRAFT → SUBMITTED

Événement :  
DOCUMENT\_SUBMITTED

6\. Valider un document  
POST /api/v1/documents/{id}/validate

Permission :  
document.validate

Entrée :  
{  
 "decisionNote": "Document validé"  
}

Effet :  
SUBMITTED → VALIDATED

Événement :  
DOCUMENT\_VALIDATED

Audit renforcé.

7\. Rejeter un document  
POST /api/v1/documents/{id}/reject

Permission :  
document.validate

Entrée :  
{  
 "reason": "Motif obligatoire"  
}

Effet :  
SUBMITTED → DRAFT ou status rejet selon choix propre documenté

Événement :  
DOCUMENT\_REJECTED

Audit obligatoire.

8\. Changer classification  
POST /api/v1/documents/{id}/classification

Permission :  
document.update

Entrée :  
{  
 "classification": "CONFIDENTIAL",  
 "reason": "Motif obligatoire"  
}

Événement :  
DOCUMENT\_CLASSIFICATION\_CHANGED

Audit obligatoire.

9\. Archiver un document  
POST /api/v1/documents/{id}/archive

Permission :  
document.archive

Entrée :  
{  
 "reason": "Motif obligatoire"  
}

Effet :  
status \= ARCHIVED

Événement :  
DOCUMENT\_ARCHIVED

10\. Exporter un document  
GET /api/v1/documents/{id}/export

Permission :  
document.export

Effet :  
\- autoriser export selon classification  
\- produire DOCUMENT\_EXPORTED  
\- audit obligatoire si CONFIDENTIAL ou STRATEGIC

Architecture attendue :

api/core/src/modules/knowledge/  
├── knowledge.controller.ts  
├── knowledge.service.ts  
├── knowledge.repository.ts  
├── knowledge.module.ts  
├── dto/  
│   ├── create-document.dto.ts  
│   ├── add-document-version.dto.ts  
│   ├── submit-document.dto.ts  
│   ├── validate-document.dto.ts  
│   ├── reject-document.dto.ts  
│   ├── change-classification.dto.ts  
│   └── archive-document.dto.ts  
├── policies/  
│   └── knowledge.policy.ts  
├── events/  
│   └── knowledge.events.ts  
└── tests/

Règles métier :  
\- Un document ARCHIVED ne peut pas être modifié.  
\- Un document VALIDATED ne doit pas être modifié directement.  
\- Une nouvelle version peut être proposée, mais l’ancienne version reste conservée.  
\- Un document sans version peut exister en DRAFT.  
\- Un document ne peut pas être VALIDATED sans au moins une version.  
\- checksum obligatoire pour toute version.  
\- classification STRATEGIC exige audit renforcé.  
\- export respecte classification et permissions.

Règles d’accès classification :  
\- PUBLIC : lecture selon règles publiques futures ou membres autorisés MVP.  
\- INTERNAL : membres actifs autorisés.  
\- CONFIDENTIAL : responsables autorisés selon contexte.  
\- STRATEGIC : HCG / Super Admin / rôles explicitement autorisés.

Réponses API :  
Utiliser le format standard :  
{  
 "success": true,  
 "data": {}  
}

Erreurs standards :  
\- VALIDATION\_ERROR  
\- AUTH\_REQUIRED  
\- PERMISSION\_DENIED  
\- RESOURCE\_NOT\_FOUND  
\- CONFLICT  
\- WORKFLOW\_REQUIRED  
\- INTERNAL\_ERROR

Tests obligatoires :  
1\. créer document avec permission valide.  
2\. refuser création sans document.create.  
3\. ajouter version avec checksum.  
4\. refuser version sans checksum.  
5\. valider document sans version doit échouer.  
6\. valider document SUBMITTED avec permission valide.  
7\. refuser validation sans document.validate.  
8\. document VALIDATED non modifiable directement.  
9\. changer classification produit audit.  
10\. export STRATEGIC produit audit.  
11\. export sans permission refusé.  
12\. archiver document ne supprime rien.  
13\. document ARCHIVED non modifiable.  
14\. chaque action métier produit event attendu.  
15\. classification STRATEGIC respecte accès strict.

Livrables attendus :  
\- Knowledge Core fonctionnel.  
\- Endpoints REST v1.  
\- DTOs validés.  
\- Events constants.  
\- Intégration Permission Engine.  
\- Intégration Audit & Event Engine.  
\- Tests Knowledge.  
\- Documentation courte dans docs/knowledge-core.md.

Ne développe pas encore :  
\- Activity Core.  
\- Communication avancée.  
\- Frontend documents.  
\- Wallet.  
\- Marketplace.  
\- TV.  
\- IA avancée.

Rappel :  
Le Knowledge Core est la mémoire institutionnelle du GAMAD HUB.  
Il doit privilégier la traçabilité et la continuité plutôt que la vitesse.

# **Prompt opérationnel n°8 — Activity Core**

Développe le module Activity Core du GAMAD HUB CORE dans api/core.

Contexte :  
Le dépôt gamad-hub-core existe.  
Le Prisma Data Model est en place.  
Identity Core est en place.  
Permission Engine est en place.  
Organization Core est en place.  
Audit & Event Engine est en place.  
Knowledge Core est en place.

Objectif :  
Construire le noyau opérationnel du GAMAD HUB :  
\- activités ;  
\- projets simples ;  
\- tâches ;  
\- assignations ;  
\- workflows simples ;  
\- validations ;  
\- rapports ;  
\- archivage.

Contraintes non négociables :  
1\. Toute activité doit être liée à une ORGANIZATION\_UNIT.  
2\. Toute activité doit avoir un owner\_id lié à un GAMAD ID.  
3\. Aucune transition d’état implicite.  
4\. Toute validation doit être auditée.  
5\. Toute action métier importante doit produire un EVENT.  
6\. Les permissions passent toujours par Permission Engine.  
7\. Le backend reste source de vérité.  
8\. Les membres SUSPENDED ou BANNED ne peuvent pas créer/valider/exécuter.  
9\. Ne pas développer marketplace, wallet, TV, IA avancée ou réseau social.

Permissions concernées :  
\- activity.create  
\- activity.read  
\- activity.update  
\- activity.validate  
\- activity.archive  
\- task.create  
\- task.update

Événements à produire :  
\- ACTIVITY\_CREATED  
\- ACTIVITY\_SUBMITTED  
\- ACTIVITY\_VALIDATED  
\- ACTIVITY\_REJECTED  
\- ACTIVITY\_STARTED  
\- ACTIVITY\_COMPLETED  
\- ACTIVITY\_ARCHIVED  
\- TASK\_CREATED  
\- TASK\_ASSIGNED  
\- TASK\_UPDATED  
\- TASK\_COMPLETED  
\- REPORT\_SUBMITTED  
\- REPORT\_VALIDATED

Audit obligatoire :  
\- création activité stratégique ;  
\- soumission activité ;  
\- validation activité ;  
\- rejet activité ;  
\- démarrage activité ;  
\- clôture activité ;  
\- archivage activité ;  
\- changement de responsable ;  
\- rapport soumis ;  
\- rapport validé.

Endpoints à implémenter :

1\. Créer une activité  
POST /api/v1/activities

Permission :  
activity.create

Entrée :  
{  
 "title": "Formation GAMAD Technology",  
 "description": "Session de formation initiale",  
 "organizationUnitId": "uuid",  
 "priority": "NORMAL",  
 "startDate": "2026-06-01",  
 "endDate": "2026-06-03"  
}

Effet :  
\- status \= DRAFT  
\- ownerId \= currentUser.gamadId  
\- event ACTIVITY\_CREATED

2\. Lister les activités  
GET /api/v1/activities

Permission :  
activity.read

Filtres :  
\- organizationUnitId  
\- status  
\- priority  
\- ownerId  
\- page  
\- limit

3\. Lire une activité  
GET /api/v1/activities/{id}

Permission :  
activity.read

4\. Modifier une activité  
PATCH /api/v1/activities/{id}

Permission :  
activity.update

Entrée :  
{  
 "title": "Nouveau titre",  
 "description": "Nouvelle description",  
 "priority": "HIGH",  
 "startDate": "2026-06-02",  
 "endDate": "2026-06-04"  
}

Règle :  
\- uniquement si status \= DRAFT ou SUBMITTED selon permission.  
\- impossible si COMPLETED ou ARCHIVED.

5\. Soumettre une activité  
POST /api/v1/activities/{id}/submit

Permission :  
activity.update

Effet :  
DRAFT → SUBMITTED

Event :  
ACTIVITY\_SUBMITTED

Audit obligatoire.

6\. Valider une activité  
POST /api/v1/activities/{id}/validate

Permission :  
activity.validate

Entrée :  
{  
 "decisionNote": "Activité approuvée"  
}

Effet :  
SUBMITTED → VALIDATED

Event :  
ACTIVITY\_VALIDATED

Audit renforcé.

7\. Rejeter une activité  
POST /api/v1/activities/{id}/reject

Permission :  
activity.validate

Entrée :  
{  
 "reason": "Motif obligatoire"  
}

Effet :  
SUBMITTED → DRAFT ou REJECTED si enum ajouté proprement.  
Si l’enum REJECTED n’existe pas encore, documenter le choix retenu.

Event :  
ACTIVITY\_REJECTED

Audit obligatoire.

8\. Démarrer une activité  
POST /api/v1/activities/{id}/start

Permission :  
activity.update

Effet :  
VALIDATED → IN\_PROGRESS

Event :  
ACTIVITY\_STARTED

Audit obligatoire.

9\. Compléter une activité  
POST /api/v1/activities/{id}/complete

Permission :  
activity.update

Entrée :  
{  
 "summary": "Résumé de réalisation"  
}

Effet :  
IN\_PROGRESS → COMPLETED

Event :  
ACTIVITY\_COMPLETED  
REPORT\_SUBMITTED si un rapport simple est créé

Audit obligatoire.

10\. Archiver une activité  
POST /api/v1/activities/{id}/archive

Permission :  
activity.archive

Entrée :  
{  
 "reason": "Motif obligatoire"  
}

Effet :  
COMPLETED → ARCHIVED

Event :  
ACTIVITY\_ARCHIVED

Audit obligatoire.

11\. Créer une tâche  
POST /api/v1/activities/{activityId}/tasks

Permission :  
task.create

Entrée :  
{  
 "title": "Préparer les supports",  
 "description": "Créer les documents de formation",  
 "assignedTo": "uuid optional",  
 "dueDate": "2026-06-01"  
}

Events :  
TASK\_CREATED  
TASK\_ASSIGNED si assignedTo existe

12\. Modifier une tâche  
PATCH /api/v1/tasks/{id}

Permission :  
task.update

Entrée :  
{  
 "title": "Nouveau titre",  
 "description": "Nouveau détail",  
 "assignedTo": "uuid optional",  
 "status": "IN\_PROGRESS",  
 "dueDate": "2026-06-02"  
}

Event :  
TASK\_UPDATED

13\. Terminer une tâche  
POST /api/v1/tasks/{id}/complete

Permission :  
task.update

Effet :  
status \= DONE

Event :  
TASK\_COMPLETED

Architecture attendue :

api/core/src/modules/activity/  
├── activity.controller.ts  
├── activity.service.ts  
├── activity.repository.ts  
├── activity.module.ts  
├── dto/  
│   ├── create-activity.dto.ts  
│   ├── update-activity.dto.ts  
│   ├── submit-activity.dto.ts  
│   ├── validate-activity.dto.ts  
│   ├── reject-activity.dto.ts  
│   ├── complete-activity.dto.ts  
│   ├── archive-activity.dto.ts  
│   ├── create-task.dto.ts  
│   └── update-task.dto.ts  
├── policies/  
│   └── activity.policy.ts  
├── events/  
│   └── activity.events.ts  
└── tests/

Règles de transition d’état :

Activité :  
\- DRAFT → SUBMITTED  
\- SUBMITTED → VALIDATED  
\- SUBMITTED → DRAFT ou REJECTED documenté  
\- VALIDATED → IN\_PROGRESS  
\- IN\_PROGRESS → COMPLETED  
\- COMPLETED → ARCHIVED

Transitions interdites :  
\- DRAFT → IN\_PROGRESS  
\- DRAFT → COMPLETED  
\- SUBMITTED → IN\_PROGRESS  
\- COMPLETED → IN\_PROGRESS  
\- ARCHIVED → autre état

Tâche :  
\- TODO → IN\_PROGRESS  
\- IN\_PROGRESS → BLOCKED  
\- BLOCKED → IN\_PROGRESS  
\- IN\_PROGRESS → DONE  
\- TODO → CANCELLED  
\- IN\_PROGRESS → CANCELLED

Règles métier :  
\- organizationUnitId doit exister.  
\- organizationUnit archived ne peut pas porter une nouvelle activité.  
\- ownerId \= utilisateur courant.  
\- assignedTo doit être un GAMAD ID actif.  
\- membre SUSPENDED/BANNED ne peut pas être assignedTo.  
\- une activité ARCHIVED ne peut pas être modifiée.  
\- une activité ne peut pas être validée sans permission activity.validate.  
\- une tâche ne peut pas être créée sur activité ARCHIVED.  
\- priorité STRATEGIC exige audit renforcé.

Réponses API :  
Utiliser le format standard :  
{  
 "success": true,  
 "data": {}  
}

Erreurs standards :  
\- VALIDATION\_ERROR  
\- AUTH\_REQUIRED  
\- PERMISSION\_DENIED  
\- RESOURCE\_NOT\_FOUND  
\- CONFLICT  
\- WORKFLOW\_REQUIRED  
\- INVALID\_STATE\_TRANSITION  
\- INTERNAL\_ERROR

Tests obligatoires :  
1\. créer activité avec permission valide.  
2\. refuser création sans activity.create.  
3\. refuser création sur organizationUnit archived.  
4\. ownerId \= utilisateur courant.  
5\. soumettre DRAFT → SUBMITTED.  
6\. refuser DRAFT → IN\_PROGRESS.  
7\. valider SUBMITTED → VALIDATED.  
8\. refuser validation sans activity.validate.  
9\. démarrer VALIDATED → IN\_PROGRESS.  
10\. compléter IN\_PROGRESS → COMPLETED.  
11\. archiver COMPLETED → ARCHIVED.  
12\. refuser modification activité ARCHIVED.  
13\. créer tâche sur activité valide.  
14\. refuser tâche sur activité ARCHIVED.  
15\. assignedTo suspended/banned refusé.  
16\. terminer tâche produit TASK\_COMPLETED.  
17\. chaque action critique produit audit.  
18\. chaque action métier produit event attendu.  
19\. activité STRATEGIC produit audit renforcé.

Livrables attendus :  
\- Activity Core fonctionnel.  
\- Endpoints REST v1.  
\- DTOs validés.  
\- Events constants.  
\- Intégration Permission Engine.  
\- Intégration Audit & Event Engine.  
\- Tests Activity.  
\- Documentation courte dans docs/activity-core.md.

Ne développe pas encore :  
\- Communication Core avancé.  
\- Frontend dashboard.  
\- Wallet.  
\- Marketplace.  
\- TV.  
\- IA avancée.  
\- Réseau social complet.

Rappel :  
Activity Core est le moteur d’exécution du GAMAD HUB.  
Il doit privilégier les transitions explicites, la validation et la traçabilité.

# **Prompt opérationnel n°9 — Communication Core minimal**

Développe le module Communication Core minimal du GAMAD HUB CORE dans api/core.

Contexte :  
Le dépôt gamad-hub-core existe.  
Le Prisma Data Model est en place.  
Identity Core est en place.  
Permission Engine est en place.  
Organization Core est en place.  
Audit & Event Engine est en place.  
Knowledge Core est en place.  
Activity Core est en place.

Objectif :  
Construire la communication minimale du MVP :  
\- annonces officielles ;  
\- messages directs simples ;  
\- notifications système ;  
\- lecture notifications.

Attention :  
Ce module n’est pas un réseau social.  
Il ne doit pas contenir de feed, d’algorithme viral, de likes, de commentaires publics ou de groupes sociaux complexes.

Contraintes non négociables :  
1\. Communication gouvernée et traçable.  
2\. Le backend reste source de vérité.  
3\. Les permissions passent par Permission Engine.  
4\. Les annonces officielles doivent être liées à une organization\_unit quand pertinent.  
5\. Les messages directs restent simples.  
6\. Les notifications peuvent être générées par les autres modules.  
7\. Toute annonce officielle publiée doit produire un EVENT.  
8\. Les actions critiques doivent produire un AUDIT\_EVENT.  
9\. Ne pas développer réseau social, marketplace, wallet, TV, IA avancée.

Permissions concernées :  
\- announcement.create  
\- announcement.publish  
\- message.send  
\- notification.read

Événements à produire :  
\- ANNOUNCEMENT\_CREATED  
\- ANNOUNCEMENT\_PUBLISHED  
\- ANNOUNCEMENT\_ARCHIVED  
\- MESSAGE\_SENT  
\- MESSAGE\_READ  
\- NOTIFICATION\_CREATED  
\- NOTIFICATION\_READ

Audit obligatoire :  
\- annonce officielle publiée ;  
\- annonce archivée ;  
\- message signalé ou action sensible future ;  
\- notification système critique lue si nécessaire.

Endpoints à implémenter :

1\. Créer une annonce  
POST /api/v1/communications/announcements

Permission :  
announcement.create

Entrée :  
{  
 "title": "Annonce officielle",  
 "content": "Contenu de l’annonce",  
 "organizationUnitId": "uuid optional",  
 "audienceScope": "INTERNAL"  
}

Effet :  
\- crée annonce  
\- publishedAt reste null si brouillon  
\- event ANNOUNCEMENT\_CREATED

2\. Publier une annonce  
POST /api/v1/communications/announcements/{id}/publish

Permission :  
announcement.publish

Effet :  
\- publishedAt \= now  
\- event ANNOUNCEMENT\_PUBLISHED  
\- audit obligatoire

3\. Lister les annonces  
GET /api/v1/communications/announcements

Permission :  
announcement.create ou lecture selon policy interne

Filtres :  
\- organizationUnitId  
\- audienceScope  
\- publishedOnly  
\- page  
\- limit

4\. Archiver une annonce  
POST /api/v1/communications/announcements/{id}/archive

Permission :  
announcement.publish

Entrée :  
{  
 "reason": "Motif obligatoire"  
}

Effet :  
\- marquer annonce comme archivée selon champ existant ou stratégie documentée.  
\- si le modèle Announcement n’a pas status, proposer une migration propre ou documenter limitation.  
\- event ANNOUNCEMENT\_ARCHIVED  
\- audit obligatoire

5\. Envoyer un message direct  
POST /api/v1/communications/messages

Permission :  
message.send

Entrée :  
{  
 "recipientId": "uuid",  
 "organizationUnitId": "uuid optional",  
 "content": "Message"  
}

Effet :  
\- crée MESSAGE  
\- status \= SENT  
\- event MESSAGE\_SENT  
\- crée notification destinataire si possible

6\. Lire ses messages  
GET /api/v1/communications/messages

Permission :  
message.send ou permission lecture interne

Filtres :  
\- recipientId \= current user par défaut  
\- organizationUnitId  
\- page  
\- limit

7\. Marquer message comme lu  
POST /api/v1/communications/messages/{id}/read

Permission :  
message.send ou policy propriétaire

Effet :  
\- status \= READ  
\- event MESSAGE\_READ

8\. Lister ses notifications  
GET /api/v1/communications/notifications

Permission :  
notification.read

Filtres :  
\- unreadOnly  
\- page  
\- limit

9\. Marquer notification comme lue  
POST /api/v1/communications/notifications/{id}/read

Permission :  
notification.read

Effet :  
\- readAt \= now  
\- event NOTIFICATION\_READ

Architecture attendue :

api/core/src/modules/communication/  
├── communication.controller.ts  
├── communication.service.ts  
├── communication.repository.ts  
├── communication.module.ts  
├── dto/  
│   ├── create-announcement.dto.ts  
│   ├── publish-announcement.dto.ts  
│   ├── archive-announcement.dto.ts  
│   ├── send-message.dto.ts  
│   └── read-notification.dto.ts  
├── policies/  
│   └── communication.policy.ts  
├── events/  
│   └── communication.events.ts  
└── tests/

Règles métier :  
\- Une annonce vide est refusée.  
\- Un message vide est refusé.  
\- recipientId doit exister et être ACTIVE.  
\- Un membre SUSPENDED ou BANNED ne peut pas envoyer de message.  
\- Un utilisateur ne peut lire que ses messages, sauf permission spéciale future.  
\- Une notification appartient à un GAMAD ID.  
\- Un utilisateur ne peut lire que ses notifications.  
\- Une annonce publiée ne doit pas être modifiée silencieusement.  
\- L’archivage remplace la suppression.

Réponses API :  
Utiliser le format standard :  
{  
 "success": true,  
 "data": {}  
}

Erreurs standards :  
\- VALIDATION\_ERROR  
\- AUTH\_REQUIRED  
\- PERMISSION\_DENIED  
\- RESOURCE\_NOT\_FOUND  
\- CONFLICT  
\- INTERNAL\_ERROR

Tests obligatoires :  
1\. créer annonce avec permission valide.  
2\. refuser annonce vide.  
3\. publier annonce produit ANNOUNCEMENT\_PUBLISHED.  
4\. publier annonce produit audit.  
5\. refuser publication sans announcement.publish.  
6\. envoyer message à membre ACTIVE.  
7\. refuser message vide.  
8\. refuser message vers membre SUSPENDED/BANNED.  
9\. message envoyé produit MESSAGE\_SENT.  
10\. message envoyé crée notification destinataire.  
11\. utilisateur ne lit que ses messages.  
12\. utilisateur ne lit que ses notifications.  
13\. marquer notification lue produit NOTIFICATION\_READ.  
14\. archiver annonce ne supprime pas les données.  
15\. aucune fonctionnalité de réseau social n’est ajoutée.

Livrables attendus :  
\- Communication Core minimal fonctionnel.  
\- Endpoints REST v1.  
\- DTOs validés.  
\- Events constants.  
\- Intégration Permission Engine.  
\- Intégration Audit & Event Engine.  
\- Tests Communication.  
\- Documentation courte dans docs/communication-core.md.

Ne développe pas :  
\- Feed social.  
\- Likes.  
\- Commentaires publics.  
\- Algorithme de recommandation.  
\- Marketplace.  
\- Wallet.  
\- TV.  
\- IA avancée.

Rappel :  
Communication Core MVP sert à coordonner, pas à divertir.  
Il doit rester sobre, gouverné et traçable.

# **Prompt opérationnel n°10 — Frontend MVP**

Construis l’interface web MVP du GAMAD HUB CORE dans apps/web.

Contexte :  
Le dépôt gamad-hub-core existe.  
Le backend CORE est structuré avec :  
\- Identity Core  
\- Permission Engine  
\- Organization Core  
\- Audit & Event Engine  
\- Knowledge Core  
\- Activity Core  
\- Communication Core minimal

Objectif :  
Créer une interface web sobre, institutionnelle et mobile-first pour exploiter le CORE MVP.

Attention :  
Le frontend ne doit jamais porter la logique métier critique.  
Il consomme les APIs.  
Le backend reste la source de vérité.

Contraintes non négociables :  
1\. Le frontend ne décide jamais des permissions réelles.  
2\. Le frontend affiche uniquement ce que les APIs autorisent.  
3\. Aucune logique métier critique dans l’interface.  
4\. Pas de wallet.  
5\. Pas de marketplace.  
6\. Pas de réseau social.  
7\. Pas de TV.  
8\. Pas d’IA avancée.  
9\. UX sobre, claire, institutionnelle.  
10\. Mobile-first.  
11\. Les erreurs API doivent être affichées clairement.  
12\. Ne pas bypasser les API.

Stack :  
\- Next.js  
\- TypeScript  
\- composants réutilisables  
\- API client centralisé

Écrans obligatoires :

1\. Login  
Route :  
/login

Fonctions :  
\- email  
\- password  
\- submit login  
\- stockage sécurisé token selon choix projet  
\- redirection dashboard après succès  
\- affichage erreur LOGIN\_FAILED

2\. Dashboard  
Route :  
/dashboard

Afficher :  
\- identité connectée  
\- statut GAMAD ID  
\- structure principale  
\- activités en cours  
\- tâches assignées  
\- documents récents  
\- validations en attente  
\- notifications récentes

3\. Membres  
Route :  
/members

Fonctions :  
\- liste membres  
\- filtre statut  
\- recherche simple  
\- détail membre  
\- création GAMAD ID si API disponible et permission autorisée  
\- validation membre si autorisée  
\- suspension membre si autorisée

4\. Organisation  
Route :  
/organization

Fonctions :  
\- liste unités  
\- vue hiérarchique simple  
\- création unité  
\- création Zumara  
\- affectation membre  
\- affectation responsable  
\- archivage unité

5\. Documents  
Route :  
/documents

Fonctions :  
\- liste documents  
\- filtres classification/statut/type  
\- création document  
\- ajout version  
\- soumission  
\- validation  
\- rejet  
\- export contrôlé  
\- archivage

6\. Activités  
Route :  
/activities

Fonctions :  
\- liste activités  
\- filtres statut/priorité/unité  
\- création activité  
\- soumission  
\- validation  
\- rejet  
\- démarrage  
\- complétion  
\- archivage  
\- tâches liées

7\. Audit  
Route :  
/audit

Fonctions :  
\- liste audit events  
\- filtres actor/action/target/date  
\- pagination  
\- export audit si autorisé

8\. Notifications  
Composant global :  
\- liste notifications récentes  
\- marquer comme lu

Structure attendue :

apps/web/  
├── app/  
│   ├── login/  
│   │   └── page.tsx  
│   ├── dashboard/  
│   │   └── page.tsx  
│   ├── members/  
│   │   ├── page.tsx  
│   │   └── \[id\]/page.tsx  
│   ├── organization/  
│   │   └── page.tsx  
│   ├── documents/  
│   │   ├── page.tsx  
│   │   └── \[id\]/page.tsx  
│   ├── activities/  
│   │   ├── page.tsx  
│   │   └── \[id\]/page.tsx  
│   └── audit/  
│       └── page.tsx  
│  
├── components/  
│   ├── layout/  
│   │   ├── app-shell.tsx  
│   │   ├── sidebar.tsx  
│   │   └── topbar.tsx  
│   ├── ui/  
│   │   ├── button.tsx  
│   │   ├── input.tsx  
│   │   ├── modal.tsx  
│   │   ├── table.tsx  
│   │   ├── badge.tsx  
│   │   └── alert.tsx  
│   ├── forms/  
│   └── domain/  
│       ├── member-card.tsx  
│       ├── organization-tree.tsx  
│       ├── document-table.tsx  
│       ├── activity-table.tsx  
│       └── audit-table.tsx  
│  
├── lib/  
│   ├── api-client.ts  
│   ├── auth.ts  
│   ├── routes.ts  
│   ├── errors.ts  
│   └── formatters.ts  
│  
└── types/

API client :  
Créer un client centralisé qui :  
\- ajoute Authorization Bearer token ;  
\- gère erreurs standard ;  
\- gère pagination ;  
\- expose fonctions par domaine :  
 \- identityApi  
 \- organizationApi  
 \- documentsApi  
 \- activitiesApi  
 \- auditApi  
 \- communicationApi

Règles UX :  
\- interface claire ;  
\- tableaux lisibles ;  
\- badges de statut ;  
\- confirmations avant actions critiques ;  
\- messages d’erreur explicites ;  
\- loader simple ;  
\- pas d’animations lourdes ;  
\- pas de design tape-à-l’œil.

Design :  
\- institutionnel ;  
\- sobre ;  
\- confiance ;  
\- hiérarchie claire ;  
\- responsive mobile-first.

Composants obligatoires :  
\- AppShell  
\- Sidebar  
\- Topbar  
\- DataTable  
\- StatusBadge  
\- ConfirmDialog  
\- ApiErrorAlert  
\- EmptyState  
\- LoadingState

Sécurité frontend :  
\- protéger routes privées.  
\- rediriger vers /login si non connecté.  
\- ne pas afficher les actions si API/permission ne les autorise pas.  
\- mais ne jamais considérer cela comme une sécurité suffisante.

Tests minimaux :  
1\. login affiche erreur si échec.  
2\. dashboard charge données utilisateur.  
3\. route privée redirige sans token.  
4\. documents list affiche classification.  
5\. activities list affiche statuts.  
6\. audit page affiche logs paginés.  
7\. action critique demande confirmation.  
8\. erreur PERMISSION\_DENIED affichée clairement.

Livrables attendus :  
\- interface MVP fonctionnelle.  
\- routes principales.  
\- composants réutilisables.  
\- API client centralisé.  
\- gestion erreurs standard.  
\- documentation courte dans docs/frontend-mvp.md.

Ne développe pas :  
\- feed social.  
\- système de likes.  
\- commentaires publics.  
\- wallet.  
\- marketplace.  
\- TV.  
\- IA avancée.  
\- gamification.

Rappel :  
Le Frontend MVP est une console de gouvernance et de coordination.  
Il ne doit pas redéfinir l’architecture.

# **Prompt opérationnel n°11 — Tests & QA**

Établis et implémente le plan de tests du GAMAD HUB CORE MVP.

Contexte :  
Le dépôt gamad-hub-core existe.  
Les modules suivants sont en place :  
\- Identity Core  
\- Permission Engine  
\- Organization Core  
\- Audit & Event Engine  
\- Knowledge Core  
\- Activity Core  
\- Communication Core minimal  
\- Frontend MVP

Objectif :  
Vérifier que le MVP respecte les contrats fondateurs :  
\- Data Model v0.1  
\- Permission Model v0.1  
\- Event Model v0.1  
\- API Contracts v0.1  
\- MVP Scope v0.1  
\- Build Spec v0.1

Contraintes non négociables :  
1\. Aucune route critique sans permission.  
2\. Aucune action critique sans audit.  
3\. Aucune action métier importante sans event.  
4\. Aucun utilisateur SUSPENDED ou BANNED ne peut agir.  
5\. Aucun document stratégique ne peut être exporté sans audit.  
6\. Aucun rôle révoqué ne doit donner accès.  
7\. Le frontend ne doit jamais contourner le backend.  
8\. Les tests doivent couvrir les workflows principaux.  
9\. Ne pas ajouter de nouvelles fonctionnalités hors MVP.

Types de tests obligatoires :

1\. Tests unitaires  
\- services  
\- policies  
\- guards  
\- validators  
\- transitions d’état

2\. Tests d’intégration  
\- endpoints API  
\- base de données  
\- permissions  
\- audit  
\- events

3\. Tests e2e minimaux  
\- login  
\- création membre  
\- création unité  
\- création document  
\- validation activité  
\- consultation audit

4\. Tests sécurité minimum  
\- accès sans token  
\- token invalide  
\- permission absente  
\- rôle révoqué  
\- statut suspendu  
\- export non autorisé

Suites de tests à créer :

api/core/tests/  
├── identity.e2e-spec.ts  
├── permissions.e2e-spec.ts  
├── organization.e2e-spec.ts  
├── knowledge.e2e-spec.ts  
├── activity.e2e-spec.ts  
├── communication.e2e-spec.ts  
├── audit.e2e-spec.ts  
└── security.e2e-spec.ts

apps/web/tests/  
├── login.spec.ts  
├── dashboard.spec.ts  
├── documents.spec.ts  
├── activities.spec.ts  
└── audit.spec.ts

Tests Identity obligatoires :  
1\. création GAMAD ID réussie.  
2\. publicCode unique.  
3\. email unique.  
4\. password hashé.  
5\. login réussi.  
6\. login failed produit LOGIN\_FAILED \+ AUDIT\_EVENT.  
7\. membre PENDING ne peut pas accéder aux actions sensibles.  
8\. membre VALIDATED devient ACTIVE.  
9\. membre SUSPENDED ne peut pas agir.

Tests Permission obligatoires :  
1\. Super Admin possède toutes les permissions.  
2\. Active Member sans permission est refusé.  
3\. rôle révoqué ne donne plus accès.  
4\. permission contextuelle fonctionne dans bonne unité.  
5\. permission contextuelle échoue hors unité.  
6\. BANNED est toujours refusé.  
7\. SUSPENDED est toujours refusé.  
8\. PERMISSION\_DENIED format standard.

Tests Organization obligatoires :  
1\. créer unité avec permission.  
2\. refuser création sans permission.  
3\. refuser parent inexistant.  
4\. empêcher cycle hiérarchique.  
5\. créer Zumara crée OrganizationUnit \+ Zumara.  
6\. affecter membre actif.  
7\. refuser membre suspended/banned.  
8\. archiver unité sans suppression destructive.  
9\. affecter responsable crée MemberRole.  
10\. actions critiques produisent audit \+ event.

Tests Knowledge obligatoires :  
1\. créer document.  
2\. ajouter version avec checksum.  
3\. refuser version sans checksum.  
4\. valider document avec version.  
5\. refuser validation sans permission.  
6\. refuser validation sans version.  
7\. document VALIDATED non modifiable directement.  
8\. export STRATEGIC exige audit.  
9\. export sans permission refusé.  
10\. archivage non destructif.

Tests Activity obligatoires :  
1\. créer activité liée à organizationUnit.  
2\. refuser activité sur unité ARCHIVED.  
3\. DRAFT → SUBMITTED.  
4\. refuser DRAFT → IN\_PROGRESS.  
5\. SUBMITTED → VALIDATED.  
6\. VALIDATED → IN\_PROGRESS.  
7\. IN\_PROGRESS → COMPLETED.  
8\. COMPLETED → ARCHIVED.  
9\. refuser modification ARCHIVED.  
10\. tâche créée sur activité valide.  
11\. assignedTo suspended/banned refusé.  
12\. action critique produit audit \+ event.

Tests Communication obligatoires :  
1\. créer annonce avec permission.  
2\. refuser annonce vide.  
3\. publier annonce produit event \+ audit.  
4\. envoyer message à membre ACTIVE.  
5\. refuser message vers membre suspended/banned.  
6\. notification créée.  
7\. utilisateur ne lit que ses notifications.  
8\. aucune fonctionnalité sociale hors MVP ajoutée.

Tests Audit/Event obligatoires :  
1\. writeAudit crée AUDIT\_EVENT.  
2\. audit ne stocke pas password/token/secret.  
3\. audit list exige audit.read.  
4\. audit export exige audit.export.  
5\. export produit AUDIT\_EXPORTED.  
6\. pas d’endpoint update/delete audit.  
7\. correlationId conservé.  
8\. causationId conservé.

Tests Frontend obligatoires :  
1\. /login affiche erreur en cas d’échec.  
2\. route privée redirige sans token.  
3\. dashboard affiche identité.  
4\. documents affiche classification/statut.  
5\. activities affiche statut/priorité.  
6\. audit affiche pagination.  
7\. action critique demande confirmation.  
8\. PERMISSION\_DENIED affiché clairement.

Qualité attendue :  
\- tests reproductibles ;  
\- base de test isolée ;  
\- seed test contrôlé ;  
\- nettoyage après tests ;  
\- commandes documentées.

Commandes attendues :  
\- npm run test  
\- npm run test:e2e  
\- npm run test:coverage  
\- npm run lint  
\- npm run build

CI attendue :  
Le workflow CI doit exécuter :  
1\. install  
2\. lint  
3\. prisma validate  
4\. prisma generate  
5\. tests unitaires  
6\. tests e2e  
7\. build API  
8\. build Web

Critères de validation :  
Le MVP ne peut pas être considéré prêt si :  
\- une route critique n’a pas de test permission ;  
\- une action critique n’a pas d’audit ;  
\- un event critique manque ;  
\- une transition d’état interdite passe ;  
\- une exportation stratégique n’est pas auditée.

Livrables attendus :  
\- suites de tests API.  
\- suites de tests frontend.  
\- configuration base test.  
\- CI mise à jour.  
\- rapport QA dans docs/qa/mvp-test-report.md.  
\- documentation des commandes de test.

Ne développe pas :  
\- nouvelles fonctionnalités.  
\- wallet.  
\- marketplace.  
\- TV.  
\- IA avancée.  
\- réseau social.  
\- gamification.

Rappel :  
Les tests ne sont pas une formalité.  
Ils sont le mécanisme qui protège la doctrine du GAMAD HUB contre la dérive d’implémentation.

# **Prompt opérationnel n°12 — Docker & Déploiement VPS**

Prépare le déploiement Docker du GAMAD HUB CORE MVP sur VPS Ubuntu.

Contexte :  
Le dépôt gamad-hub-core existe.  
Les modules CORE sont développés.  
Les tests et QA sont en place.  
Tu dois maintenant préparer un déploiement propre, reproductible et documenté.

Objectif :  
Permettre de déployer le MVP sur un VPS Ubuntu avec :  
\- API NestJS ;  
\- Web Next.js ;  
\- PostgreSQL ;  
\- Nginx reverse proxy ;  
\- volumes persistants ;  
\- migrations Prisma ;  
\- sauvegardes ;  
\- restauration ;  
\- logs ;  
\- HTTPS préparé.

Contraintes non négociables :  
1\. Aucun secret dans Git.  
2\. Utiliser .env.example comme modèle uniquement.  
3\. Séparer dev, staging et prod.  
4\. Les données PostgreSQL doivent être persistantes.  
5\. Les fichiers uploadés doivent être persistants.  
6\. Les backups doivent être automatisables.  
7\. La restauration doit être documentée.  
8\. Le déploiement doit être reproductible.  
9\. Pas de Kubernetes dans le MVP.  
10\. Pas de microservices avancés.  
11\. Pas de wallet, marketplace, TV ou IA avancée.

Structure attendue :

docker/  
├── Dockerfile.api  
├── Dockerfile.web  
└── docker-compose.yml

infra/  
├── nginx/  
│   └── gamad-hub.conf  
├── backups/  
│   ├── backup-policy.md  
│   └── restore-policy.md  
└── deploy/  
   ├── deploy-staging.sh  
   └── deploy-prod.sh

scripts/  
├── setup.sh  
├── migrate.sh  
├── seed.sh  
├── backup.sh  
└── restore.sh  
---

## **1\. Dockerfile API**

Créer docker/Dockerfile.api pour api/core.

Contraintes :  
\- build propre ;  
\- installer dépendances ;  
\- générer Prisma client ;  
\- compiler NestJS ;  
\- exposer API\_PORT ;  
\- exécuter l’API en mode production ;  
\- ne pas inclure secrets.  
---

## **2\. Dockerfile Web**

Créer docker/Dockerfile.web pour apps/web.

Contraintes :  
\- build Next.js ;  
\- variables publiques uniquement côté web ;  
\- exposer WEB\_PORT ;  
\- exécuter en production ;  
\- ne pas inclure secrets.  
---

## **3\. Docker Compose**

Créer docker/docker-compose.yml avec services :

\- postgres  
\- api  
\- web  
\- nginx

Volumes :  
\- postgres\_data  
\- uploads\_data  
\- backups\_data

Réseaux :  
\- gamad\_internal

Contraintes :  
\- api dépend de postgres ;  
\- web dépend de api ;  
\- nginx expose 80 et prépare 443 ;  
\- postgres non exposé publiquement ;  
\- variables via .env ;  
\- healthchecks si possible.  
---

## **4\. Variables d’environnement**

Créer ou compléter `.env.example` :

APP\_ENV=production

DATABASE\_URL=postgresql://gamad\_user:change\_me@postgres:5432/gamad\_hub

POSTGRES\_DB=gamad\_hub  
POSTGRES\_USER=gamad\_user  
POSTGRES\_PASSWORD=change\_me

JWT\_SECRET=change\_me  
JWT\_EXPIRES\_IN=1d

API\_PORT=4000  
WEB\_PORT=3000

NEXT\_PUBLIC\_API\_URL=https://your-domain.com/api

STORAGE\_DRIVER=local  
STORAGE\_PATH=/app/storage

ADMIN\_EMAIL=admin@example.com  
ADMIN\_PASSWORD=change\_me  
ADMIN\_DISPLAY\_NAME=Super Admin GAMAD

BACKUP\_RETENTION\_DAYS=14

Règle :

.env réel jamais commité.  
---

## **5\. Nginx**

Créer `infra/nginx/gamad-hub.conf`.

Objectifs :

* reverse proxy vers web ;  
* proxy `/api` vers API ;  
* préparer HTTPS ;  
* headers sécurité minimaux ;  
* limite taille upload raisonnable.

Exemple logique :

* `/` → web:3000  
* `/api` → api:4000

\---

\#\# 6\. Scripts

\#\#\# setup.sh

\`\`\`text  
Prépare le serveur :  
\- vérifier Docker ;  
\- vérifier Docker Compose ;  
\- créer dossiers nécessaires ;  
\- vérifier .env ;  
\- afficher erreurs claires.

### **migrate.sh**

Exécute :  
\- prisma migrate deploy  
\- prisma generate si nécessaire

### **seed.sh**

Exécute le seed initial uniquement si variables admin présentes.

### **backup.sh**

Sauvegarde :  
\- base PostgreSQL ;  
\- uploads ;  
\- fichiers config utiles ;  
\- timestamp ;  
\- compression ;  
\- rotation selon BACKUP\_RETENTION\_DAYS.

### **restore.sh**

Restaure :  
\- base PostgreSQL ;  
\- uploads ;  
\- avec confirmation explicite ;  
\- documentation du risque.  
---

## **7\. CI/CD GitHub Actions**

Créer ou compléter :

.github/workflows/ci.yml  
.github/workflows/deploy-staging.yml

### **ci.yml doit exécuter :**

install  
lint  
prisma validate  
prisma generate  
test  
test:e2e  
build api  
build web

### **deploy-staging.yml doit :**

\- se déclencher manuellement ou sur branche staging/release  
\- se connecter au VPS via SSH  
\- pull latest  
\- docker compose build  
\- docker compose up \-d  
\- exécuter migrations  
\- vérifier santé services

⚠️ Les secrets doivent rester dans GitHub Secrets.

---

## **8\. Healthchecks**

Prévoir endpoints :

GET /api/v1/system/health

Réponse :

{  
 "success": true,  
 "data": {  
   "status": "ok",  
   "database": "ok",  
   "timestamp": "..."  
 }  
}

Nginx / Docker doivent pouvoir vérifier la santé du système.

---

## **9\. Logs**

Prévoir :

docker compose logs api  
docker compose logs web  
docker compose logs nginx  
docker compose logs postgres

Documentation obligatoire dans :

docs/deployment/logging.md  
---

## **10\. Documentation déploiement**

Créer :

docs/deployment/vps-deployment.md  
docs/deployment/backup-restore.md  
docs/deployment/environment-variables.md

Doit expliquer :

* prérequis VPS Ubuntu ;  
* installation Docker ;  
* configuration .env ;  
* lancement ;  
* migration ;  
* seed ;  
* logs ;  
* backup ;  
* restore ;  
* rollback ;  
* HTTPS avec Certbot ou reverse proxy externe.

---

## **11\. Sécurité minimale déploiement**

Inclure recommandations :

\- fermer PostgreSQL au public ;  
\- utiliser firewall ;  
\- secrets forts ;  
\- HTTPS obligatoire en production ;  
\- backups hors serveur si possible ;  
\- accès SSH sécurisé ;  
\- rotation secrets ;  
\- monitoring minimum.  
---

## **12\. Tests de déploiement**

Prévoir checklist :

1\. docker compose up \-d fonctionne.  
2\. API health répond.  
3\. Web répond.  
4\. Login admin fonctionne.  
5\. Migration exécutée.  
6\. Seed exécuté.  
7\. Upload test fonctionne.  
8\. Backup créé.  
9\. Restore testé sur environnement non-prod.  
10\. Logs consultables.  
---

## **13\. Livrables attendus**

\- Dockerfile.api  
\- Dockerfile.web  
\- docker-compose.yml  
\- nginx config  
\- scripts setup/migrate/seed/backup/restore  
\- workflows CI/CD  
\- docs déploiement  
\- healthcheck system  
\- checklist validation déploiement  
---

## **14\. Interdictions**

Ne pas ajouter :

Kubernetes  
microservices avancés  
blockchain  
wallet  
marketplace  
TV  
IA avancée  
réseau social  
---

## **15\. Rappel final**

Le déploiement MVP doit être :

simple,  
reproductible,  
sécurisé,  
documenté,  
restaurable.

Pas sophistiqué inutilement.

Suite logique :

\`\`\`text  
Prompt opérationnel n°13 — Documentation finale MVP

# **Prompt opérationnel n°13 — Documentation finale MVP**

Rédige la documentation technique finale du GAMAD HUB CORE MVP.

Contexte :  
Le dépôt gamad-hub-core existe.  
Le backend, le frontend, les tests, Docker et le déploiement VPS sont préparés.  
Tu dois maintenant produire une documentation complète, claire et transmissible.

Objectif :  
Permettre à un nouveau développeur ou administrateur technique de comprendre, installer, tester, déployer, maintenir et reprendre le projet sans dépendre de l’auteur initial.

Contraintes non négociables :  
1\. La documentation doit être en Markdown.  
2\. Elle doit être placée dans /docs.  
3\. Elle doit respecter la doctrine GAMAD HUB.  
4\. Elle doit séparer vision, conception et implémentation.  
5\. Elle doit documenter les limites du MVP.  
6\. Elle ne doit pas prétendre que wallet, marketplace, TV, IA avancée ou blockchain existent dans le MVP.  
7\. Elle doit indiquer clairement les modules exclus.  
8\. Elle doit être utilisable hors contexte de discussion.  
9\. Elle doit être concise mais complète.  
10\. Elle doit être versionnée.

Structure documentaire attendue :

docs/  
├── README.md  
├── 00-constitution/  
│   └── constitution-technique-gamad-hub.md  
├── 01-core-specification/  
│   └── gamad-hub-core-specification-v0.1.md  
├── 02-reference-architecture/  
│   └── gamad-hub-reference-architecture-v0.1.md  
├── 03-data-model/  
│   ├── gamad-hub-data-model-v0.1.md  
│   └── prisma-implementation-notes.md  
├── 04-permission-model/  
│   ├── gamad-hub-permission-model-v0.1.md  
│   └── permission-engine-implementation.md  
├── 05-event-model/  
│   ├── gamad-hub-event-model-v0.1.md  
│   └── audit-event-engine-implementation.md  
├── 06-api-contracts/  
│   └── gamad-hub-api-contracts-v0.1.md  
├── 07-mvp-scope/  
│   └── gamad-hub-mvp-scope-v0.1.md  
├── 08-build-spec/  
│   └── gamad-hub-build-spec-v0.1.md  
├── 09-implementation-strategy/  
│   └── gamad-hub-implementation-strategy-v0.1.md  
├── 10-tech-stack-decision/  
│   └── gamad-hub-tech-stack-decision-v0.1.md  
├── 11-repository-blueprint/  
│   └── gamad-hub-repository-blueprint-v0.1.md  
├── api/  
│   ├── identity-api.md  
│   ├── organization-api.md  
│   ├── knowledge-api.md  
│   ├── activity-api.md  
│   ├── communication-api.md  
│   └── audit-api.md  
├── deployment/  
│   ├── vps-deployment.md  
│   ├── backup-restore.md  
│   ├── environment-variables.md  
│   └── logging.md  
├── qa/  
│   └── mvp-test-report.md  
└── roadmap/  
   ├── future-roadmap.md  
   └── excluded-from-mvp.md  
---

## **1\. docs/README.md**

Inclure :

* présentation courte du GAMAD HUB CORE ;  
* but du MVP ;  
* modules inclus ;  
* modules exclus ;  
* architecture générale ;  
* liens vers les documents principaux ;  
* avertissement : le MVP est un noyau, pas la super-app finale.

---

## **2\. Documentation d’installation locale**

Créer une section claire :

Prérequis :  
\- Node.js  
\- npm ou pnpm  
\- Docker  
\- PostgreSQL via Docker  
\- Git

Inclure les commandes :

git clone \<repo\>  
cd gamad-hub-core  
cp .env.example .env  
docker compose up \-d postgres  
npm install  
npm run prisma:generate  
npm run prisma:migrate  
npm run prisma:seed  
npm run dev

Adapter les commandes aux scripts réellement disponibles.

---

## **3\. Documentation architecture**

Inclure :

* monolithe modulaire organisé ;  
* séparation frontend/backend ;  
* modules backend ;  
* API Gateway logique ;  
* PostgreSQL ;  
* Prisma ;  
* Audit/Event Engine ;  
* Docker.

Diagramme texte attendu :

Web App  
 ↓  
API Core  
 ↓  
Modules  
 ├── Identity  
 ├── Permissions  
 ├── Organization  
 ├── Knowledge  
 ├── Activity  
 ├── Communication  
 └── Audit  
 ↓  
PostgreSQL \+ Storage  
---

## **4\. Documentation API**

Pour chaque domaine API, documenter :

Endpoint  
Méthode  
Permission  
Entrée  
Sortie  
Erreurs  
Events  
Audit

Domaines obligatoires :

* Identity  
* Organization  
* Knowledge  
* Activity  
* Communication  
* Audit

---

## **5\. Documentation permissions**

Inclure :

* principe RBAC \+ contexte organisationnel ;  
* statuts bloquants ;  
* rôle global vs rôle unité ;  
* permission format module.action ;  
* exemple d’accès refusé ;  
* exemple d’accès autorisé.

---

## **6\. Documentation événements et audit**

Inclure :

* différence EVENT / AUDIT\_EVENT ;  
* événements critiques ;  
* correlation\_id ;  
* causation\_id ;  
* append-only ;  
* payload sans secrets ;  
* export audit contrôlé.

---

## **7\. Documentation base de données**

Inclure :

* principales entités ;  
* relations critiques ;  
* contraintes ;  
* seed initial ;  
* migrations ;  
* règles de non-suppression destructive.

---

## **8\. Documentation déploiement VPS**

Inclure :

* prérequis VPS Ubuntu ;  
* installation Docker ;  
* configuration .env ;  
* lancement Docker Compose ;  
* migrations ;  
* seed ;  
* reverse proxy Nginx ;  
* HTTPS ;  
* logs ;  
* backup ;  
* restore ;  
* rollback.

---

## **9\. Documentation tests QA**

Inclure :

* commandes de test ;  
* types de tests ;  
* couverture attendue ;  
* checklist MVP ;  
* critères bloquants.

Critères bloquants :

\- route critique sans permission  
\- action critique sans audit  
\- event critique manquant  
\- export stratégique non audité  
\- transition d’état interdite acceptée  
---

## **10\. Documentation limites MVP**

Créer :

docs/roadmap/excluded-from-mvp.md

Inclure explicitement :

Exclus du MVP :  
\- ZAHAB Wallet  
\- Marketplace  
\- GAMAD TV  
\- GAMADTUBE  
\- IA avancée  
\- Blockchain  
\- Public Ads  
\- Réseau social complet  
\- Gamification massive

Expliquer :

Ces modules sont exclus volontairement afin de stabiliser le noyau Identity \+ Governance \+ Knowledge \+ Activity \+ Audit.  
---

## **11\. Future Roadmap**

Créer :

docs/roadmap/future-roadmap.md

Organiser :

Phase 1 : Stabilisation CORE  
Phase 2 : Portail public  
Phase 3 : Services économiques  
Phase 4 : Intelligence augmentée  
Phase 5 : Infrastructure souveraine distribuée

Ne pas implémenter ces modules.

---

## **12\. Documentation exploitation**

Inclure :

* comment créer un admin ;  
* comment lancer migrations ;  
* comment sauvegarder ;  
* comment restaurer ;  
* comment consulter logs ;  
* comment vérifier healthcheck ;  
* comment désactiver un compte ;  
* comment exporter audit.

---

## **13\. README racine**

Mettre à jour README.md racine avec :

* description projet ;  
* stack ;  
* démarrage rapide ;  
* commandes ;  
* structure dépôt ;  
* liens docs ;  
* avertissement MVP.

---

## **14\. CHANGELOG**

Mettre à jour CHANGELOG.md :

\#\# v0.1.0-alpha  
\- Bootstrap repository  
\- Prisma Data Model  
\- Identity Core  
\- Permission Engine  
\- Organization Core  
\- Audit & Event Engine  
\- Knowledge Core  
\- Activity Core  
\- Communication Core minimal  
\- Frontend MVP  
\- Docker VPS deployment  
\- QA plan  
---

## **15\. Qualité attendue**

La documentation doit être :

* claire ;  
* structurée ;  
* maintenable ;  
* utile pour reprise ;  
* sans promesse excessive ;  
* alignée avec la Constitution Technique.

---

## **16\. Livrables attendus**

\- docs complètes en Markdown  
\- README racine mis à jour  
\- CHANGELOG mis à jour  
\- roadmap future  
\- exclusions MVP documentées  
\- guide déploiement  
\- guide backup/restore  
\- guide QA  
---

## **17\. Interdictions**

Ne pas :

* ajouter de nouvelles fonctionnalités ;  
* modifier l’architecture ;  
* choisir une nouvelle stack ;  
* prétendre que le MVP est la plateforme finale ;  
* mélanger documentation et marketing.

---

## **18\. Rappel final**

Cette documentation doit permettre au projet GAMAD HUB CORE de survivre :

au changement de développeur,  
au changement d’outil,  
au changement d’IA,  
au changement d’infrastructure.

Elle est une pièce de continuité stratégique.

Suite logique :

\`\`\`text  
Prompt opérationnel n°14 — Release Alpha Checklist  
