# Prompt 13 — Phase C : Système de Modération

> Objectif : Construire un système de modération robuste pour le portail —
> file de modération, signalements, pénalités de réputation, filtrage de contenu.

---

## Contexte

Le portail a un feed social et un blog actifs. La réputation TrustLevel contrôle déjà
qui peut publier directement. Il manque :
1. Une interface de modération pour les VETERAN/GUARDIAN
2. Un système de signalement par les utilisateurs
3. Des pénalités automatiques sur la réputation
4. Un pipeline de filtrage de contenu (mots interdits, spam, IA future)

---

## Ce que tu dois construire

### A. Backend — NestJS

#### 1. Module `moderation`

```
api/core/src/modules/moderation/
  moderation.controller.ts
  moderation.service.ts
  moderation.repository.ts
  moderation.module.ts
  dto/review-content.dto.ts
  dto/report-content.dto.ts
```

**Endpoints :**
```
GET    /portal/moderation/queue          File d'attente (VETERAN+ only)
POST   /portal/moderation/review/:id    Approuver ou rejeter (VETERAN+)
POST   /portal/feed/:id/report          Signaler un post (auth portail)
POST   /portal/blog/:id/report          Signaler un article (auth portail)
GET    /portal/moderation/reports       Liste signalements (GUARDIAN only)
PUT    /portal/moderation/reports/:id   Traiter un signalement (GUARDIAN)
GET    /portal/moderation/stats         Statistiques modération (GUARDIAN)
```

#### 2. Modèle ContentReport (nouveau)

```prisma
model ContentReport {
  id          String       @id @default(uuid())
  reporterId  String
  contentId   String
  contentType String       // "POST" | "ARTICLE" | "COMMENT"
  reason      ReportReason
  note        String?
  status      ReportStatus @default(PENDING)
  reviewerId  String?
  reviewNote  String?
  createdAt   DateTime     @default(now())
  reviewedAt  DateTime?

  reporter    GamadId      @relation("ReportsMade", fields: [reporterId], references: [id])
  reviewer    GamadId?     @relation("ReportsReviewed", fields: [reviewerId], references: [id])
}

enum ReportReason {
  SPAM
  HATE_SPEECH
  MISINFORMATION
  HARASSMENT
  INAPPROPRIATE_CONTENT
  COPYRIGHT
  OTHER
}

enum ReportStatus {
  PENDING
  UNDER_REVIEW
  VALIDATED     // Le signalement était justifié
  DISMISSED     // Signalement non fondé
}
```

Créer migration : `20260514_moderation_system`

#### 3. Pénalités de réputation (dans zahab.service.ts ou moderation.service.ts)

```typescript
// Signalement validé sur un contenu
onContentReported(authorId: string) {
  // -5 pts réputation à l'auteur
  // Incrémenter totalReported
  // Si totalReported >= 3 : passer en FLAGGED automatiquement
}

// Contenu rejeté par modérateur
onContentRejected(authorId: string) {
  // -10 pts réputation à l'auteur
  // Incrémenter totalFlagged
  // Si score descend en-dessous du seuil : rétrograder TrustLevel
}
```

TrustLevel peut désormais **descendre** suite aux pénalités.

#### 4. Filtrage de contenu (ModerationService)

```typescript
// Vérification synchrone avant publication
async filterContent(text: string): Promise<{ allowed: boolean; reason?: string }> {
  // Phase C : liste noire de mots interdits configurable (table DB ou config)
  // Phase D : appel API IA (Moderation API, Perspective API, ou custom)
}
```

Liste noire initiale configurable via table `ContentFilterRule` :
```prisma
model ContentFilterRule {
  id        String   @id @default(uuid())
  keyword   String   @unique
  severity  String   // BLOCK | FLAG
  createdAt DateTime @default(now())
  createdBy String
}
```

#### 5. Guard VETERAN+ (nouveau)

```typescript
// apps/portal guards
@Injectable()
export class VeteranGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().portalUser;
    return ['VETERAN', 'GUARDIAN'].includes(user?.trustLevel);
  }
}
```

### B. Frontend — apps/portal

#### 1. Page /dashboard/moderation — File de modération

```
apps/portal/app/dashboard/moderation/page.tsx
```

Accessible uniquement si `reputation.trustLevel` est VETERAN ou GUARDIAN.

Sections :
- **Onglet "File d'attente"** : posts PENDING à modérer
  - Pour chaque post : auteur, contenu, date, boutons Approuver / Rejeter
  - Champ note de refus (obligatoire si rejet)
- **Onglet "Signalements"** (GUARDIAN uniquement) : ContentReport PENDING
  - Contenu signalé, raison, nombre de signalements identiques, boutons Traiter
- **Stats** : posts modérés aujourd'hui, taux d'approbation, temps moyen

#### 2. Composant SignalButton

```
apps/portal/components/SignalButton.tsx
```

Petit bouton discret "Signaler" sur chaque post du feed et article du blog.
Si connecté : ouvre une modale avec sélection de raison.
Si non connecté : redirige vers /connexion.

#### 3. Mettre à jour /dashboard/page.tsx

Si `reputation.trustLevel` est VETERAN/GUARDIAN, afficher raccourci :
```typescript
{ icon: '🛡️', label: 'Modération', href: '/dashboard/moderation' },
```

---

## Règles techniques

- La file de modération ne montre que les posts `moderationStatus: PENDING`.
- Un modérateur ne peut pas modérer ses propres posts.
- Un utilisateur ne peut signaler le même contenu qu'une seule fois.
- Les pénalités de réputation sont appliquées immédiatement.
- Le TrustLevel peut descendre (contrairement à Phase A où il ne montait que).
- Toute décision de modération crée un `AuditEvent` dans le Core.
- Le filtre de contenu est appliqué **avant** la création du post (pas après).

---

## Algorithme d'auto-modération

```
Nouveau post soumis
  ├─ filterContent(text) → BLOCK → Refuser immédiatement (status: REJECTED)
  ├─ filterContent(text) → FLAG → status: PENDING (file de modération)
  └─ filterContent(text) → OK
       ├─ auteur NEWCOMER/MEMBER → status: PENDING
       └─ auteur TRUSTED/VETERAN/GUARDIAN → status: APPROVED (direct)
```

---

## Tests manuels

1. Publier un post avec un mot de la liste noire → refus immédiat
2. NEWCOMER publie → post en PENDING
3. VETERAN approve → post passe en APPROVED, auteur notifié
4. Signaler un post → ContentReport créé
5. GUARDIAN traite → pénalité appliquée si validé
6. Vérifier que le score de réputation descend correctement

---

## Critères de succès

- [ ] File de modération fonctionnelle pour VETERAN+
- [ ] Signalements fonctionnels pour tous les utilisateurs
- [ ] Pénalités de réputation appliquées correctement
- [ ] Filtre de mots interdits opérationnel
- [ ] TrustLevel peut descendre suite aux pénalités
- [ ] AuditEvent créé pour chaque décision de modération
