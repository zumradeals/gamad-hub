# **📘 GAMAD HUB EVENT MODEL v0.1**

## **Événements critiques, workflows, automatisations et traces système**

---

# **0\. Objectif**

Le **Event Model** définit les événements que le GAMAD HUB doit produire, écouter, historiser et utiliser pour coordonner le système.

Un événement représente :

quelque chose d’important qui vient de se produire.  
---

# **1\. Principe fondamental**

Toute action critique doit générer :

un événement système  
\+  
une trace d’audit.

L’événement permet au système de réagir.  
 L’audit permet à l’institution de prouver.

---

# **2\. Différence critique**

| Élément | Rôle |
| ----- | ----- |
| EVENT | déclenche coordination système |
| AUDIT\_EVENT | conserve preuve historique |

Exemple :

USER\_VALIDATED  
→ déclenche notification

AUDIT\_EVENT  
→ conserve qui a validé, quand, pourquoi  
---

# **3\. Structure standard d’un événement**

Tout événement doit contenir :

| Champ | Rôle |
| ----- | ----- |
| event\_id | identifiant unique |
| event\_type | type d’événement |
| actor\_id | auteur |
| target\_type | cible |
| target\_id | identifiant cible |
| organization\_unit\_id | contexte |
| payload | données utiles |
| occurred\_at | date réelle |
| emitted\_at | date émission |
| correlation\_id | lien avec opération globale |
| causation\_id | événement déclencheur |

---

# **4\. Domaines d’événements**

Les événements sont classés par domaine :

Identity  
Organization  
Activity  
Knowledge  
Communication  
Permission  
Security  
Audit  
System  
---

# **5\. Identity Events**

## **Événements principaux**

GAMAD\_ID\_CREATED  
ACCOUNT\_CREATED  
ACCOUNT\_ACTIVATED  
ACCOUNT\_LOCKED  
ACCOUNT\_DISABLED  
PROFILE\_UPDATED  
MEMBER\_VALIDATED  
MEMBER\_LIMITED  
MEMBER\_SUSPENDED  
MEMBER\_ARCHIVED  
MEMBER\_BANNED

## **Exemple**

GAMAD\_ID\_CREATED  
→ créer profil initial  
→ notifier responsable  
→ écrire audit  
---

# **6\. Organization Events**

ORGANIZATION\_UNIT\_CREATED  
ORGANIZATION\_UNIT\_UPDATED  
ORGANIZATION\_UNIT\_ARCHIVED  
MEMBER\_ATTACHED\_TO\_UNIT  
MEMBER\_REMOVED\_FROM\_UNIT  
ZUMARA\_CREATED  
ZUMARA\_UPDATED  
ZUMARA\_ARCHIVED  
RESPONSIBLE\_ASSIGNED  
RESPONSIBLE\_REVOKED

## **Exemple**

MEMBER\_ATTACHED\_TO\_UNIT  
→ mise à jour visibilité  
→ notification membre  
→ audit  
---

# **7\. Permission Events**

ROLE\_CREATED  
ROLE\_UPDATED  
ROLE\_ASSIGNED  
ROLE\_REVOKED  
PERMISSION\_CREATED  
PERMISSION\_UPDATED  
PERMISSION\_GRANTED  
PERMISSION\_REVOKED  
TEMPORARY\_ACCESS\_GRANTED  
TEMPORARY\_ACCESS\_EXPIRED  
EMERGENCY\_ACCESS\_USED

⚠️ Ces événements sont critiques.

Ils doivent toujours produire un audit renforcé.

---

# **8\. Activity Events**

ACTIVITY\_CREATED  
ACTIVITY\_SUBMITTED  
ACTIVITY\_VALIDATED  
ACTIVITY\_REJECTED  
ACTIVITY\_STARTED  
ACTIVITY\_COMPLETED  
ACTIVITY\_ARCHIVED  
TASK\_CREATED  
TASK\_ASSIGNED  
TASK\_UPDATED  
TASK\_COMPLETED  
REPORT\_SUBMITTED  
REPORT\_VALIDATED

## **Cycle standard**

ACTIVITY\_CREATED  
→ ACTIVITY\_SUBMITTED  
→ ACTIVITY\_VALIDATED  
→ ACTIVITY\_STARTED  
→ ACTIVITY\_COMPLETED  
→ ACTIVITY\_ARCHIVED  
---

# **9\. Knowledge Events**

DOCUMENT\_CREATED  
DOCUMENT\_UPLOADED  
DOCUMENT\_SUBMITTED  
DOCUMENT\_VALIDATED  
DOCUMENT\_REJECTED  
DOCUMENT\_VERSION\_CREATED  
DOCUMENT\_CLASSIFICATION\_CHANGED  
DOCUMENT\_ARCHIVED  
DOCUMENT\_ACCESSED  
DOCUMENT\_EXPORTED

⚠️ Pour les documents stratégiques :

DOCUMENT\_ACCESSED  
DOCUMENT\_EXPORTED

doivent obligatoirement être audités.

---

# **10\. Communication Events**

MESSAGE\_SENT  
MESSAGE\_READ  
ANNOUNCEMENT\_CREATED  
ANNOUNCEMENT\_PUBLISHED  
ANNOUNCEMENT\_ARCHIVED  
NOTIFICATION\_CREATED  
NOTIFICATION\_SENT  
NOTIFICATION\_READ  
---

# **11\. Security Events**

LOGIN\_SUCCESS  
LOGIN\_FAILED  
MFA\_ENABLED  
MFA\_DISABLED  
PASSWORD\_CHANGED  
SESSION\_CREATED  
SESSION\_REVOKED  
SUSPICIOUS\_ACTIVITY\_DETECTED  
BRUTE\_FORCE\_DETECTED  
SECURITY\_ALERT\_RAISED

⚠️ Les événements sécurité doivent être conservés avec priorité élevée.

---

# **12\. System Events**

SYSTEM\_STARTED  
SYSTEM\_STOPPED  
BACKUP\_STARTED  
BACKUP\_COMPLETED  
BACKUP\_FAILED  
RESTORE\_STARTED  
RESTORE\_COMPLETED  
DEPLOYMENT\_STARTED  
DEPLOYMENT\_COMPLETED  
DEPLOYMENT\_FAILED  
MIGRATION\_STARTED  
MIGRATION\_COMPLETED  
MIGRATION\_FAILED  
---

# **13\. Workflow Events**

Les workflows doivent produire leurs propres événements.

WORKFLOW\_CREATED  
WORKFLOW\_STARTED  
WORKFLOW\_STEP\_APPROVED  
WORKFLOW\_STEP\_REJECTED  
WORKFLOW\_COMPLETED  
WORKFLOW\_CANCELLED

## **Exemple**

DOCUMENT\_SUBMITTED  
→ WORKFLOW\_STARTED  
→ WORKFLOW\_STEP\_APPROVED  
→ DOCUMENT\_VALIDATED  
---

# **14\. Règles de déclenchement**

## **Règle 1**

Une action utilisateur critique produit :

EVENT \+ AUDIT\_EVENT

## **Règle 2**

Un événement peut déclencher :

* notification ;  
* workflow ;  
* changement d’état ;  
* journalisation ;  
* synchronisation.

## **Règle 3**

Un événement critique ne doit jamais être supprimé silencieusement.

---

# **15\. États et transitions**

## **Exemple membre**

PENDING  
→ ACTIVE  
→ LIMITED  
→ SUSPENDED  
→ ARCHIVED

## **Événements associés**

MEMBER\_VALIDATED  
MEMBER\_LIMITED  
MEMBER\_SUSPENDED  
MEMBER\_ARCHIVED  
---

# **16\. Correlation ID**

Toute opération complexe doit porter un correlation\_id.

Exemple :

Création d’un membre  
├── GAMAD\_ID\_CREATED  
├── ACCOUNT\_CREATED  
├── PROFILE\_CREATED  
├── MEMBER\_ATTACHED\_TO\_UNIT  
└── NOTIFICATION\_SENT

Tous ces événements partagent le même correlation\_id.

---

# **17\. Causation ID**

Le causation\_id indique quel événement a déclenché un autre événement.

Exemple :

DOCUMENT\_SUBMITTED  
→ WORKFLOW\_STARTED

WORKFLOW\_STARTED a pour causation\_id l’événement DOCUMENT\_SUBMITTED.

---

# **18\. Automatisations autorisées**

Le système peut automatiser :

* notifications ;  
* rappels ;  
* création de tâches ;  
* démarrage workflow ;  
* changement statut non critique ;  
* indexation recherche ;  
* archivage automatique selon règle.

---

# **19\. Automatisations interdites sans validation humaine**

⚠️ Le système ne doit pas automatiser seul :

* bannissement définitif ;  
* suppression critique ;  
* modification permissions centrales ;  
* validation stratégique ;  
* accès d’urgence ;  
* changement structurel majeur.

---

# **20\. Event Store**

Le système doit conserver un registre des événements.

## **Rôle**

* reconstitution ;  
* audit ;  
* analyse ;  
* diagnostic ;  
* synchronisation.

---

# **21\. Event Payload**

Le payload doit contenir uniquement les données nécessaires.

⚠️ Il ne doit pas contenir inutilement :

* secrets ;  
* mots de passe ;  
* données sensibles non indispensables.

---

# **22\. Priorité des événements**

| Niveau | Exemple |
| ----- | ----- |
| LOW | notification lue |
| NORMAL | tâche créée |
| HIGH | document validé |
| CRITICAL | rôle modifié |
| SECURITY | tentative intrusion |

---

# **23\. Rétention**

Les événements critiques doivent être conservés durablement.

| Type | Rétention |
| ----- | ----- |
| Security | longue durée |
| Permission | permanente |
| Audit | permanente |
| Document stratégique | permanente |
| Notification simple | courte/moyenne |

---

# **24\. Architecture logique**

USER ACTION  
   ↓  
DOMAIN SERVICE  
   ↓  
EVENT EMITTED  
   ↓  
EVENT STORE  
   ↓  
AUDIT SERVICE  
   ↓  
REACTIONS  
   ├── Notification  
   ├── Workflow  
   ├── Indexation  
   ├── Reporting  
   └── Synchronisation  
---

# **25\. Avertissement stratégique**

⚠️ Sans Event Model clair, le HUB deviendra opaque.

Les conséquences :

* actions invisibles ;  
* workflows impossibles à comprendre ;  
* audit faible ;  
* automatisations dangereuses ;  
* perte de mémoire opérationnelle.

---

# **26\. Conclusion**

Le **GAMAD HUB EVENT MODEL v0.1** établit le système nerveux opérationnel du HUB.

Il permet au système de :

réagir,  
coordonner,  
prouver,  
reconstruire  
et comprendre.  
