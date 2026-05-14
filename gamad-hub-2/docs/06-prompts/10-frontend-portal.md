# Prompt 10 — Frontend PORTAIL — G-SEARCH et carrefour universel

> Le portail web est le carrefour universel. G-SEARCH est son identité.
> Voir docs/03-ecosystem/gamad-public-portal-specification-v0.1.md

---

## Ce que tu construis

gamad.net — un portail d'information, de ressources et de services numériques.
L'utilisateur arrive et voit une barre de recherche au centre.
Il ne sait pas qu'il y a un CORE, un HCG, des Zumara.
Il voit juste un service universel utile.

---

## Design obligatoire

```
Fond : #f8f7f4 (blanc cassé très légèrement chaud)
Texte : #1a1a1a
Accent principal : #0f6e56 (teal sombre — CTAs)
Accent secondaire : #854f0b (ambre sombre — liens actifs)
Police display : 'Fraunces' (Google Fonts)
Police corps : 'DM Sans' (Google Fonts)
Base font : 16px, line-height 1.7
```

---

## Page Accueil — /

Structure :
1. Nav sobre en haut : [Logo GAMAD] ... [Blog] [TV] [Services] [Connexion discret]
2. Hero : logo GAMAD centré + barre G-SEARCH large
   - Icône loupe, placeholder "Rechercher articles, formations, services..."
   - Bouton "Rechercher" en teal
   - Pills de catégories sous la barre : Tout · Articles · Vidéos · Formations · Ressources
3. Section "Derniers articles" (3 cartes)
4. Section "GAMAD TV" (3 miniatures vidéo)
5. Section "Formations disponibles" (3 cartes)
6. Section "Services de l'écosystème" (modules avec badges : Disponible / Bientôt / En développement)
7. Footer : liens discrets + "Espace membre" (porte vers le CORE)

---

## G-SEARCH — /recherche?q=&type=

Appelle : GET /api/v1/public/search?q=&type=
Types : all, article, video, formation, resource

Résultats groupés par type.
Chaque résultat : titre, extrait, type badge, date, lien.
Message "Aucun résultat" si vide.
Loading state pendant la recherche.

---

## Blog — /blog et /blog/[slug]

/blog : grille de cartes avec filtres par catégorie
/blog/[slug] : article complet, auteur, date, temps de lecture, catégorie
Navigation "Article suivant / précédent"

---

## Formulaire Rejoindre — /rejoindre

Champs : prénom, nom, email, pays, ville, domaine de compétence, motivation (textarea)
Pas de champs sensibles.
Soumet vers : POST /api/v1/public/apply
Message de confirmation : "Votre candidature a été reçue. Nous vous contacterons prochainement."
Pas de mention de "GAMAD ID", "validation", "niveau".

---

## Connexion — /connexion

Redirect simple vers hub.gamad.net/login
Texte intermédiaire sobre : "Redirection vers votre espace membre..."

---

## Mots INTERDITS dans toute l'interface portail

CORE, HCG, Zumara, Mouvement, Confrérie, souverain, noyau,
niveaux de citoyenneté, doctrine interne, structure hiérarchique.

---

## Commit attendu

```
feat(portal): portail public — G-SEARCH, blog, TV, formulaire candidature
```

Push sur main.
