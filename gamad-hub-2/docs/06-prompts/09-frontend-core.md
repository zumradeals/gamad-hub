# Prompt 09 — Frontend CORE — Monde vivant

> Le CORE n'est pas un dashboard. C'est un monde.
> Chaque citoyen entre dans son espace, voit sa place, agit.

---

## Design obligatoire

```
Fond : #0d1117 (très sombre, presque noir)
Sidebar : #0a0e1a (légèrement plus sombre)
Cartes/panels : #111827
Texte principal : #e5e7eb
Texte secondaire : #9ca3af
Accent GAMAD ID : #f59e0b (ambre — c'est une existence)
Niveau PENDING : #60a5fa (bleu clair)
Niveau ACTIVE : #34d399 (teal vert)
Niveau RESPONSABLE : #f59e0b (ambre)
Niveau HCG : #a78bfa (violet)
Police : 'IBM Plex Sans' (Google Fonts)
```

---

## Page Login — /(auth)/login

- Fond sombre, centré
- Logo GAMAD textuel sobre, en grand
- Champ email + mot de passe
- Bouton "Entrer dans l'espace" (pas "Se connecter")
- Pas de lien "S'inscrire" — l'accès se fait via le portail public
- Après login : stocker token dans localStorage('gamadToken')
  et citizenContext dans localStorage('gamadCitizen')
  Rediriger vers /(world)/home

---

## Layout monde — /(world)/layout.tsx

Sidebar gauche fixe (240px) :
- En haut : GAMAD ID public en ambre + badge niveau coloré
- Navigation contextuelle (icônes + labels) :
  - Accueil
  - Mon Identité
  - Ma Zumara (si ACTIVE+)
  - Discussions
  - Formation
  - Activités
  - Bibliothèque
  - Cotisation
  - [Gouvernance] (si RESPONSABLE+, séparateur visuel)
- En bas : bouton Déconnexion

---

## Page Accueil — /(world)/home

Ce n'est PAS un tableau de bord avec des chiffres.
C'est l'espace d'entrée dans le monde.

Sections :
1. Salutation : "Bienvenue, [displayName]" + description du niveau
2. Son GAMAD ID en grand (typographie distincte, couleur ambre)
3. Ses Zumara actives (badges avec domaine)
4. Ses activités en cours (3 max, avec statut coloré)
5. Dernières annonces non lues (3 max)
6. Dernières discussions de ses structures (3 max)

---

## Page Mon Identité — /(world)/identity

- GAMAD ID public affiché en grand (fonte 32px, couleur ambre)
- Badge statut coloré selon niveau
- Informations profil éditables (formulaire inline)
- Liste des structures d'appartenance avec rôle
- Historique des 10 dernières actions (depuis audit)

---

## Page Ma Zumara — /(world)/my-zumara

Si pas de Zumara : message d'invitation, explication de ce qu'est une Zumara.

Si Zumara active :
- Nom + mission + domaine d'activité (badge distinct)
- Membres de la Zumara (liste avec profils cliquables)
- Activités de la Zumara
- Documents produits (classification visible)
- Fil de discussion privé (threads de scope ZUMARA)
- Annonces internes

---

## Commit attendu

```
feat(frontend-core): monde vivant — layout, identité, home, zumara
```

Push sur main.
