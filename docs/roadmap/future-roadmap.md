# Roadmap GAMAD HUB 2.0

**Mise à jour :** 2026-05-15  
**Version :** 2.1 — Zumara comme atome civilisationnel + réseau social PHPFox-like

---

## Phases complétées

### Phase 0 — Bootstrap (complété)
- Monorepo npm workspaces (7 workspaces)
- Docker multi-stage + Docker Compose
- Nginx reverse proxy + HTTPS
- Prisma schema étendu

### Phase 1 — Core Backend (complété)
- Module Identity : GAMAD ID, comptes, auth JWT, profils
- Module Organization : HCG, départements, Zumara
- Module Formation : cours, modules, parcours
- Module Communication : threads, posts, messagerie
- Module Activity : projets, tâches, workflows
- Module Knowledge : documents, versions, bibliothèque
- Module Cotisation : paiements, niveaux, statuts
- Module Audit : traces immuables, AuditEvents
- Module Permissions : RBAC, contexte organisationnel
- Endpoints publics (module public) pour le portail

### Phase 2 — Portail Public (complété)
- Refonte complète portail : architecture GAFAM-like (gamad.net)
- Compte universel : inscription portail → PORTAL_USER (GAMAD ID silencieux)
- Auth portail séparée : `PortalJwtGuard`, module `portal-auth`
- Feed social : publications, réactions, modération par réputation
- Pages : Accueil, Vision, Services, Blog, Feed, Ressources, Rejoindre
- Pipeline candidature Réseau : formulaire minimal → PortalApplication → pipeline HCG
- Dashboard : espace compte unifié, raccourcis, statut candidature

### Phase 3 — ZAHAB Economy (complété)
- Wallet ZAHAB : balance, totalEarned, totalSpent, lockedAmount
- Transactions append-only : REGISTRATION_BONUS, CONTENT_PUBLISHED, COMMENT_REWARD, REACTION_RECEIVED
- Système de réputation : TrustLevel (NEWCOMER → GUARDIAN), seuils 0/50/200/1000/5000
- Dashboard wallet : solde, réputation, historique transactions, niveaux de confiance
- Distribution automatique fire-and-forget dans les modules portail
- Décision blockchain : **ZAHAB Coin = Stellar** (Anchors Mobile Money Afrique)
- TON : conservé pour couche notification/bot Telegram uniquement

---

### Phase 4 — Gouvernance Core opérationnelle (complété)

- Module `portal-auth` HCG : gestion des candidatures (review/approve/reject)
- Module `permissions` enrichi : assignation/révocation de rôles
- Frontend Core : login fonctionnel, layout dynamique CitizenContext
- Pages gouvernance : Membres, Organisation, Candidatures (toutes fonctionnelles)
- Modals : créer membre, assigner rôle, créer unité

### Phase 5 — Doctrine Zumara + modules (complété)

- Doctrine consolidée : `zumara-doctrine.md` v2.0, `core-access-doctrine.md`, `identity-doctrine.md`
- Constitution enrichie : Zumara comme atome civilisationnel (articles 8 et 9)
- Modules backend : `zumara`, `portal-zumara`, `revelation` (complets)
- Prisma : ZumaraRequest, ZumaraCell, ZumaraCellMembership, RevelationEvent
- Pages gouvernance Core : Zumara, Révélation
- Pages portail : annuaire /zumara, profil /zumara/[slug], création, dashboard
- Carrefour Zumara : /feed → /zumara (Publications + Groupes unifiés)
- Roadmap réseau social : `docs/roadmap/zumara-social-network-roadmap.md`

---

## Prochaines phases

### Phase 6 — Core Phase 2 (en cours)

**Objectif :** Rendre les 5 pages monde du Core pleinement fonctionnelles.

Périmètre :
- `/discussions` : forums et fils de discussion (créer thread, poster, réagir)
- `/formation` : catalogue, inscription, progression module par module
- `/activities` : projets et tâches (créer, assigner, changer statut)
- `/knowledge` : bibliothèque documents (lister, soumettre, consulter)
- `/cotisation` : statut cotisation, historique paiements, périodes actives

### Phase B — Dashboard Créateur
**Objectif :** Rémunérer les créateurs de contenu long-form sur le portail.

**Prompt :** `docs/06-prompts/12-creator-dashboard.md`

Périmètre :
- Module `portal-blog` : articles long-form distincts du feed
- Récompenses articles : +20 Z publication, +10 Z milestone 100 vues, +50 Z milestone 1K vues
- Page /blog/new : éditeur d'article
- Page /dashboard/creator : KPIs, revenus ZAHAB, liste articles, stats vues
- Page /blog/[slug] : article individuel avec réactions

### Phase C — Système de Modération
**Objectif :** Donner aux VETERAN/GUARDIAN les outils pour gouverner le contenu.

**Prompt :** `docs/06-prompts/13-moderation.md`

Périmètre :
- File de modération : posts PENDING accessibles aux VETERAN+
- Signalements : ContentReport par tout utilisateur
- Pénalités : -5 pts (signalement validé), -10 pts (contenu rejeté)
- TrustLevel peut désormais descendre (rétrogradation)
- Filtre de contenu synchrone (liste noire configurable)
- Interface /dashboard/moderation pour VETERAN/GUARDIAN
- Guard `VeteranGuard` pour les endpoints de modération

### Phase D — Stellar ZAHAB Coin
**Objectif :** Émettre ZAHAB Coin sur Stellar Testnet, préparer la conversion.

**Prompt :** `docs/06-prompts/14-stellar-zahab.md`

Périmètre :
- Installation `@stellar/stellar-sdk`
- Module `stellar` : mint, balance, compte utilisateur
- Module `zahab-conversion` : conversion Points → Coin avec limites par TrustLevel
- `stellar.toml` publié (SEP-1)
- Page /zahab/reserve : transparence réserve
- Section wallet étendue : lier compte Stellar, convertir, historique
- Tests sur Stellar Testnet

---

## Vision long terme

### Phase E — Anchors Mobile Money
- Intégration Anchors Stellar (Cowrie, Tempo, etc.)
- Conversion ZAHAB Coin → Orange Money, MTN MoMo, SEPA
- Flow SEP-24 interactif
- KYC/AML intégré

### Phase F — Écosystème étendu
- GAMAD Mail (messagerie souveraine)
- GAMAD Cloud (stockage chiffré)
- GAMAD Market (marketplace de services)
- GAMAD TV (plateforme vidéo)

### Phase G — Gold Backing
- Réserve ZAHAB certifiée (or physique ou PAXG)
- Audit externe annuel
- Attestation publique
- Couverture progressive : 10% → 50% → 100%

### Phase H — Infrastructure distribuée
- Nœuds Stellar GAMAD propres
- Infrastructure souveraine décentralisée
- Gouvernance on-chain pour ZAHAB Coin

---

## Principes de développement permanents

1. **Le backend est l'autorité.** Jamais le frontend ne décide des permissions.
2. **Append-only pour l'économie et l'audit.** ZahabTransaction + AuditEvent : jamais modifiés.
3. **Le Core reste invisible depuis le portail.** Zéro lien direct, zéro mot interdit.
4. **Mobile-first.** Connexion faible, Afrique en priorité.
5. **ZAHAB n'est pas spéculatif.** Chaque unité correspond à une contribution réelle.
6. **Souveraineté totale.** GAMAD contrôle son infrastructure, ses clés, ses règles.
