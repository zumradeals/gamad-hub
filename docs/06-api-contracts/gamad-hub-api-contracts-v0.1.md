# **📘 GAMAD HUB API CONTRACTS v0.1**

## **Endpoints, entrées, sorties, erreurs, permissions et événements produits**

---

# **0\. Objectif**

Ce document définit les contrats API minimaux du **GAMAD HUB CORE**.

Une API n’est pas seulement une route technique.  
 C’est un **contrat explicite** entre les modules.

Une API mal définie crée une dette invisible.  
---

# **1\. Principe fondamental**

Toute API doit préciser :

| Élément | Obligatoire |
| ----- | ----- |
| endpoint | oui |
| méthode | oui |
| permission requise | oui |
| entrée | oui |
| sortie | oui |
| erreurs | oui |
| événement produit | oui |
| audit | oui si action critique |

---

# **2\. Convention générale**

## **Format de base**

/api/v1/{domain}/{resource}

Exemples :

/api/v1/identity/gamad-ids  
/api/v1/organization/units  
/api/v1/activities  
/api/v1/documents  
/api/v1/audit/events  
---

# **3\. Standards de réponse**

## **Succès**

{  
 "success": true,  
 "data": {},  
 "meta": {}  
}

## **Erreur**

{  
 "success": false,  
 "error": {  
   "code": "PERMISSION\_DENIED",  
   "message": "Access denied",  
   "details": {}  
 }  
}  
---

# **4\. Codes d’erreur standards**

VALIDATION\_ERROR  
AUTH\_REQUIRED  
PERMISSION\_DENIED  
RESOURCE\_NOT\_FOUND  
CONFLICT  
RATE\_LIMITED  
INTERNAL\_ERROR  
AUDIT\_REQUIRED  
WORKFLOW\_REQUIRED  
---

# **5\. Identity API**

## **5.1 Créer un GAMAD ID**

POST /api/v1/identity/gamad-ids

Permission :

identity.create

Entrée :

{  
 "identity\_type": "person",  
 "email": "user@example.com",  
 "phone": "+2250000000000"  
}

Sortie :

{  
 "gamad\_id": "uuid",  
 "public\_code": "GMD-000001",  
 "status": "pending"  
}

Événements produits :

GAMAD\_ID\_CREATED  
ACCOUNT\_CREATED

Audit :

obligatoire  
---

## **5.2 Lire une identité**

GET /api/v1/identity/gamad-ids/{id}

Permission :

identity.read

Sortie :

{  
 "id": "uuid",  
 "public\_code": "GMD-000001",  
 "identity\_type": "person",  
 "status": "active"  
}  
---

## **5.3 Valider un membre**

POST /api/v1/identity/gamad-ids/{id}/validate

Permission :

identity.validate

Entrée :

{  
 "decision\_note": "Validation approuvée"  
}

Événement :

MEMBER\_VALIDATED

Audit :

obligatoire  
---

## **5.4 Suspendre une identité**

POST /api/v1/identity/gamad-ids/{id}/suspend

Permission :

identity.suspend

Entrée :

{  
 "reason": "Motif obligatoire",  
 "duration\_days": 30  
}

Événement :

MEMBER\_SUSPENDED

Audit :

renforcé  
---

# **6\. Profile API**

## **6.1 Lire profil**

GET /api/v1/profiles/{gamad\_id}

Permission :

profile.read  
---

## **6.2 Modifier son profil**

PATCH /api/v1/profiles/{gamad\_id}

Permission :

profile.update.self

Entrée :

{  
 "display\_name": "Nom affiché",  
 "bio": "Présentation",  
 "city": "Abidjan",  
 "country": "Côte d’Ivoire"  
}

Événement :

PROFILE\_UPDATED

Audit :

standard  
---

# **7\. Organization API**

## **7.1 Créer une unité organisationnelle**

POST /api/v1/organization/units

Permission :

organization.create

Entrée :

{  
 "name": "GAMAD Technologie",  
 "type": "department",  
 "parent\_id": null,  
 "description": "Département Technologie"  
}

Sortie :

{  
 "organization\_unit\_id": "uuid",  
 "status": "active"  
}

Événement :

ORGANIZATION\_UNIT\_CREATED

Audit :

obligatoire  
---

## **7.2 Affecter un membre à une unité**

POST /api/v1/organization/units/{unit\_id}/members

Permission :

organization.assign\_member

Entrée :

{  
 "gamad\_id": "uuid",  
 "membership\_type": "member"  
}

Événement :

MEMBER\_ATTACHED\_TO\_UNIT

Audit :

obligatoire  
---

## **7.3 Archiver une unité**

POST /api/v1/organization/units/{unit\_id}/archive

Permission :

organization.archive

Entrée :

{  
 "reason": "Motif obligatoire"  
}

Événement :

ORGANIZATION\_UNIT\_ARCHIVED

Audit :

renforcé  
---

# **8\. Role & Permission API**

## **8.1 Attribuer un rôle**

POST /api/v1/identity/roles/assign

Permission :

identity.manage\_roles

Entrée :

{  
 "gamad\_id": "uuid",  
 "role\_id": "uuid",  
 "organization\_unit\_id": "uuid",  
 "reason": "Nomination officielle"  
}

Événement :

ROLE\_ASSIGNED

Audit :

renforcé  
---

## **8.2 Révoquer un rôle**

POST /api/v1/identity/roles/revoke

Permission :

identity.manage\_roles

Entrée :

{  
 "member\_role\_id": "uuid",  
 "reason": "Fin de mission"  
}

Événement :

ROLE\_REVOKED

Audit :

renforcé  
---

# **9\. Activity API**

## **9.1 Créer une activité**

POST /api/v1/activities

Permission :

activity.create

Entrée :

{  
 "title": "Formation GAMAD Technology",  
 "description": "Session de formation initiale",  
 "organization\_unit\_id": "uuid",  
 "priority": "normal",  
 "start\_date": "2026-06-01",  
 "end\_date": "2026-06-03"  
}

Sortie :

{  
 "activity\_id": "uuid",  
 "status": "draft"  
}

Événement :

ACTIVITY\_CREATED  
---

## **9.2 Soumettre une activité**

POST /api/v1/activities/{id}/submit

Permission :

activity.submit

Événement :

ACTIVITY\_SUBMITTED  
WORKFLOW\_STARTED

Audit :

obligatoire  
---

## **9.3 Valider une activité**

POST /api/v1/activities/{id}/validate

Permission :

activity.validate

Entrée :

{  
 "decision\_note": "Activité approuvée"  
}

Événement :

ACTIVITY\_VALIDATED  
WORKFLOW\_STEP\_APPROVED

Audit :

obligatoire  
---

# **10\. Task API**

## **10.1 Créer une tâche**

POST /api/v1/activities/{activity\_id}/tasks

Permission :

task.create

Entrée :

{  
 "title": "Préparer les supports",  
 "description": "Créer les documents de formation",  
 "assigned\_to": "uuid",  
 "due\_date": "2026-06-01"  
}

Événement :

TASK\_CREATED  
TASK\_ASSIGNED  
---

## **10.2 Marquer une tâche terminée**

POST /api/v1/tasks/{id}/complete

Permission :

task.update

Événement :

TASK\_COMPLETED

Audit :

standard  
---

# **11\. Knowledge API**

## **11.1 Créer un document**

POST /api/v1/documents

Permission :

document.create

Entrée :

{  
 "title": "Statuts GAMAD",  
 "document\_type": "statute",  
 "classification": "strategic",  
 "organization\_unit\_id": "uuid"  
}

Événement :

DOCUMENT\_CREATED

Audit :

obligatoire  
---

## **11.2 Ajouter une version**

POST /api/v1/documents/{id}/versions

Permission :

document.update

Entrée :

{  
 "version\_number": "1.0",  
 "file\_url": "storage/path/file.pdf",  
 "checksum": "sha256\_hash"  
}

Événement :

DOCUMENT\_VERSION\_CREATED

Audit :

obligatoire  
---

## **11.3 Valider un document**

POST /api/v1/documents/{id}/validate

Permission :

document.validate

Entrée :

{  
 "decision\_note": "Document validé"  
}

Événement :

DOCUMENT\_VALIDATED

Audit :

renforcé  
---

## **11.4 Exporter un document**

GET /api/v1/documents/{id}/export

Permission :

document.export

Événement :

DOCUMENT\_EXPORTED

Audit :

obligatoire si confidentiel ou stratégique  
---

# **12\. Communication API**

## **12.1 Publier une annonce**

POST /api/v1/communications/announcements

Permission :

announcement.create

Entrée :

{  
 "title": "Annonce officielle",  
 "content": "Contenu de l’annonce",  
 "organization\_unit\_id": "uuid",  
 "audience\_scope": "internal"  
}

Événement :

ANNOUNCEMENT\_CREATED  
ANNOUNCEMENT\_PUBLISHED  
---

## **12.2 Envoyer un message**

POST /api/v1/communications/messages

Permission :

message.send

Entrée :

{  
 "recipient\_id": "uuid",  
 "organization\_unit\_id": "uuid",  
 "content": "Message"  
}

Événement :

MESSAGE\_SENT  
---

# **13\. Audit API**

## **13.1 Lire les événements d’audit**

GET /api/v1/audit/events

Permission :

audit.read

Filtres :

{  
 "actor\_id": "uuid",  
 "target\_type": "document",  
 "organization\_unit\_id": "uuid",  
 "from": "2026-01-01",  
 "to": "2026-12-31"  
}  
---

## **13.2 Export audit**

GET /api/v1/audit/events/export

Permission :

audit.export

Événement :

AUDIT\_EXPORTED

Audit :

obligatoire  
---

# **14\. Workflow API**

## **14.1 Démarrer un workflow**

POST /api/v1/workflows/start

Permission :

workflow.start

Entrée :

{  
 "target\_type": "document",  
 "target\_id": "uuid",  
 "workflow\_id": "uuid"  
}

Événement :

WORKFLOW\_STARTED  
---

## **14.2 Approuver une étape**

POST /api/v1/workflows/steps/{step\_id}/approve

Permission :

workflow.approve

Entrée :

{  
 "decision\_note": "Approuvé"  
}

Événement :

WORKFLOW\_STEP\_APPROVED

Audit :

obligatoire  
---

## **14.3 Rejeter une étape**

POST /api/v1/workflows/steps/{step\_id}/reject

Permission :

workflow.reject

Entrée :

{  
 "reason": "Motif obligatoire"  
}

Événement :

WORKFLOW\_STEP\_REJECTED

Audit :

obligatoire  
---

# **15\. Règles transversales obligatoires**

## **15.1 Authentification**

Toutes les routes privées exigent :

Authorization: Bearer \<token\>  
---

## **15.2 Pagination**

Toute liste doit supporter :

?page=1\&limit=20  
---

## **15.3 Tri**

?sort=created\_at\&order=desc  
---

## **15.4 Filtrage**

Les filtres doivent être explicites, pas improvisés.

---

# **16\. Audit obligatoire selon criticité**

| Action | Audit |
| ----- | ----- |
| création compte | oui |
| rôle attribué | renforcé |
| document stratégique consulté | oui |
| permission modifiée | renforcé |
| suspension membre | renforcé |
| export données | renforcé |
| connexion simple | sécurité |

---

# **17\. Événements produits par domaine**

| Domaine | Événements |
| ----- | ----- |
| Identity | GAMAD\_ID\_CREATED, MEMBER\_VALIDATED |
| Organization | UNIT\_CREATED, MEMBER\_ATTACHED |
| Activity | ACTIVITY\_CREATED, ACTIVITY\_VALIDATED |
| Knowledge | DOCUMENT\_CREATED, DOCUMENT\_VALIDATED |
| Permission | ROLE\_ASSIGNED, ROLE\_REVOKED |
| Security | LOGIN\_FAILED, SESSION\_REVOKED |
| Audit | AUDIT\_EXPORTED |

---

# **18\. Interdictions**

Sont interdits :

API sans permission définie  
API sans contrat d’erreur  
API critique sans audit  
API modifiant plusieurs domaines sans événement  
API non versionnée  
API dépendante d’une interface  
---

# **19\. Avertissement stratégique**

⚠️ Les API Contracts sont le premier pont entre conception et implémentation.

Sans contrats API clairs :

* le frontend dictera le backend ;  
* les permissions seront bricolées ;  
* les modules deviendront dépendants ;  
* la dette technique apparaîtra avant même le MVP.

---

# **20\. Conclusion**

