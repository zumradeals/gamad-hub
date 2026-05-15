# Zumara — Modèle technique de cycle de vie v0.1

> Document technique. Base pour l'implémentation du module Zumara.
> À lire après `docs/00-civilization/zumara-doctrine.md`.

---

## Schéma de données — extensions au modèle existant

### Entité `ZumaraRequest` (portail — demande de création)

```prisma
model ZumaraRequest {
  id             String              @id @default(uuid())
  gamadId        String              // Fondateur (PORTAL_USER)
  name           String
  objective      String              @db.Text
  type           ZumaraType          // LOCAL | DIGITAL | HYBRID
  country        String?
  city           String?
  status         ZumaraRequestStatus @default(SUBMITTED)
  reviewNote     String?             // Note HCG (non publiée)
  reviewedBy     String?             // gamadId HCG
  reviewedAt     DateTime?
  deadline       DateTime?           // Date limite recrutement
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt

  founders       ZumaraFounder[]     // Les 5 co-dirigeants
  zumara         Zumara?             // Lien vers la Zumara créée si approuvée
}

enum ZumaraType {
  LOCAL
  DIGITAL
  HYBRID
}

enum ZumaraRequestStatus {
  SUBMITTED       // Soumise, en attente HCG
  PRE_VALIDATED   // Objectif approuvé, délai lancé
  IN_FORMATION    // 5 dirigeants recrutés, formation en cours
  ACTIVE          // Zumara créée et activée
  REJECTED        // Refusée par HCG
  EXPIRED         // Délai expiré sans les 5 dirigeants
}
```

### Entité `ZumaraFounder` (co-dirigeants en attente)

```prisma
model ZumaraFounder {
  id         String         @id @default(uuid())
  requestId  String
  gamadId    String?        // Lié si compte portail existant
  email      String         // Pour invitation si pas encore inscrit
  role       FounderRole    @default(CO_FOUNDER)
  joinedAt   DateTime       @default(now())
  trained    Boolean        @default(false)  // Formation GAMAD complétée

  request    ZumaraRequest  @relation(fields: [requestId], references: [id])
}

enum FounderRole {
  FOUNDER       // Le créateur original
  CO_FOUNDER    // Les 4 co-dirigeants recrutés
}
```

### Entité `Zumara` (Zumara créée et active)

```prisma
model Zumara {
  id              String         @id @default(uuid())
  requestId       String         @unique
  organizationUnitId String?     // Lien vers OrganizationUnit (si Core)
  name            String
  slug            String         @unique
  objective       String         @db.Text
  type            ZumaraType
  country         String?
  city            String?
  status          ZumaraStatus   @default(ACTIVE)
  level           ZumaraLevel    @default(ACTIVE)
  visibility      ZumaraVisibility @default(PUBLIC)
  memberCount     Int            @default(0)
  walletBalance   Decimal        @default(0) @db.Decimal(18, 8)
  cotisationAmount Decimal?      @db.Decimal(18, 8)
  cotisationPeriod String?       // MONTHLY | QUARTERLY | ANNUAL
  activatedAt     DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  request         ZumaraRequest  @relation(fields: [requestId], references: [id])
  memberships     ZumaraMembership[]
  projects        ZumaraProject[]
  transactions    ZumaraTransaction[]
  campaigns       ZumaraFundingCampaign[]
}

enum ZumaraStatus {
  ACTIVE
  ESTABLISHED   // 50+ membres
  SATELLITE     // Partenariat GAMAD
  ELITE         // Promue dans le Core (invisible portail)
  SUSPENDED
  DISSOLVED
}

enum ZumaraLevel {
  ACTIVE        // Opérationnelle
  ESTABLISHED   // 50+ membres
  SATELLITE     // Partenariat formalisé
  ELITE         // Niveau Core
}

enum ZumaraVisibility {
  PUBLIC        // Visible sur le portail
  INTERNAL      // Visible aux membres seulement
  CORE          // Invisible portail — Core uniquement
}
```

### Entité `ZumaraMembership` (appartenance)

```prisma
model ZumaraMembership {
  id         String           @id @default(uuid())
  zumaraId   String
  gamadId    String
  role       ZumaraMemberRole @default(MEMBER)
  status     MembershipStatus @default(ACTIVE)
  joinedAt   DateTime         @default(now())
  leftAt     DateTime?

  zumara     Zumara           @relation(fields: [zumaraId], references: [id])
  gamad      GamadId          @relation(fields: [gamadId], references: [id])

  @@unique([zumaraId, gamadId])
}

enum ZumaraMemberRole {
  FOUNDER
  CO_FOUNDER
  MEMBER
  OBSERVER
}
```

### Entité `RevelationEvent` (accès Core — append-only)

```prisma
model RevelationEvent {
  id         String          @id @default(uuid())
  gamadId    String          // Citoyen révélé
  path       RevelationPath  // Comment
  actorId    String?         // Qui a décidé (null si système)
  note       String?         // Contexte interne
  grantedAt  DateTime        @default(now())

  gamad      GamadId         @relation(fields: [gamadId], references: [id])
}

enum RevelationPath {
  DIRECT      // Invitation HCG directe
  THRESHOLD   // Seuil algorithmique atteint
  SPONSORED   // Parrainage citoyen Core
  CHOSEN      // Choix souverain (élu ignorant)
}
```

---

## Statuts GamadId — extensions

```prisma
// Ajout à l'enum IdentityStatus existant
enum IdentityStatus {
  PORTAL_USER    // Compte portail standard
  PENDING        // En attente activation Core
  ACTIVE         // Citoyen Core actif
  MISSIONARY     // Renvoyé au portail après séjour Core
  ILLUMINATED    // Accès Zumara d'élite Core
  LIMITED
  SUSPENDED
  ARCHIVED
  BANNED
}
```

---

## Endpoints API — module Zumara portail

### Publics (portail)

```
POST   /portal/zumara/requests              Soumettre une demande
GET    /portal/zumara/requests/:id          Statut de ma demande
POST   /portal/zumara/requests/:id/invite   Inviter un co-dirigeant
GET    /portal/zumara                       Liste des Zumara publiques
GET    /portal/zumara/:slug                 Profil public d'une Zumara
POST   /portal/zumara/:id/join              Demander à rejoindre
```

### HCG (Core — PermissionGuard)

```
GET    /zumara/requests                     Toutes les demandes
POST   /zumara/requests/:id/pre-validate    Pré-valider avec délai
POST   /zumara/requests/:id/reject          Rejeter
POST   /zumara/requests/:id/activate        Activer manuellement
GET    /zumara                              Toutes les Zumara
PATCH  /zumara/:id                          Modifier paramètres
POST   /zumara/:id/suspend                  Suspendre
POST   /zumara/:id/promote-elite            Promouvoir niveau Core
```

### Système (Core — révélation)

```
GET    /revelation/events                   Historique des révélations
POST   /revelation/grant                    Accorder accès Core (HCG)
POST   /revelation/sponsor                  Parrainer (citoyen Core)
```

---

## Paramètres souverains configurables (Core)

```typescript
interface ZumaraSystemConfig {
  activationFeeZahab: number;       // Frais d'activation (ZAHAB)
  recruitmentDeadlineDays: number;  // Délai de recrutement (jours)
  minFounders: number;              // Minimum dirigeants (défaut: 5)
  establishedThreshold: number;     // Membres pour statut ÉTABLIE (défaut: 50)
  cotisationMinimum: number;        // Plancher cotisation (ZAHAB)
}
```

---

## Règles métier critiques

1. **Un PORTAL_USER peut soumettre une demande** sans avoir de GAMAD ID activé.
2. **Le délai de recrutement** commence à la pré-validation, pas à la soumission.
3. **Si le délai expire** : statut `EXPIRED`. Le fondateur peut réinitialiser et resoumettre.
4. **Les 5 dirigeants doivent compléter la formation** avant le paiement d'activation.
5. **Le paiement d'activation** se fait en ZAHAB depuis le wallet portail du fondateur.
6. **La cotisation** est auto-déclarée par la Zumara. Non négociée par le HCG sauf plancher.
7. **Promouvoir une Zumara en Elite** change sa visibilité à `CORE`. Elle disparaît du portail.
8. **Un RevelationEvent est immuable**. Jamais modifié, jamais supprimé.
9. **Tout changement de statut Zumara produit un AuditEvent**.
10. **Le wallet Zumara** est crédité/débité uniquement via les transactions ZAHAB.

---

## Intégration module Communauté (suggestion intelligente)

Quand une Zumara est en statut `PRE_VALIDATED`,
le module Communauté peut suggérer des co-dirigeants potentiels.

Critères de suggestion :
- même pays/ville que le fondateur ;
- formation GAMAD complétée ou en cours ;
- pas déjà dirigeant dans 3 Zumara actives ou plus ;
- réputation ZAHAB au-dessus du seuil moyen ;
- domaine de compétence complémentaire à l'objectif de la Zumara.

La suggestion est une aide, jamais une obligation.

---

## Intégration ZAHAB

| Événement | Montant | Sens |
|---|---|---|
| Activation Zumara | `activationFeeZahab` (config) | Fondateur → Treasury GAMAD |
| Cotisation mensuelle | Déclarée par Zumara | Membres → Wallet Zumara |
| Campagne crowdfunding | Variable | Communauté → Wallet Zumara |
| Aide HCG | Variable | Treasury GAMAD → Wallet Zumara |
| Commission campagne | % configurable | Wallet Zumara → Treasury GAMAD |

---

## Modules à développer (ordre suggéré)

| Ordre | Module | Priorité |
|---|---|---|
| 1 | `zumara` (API Core) | Critique |
| 2 | `portal-zumara` (endpoints portail) | Critique |
| 3 | `revelation` (accès Core) | Haute |
| 4 | Module Communauté — Zumara feed | Haute |
| 5 | Campagnes de financement | Moyenne |
| 6 | Satellite / partenariat GAMAD | Long terme |
