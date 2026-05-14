# Prompt 12 — Phase B : Dashboard Créateur

> Objectif : Donner aux auteurs du portail un tableau de bord complet pour suivre leurs revenus ZAHAB,
> leurs statistiques de contenu et gérer leurs articles de blog.

---

## Contexte

Le portail GAMAD a un feed social fonctionnel et une économie ZAHAB active.
Les utilisateurs gagnent des ZAHAB en publiant. Il manque :
1. Un espace blog structuré (article long-form vs post court)
2. Un tableau de bord pour les créateurs (stats, revenus, performances)
3. Des incitations à produire du contenu de qualité

---

## Ce que tu dois construire

### A. Backend — NestJS

#### 1. Nouveau module `portal-blog`

```
api/core/src/modules/portal-blog/
  portal-blog.controller.ts
  portal-blog.service.ts
  portal-blog.repository.ts
  portal-blog.module.ts
  dto/create-article.dto.ts
  dto/update-article.dto.ts
```

**Endpoints à créer :**
```
GET  /portal/blog                   Articles publiés (public, paginé, sort: recent/popular)
GET  /portal/blog/:slug             Article individuel (incrémente viewCount)
POST /portal/blog                   Créer brouillon (auth portail)
PUT  /portal/blog/:id               Modifier article (auteur uniquement)
DELETE /portal/blog/:id             Supprimer (soft delete)
POST /portal/blog/:id/publish       Soumettre à publication
GET  /portal/blog/me/articles       Mes articles + stats (auth portail)
GET  /portal/blog/me/stats          Dashboard créateur — revenus, vues, réactions totaux
```

#### 2. Nouvelles récompenses ZAHAB (dans zahab.service.ts)

```typescript
// Ajouter dans REWARD_RULES :
ARTICLE_PUBLISHED: 20,        // Article blog approuvé
ARTICLE_MILESTONE_100: 10,    // 100 vues atteintes
ARTICLE_MILESTONE_1K: 50,     // 1 000 vues atteintes
```

Logique milestone : vérifier dans `incrementViewCount()` si un palier est franchi.

#### 3. Schéma Prisma — Article étendu

L'entité `Article` existe déjà. Vérifier et compléter avec :
```prisma
model Article {
  // Champs existants...
  authorId         String?
  moderationStatus ModerationStatus @default(PENDING)
  zahabRewarded    Boolean          @default(false)
  viewCount        Int              @default(0)
  contentBlocks    Json?
  milestone100     Boolean          @default(false)
  milestone1k      Boolean          @default(false)
  publishedAt      DateTime?
}
```

Créer une migration : `20260514_article_creator_features`

### B. Frontend — apps/portal

#### 1. Page /blog/new — Éditeur d'article

```
apps/portal/app/blog/new/page.tsx
```

Composants :
- Champ titre (input text)
- Champ slug (auto-généré depuis titre, éditable)
- Éditeur texte (textarea pour l'instant, extensible vers TipTap Phase C)
- Sélection catégorie (tags)
- Boutons : "Enregistrer brouillon" / "Soumettre pour publication"
- Message d'attente si NEWCOMER/MEMBER (modération)

Auth requise : redirection /connexion si non connecté.

#### 2. Page /dashboard/creator — Tableau de bord créateur

```
apps/portal/app/dashboard/creator/page.tsx
```

Sections :
- **KPI cards** (4 cartes) :
  - Total ZAHAB gagné (via articles)
  - Total vues cumulées
  - Nombre d'articles publiés
  - Ratio vues/article moyen
- **Graphique tendance** (simple — pas de lib externe pour l'instant, barres CSS)
- **Liste mes articles** : titre, vues, réactions, statut modération, ZAHAB gagné, date
- **Jalons prochains** : "X vues pour atteindre le prochain palier ZAHAB"

#### 3. Mettre à jour /dashboard/page.tsx

Ajouter raccourci "Dashboard Créateur" dans la grille SHORTCUTS :
```typescript
{ icon: '✍️', label: 'Espace Créateur', href: '/dashboard/creator' },
```

#### 4. Page /blog/[slug]/page.tsx

Créer la page d'article individuelle :
- Titre, auteur, date de publication
- Corps de l'article (paragraphes)
- Nombre de vues (affiché)
- Section réactions (reprendre le système du feed)
- CTA "Écrire un article" en bas de page

---

## Règles techniques

- Toutes les nouvelles routes portail utilisent `PortalJwtGuard` pour les endpoints authentifiés.
- Le module `portal-blog` s'importe `ZahabModule` pour distribuer les récompenses.
- La récompense article est fire-and-forget (`.catch(() => {})`).
- `viewCount` est incrémenté sans auth (endpoint public).
- Les milestones ne sont déclenchés qu'une fois (`milestone100`, `milestone1k` boolean).
- Un article ne peut être publié que par son auteur.
- La suppression est un soft delete (`status: DELETED`, pas de suppression physique).

---

## Tests manuels à effectuer

1. Créer un article → statut PENDING si NEWCOMER
2. Approuver via admin (direct DB ou endpoint admin si existant) → +20 Z crédités
3. Consulter /dashboard/creator → KPIs corrects
4. Incrémenter viewCount 100 fois (script) → +10 Z milestone
5. Vérifier que ZahabTransaction est bien créé à chaque récompense

---

## Critères de succès

- [ ] Articles créés et affichés sur /blog
- [ ] Récompenses ZAHAB distribuées automatiquement
- [ ] Dashboard créateur affiche les bonnes stats
- [ ] Milestones 100/1K vues fonctionnels
- [ ] Aucun lien vers le Core dans les nouvelles pages
