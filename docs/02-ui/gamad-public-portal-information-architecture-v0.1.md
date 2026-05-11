# GAMAD PUBLIC PORTAL INFORMATION ARCHITECTURE v0.1
> Pages, sections, parcours, contenus, accès et transitions vers le CORE

**Version :** 0.1  
**Statut :** Architecture officielle  
**Couche :** 02-ui

---

## 0. Objet du document

Ce document définit l'architecture informationnelle du portail public GAMAD. Il précise les pages publiques, les sections visibles, les parcours utilisateurs, les contenus autorisés, les appels à l'action, les transitions vers le CORE et ce qui doit rester discret.

---

## 1. Principe fondamental

> Le portail public GAMAD doit être utile, discret, institutionnel et universel.

Il doit orienter sans exposer.

---

## 2. Structure principale

```
/
├── /                    Accueil
├── /vision              Vision
├── /ecosysteme          Écosystème
├── /services            Services
├── /transmission        Transmission
├── /rejoindre           Rejoindre
├── /ressources          Ressources
├── /contact             Contact
└── /connexion           Accès HUB (discret)
```

---

## 3. Navigation principale

### Desktop
Logo | Vision | Écosystème | Services | Transmission | Ressources | Rejoindre | **Connexion**

### Mobile
Menu compact : Accueil / Vision / Services / Rejoindre / Connexion

---

## 4. Page Accueil `/`

### 4.1 Hero Section
| Élément | Contenu |
|---|---|
| Slogan | Formation — Travail — Adoration |
| Phrase | Une infrastructure humaine et numérique au service de la transmission, du travail utile et de la continuité. |
| CTA 1 | Découvrir |
| CTA 2 | Rejoindre |
| CTA 3 | Connexion (discret, topbar) |

### 4.2 Trois piliers
- **Formation** — transmission du savoir
- **Travail** — contribution utile
- **Adoration** — responsabilité humaine

### 4.3 Écosystème en bref
Aperçu sobre : outils, services, savoirs, communautés, projets. Sans révéler le CORE.

### 4.4 Appel à contribution
> Vous avez une compétence utile ? Contribuez à transmettre, construire ou accompagner.

Bouton : **Proposer une compétence**

---

## 5. Page Vision `/vision`

### Sections
- Mission GAMAD
- Valeurs fondamentales
- Développement humain
- Responsabilité collective
- Continuité et transmission

### Texte public clé
> GAMAD considère chaque être humain comme un potentiel acteur de développement, de transmission et de responsabilité.

---

## 6. Page Écosystème `/ecosysteme`

### Sections
| Section | Contenu |
|---|---|
| Services numériques | Outils utiles |
| Savoirs | Ressources et formations |
| Projets | Initiatives |
| Partenaires | Collaborations |
| GAMAD ID | Identité de continuité |

### Présentation GAMAD ID (public)
> Un identifiant de continuité, de sécurité et d'accès aux avantages de l'écosystème.

Ne pas présenter publiquement comme clé d'accès au noyau souverain.

---

## 7. Page Services `/services`

### Catégories
- Communication
- Formation
- Cloud
- Commerce
- Santé
- Outils professionnels
- Projets communautaires

Un service peut être marqué GAMAD, satellite discret, partenaire ou hybride. La page ne doit pas tout expliquer.

---

## 8. Page Transmission `/transmission`

### Sections
- Pourquoi transmettre
- Qui peut transmettre
- Proposer une compétence
- Créer ou rejoindre une cellule de transmission
- Accompagnement

### Terme public conseillé
Utiliser **cellule de transmission** plutôt que Zumra pour le public général.

---

## 9. Page Rejoindre `/rejoindre`

### Parcours
```
Visiteur
→ propose compétence
→ demande accès
→ candidature
→ validation interne
→ GAMAD ID
→ orientation
```

### Formulaire public initial
Champs :
- Nom, Prénom
- Email / Téléphone
- Pays, Ville
- Compétence principale
- Domaine d'activité
- Motivation (texte libre)
- Disponibilité
- ☑ Accepter les règles de respect mutuel

### Ce qu'on ne demande PAS au premier stade
- Détails doctrinaux sensibles
- Classifications internes
- Niveaux GAMAD
- Informations spirituelles internes

---

## 10. Page Ressources `/ressources`

### Types de contenus
- Textes publics officiels
- Communiqués
- Formations ouvertes
- Articles
- Guides pratiques
- Annonces
- Rapports publics

### Règle
Seuls les contenus classifiés PUBLIC sont visibles ici.

---

## 11. Page Contact `/contact`

### Champs
- Nom, Email/Téléphone
- Sujet, Message
- Type de demande : partenariat / compétence / support / information / autre

---

## 12. Connexion `/connexion`

Position discrète dans la navigation. Texte : **Accès membre** ou **Connexion**. Redirige vers le login du GAMAD HUB CORE.

Éviter publiquement : *Accès CORE souverain*, *Espace interne GAMAD*, etc.

---

## 13. Parcours utilisateurs

### Visiteur simple
```
/ → /services → /ressources → /contact
```

### Contributeur potentiel
```
/ → /transmission → Proposer une compétence → Formulaire
```

### Futur citoyen GAMAD
```
/ → /vision → /rejoindre → Candidature → Validation interne
```

### Membre validé
```
/ → Connexion → GAMAD HUB CORE
```

### Partenaire
```
/ → /ecosysteme → /contact → Partenariat
```

---

## 14. Contenus autorisés publiquement

✅ Mission, valeurs, services, appels à compétence, ressources publiques, contacts, projets publics, vision générale.

---

## 15. Contenus à éviter publiquement

❌ Structure HCG détaillée, mécanismes internes, niveaux spirituels internes, architecture souveraine, secrets organisationnels, relations satellites sensibles, accès CORE profond.

---

## 16. Appels à l'action principaux

| CTA | Page |
|---|---|
| Découvrir l'écosystème | Accueil |
| Proposer une compétence | Accueil / Transmission |
| Rejoindre GAMAD | Accueil / Rejoindre |
| Accès membre | Navigation |
| Nous contacter | Contact |

---

## 17. Architecture visuelle

Le portail public doit être lumineux, respirant, calme, symbolique, mobile-first. Il doit hériter du GAMAD Design System.

---

## 18. Footer

| Colonne | Contenu |
|---|---|
| Navigation | Liens principaux |
| Doctrine | Vision, valeurs |
| Contact | Email, formulaire |
| Accès | Connexion membre |
| Copyright | © GAMAD |

---

## 19. MVP du portail — pages obligatoires

```
/            Accueil
/vision      Vision
/ecosysteme  Écosystème
/transmission Transmission
/rejoindre   Rejoindre
/ressources  Ressources
/contact     Contact
/connexion   Accès membre
```

---

## 20. Pages futures (non MVP)

```
/actualites
/formations
/services/[slug]
/ressources/[slug]
/partenaires
/gamad-id
```

---

## 21. Déclaration finale

> Le portail public GAMAD doit être une porte ouverte, mais pas une salle des archives. Il doit permettre au monde de rencontrer les fruits de GAMAD, sans exposer toutes ses racines.
