#!/usr/bin/env bash
# ============================================================
# GAMAD HUB — Réorganisation /docs
# À exécuter depuis la racine du dépôt gamad-hub-core
# dans Git Bash (Windows) ou bash (Linux/Mac)
# ============================================================

set -e

echo "=== GAMAD HUB — Réorganisation /docs ==="
echo ""

# ── 1. Créer la nouvelle arborescence ──────────────────────
echo "[1/5] Création des nouveaux dossiers..."

mkdir -p docs/00-foundation
mkdir -p docs/01-core
mkdir -p docs/02-ui
mkdir -p docs/03-ecosystem
mkdir -p docs/04-build
mkdir -p docs/05-repository
mkdir -p docs/06-prompts
mkdir -p docs/deployment
mkdir -p docs/qa
mkdir -p docs/roadmap

echo "      OK"

# ── 2. Déplacer les fichiers existants ─────────────────────
echo "[2/5] Déplacement des fichiers existants..."

# — 00-foundation (anciennement 00-constitution)
if [ -f "docs/00-constitution/constitution-technique-gamad-hub.md" ]; then
  git mv "docs/00-constitution/constitution-technique-gamad-hub.md" \
         "docs/00-foundation/constitution-technique-gamad-hub.md"
fi

# — 01-core : rassembler core-spec + reference-arch + data/permission/event/api/mvp
FILES_TO_CORE=(
  "docs/01-core-specification/gamad-hub-core-specification-v0.1.md"
  "docs/02-reference-architecture/gamad-hub-reference-architecture-v0.1.md"
  "docs/03-data-model/gamad-hub-data-model-v0.1.md"
  "docs/04-permission-model/gamad-hub-permission-model-v0.1.md"
  "docs/05-event-model/gamad-hub-event-model-v0.1.md"
  "docs/06-api-contracts/gamad-hub-api-contracts-v0.1.md"
  "docs/07-mvp-scope/gamad-hub-mvp-scope-v0.1.md"
)
for f in "${FILES_TO_CORE[@]}"; do
  if [ -f "$f" ]; then
    git mv "$f" "docs/01-core/$(basename "$f")"
  fi
done

# — 02-ui : design system + ui foundation + portal IA
FILES_TO_UI=(
  "docs/13-design-system/gamad-design-system-specification-v0.1.md"
  "docs/14-ui-foundation/gamad-ui-foundation-v0.1.md"
)
for f in "${FILES_TO_UI[@]}"; do
  if [ -f "$f" ]; then
    git mv "$f" "docs/02-ui/$(basename "$f")"
  fi
done

# — 03-ecosystem : ecosystem architecture + public portal spec
# (ces fichiers seront créés via placeholder ci-dessous si absents)

# — 04-build : build spec + implementation strategy + tech stack
FILES_TO_BUILD=(
  "docs/08-build-spec/gamad-hub-build-spec-v0.1.md"
  "docs/09-implementation-strategy/gamad-hub-implementation-strategy-v0.1.md"
  "docs/10-tech-stack-decision/gamad-hub-tech-stack-decision-v0.1.md"
)
for f in "${FILES_TO_BUILD[@]}"; do
  if [ -f "$f" ]; then
    git mv "$f" "docs/04-build/$(basename "$f")"
  fi
done

# — 05-repository
if [ -f "docs/11-repository-blueprint/gamad-hub-repository-blueprint-v0.1.md" ]; then
  git mv "docs/11-repository-blueprint/gamad-hub-repository-blueprint-v0.1.md" \
         "docs/05-repository/gamad-hub-repository-blueprint-v0.1.md"
fi

# — 06-prompts
if [ -f "docs/12-prompt-pack/gamad-hub-prompt-pack-v0.1.md" ]; then
  git mv "docs/12-prompt-pack/gamad-hub-prompt-pack-v0.1.md" \
         "docs/06-prompts/gamad-hub-prompt-pack-v0.1.md"
fi

echo "      OK"

# ── 3. Créer les nouveaux documents doctrinaux ─────────────
echo "[3/5] Création des nouveaux documents doctrinaux..."

# — 00-foundation : les 3 nouveaux docs
cat > docs/00-foundation/gamad-civilization-model-v0.1.md << 'PLACEHOLDER'
# GAMAD CIVILIZATION MODEL v0.1
> Doctrine civilisationnelle, structure humaine et architecture numérique de GAMAD

**Statut :** À compléter avec le contenu validé dans la session de conception.

Formation — Travail — Adoration
PLACEHOLDER

cat > docs/00-foundation/gamad-digital-citizenship-model-v0.1.md << 'PLACEHOLDER'
# GAMAD DIGITAL CITIZENSHIP MODEL v0.1
> Citoyenneté numérique, cycle de vie humain et responsabilité dans l'écosystème GAMAD

**Statut :** À compléter avec le contenu validé dans la session de conception.
PLACEHOLDER

cat > docs/00-foundation/gamad-visibility-sovereignty-model-v0.1.md << 'PLACEHOLDER'
# GAMAD VISIBILITY & SOVEREIGNTY MODEL v0.1
> Doctrine de visibilité, discrétion stratégique et souveraineté numérique GAMAD

**Statut :** À compléter avec le contenu validé dans la session de conception.
PLACEHOLDER

# — 02-ui : portal information architecture
cat > docs/02-ui/gamad-public-portal-information-architecture-v0.1.md << 'PLACEHOLDER'
# GAMAD PUBLIC PORTAL INFORMATION ARCHITECTURE v0.1
> Pages, sections, parcours, contenus, accès et transitions vers le CORE

**Statut :** À compléter avec le contenu validé dans la session de conception.
PLACEHOLDER

# — 03-ecosystem : ecosystem architecture + public portal spec
cat > docs/03-ecosystem/gamad-ecosystem-architecture-v0.1.md << 'PLACEHOLDER'
# GAMAD ECOSYSTEM ARCHITECTURE v0.1
> Cartographie opérationnelle de l'écosystème numérique GAMAD

**Statut :** À compléter avec le contenu validé dans la session de conception.
PLACEHOLDER

cat > docs/03-ecosystem/gamad-public-portal-specification-v0.1.md << 'PLACEHOLDER'
# GAMAD PUBLIC PORTAL SPECIFICATION v0.1
> Vision, structure et doctrine du portail public mondial GAMAD

**Statut :** À compléter avec le contenu validé dans la session de conception.
PLACEHOLDER

# — 04-build : public portal design & build (futur)
cat > docs/04-build/gamad-public-portal-design-build-v0.1.md << 'PLACEHOLDER'
# GAMAD PUBLIC PORTAL — Design & Build v0.1
> Prompts et spécifications de construction du portail public

**Statut :** Document futur — à rédiger après stabilisation du CORE.
PLACEHOLDER

echo "      OK"

# ── 4. Supprimer les anciens dossiers devenus vides ────────
echo "[4/5] Nettoyage des anciens dossiers vides..."

OLD_DIRS=(
  "docs/00-constitution"
  "docs/01-core-specification"
  "docs/02-reference-architecture"
  "docs/03-data-model"
  "docs/04-permission-model"
  "docs/05-event-model"
  "docs/06-api-contracts"
  "docs/07-mvp-scope"
  "docs/08-build-spec"
  "docs/09-implementation-strategy"
  "docs/10-tech-stack-decision"
  "docs/11-repository-blueprint"
  "docs/12-prompt-pack"
  "docs/13-design-system"
  "docs/14-ui-foundation"
)

for d in "${OLD_DIRS[@]}"; do
  if [ -d "$d" ] && [ -z "$(ls -A "$d")" ]; then
    rmdir "$d"
    echo "      Supprimé : $d"
  elif [ -d "$d" ]; then
    echo "      ATTENTION : $d n'est pas vide, non supprimé"
    ls "$d"
  fi
done

echo "      OK"

# ── 5. Commit ──────────────────────────────────────────────
echo "[5/5] Commit Git..."

git add .
git commit -m "docs: reorganize documentation architecture — foundation / core / ui / ecosystem / build"

echo ""
echo "=== Réorganisation terminée ==="
echo ""
echo "Structure finale :"
find docs -maxdepth 2 -type f -name "*.md" | sort
echo ""
echo "Pousser avec : git push"
