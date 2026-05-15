# Roadmap Réseau Social Zumara — PHPFox/LinkedIn GAMAD

> Document stratégique. Mis à jour : 2026-05-15.
> Complémente `future-roadmap.md`. Référence pour toutes les décisions de produit portail.

---

## Vision

Le Zumara (portail gamad.net) est la **place publique de la Nation GAMAD**.

Ce n'est pas un fil d'actualités.
C'est un réseau social sérieux — aussi structuré que LinkedIn,
aussi vivant que PHPFox, aussi souverain que rien d'autre sur le marché.

Chaque module est un service autonome.
Chaque service renforce l'économie ZAHAB.
Chaque interaction produit une trace dans la mémoire GAMAD.

---

## Architecture modulaire

```
Le Zumara (portail)
  ├── Publications        ← fil social (implémenté)
  ├── Groupes             ← annuaire Zumara (implémenté)
  ├── Blog                ← articles long-form rémunérés (implémenté)
  ├── Profil              ← page personnelle publique enrichie
  ├── Pages Pro           ← vitrine officielle d'une Zumara
  ├── Messagerie          ← DM privés entre citoyens
  ├── Annuaire            ← recherche par compétence / pays / Zumara
  ├── Boutique            ← marketplace produits et services (ZAHAB)
  ├── Bibliothèque        ← docs, ressources, livres blancs communautaires
  ├── Formations          ← parcours publics ouverts à tous
  └── TV                  ← vidéos, podcasts, lives (futur)
```

---

## Phases de développement

### Phase Z1 — Réseau social de base (priorité immédiate)

**Profil public enrichi**
- Page `/profil/[publicCode]` visible sans connexion
- Nom, bio, pays, compétences, badges GAMAD
- Zumara(s) d'appartenance (nom commercial, pas l'identité interne)
- Réputation ZAHAB publique (score + niveau TrustLevel)
- Formations complétées + certifications GAMAD
- Publications récentes

**Messagerie privée**
- DM entre deux citoyens connectés
- Chiffrement côté serveur
- Notifications en temps réel (WebSocket ou polling)
- Aucun DM anonyme — identité toujours requise

**Annuaire citoyens**
- Recherche par pays, compétence, Zumara active
- Filtre par TrustLevel (TRUSTED, VETERAN, GUARDIAN uniquement visibles)
- Pas d'email exposé — contact via DM uniquement

---

### Phase Z2 — Pages Pro Zumara

**Page officielle d'une Zumara**
- URL : `/zumara/[slug]` enrichie (déjà existant, à enrichir)
- Section "À propos" avec mission, secteur, équipe
- Section "Projets en cours" — activités publiques de la Zumara
- Section "Offres" — services ou produits proposés
- Bouton "Rejoindre" ou "Contacter"
- Badge certification GAMAD (si ACTIVE / ESTABLISHED / SATELLITE)

**Nom commercial affiché, identité GAMAD interne**
- La page affiche le nom commercial choisi
- Le GAMAD ID de la Zumara n'est jamais exposé publiquement

---

### Phase Z3 — Économie intégrée

**Boutique (Marketplace)**
- Chaque Zumara peut lister des produits ou services
- Transactions en ZAHAB (wallet → wallet)
- Types : produit physique, service, formation, abonnement
- Commission GAMAD sur chaque vente (configurable depuis le Core)
- Historique acheteur/vendeur dans le wallet

**Offres d'emploi / missions**
- Une Zumara publie une offre (CDI, mission, bénévolat, stage)
- Candidature via profil GAMAD (pas de CV externe)
- Réputation ZAHAB + formations comme signal de qualité

---

### Phase Z4 — Bibliothèque communautaire

- Dépôt de documents par les citoyens (PDF, articles, guides)
- Validation par les GUARDIAN avant publication
- Accessible sans connexion (PUBLIC) ou sur connexion (INTERNAL)
- Récompense ZAHAB à la publication (+10 Z pour doc validé)
- Lié aux formations : un document peut être ressource d'un cours

---

### Phase Z5 — TV GAMAD

- Vidéos publiées par les Zumara (tutoriels, présentations, lives)
- Monétisation ZAHAB : vue longue = micro-récompense auteur
- Modération par GUARDIAN
- Lecture sans compte, publication avec compte TRUSTED+

---

## Ce qui ne changera jamais

1. **Le Core reste invisible.** Aucun module Zumara portail ne mentionne le Core.
2. **ZAHAB est la monnaie unique.** Chaque transaction du réseau passe par le wallet.
3. **L'identité de référence est interne.** Seul le nom commercial est public.
4. **La réputation gouverne l'accès.** Plus tu contribues, plus tu peux faire.
5. **La mémoire est permanente.** Un profil supprimé conserve ses traces dans le Core.

---

## Tableau de bord de la roadmap

| Module | Statut | Phase |
|---|---|---|
| Feed social (Publications) | ✅ Implémenté | MVP |
| Annuaire Groupes (Zumara) | ✅ Implémenté | MVP |
| Blog long-form | ✅ Implémenté | MVP |
| Wallet ZAHAB portail | ✅ Implémenté | MVP |
| Module Zumara complet (création, lifecycle) | ✅ Implémenté | Phase 1 |
| Carrefour Zumara (portail unifié) | ✅ Implémenté | Phase 1 |
| Profil public enrichi | 🔲 À faire | Z1 |
| Messagerie privée | 🔲 À faire | Z1 |
| Annuaire citoyens | 🔲 À faire | Z1 |
| Pages Pro Zumara | 🔲 À faire | Z2 |
| Boutique / Marketplace | 🔲 À faire | Z3 |
| Offres d'emploi / missions | 🔲 À faire | Z3 |
| Bibliothèque communautaire | 🔲 À faire | Z4 |
| TV GAMAD | 🔲 À faire | Z5 |
