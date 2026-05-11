# **📘 GAMAD HUB PERMISSION MODEL v0.1**

## **Modèle fondateur des rôles, droits, visibilité et gouvernance d’accès**

---

# **0\. Objectif**

Ce document définit comment le **GAMAD HUB CORE** contrôle :

qui peut voir,  
qui peut créer,  
qui peut modifier,  
qui peut valider,  
qui peut administrer,  
qui peut auditer.

Le modèle de permission doit empêcher :

* le chaos organisationnel ;  
* les accès excessifs ;  
* les permissions implicites ;  
* la confusion entre rôle social et droit technique.

---

# **1\. Principe fondamental**

Dans le GAMAD HUB :

aucun accès critique ne doit être implicite.

Toute permission doit être :

* explicite ;  
* contextualisée ;  
* auditée ;  
* révocable ;  
* justifiable.

---

# **2\. Séparation essentielle**

## **2.1 Statut ≠ Rôle ≠ Permission**

| Élément | Signification |
| ----- | ----- |
| Statut | position générale d’une identité |
| Rôle | fonction dans une structure |
| Permission | droit technique précis |

Exemple :

Statut : ACTIVE\_MEMBER  
Rôle : Responsable Zumara  
Permission : activity.validate  
---

# **3\. Les 4 couches du modèle d’accès**

Le GAMAD HUB combine 4 couches.

Identity Status  
\+ Role  
\+ Organization Context  
\+ Resource Classification  
---

# **3.1 Identity Status**

Détermine l’état général du GAMAD ID.

| Statut | Accès |
| ----- | ----- |
| PENDING | très limité |
| ACTIVE | accès normal |
| LIMITED | accès réduit |
| SUSPENDED | accès bloqué temporairement |
| ARCHIVED | lecture historique selon règles |
| BANNED | aucun accès |

---

# **3.2 Role**

Détermine la fonction opérationnelle.

Exemples :

* membre ;  
* responsable Zumara ;  
* responsable Section ;  
* responsable Coordination ;  
* responsable Département ;  
* archiviste ;  
* validateur ;  
* auditeur ;  
* administrateur.

---

# **3.3 Organization Context**

Une permission peut être limitée à :

* une Zumara ;  
* une Section ;  
* une Coordination ;  
* un Département ;  
* tout le Mouvement.

Exemple :

Responsable Coordination A  
peut gérer les Sections de Coordination A,  
mais pas celles de Coordination B.  
---

# **3.4 Resource Classification**

Les ressources sont classées.

| Classification | Accès |
| ----- | ----- |
| PUBLIC | ouvert selon contexte |
| INTERNAL | membres actifs |
| CONFIDENTIAL | responsables autorisés |
| STRATEGIC | gouvernance centrale |
| RESTRICTED | accès spécial |

---

# **4\. Actions standards**

Toutes les permissions doivent se baser sur des actions standards.

read  
create  
update  
delete  
validate  
reject  
manage  
moderate  
export  
archive  
assign  
revoke  
audit  
---

# **5\. Format des permissions**

Chaque permission doit suivre une convention claire.

module.action

Exemples :

identity.read  
identity.manage  
organization.create  
organization.update  
organization.assign\_member  
activity.create  
activity.validate  
document.read  
document.validate  
audit.read  
---

# **6\. Rôles système minimaux**

## **6.1 SUPER\_ADMINISTRATOR**

Portée :

globale

Capacités :

* gérer le système ;  
* configurer les rôles ;  
* gérer les accès critiques ;  
* superviser les audits.

⚠️ Ce rôle doit être extrêmement limité en nombre.

---

## **6.2 HCG\_VALIDATOR**

Portée :

gouvernance centrale

Capacités :

* valider décisions critiques ;  
* approuver structures ;  
* autoriser documents stratégiques ;  
* examiner sanctions majeures.

---

## **6.3 DEPARTMENT\_MANAGER**

Portée :

département

Capacités :

* gérer membres du département ;  
* créer activités départementales ;  
* valider documents départementaux ;  
* superviser coordinations liées.

---

## **6.4 COORDINATION\_MANAGER**

Portée :

coordination

Capacités :

* gérer sections rattachées ;  
* coordonner activités locales ;  
* remonter rapports ;  
* proposer validations.

---

## **6.5 SECTION\_MANAGER**

Portée :

section

Capacités :

* gérer membres de section ;  
* suivre activités locales ;  
* encadrer Zumara.

---

## **6.6 ZUMARA\_MANAGER**

Portée :

Zumara

Capacités :

* gérer membres de Zumara ;  
* créer tâches ;  
* publier rapports ;  
* proposer activités.

---

## **6.7 ACTIVE\_MEMBER**

Portée :

ses espaces autorisés

Capacités :

* consulter ressources internes autorisées ;  
* participer aux activités ;  
* soumettre documents ;  
* répondre aux tâches.

---

## **6.8 ARCHIVIST**

Portée :

documentation

Capacités :

* classer documents ;  
* gérer versions ;  
* archiver contenus ;  
* proposer validation documentaire.

---

## **6.9 AUDITOR**

Portée :

audit

Capacités :

* consulter logs autorisés ;  
* produire rapports ;  
* enquêter sur actions critiques.

⚠️ L’auditeur ne doit pas automatiquement pouvoir modifier les données auditées.

---

## **6.10 SYSTEM\_AGENT**

Portée :

technique limitée

Capacités :

* exécuter actions automatisées ;  
* produire événements ;  
* notifier ;  
* synchroniser.

Tout agent système doit avoir :

un GAMAD ID système.  
---

# **7\. Matrice des permissions initiales**

## **7.1 Identity**

| Permission | Super Admin | HCG | Manager | Membre |
| ----- | ----- | ----- | ----- | ----- |
| identity.read | Oui | Oui | contexte | soi-même |
| identity.create | Oui | Oui | Non | Non |
| identity.update | Oui | contexte | contexte | soi-même limité |
| identity.suspend | Oui | Oui | proposition | Non |
| identity.manage\_roles | Oui | Oui | limité | Non |

---

## **7.2 Organization**

| Permission | Super Admin | HCG | Dept | Coord | Section | Zumara |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| organization.read | Oui | Oui | contexte | contexte | contexte | contexte |
| organization.create | Oui | Oui | proposition | Non | Non | Non |
| organization.update | Oui | Oui | contexte | contexte limité | Non | Non |
| organization.assign\_member | Oui | Oui | contexte | contexte | contexte | contexte |
| organization.archive | Oui | Oui | proposition | Non | Non | Non |

---

## **7.3 Activity**

| Permission | Super Admin | HCG | Dept | Coord | Section | Zumara | Membre |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| activity.read | Oui | Oui | contexte | contexte | contexte | contexte | autorisé |
| activity.create | Oui | Oui | Oui | Oui | Oui | Oui | proposition |
| activity.update | Oui | Oui | contexte | contexte | contexte | contexte | si propriétaire |
| activity.validate | Oui | Oui | Dept | Coord | Section | proposition | Non |
| activity.archive | Oui | Oui | contexte | contexte | Non | Non | Non |

---

## **7.4 Documents**

| Permission | Super Admin | HCG | Manager | Archiviste | Membre |
| ----- | ----- | ----- | ----- | ----- | ----- |
| document.read\_public | Oui | Oui | Oui | Oui | Oui |
| document.read\_internal | Oui | Oui | contexte | contexte | autorisé |
| document.read\_confidential | Oui | Oui | contexte strict | contexte strict | Non |
| document.read\_strategic | Oui | Oui | Non | Non | Non |
| document.create | Oui | Oui | Oui | Oui | proposition |
| document.validate | Oui | Oui | contexte | proposition | Non |
| document.archive | Oui | Oui | contexte | Oui | Non |

---

## **7.5 Audit**

| Permission | Super Admin | HCG | Auditor | Manager |
| ----- | ----- | ----- | ----- | ----- |
| audit.read | Oui | Oui | Oui | contexte |
| audit.export | Oui | Oui | Oui limité | Non |
| audit.delete | Non | Non | Non | Non |

⚠️ Même le Super Admin ne doit pas supprimer les logs critiques.  
 Il peut seulement les archiver selon procédure.

---

# **8\. Règles de visibilité**

## **8.1 Visibilité des profils**

| Niveau | Description |
| ----- | ----- |
| PUBLIC | visible public |
| INTERNAL | visible membres |
| PRIVATE | visible propriétaire \+ responsables |
| RESTRICTED | visible autorité autorisée |

---

## **8.2 Visibilité organisationnelle**

Un utilisateur voit :

* sa structure ;  
* ses rattachements ;  
* les espaces autorisés ;  
* les annonces publiques ou internes.

Il ne voit pas automatiquement :

* autres structures ;  
* documents confidentiels ;  
* décisions stratégiques.

---

# **9\. Règles d’héritage**

## **9.1 Héritage descendant**

Un responsable peut obtenir des droits sur les niveaux inférieurs de sa branche.

Exemple :

Responsable Département  
→ Coordination rattachée  
→ Section rattachée  
→ Zumara rattachée  
---

## **9.2 Limite d’héritage**

⚠️ L’héritage ne doit jamais franchir une branche non rattachée.

Département Technologie  
≠  
Département Finance  
---

# **10\. Règles de validation**

## **10.1 Validation simple**

Une action peut nécessiter un seul validateur.

Exemple :

publication annonce interne  
---

## **10.2 Validation hiérarchique**

Une action sensible peut nécessiter plusieurs niveaux.

Zumara  
→ Section  
→ Coordination  
→ Département  
→ HCG  
---

## **10.3 Validation critique**

Certaines actions exigent HCG ou rôle spécial :

* création département ;  
* suspension définitive ;  
* document stratégique ;  
* modification des permissions centrales ;  
* changement de gouvernance.

---

# **11\. Règles d’interdiction**

Sont interdits :

permission implicite  
rôle sans périmètre  
admin illimité non audité  
suppression silencieuse  
modification de logs critiques  
accès stratégique non justifié  
---

# **12\. Règles d’audit des permissions**

Chaque action suivante doit produire un `AUDIT_EVENT` :

* rôle attribué ;  
* rôle révoqué ;  
* permission modifiée ;  
* utilisateur suspendu ;  
* document stratégique consulté ;  
* export réalisé ;  
* validation critique effectuée.

---

# **13\. Permissions temporaires**

Le système doit permettre :

* délégation temporaire ;  
* remplacement ;  
* mission spéciale.

Mais chaque délégation doit avoir :

* début ;  
* fin ;  
* justification ;  
* auteur ;  
* audit.

---

# **14\. Permissions d’urgence**

Une procédure d’urgence peut exister.

Mais elle doit être :

* rare ;  
* auditée ;  
* justifiée ;  
* revue après usage.

Exemple :

emergency\_access.grant  
---

# **15\. Permissions des agents IA et systèmes**

Les agents IA ne doivent jamais avoir :

* accès global ;  
* droits implicites ;  
* suppression critique ;  
* modification des permissions centrales.

Ils doivent agir :

dans un périmètre strict.  
---

# **16\. Politique du moindre privilège**

Tout compte reçoit :

le minimum exact nécessaire  
pour accomplir sa mission.

Pas plus.

---

# **17\. Avertissement stratégique**

⚠️ Le modèle de permission est une fondation critique.

Une erreur ici produira :

* fuite de données ;  
* conflit hiérarchique ;  
* désordre organisationnel ;  
* abus de pouvoir ;  
* perte de confiance.

---

# **18\. Conclusion**

Le **GAMAD HUB PERMISSION MODEL v0.1** établit la gouvernance d’accès minimale du système.

Il garantit que le HUB reste :

* contrôlable ;  
* hiérarchisé ;  
* auditable ;  
* sécurisé ;  
* fidèle à l’organisation GAMAD.

