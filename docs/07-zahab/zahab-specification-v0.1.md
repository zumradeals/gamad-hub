# ZAHAB SPECIFICATION v0.1
> Monnaie civilisationnelle de GAMAD — tokenomics, économie, règles

**Version :** 0.1  
**Statut :** Fondation implémentée  
**Couche :** 07-zahab  
**Date :** 2026-05-14

---

## 0. Qu'est-ce que ZAHAB ?

ZAHAB est la **monnaie officielle et civilisationnelle de l'écosystème GAMAD**.

Son nom évoque l'or (ذَهَب en arabe — *dhahab*, or).

ZAHAB n'est pas une monnaie spéculative. C'est un outil de :
- **Reconnaissance** : rémunérer la contribution réelle
- **Gouvernance économique** : financer les structures internes
- **Inclusion** : permettre les transferts transfrontaliers sans banque
- **Souveraineté** : affranchir GAMAD des systèmes financiers externes

---

## 1. Deux faces de ZAHAB

### 1.1 ZAHAB Points (portail — actuel)
Récompenses internes distribuées automatiquement sur gamad.net.
- Unité de compte interne
- Non convertibles immédiatement
- Stockés dans `ZahabWallet.balance`
- Distribuées via `ZahabService` au fil des actions

### 1.2 ZAHAB Coin (stablecoin — Phase D)
Actif numérique décentralisé émis sur la **blockchain Stellar**.
- Adossé à terme à un actif réel (or de référence GAMAD)
- Convertible via les Anchors Stellar (Mobile Money Afrique, virements SEPA)
- Utilisable pour les cotisations Core, paiements inter-membres, services
- Gouverné par GAMAD — pas spéculatif

---

## 2. Règles de distribution — REWARD_RULES (actuellement implémentées)

```typescript
export const REWARD_RULES: Record<string, number> = {
  REGISTRATION_BONUS: 10,   // Bonus de bienvenue à l'inscription
  CONTENT_PUBLISHED: 5,     // Publication d'un post ou article
  COMMENT_REWARD: 1,        // Commentaire posté
  REACTION_RECEIVED: 0.5,   // Réaction reçue sur un contenu de l'auteur
};
```

### Principe fire-and-forget
Les appels ZAHAB ne bloquent jamais le flux principal :
```typescript
this.zahab.onContentPublished(userId).catch(() => {});
```
Une erreur ZAHAB n'empêche pas la publication du contenu.

### Règles de distribution futures (Phase B)
```
ARTICLE_PUBLISHED:      +20 Z (article blog complet)
ARTICLE_MILESTONE_100:  +10 Z (100 vues)
ARTICLE_MILESTONE_1K:   +50 Z (1 000 vues)
REFERRAL_BONUS:         +25 Z (parrain quand filleul atteint 50 pts)
COTISATION_PAYMENT:     débit selon niveau
```

---

## 3. Système de réputation

### 3.1 Seuils TrustLevel

```typescript
export function computeTrustLevel(score: number): TrustLevel {
  if (score >= 5000) return TrustLevel.GUARDIAN;
  if (score >= 1000) return TrustLevel.VETERAN;
  if (score >= 200)  return TrustLevel.TRUSTED;
  if (score >= 50)   return TrustLevel.MEMBER;
  return TrustLevel.NEWCOMER;
}
```

| Niveau | Seuil | Modération | Pouvoirs |
|---|---|---|---|
| NEWCOMER | 0 pts | Posts soumis à validation | Aucun pouvoir spécial |
| MEMBER | 50 pts | Modération accélérée | — |
| TRUSTED | 200 pts | Publication directe | Bypass modération |
| VETERAN | 1 000 pts | Publication directe | Accès file de modération |
| GUARDIAN | 5 000 pts | Publication directe | Autorité éditoriale complète |

### 3.2 Sources de points de réputation

| Action | Points |
|---|---|
| Publier un contenu | +10 pts |
| Commentaire | +2 pts |
| Réaction reçue | +1 pt |
| Contenu signalé (validé) | -5 pts |
| Contenu rejeté | -10 pts |

### 3.3 Recalcul du TrustLevel
À chaque modification de `ReputationScore`, `trustLevel` est recalculé via `computeTrustLevel()`.
La progression est **unidirectionnelle vers le haut** par défaut.
Un système de dégradation (penalties) peut être activé par les GUARDIAN (Phase C).

---

## 4. Modèle de données ZAHAB

### 4.1 ZahabWallet
```prisma
model ZahabWallet {
  id           String   @id @default(uuid())
  gamadId      String   @unique
  balance      Decimal  @default(0) @db.Decimal(18, 8)
  lockedAmount Decimal  @default(0) @db.Decimal(18, 8)
  totalEarned  Decimal  @default(0) @db.Decimal(18, 8)
  totalSpent   Decimal  @default(0) @db.Decimal(18, 8)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  owner        GamadId  @relation(fields: [gamadId], references: [id])
}
```

### 4.2 ZahabTransaction (append-only)
```prisma
model ZahabTransaction {
  id        String                  @id @default(uuid())
  fromId    String?
  toId      String
  amount    Decimal                 @db.Decimal(18, 8)
  reason    ZahabTransactionReason
  note      String?
  createdAt DateTime                @default(now())
  from      GamadId?                @relation("SentZahab", fields: [fromId], references: [id])
  to        GamadId                 @relation("ReceivedZahab", fields: [toId], references: [id])
}
```

`fromId = null` signifie **émission système GAMAD** (création monétaire).

### 4.3 ReputationScore
```prisma
model ReputationScore {
  id              String     @id @default(uuid())
  gamadId         String     @unique
  score           Int        @default(0)
  contentScore    Int        @default(0)
  engagementScore Int        @default(0)
  trustLevel      TrustLevel @default(NEWCOMER)
  totalPosts      Int        @default(0)
  totalComments   Int        @default(0)
  totalReactions  Int        @default(0)
  totalReported   Int        @default(0)
  totalFlagged    Int        @default(0)
  updatedAt       DateTime   @updatedAt
  owner           GamadId    @relation(fields: [gamadId], references: [id])
}
```

---

## 5. API ZAHAB (implémentée)

### GET /api/v1/portal/wallet
Retourne wallet + réputation + 20 dernières transactions.
```json
{
  "wallet": {
    "balance": 15.50,
    "totalEarned": 16.00,
    "totalSpent": 0.50,
    "lockedAmount": 0
  },
  "reputation": {
    "score": 12,
    "contentScore": 10,
    "engagementScore": 2,
    "trustLevel": "NEWCOMER",
    "totalPosts": 2,
    "totalComments": 1,
    "totalReactions": 3
  },
  "transactions": [...]
}
```

### POST /api/v1/portal/wallet/transfer
```json
{
  "toGamadId": "uuid-du-destinataire",
  "amount": 5.00,
  "note": "Merci pour ton aide !"
}
```
- Vérifie que `balance >= amount`
- Débite l'expéditeur, crédite le destinataire
- Crée deux ZahabTransaction (MANUAL_DEBIT + MANUAL_CREDIT)

---

## 6. Politique monétaire ZAHAB

### 6.1 Principes

1. **Émission contrôlée** : chaque ZAHAB créé correspond à une action réelle documentée.
2. **Pas d'émission arbitraire** : seuls les `REWARD_RULES` et `MANUAL_CREDIT` (opérateur) créent des ZAHAB.
3. **Transparence** : tout ZAHAB est tracé dans ZahabTransaction (append-only).
4. **Pas de destruction** : un débit = un transfert. Rien ne disparaît.

### 6.2 Réserve de valeur (Phase D)

GAMAD maintiendra une réserve couvrant a minima 1:1 les ZAHAB Coin en circulation.
La réserve sera constituée progressivement par :
- Les revenus des services GAMAD
- Les cotisations Core
- Les partenariats institutionnels

L'adossement à l'or est l'objectif à long terme (stablecoin gold-backed).

---

## 7. Roadmap ZAHAB

| Phase | Milestone | Description |
|---|---|---|
| **Actuelle** | Points internes | Wallet, réputation, récompenses automatiques |
| **B** | Créateur | Revenus par article, stats, tableau de bord |
| **C** | Modération | Pénalités, signalements, dégradation réputation |
| **D** | Stellar Coin | Émission token, Anchors, conversion Mobile Money |
| **E** | Gold backing | Réserve de valeur, audit externe, conformité |

---

## 8. Règles absolues ZAHAB

1. **ZahabTransaction est append-only** — jamais modifiée, jamais supprimée.
2. **balance ne peut pas être négatif** — vérification avant tout débit.
3. **Toute création monétaire (fromId = null) est documentée** — reason obligatoire.
4. **Les récompenses ne bloquent pas le flux** — fire-and-forget avec `.catch()`.
5. **Un wallet par GAMAD ID** — créé automatiquement à l'inscription.
6. **ZAHAB Coin sera gouverné par GAMAD** — pas de DAO externe, pas de spéculation.
