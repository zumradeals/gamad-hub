# GAMAD CORE — Constitution du Monde Numerique

## Nature du document

Ce document ne decrit pas une application.

Il decrit les lois fondatrices du monde numerique GAMAD.

Le GAMAD HUB n'est pas une simple plateforme logicielle.
Il constitue une infrastructure civilisationnelle numerique composee :

- d'identites ;
- d'organisations ;
- de permissions ;
- d'evenements ;
- de contrats ;
- de memoires ;
- de preuves ;
- de services ;
- d'interfaces.

Cette constitution definit les invariants qui gouvernent l'ensemble du systeme.

---

# Pyramide officielle

```text
Civilisation
    ↓
Constitution
    ↓
Core
    ↓
Services
    ↓
Satellites
    ↓
Interfaces
```

---

# Principes invariants

## 1. Separation entre civilisation et implementation

La technologie est remplacable.

Les principes, contrats et regles de coherence sont permanents.

Aucune interface, framework ou stack ne constitue la verite du systeme.

---

## 2. Le backend est l'autorite

Le frontend ne decide jamais :

- des permissions ;
- des validations ;
- des droits reels ;
- des transitions critiques.

Le backend porte :

- la logique metier ;
- les audits ;
- les preuves ;
- les evenements.

---

## 3. Toute action critique produit une trace

Toute action importante doit produire :

- un audit ;
- un evenement ;
- une preuve temporelle ;
- un auteur identifiable.

L'absence de trace constitue une incoherence systemique.

---

## 4. Les contrats priment sur les interfaces

Les interfaces changent.

Les contrats definissent la stabilite du monde.

Les schemas, permissions, evenements et API constituent les interfaces souveraines du systeme.

---

## 5. Le systeme doit etre reconstructible

Aucun composant ne doit devenir irremplacable.

Le systeme doit pouvoir etre reconstruit a partir :

- du depot Git ;
- des contrats ;
- des migrations ;
- des specifications ;
- des journaux d'execution.

---

## 6. L'evenement est une preuve historique

Les evenements ne sont pas de simples notifications.

Ils constituent la memoire vivante du systeme.

Chaque evenement important doit etre :

- typable ;
- horodate ;
- attribuable ;
- verifiable.

---

## 7. L'identite est souveraine

Chaque utilisateur, organisation ou systeme possede :

- une identite ;
- des permissions ;
- une responsabilite ;
- un historique.

Aucune action anonyme critique ne doit exister.

---

## 8. La Zumara est l'atome civilisationnel

GAMAD dit : l'humain dit communauté, composée de groupes pour le développement.

La Zumara est ce groupe.

Elle est l'unité irréductible de l'action collective dans le monde GAMAD.
Tout part d'elle. Tout y revient.

```
Humain → Zumara → Département → Organisation → Nation GAMAD
```

Chaque humain est un GAMAD potentiel.
Chaque groupe est une Zumara potentielle.
Chaque Zumara est un Département potentiel.

Le mouvement est ascendant. Toujours.

---

## 9. La Nation GAMAD a deux visages

Le **portail** est le visage public — Le Zumara — où tout citoyen vit, crée, contribue.

Le **Core** est le visage souverain — invisible, choisi, gouverné par le HCG.

Ces deux mondes ne se mélangent pas.
Ils coexistent selon la doctrine de révélation.
Le portail ne mentionne jamais le Core.
Le Core observe tout depuis le portail.

---

# Doctrine architecturale

Le GAMAD HUB est organise comme un noyau.

Les modules, satellites et extensions gravitent autour du Core sans compromettre sa coherence.

Le MVP n'est pas une reduction de principes.

Le MVP est une reduction de surface fonctionnelle.

---

# Structure documentaire officielle

```text
/docs
│
├── 00-civilization
├── 01-core
├── 02-runtime
├── 03-governance
├── 04-satellites
└── 99-archives
```

---

# Finalite

Le GAMAD HUB vise a devenir :

- une infrastructure souveraine ;
- un systeme reconstructible ;
- un environnement gouvernable ;
- une memoire organisationnelle ;
- un noyau civilisationnel numerique.
