# Doctrine de l'Accès au Core

> Document souverain. Ne pas référencer sur le portail.
> Ne pas mentionner dans aucune communication publique.

---

## Principe absolu

> *On ne choisit pas le Core. C'est le Core qui te choisit.*

Il n'existe aucun formulaire d'accès au Core.
Aucun bouton.
Aucun lien.
Aucune page d'inscription.

Le portail ne mentionne jamais l'existence du Core.
Ce silence est intentionnel.
C'est la première épreuve.

Celui qui cherche activement ne trouvera rien.
Celui qui construit, forme, contribue — sans attendre —
pourrait un jour recevoir une invitation
qu'il ne comprendra pas entièrement.

---

## Les deux mondes

```
┌─────────────────────────────────────────────────────────┐
│                   PORTAIL (gamad.net)                   │
│                                                         │
│  Tout le monde peut entrer.                             │
│  Chacun peut créer, former, contribuer, croître.        │
│  Personne ne sait que le Core existe.                   │
│  Personne ne cherche ce qu'il ne connaît pas.           │
│                                                         │
│              ↑ mur d'invisibilité ↑                    │
└──────────────────────┬──────────────────────────────────┘
                       │  révélation — 4 chemins
┌──────────────────────▼──────────────────────────────────┐
│                 CORE (hub.gamad.net)                    │
│                                                         │
│  Accessible uniquement aux révélés.                     │
│  Gouverné par le HCG.                                   │
│  Mémoire souveraine du monde GAMAD.                     │
│  Invisible depuis le portail.                           │
│  Imprévisible dans ses choix.                           │
└─────────────────────────────────────────────────────────┘
```

---

## Les quatre chemins vers la révélation

Le Core ne s'explique pas.
Il choisit selon sa propre logique.
Voici les voies connues — mais leurs conditions exactes ne sont jamais publiées.

### Chemin 1 — L'Invitation directe

Le HCG observe un comportement dans le portail.
Une constance. Une valeur. Une qualité rare.
Une invitation est envoyée.
Son contenu ne mentionne jamais le mot "Core".

### Chemin 2 — Le Seuil silencieux

Un algorithme invisible évalue en permanence :
- réputation ZAHAB ;
- formations complétées ;
- activité Zumara ;
- contributions communautaires ;
- comportement général.

Quand un seuil non publié est atteint,
une ouverture peut se produire automatiquement.

Les seuils exacts sont connus du Core uniquement.
Ils peuvent changer à tout moment.

### Chemin 3 — Le Parrainage

Un citoyen du Core juge quelqu'un digne.
Il le présente au HCG.
Le HCG tranche.

Le parrainage n'est pas une garantie.
C'est une recommandation.

### Chemin 4 — L'Élu ignorant

Le Core choisit quelqu'un sans critère apparent.
Pas de Zumara.
Pas de formation complète.
Pas de réputation particulière.

Le Core voit autrement.

Cet élu entre dans le Core.
Il est formé en interne.
Il vit dans le Core le temps nécessaire.
Puis il est renvoyé dans le portail.

Personne sur le portail ne sait qu'il a été à l'intérieur.
Il devient un **citoyen missionnaire** :
vecteur de valeurs GAMAD dans la communauté,
sans badge visible, sans titre explicite.
Sa présence élève ceux qui l'entourent
sans qu'ils sachent pourquoi.

---

## Les statuts d'un citoyen révélé

```
PORTAL_USER     → compte portail standard, n'a pas accès au Core
PENDING         → en cours d'activation Core (pipeline classique)
ACTIVE          → citoyen Core actif
MISSIONARY      → citoyen renvoyé au portail après séjour Core
ILLUMINATED     → citoyen Core avec accès Zumara d'élite
```

---

## Le RevelationEvent — trace souveraine

Chaque accès au Core est enregistré comme un événement immuable.

| Champ | Contenu |
|---|---|
| `gamadId` | Identité révélée |
| `path` | Chemin utilisé (DIRECT / THRESHOLD / SPONSORED / CHOSEN) |
| `actorId` | Qui a décidé (HCG member ou système) |
| `grantedAt` | Horodatage |
| `note` | Contexte interne (jamais publié) |

Cet événement ne peut jamais être supprimé.
Il fait partie de la mémoire souveraine du Core.

---

## Le module Communauté du Core

Il existe un espace communautaire dans le Core.
Il ressemble fonctionnellement au module Communauté du portail.
Il n'en est pas la copie.

Il est réservé aux citoyens révélés.
Les Zumara d'élite y interagissent.
Les échanges n'ont aucune trace publique.
Le HCG y observe, y participe, y décide.

C'est le cœur vivant du monde GAMAD.

---

## Ce que le Core ne fait jamais

- Le Core ne se mentionne jamais sur le portail.
- Le Core ne publie jamais ses critères de sélection.
- Le Core ne permet jamais à un portail-user de "candidater".
- Le Core ne confirme jamais à un portail-user qu'il est observé.
- Le Core ne justifie jamais un refus.
- Le Core ne justifie jamais un choix.

---

## Finalité

Le Core est l'entité souveraine et imprévisible de GAMAD.

Son inaccessibilité n'est pas un défaut de design.
C'est son identité.

La rareté de l'accès est ce qui lui donne sa valeur.
Le mystère est ce qui maintient l'intégrité du monde GAMAD.

Ceux qui sont dedans le savent.
Ceux qui sont dehors espèrent.
Ceux qui n'en ont jamais entendu parler construisent quand même —
et c'est exactement ce que le Core attend d'eux.
