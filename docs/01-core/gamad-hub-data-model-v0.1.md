# **📘 GAMAD HUB DATA MODEL v0.1**

## **Modèle de données fondateur du noyau GAMAD HUB**

---

# **0\. Objectif**

Ce document définit les entités fondamentales du **GAMAD HUB CORE**.

Il ne décrit pas encore les écrans.  
 Il décrit :

ce que le système doit connaître,  
relier,  
protéger,  
historiser  
et transmettre.  
---

# **1\. Principe fondamental**

Le modèle de données doit être construit autour de :

GAMAD ID

Toute entité importante doit pouvoir être reliée :

* à une identité ;  
* à une structure ;  
* à une action ;  
* à un document ;  
* à une trace d’audit.

---

# **2\. Entités principales**

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

# **3\. Domaine Identity**

## **3.1 GAMAD\_ID**

Représente l’identité numérique officielle.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant interne |
| public\_code | string | identifiant visible |
| identity\_type | enum | person / organization / system |
| status | enum | pending / active / limited / suspended / archived / banned |
| created\_at | datetime | création |
| updated\_at | datetime | mise à jour |

### **Contraintes**

* `id` est immutable.  
* `public_code` est unique.  
* Un GAMAD ID supprimé ne doit jamais être réattribué.

---

## **3.2 ACCOUNT**

Représente l’accès technique au système.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant compte |
| gamad\_id | UUID | lien GAMAD\_ID |
| email | string | connexion |
| phone | string | contact |
| password\_hash | string | sécurité |
| mfa\_enabled | boolean | double authentification |
| last\_login\_at | datetime | dernière connexion |
| status | enum | active / locked / disabled |
| created\_at | datetime | création |

### **Contraintes**

* Un compte appartient à un GAMAD ID.  
* Un email actif doit être unique.  
* Le mot de passe brut ne doit jamais être stocké.

---

## **3.3 PROFILE**

Représente les informations visibles ou administratives.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant profil |
| gamad\_id | UUID | lien identité |
| first\_name | string | prénom |
| last\_name | string | nom |
| display\_name | string | nom affiché |
| avatar\_url | string | photo |
| bio | text | présentation |
| birth\_date | date | optionnel |
| country | string | pays |
| city | string | ville |
| visibility | enum | public / internal / private |
| created\_at | datetime | création |
| updated\_at | datetime | modification |

### **Contraintes**

* Le profil peut changer.  
* Le GAMAD ID reste stable.

---

# **4\. Domaine Permissions**

## **4.1 ROLE**

Représente une fonction ou responsabilité.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant rôle |
| name | string | nom du rôle |
| scope | enum | global / unit / module |
| description | text | explication |
| is\_system\_role | boolean | rôle système |
| created\_at | datetime | création |

Exemples :

* Super Administrateur  
* Responsable Département  
* Responsable Zumara  
* Membre Actif  
* Archiviste  
* Validateur

---

## **4.2 PERMISSION**

Représente un droit explicite.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant permission |
| code | string | permission lisible |
| module | string | domaine concerné |
| action | enum | read / create / update / delete / validate / manage / export |
| description | text | explication |

Exemples :

identity.read  
organization.manage  
document.validate  
activity.create  
audit.read  
---

## **4.3 ROLE\_PERMISSION**

Relie rôles et permissions.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| role\_id | UUID | rôle |
| permission\_id | UUID | permission |

---

## **4.4 MEMBER\_ROLE**

Attribue un rôle à une identité.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant |
| gamad\_id | UUID | identité |
| role\_id | UUID | rôle |
| organization\_unit\_id | UUID | contexte |
| granted\_by | UUID | attribué par |
| granted\_at | datetime | date |
| revoked\_at | datetime | révocation |

### **Contraintes**

* Un rôle peut être global ou limité à une structure.  
* Toute attribution doit être auditée.

---

# **5\. Domaine Organisation**

## **5.1 ORGANIZATION\_UNIT**

Représente toute unité structurelle.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant unité |
| name | string | nom |
| type | enum | hcg / department / coordination / section / zumara |
| parent\_id | UUID | unité parente |
| status | enum | active / inactive / archived |
| description | text | présentation |
| created\_at | datetime | création |
| updated\_at | datetime | modification |

### **Contraintes**

* Une unité peut avoir une unité parente.  
* Une Zumara est une unité organisationnelle spécialisée.  
* Une unité archivée garde son historique.

---

## **5.2 MEMBERSHIP**

Relie une identité à une structure.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant |
| gamad\_id | UUID | identité |
| organization\_unit\_id | UUID | structure |
| membership\_type | enum | member / responsible / assistant / observer |
| status | enum | pending / active / suspended / archived |
| joined\_at | datetime | entrée |
| left\_at | datetime | sortie |

### **Contraintes**

* Une identité peut appartenir à plusieurs structures.  
* Un responsable doit avoir un rôle compatible.

---

## **5.3 ZUMARA**

Spécialisation organisationnelle.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant |
| organization\_unit\_id | UUID | lien unité |
| activity\_domain | string | domaine d’activité |
| mission | text | mission |
| visibility | enum | public / internal / private |
| created\_at | datetime | création |

### **Note**

Une Zumara doit aussi exister comme `ORGANIZATION_UNIT`.

---

# **6\. Domaine Activity**

## **6.1 ACTIVITY**

Représente une initiative, action ou projet.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant activité |
| title | string | titre |
| description | text | détails |
| organization\_unit\_id | UUID | structure porteuse |
| owner\_id | UUID | responsable |
| status | enum | draft / submitted / validated / in\_progress / completed / archived |
| priority | enum | low / normal / high / strategic |
| start\_date | date | début |
| end\_date | date | fin |
| created\_at | datetime | création |
| updated\_at | datetime | modification |

---

## **6.2 TASK**

Représente une tâche liée à une activité.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant tâche |
| activity\_id | UUID | activité |
| title | string | titre |
| description | text | détails |
| assigned\_to | UUID | responsable exécution |
| status | enum | todo / in\_progress / blocked / done / cancelled |
| due\_date | date | échéance |
| created\_at | datetime | création |

---

## **6.3 WORKFLOW**

Représente un processus de validation.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant workflow |
| name | string | nom |
| target\_type | string | activity / document / membership |
| status | enum | active / inactive |
| created\_at | datetime | création |

---

## **6.4 WORKFLOW\_STEP**

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant étape |
| workflow\_id | UUID | workflow |
| step\_order | integer | ordre |
| required\_role\_id | UUID | rôle exigé |
| action\_required | enum | approve / reject / review |
| created\_at | datetime | création |

---

# **7\. Domaine Knowledge**

## **7.1 DOCUMENT**

Représente un document institutionnel ou ressource.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant document |
| title | string | titre |
| document\_type | enum | statute / report / manual / procedure / media / archive / training |
| classification | enum | public / internal / confidential / strategic |
| organization\_unit\_id | UUID | structure concernée |
| owner\_id | UUID | propriétaire |
| status | enum | draft / submitted / validated / archived |
| created\_at | datetime | création |
| updated\_at | datetime | modification |

---

## **7.2 DOCUMENT\_VERSION**

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant version |
| document\_id | UUID | document parent |
| version\_number | string | version |
| file\_url | string | emplacement |
| checksum | string | preuve intégrité |
| created\_by | UUID | auteur |
| created\_at | datetime | date |

### **Contraintes**

* Une version validée ne doit pas être modifiée.  
* Une nouvelle modification crée une nouvelle version.

---

# **8\. Domaine Communication**

## **8.1 MESSAGE**

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant message |
| sender\_id | UUID | expéditeur |
| recipient\_id | UUID | destinataire |
| organization\_unit\_id | UUID | contexte |
| content | text | contenu |
| status | enum | sent / delivered / read / archived |
| created\_at | datetime | date |

---

## **8.2 ANNOUNCEMENT**

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant annonce |
| title | string | titre |
| content | text | contenu |
| organization\_unit\_id | UUID | structure |
| audience\_scope | enum | public / internal / unit / role |
| published\_by | UUID | auteur |
| published\_at | datetime | publication |

---

## **8.3 NOTIFICATION**

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant notification |
| gamad\_id | UUID | destinataire |
| type | string | type |
| content | text | message |
| read\_at | datetime | lecture |
| created\_at | datetime | création |

---

# **9\. Domaine Audit**

## **9.1 AUDIT\_EVENT**

Entité critique.

| Champ | Type logique | Rôle |
| ----- | ----- | ----- |
| id | UUID | identifiant audit |
| actor\_id | UUID | auteur |
| action | string | action |
| target\_type | string | type cible |
| target\_id | UUID | cible |
| organization\_unit\_id | UUID | contexte |
| old\_value | json | ancienne valeur |
| new\_value | json | nouvelle valeur |
| ip\_address | string | source |
| user\_agent | string | appareil |
| created\_at | datetime | date |

### **Contraintes**

* Les événements critiques sont append-only.  
* Les logs ne doivent pas être modifiés silencieusement.

---

# **10\. Relations globales**

GAMAD\_ID  
├── ACCOUNT  
├── PROFILE  
├── MEMBER\_ROLE  
├── MEMBERSHIP  
├── ACTIVITY.owner\_id  
├── TASK.assigned\_to  
├── DOCUMENT.owner\_id  
├── MESSAGE.sender\_id  
└── AUDIT\_EVENT.actor\_id  
ORGANIZATION\_UNIT  
├── parent\_id  
├── MEMBERSHIP  
├── ACTIVITY  
├── DOCUMENT  
├── ANNOUNCEMENT  
└── AUDIT\_EVENT  
---

# **11\. Contraintes non négociables**

## **11.1 Identité**

* Aucun utilisateur sans GAMAD ID.  
* Aucun GAMAD ID réattribué.  
* Aucun module ne crée sa propre identité.

---

## **11.2 Permissions**

* Aucun accès critique sans permission explicite.  
* Toute attribution de rôle est auditée.

---

## **11.3 Documents**

* Aucun document stratégique sans version.  
* Toute validation documentaire est historisée.

---

## **11.4 Audit**

* Toute action critique produit un AUDIT\_EVENT.  
* Les logs critiques sont append-only.

---

# **12\. États standards**

## **Compte**

active  
locked  
disabled

## **Identité**

pending  
active  
limited  
suspended  
archived  
banned

## **Document**

draft  
submitted  
validated  
archived

## **Activité**

draft  
submitted  
validated  
in\_progress  
completed  
archived  
---

# **13\. Avertissement stratégique**

⚠️ Le modèle de données est plus important que l’interface.

Une belle interface sur un mauvais modèle produira :

* incohérence ;  
* duplication ;  
* dette technique ;  
* permissions cassées ;  
* mémoire fragmentée.

---

# **14\. Conclusion**

Le **GAMAD HUB DATA MODEL v0.1** établit le premier squelette informationnel du système.

