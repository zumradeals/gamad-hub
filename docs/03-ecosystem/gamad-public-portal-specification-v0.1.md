# GAMAD PUBLIC PORTAL SPECIFICATION v0.2
> Vision, architecture et doctrine du portail public mondial GAMAD

**Version :** 0.2 — Refonte architecture GAFAM-like + ZAHAB Economy  
**Statut :** Architecture officielle implémentée  
**Couche :** 03-ecosystem  
**Mise à jour :** 2026-05-14

---

## 0. Historique des versions

| Version | Date | Description |
|---|---|---|
| 0.1 | 2026-04 | Spécification initiale — portail vitrine + G-SEARCH |
| 0.2 | 2026-05 | Refonte complète — écosystème GAFAM-like, compte universel, ZAHAB, feed social |

---

## 1. Mission du portail

Le portail public GAMAD (gamad.net) est un **écosystème numérique complet** qui rivalise avec les GAFAM.

Ce n'est pas une simple vitrine. C'est un monde vivant avec :
- Un compte utilisateur universel (GAMAD ID silencieux)
- Un feed social avec modération par réputation
- Un blog éditorial rémunéré
- Une économie interne (monnaie ZAHAB)
- Des services futurs (mail, cloud, marketplace, creator tools)

Le portail est **l'interface économique et sociale publique de GAMAD**.
Il génère des revenus, récolte des données, alimente le GAMAD ID de chaque utilisateur.

---

## 2. Principe fondamental de séparation

> Le Core est un monde invisible. Le portail en est la façade économique.

| | Portail (gamad.net) | Core (hub.gamad.net) |
|---|---|---|
| Visibilité | Public, mondial | Invisible, sur invitation |
| Accès | Libre inscription | Pipeline contrôlé |
| Connaît le Core ? | Non | Oui |
| Lien vers le Core ? | Aucun direct | N/A |
| Identité | PORTAL_USER (silencieux) | Citoyen GAMAD (explicite) |
| Monnaie | ZAHAB points | ZAHAB + cotisation |

**Seul passage vers le Core :** bouton "Rejoindre le Réseau" → formulaire minimal → pipeline.

---

## 3. Architecture des routes — implémentée

```
/                       Accueil — Hero Navy/Gold, piliers, services, articles récents
/vision                 Mission et 6 valeurs GAMAD
/services               Écosystème complet (4 catégories)
/blog                   Articles éditoriaux
/blog/[slug]            Article individuel
/ressources             Bibliothèque publique (formations, documents)
/feed                   Feed social — composer (connecté) ou CTA connexion
/inscription            Inscription portail → PORTAL_USER → auto-login → /dashboard
/connexion              Connexion portail (JWT portal séparé du Core)
/rejoindre              Formulaire candidature Réseau (minimal, ne révèle pas le Core)
/dashboard              Espace compte — raccourcis, statut candidature, infos
/dashboard/wallet       Wallet ZAHAB — solde, réputation, historique
```

Routes à venir :
```
/blog/new               Créer un article (Phase B)
/dashboard/creator      Tableau de bord créateur — revenus, stats (Phase B)
/dashboard/moderation   File de modération pour VETERAN/GUARDIAN (Phase C)
/tv                     GAMAD TV — catalogue vidéos
/market                 Marketplace (Phase future)
```

---

## 4. Identité utilisateur — PORTAL_USER

Tout visiteur qui s'inscrit reçoit **silencieusement un GAMAD ID** avec statut `PORTAL_USER`.

```
POST /api/v1/portal/auth/register
→ GamadId créé (status: PORTAL_USER)
→ ZahabWallet créé (balance: 0)
→ ReputationScore créé (score: 0, trustLevel: NEWCOMER)
→ ZahabTransaction REGISTRATION_BONUS (+10 Z)
→ JWT portal retourné (payload: { portalUserId, portalUser: true })
```

Le JWT portal est **distinct** du JWT Core. Les guards séparés :
- `PortalJwtGuard` → authentifie les routes `/portal/*`
- `JwtAuthGuard` → authentifie les routes Core

L'utilisateur portail **ignore** qu'il a un GAMAD ID. Il voit juste son compte.

---

## 5. Pipeline Réseau — candidature contrôlée

```
1. Utilisateur connecté sur le portail
2. Clic "Rejoindre le Réseau" → /rejoindre
3. Formulaire minimal (prénom, nom, pays, ville, message)
   → NE RÉVÈLE PAS : structure Core, niveaux, doctrine
4. PortalApplication créée (status: SUBMITTED)
5. Tableau de bord affiche badge "Candidature envoyée"
6. Opérateur HCG examine → passe en UNDER_REVIEW
7. Si APPROVED → email avec formulaire Core avancé + lien hub.gamad.net
8. Si REJECTED → notification discrète
```

---

## 6. Économie ZAHAB sur le portail

### 6.1 Récompenses automatiques

| Action | Montant | Déclencheur |
|---|---|---|
| Inscription | +10 Z | onRegistration() |
| Publier un post | +5 Z | onContentPublished() |
| Poster un commentaire | +1 Z | onCommentPosted() |
| Recevoir une réaction | +0.5 Z | onReactionReceived() |

### 6.2 Wallet ZAHAB (/dashboard/wallet)

L'utilisateur voit :
- Solde disponible (Navy/Gold card)
- Total gagné depuis la création
- Score de réputation + niveau TrustLevel
- Barre de progression vers le prochain niveau
- Statistiques d'activité (posts, commentaires, réactions)
- Table des seuils TrustLevel
- Historique complet des transactions (avec labels en français)

### 6.3 Future conversion

La conversion ZAHAB → monnaie locale sera disponible via les Anchors Stellar (Phase D).

---

## 7. Feed social (/feed)

### 7.1 Fonctionnement

- **Non connecté** : lecture seule, CTA "Créer un compte"
- **Connecté (PORTAL_USER)** : composer visible, peut publier
- **Publication** : déclenche récompense ZAHAB + incrément réputation
- **Réaction** : toggle — une réaction du même type s'annule
- **Modération** : selon TrustLevel de l'auteur
  - NEWCOMER/MEMBER : post en PENDING, validé par modérateur
  - TRUSTED+ : publication directe (APPROVED immédiat)

### 7.2 Statuts de modération

```
PENDING  → En attente de validation
APPROVED → Publié et visible
REJECTED → Refusé, non visible
FLAGGED  → Signalé, examen en cours
```

### 7.3 Évolutivité

Le feed est conçu pour devenir un réseau social complet :
- `contentBlocks: Json?` prévu pour Rich Text, embeds, polls
- `mediaUrls: Json?` pour images/vidéos multiples
- `viewCount` pour statistiques auteur
- Architecture réactions extensible (types multiples)

---

## 8. Design system — charte GAMAD

### Typographie
- **Inter** — interface utilisateur principale
- **JetBrains Mono** — montants ZAHAB, identifiants techniques

### Palette officielle
| Token | Valeur | Usage |
|---|---|---|
| `--gold` | `#E5C100` | CTA primaire, accents économiques |
| `--blue` | `#1696D2` | Liens, informations, actions |
| `--green` | `#0E9F4B` | Succès, gains, croissance |
| `--navy` | `#071326` | Header, cartes balances, fond profond |
| `--muted` | `#6B7280` | Texte secondaire, labels |
| `--border` | `#E5E7EB` | Séparateurs, bordures subtiles |

### Composants implémentés
- `.btn`, `.btn-primary` (fond Gold), `.btn-navy`, `.btn-outline`, `.btn-ghost`
- `.card` — surface blanche, border-radius 12px, shadow subtile
- `.badge-blue`, `.badge-gold`, `.badge-green`, `.badge-muted`
- `.form-input`, `.form-group`
- `.container` — max-width 1200px, centré

---

## 9. Navigation — règles absolues

### Nav principale
- Logo GAMAD + liens : Accueil, Vision, Services, Blog, Feed, Ressources
- CTA primaire : **"Rejoindre le Réseau"** (Gold)
- Lien secondaire : **"Connexion"** (portail uniquement, JAMAIS hub.gamad.net)
- Si connecté : "Mon compte" → /dashboard

### Mots INTERDITS dans toute la navigation et l'interface
```
CORE, HCG, Zumara, Mouvement, Confrérie, souverain, noyau,
citoyen GAMAD, niveau citoyen, gouvernance interne
```

---

## 10. API backend — modules portail

### 10.1 portal-auth (module NestJS)
```
POST /api/v1/portal/auth/register    Inscription → PORTAL_USER + wallet + réputation
POST /api/v1/portal/auth/login       Connexion → JWT portal
GET  /api/v1/portal/auth/me          Profil utilisateur connecté
POST /api/v1/portal/auth/apply       Soumettre une candidature Réseau
```

### 10.2 portal-feed (module NestJS)
```
GET  /api/v1/portal/feed             Liste posts APPROVED (public, paginé)
POST /api/v1/portal/feed             Créer un post (auth portail)
POST /api/v1/portal/feed/:id/react   Toggle réaction (auth portail)
DELETE /api/v1/portal/feed/:id       Supprimer son post (soft delete)
```

### 10.3 zahab (module NestJS)
```
GET  /api/v1/portal/wallet                  Wallet + réputation + transactions
GET  /api/v1/portal/wallet/transactions     Historique transactions (paginé)
POST /api/v1/portal/wallet/transfer         Transfert entre utilisateurs
```

---

## 11. Prochaines phases

| Phase | Description | Priorité |
|---|---|---|
| **B** | Dashboard créateur — stats blog, revenus ZAHAB par article | Haute |
| **C** | Système de modération — file admin, IA filter, signalements | Haute |
| **D** | Stellar ZAHAB Coin — Anchor setup, conversion Mobile Money | Stratégique |
| **E** | GAMAD Mail, Cloud, Marketplace | Vision long terme |

---

## 12. Relation avec le Core

Le portail **alimente** le Core via le pipeline candidature.
Il ne communique pas directement avec le Core en dehors de cette API.

```
Portal DB (PostgreSQL gamad_portal) ← même instance que Core
Portal Schema : PortalApplication, PortalFeedPost, PortalFeedReaction
ZAHAB Schema  : ZahabWallet, ZahabTransaction, ReputationScore
Core Schema   : GamadId, Account, Profile, Organization, ...
```

L'isolation logique est garantie par les modules NestJS séparés et les guards distincts.
L'isolation physique (DB séparée) est possible en Phase E si la charge le justifie.
