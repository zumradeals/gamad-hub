# Doctrine des Zumara — v2.0

> Version consolidée. Remplace la v0.1.
> Toute implementation technique se base sur ce document.

---

## Definition souveraine

Une Zumara est une **cellule certifiée GAMAD**.

Elle n'est pas un simple groupe.
Elle n'est pas une association ordinaire.
Elle n'est pas un projet informel.

Elle est une unité d'action collective, née d'un objectif validé,
structurée selon les lois GAMAD, opérant sous la marque GAMAD,
et destinée à devenir un satellite autonome de l'écosystème.

---

## Principe fondamental

Une Zumara vit dans le **portail**.

Le Core la gouverne de manière **invisible**.

Les membres d'une Zumara ne savent pas que le Core existe,
sauf ceux que le Core a choisi de révéler.

```
PORTAIL (visible)          CORE (invisible)
─────────────────          ────────────────
Zumara vit ici     ←───── HCG gouverne de là
Membres cotisent           Paramètres configurés
Projets publiés            Validation souveraine
Communauté active          Financement décidé
Formation suivie           Révélation accordée
```

---

## Les visages d'une Zumara

Une Zumara n'a pas de secteur imposé. Elle peut être :

- une agence web ou studio digital ;
- une coopérative agricole ou artisanale ;
- un organisme humanitaire ou social ;
- une école, un centre de formation ;
- un collectif culturel, religieux ou philosophique ;
- une tontine structurée ou un fonds de micro-crédit ;
- une société de transformation de matière première ;
- un laboratoire de recherche communautaire.

Toutes les Zumara suivent les mêmes règles.
Ce qui diffère : l'objectif, la cotisation, les projets.

---

## Nature d'une Zumara

Une Zumara peut être :

- **locale** — ancrée dans un territoire physique ;
- **numérique** — opérant entièrement en ligne ;
- **hybride** — les deux simultanément.

Ces trois formes suivent les mêmes règles d'éligibilité.

---

## Les deux niveaux d'existence

### Niveau 1 — Zumara portail (visible)

Accessible depuis le portail public.
Profil public, membres visibles, projets publiés, cotisation déclarée.
Vise 50 membres minimum pour être considérée établie.

### Niveau 2 — Zumara d'élite (Core, invisible)

N'apparaît nulle part dans le portail.
Composée uniquement de citoyens révélés par le Core.
Peut être la version profonde d'une Zumara portail,
ou une cellule née directement dans le Core sans équivalent portail.
Dialogue direct avec le HCG.
Accès au module Communauté du Core.

---

## Cycle de vie

```
SOUMISE → PRE_VALIDEE → EN_FORMATION → ACTIVE → ETABLIE → SATELLITE
                                                         ↘ ELITE (Core)
```

| Statut | Condition d'entrée |
|---|---|
| `SOUMISE` | Demande de création déposée depuis le portail |
| `PRE_VALIDEE` | HCG valide l'objectif — délai de recrutement lancé |
| `EXPIRÉE` | Délai écoulé sans les 5 dirigeants |
| `EN_FORMATION` | 5 dirigeants recrutés — formation GAMAD en cours |
| `ACTIVE` | 5 dirigeants formés + frais d'activation acquittés |
| `ETABLIE` | 50+ membres actifs |
| `SATELLITE` | Partenariat GAMAD formalisé |
| `ELITE` | Zumara reconnue et promue dans le Core |
| `SUSPENDUE` | Activité interrompue par le HCG |
| `DISSOUTE` | Fermée définitivement |

---

## Structure interne

```
1 Fondateur
├── 4 Co-dirigeants (recrutés dans le délai)
│   Total = 5 Dirigeants (obligatoires pour activation)
└── N Membres (objectif : 50 minimum)
```

### Rôles internes

| Rôle | Description |
|---|---|
| `FONDATEUR` | Initie, porte la vision. Seul autorisé à dissoudre. |
| `DIRIGEANT` | Co-responsable. Vote sur les décisions internes. |
| `MEMBRE` | Participe aux activités. Cotise. |
| `OBSERVATEUR` | Portail uniquement. Pas encore engagé. |

---

## Pipeline de création

### Étape 1 — Soumission (portail)

Tout utilisateur portail peut soumettre une demande de création.

Données requises :
- Nom de la Zumara
- Objectif (description claire)
- Type : locale / numérique / hybride
- Localisation (si locale ou hybride)

### Étape 2 — Pré-validation (Core, HCG)

Le HCG examine l'objectif depuis le Core.
L'objectif est-il pertinent ? aligné avec les valeurs GAMAD ?

- OUI → statut `PRE_VALIDEE` + délai de recrutement lancé (configurable depuis le Core)
- NON → statut `REJETÉE` + note de refus

### Étape 3 — Recrutement des co-dirigeants (portail)

Le fondateur dispose du délai accordé pour recruter 4 co-dirigeants.

Le module Communauté suggère des profils compatibles :
- même localité que le fondateur ;
- formation GAMAD complétée ou en cours ;
- compétences complémentaires à l'objectif déclaré.

Si le délai expire sans 5 personnes → statut `EXPIRÉE`.
La demande peut être résoumise.

### Étape 4 — Formation GAMAD (portail)

Les 5 dirigeants suivent les **100 Chartes de la Loi GAMAD**.

La formation est ouverte à tous les utilisateurs portail,
pas uniquement aux membres d'une Zumara.
Compléter la formation enrichit le profil, augmente la réputation ZAHAB,
et permet d'être suggéré comme co-dirigeant potentiel.

Attestation individuelle délivrée à chaque dirigeant.
Condition non négociable pour l'activation.

### Étape 5 — Activation (portail + ZAHAB)

Paiement des frais d'activation (montant fixe, configurable depuis le Core).
Paiement en ZAHAB via le wallet portail.

Statut → `ACTIVE`.

---

## Paramètres souverains (Core uniquement)

Tous ces paramètres sont configurables exclusivement depuis le Core par le HCG.
Ils ne sont jamais visibles ni publiés sur le portail.

| Paramètre | Description |
|---|---|
| Frais d'activation | Montant fixe en ZAHAB |
| Délai de recrutement | Nombre de jours accordés après pré-validation |
| Membres minimum pour statut ÉTABLIE | Objectif de croissance (défaut : 50) |
| Plancher de cotisation | Montant minimum acceptable |

---

## La cotisation — critère d'éligibilité aux aides

Chaque Zumara déclare elle-même son niveau de cotisation.
Ce n'est pas imposé. C'est proposé par la Zumara.

Règle :

- Zumara sans cotisation active → non éligible aux aides HCG
- Zumara avec cotisation régulière → prioritaire pour le financement communautaire
- Le HCG peut fixer un plancher minimum depuis le Core

La cotisation alimente un **wallet Zumara** en ZAHAB.
Ce wallet est visible du HCG. Pas nécessairement de la communauté.

---

## Le financement GAMAD — en couches

| Couche | Mécanisme | Condition |
|---|---|---|
| Frais d'activation | Paiement unique | Statut ACTIVE |
| Cotisation | Périodique, auto-déclarée | Statut ACTIVE |
| Crowdfunding communautaire | Campagne visible sur le réseau | Pré-validée ou ACTIVE |
| Financement HCG | Subvention ou prêt | ÉTABLIE + formation complète |
| Partenariat Satellite | Négociation formalisée | ÉTABLIE + dossier soumis |

---

## GAMAD comme acteur — les Satellites

Quand une Zumara atteint la maturité économique,
GAMAD peut devenir **partenaire ou actionnaire minoritaire**.

En échange :
- label officiel "Satellite GAMAD" ;
- accès aux ressources du réseau ;
- visibilité dans l'écosystème GAMAD.

La Zumara reste autonome.
Elle porte la marque.
Elle contribue à l'économie GAMAD.
GAMAD reçoit une part de ses bénéfices.

Ce modèle crée un **effet satellite** :
chaque Zumara qui réussit finance les Zumara suivantes.

---

## Zumara — Identité de référence d'une startup GAMAD

Une Zumara certifiée est, dans sa nature profonde, une **startup GAMAD**.

Son nom interne dans le système GAMAD est son **identité de référence** :
traçable, immuable, liée à son GAMAD ID, soumise aux lois souveraines.

Son nom public et commercial est libre.

### Convention de nommage commercial

Une Zumara peut choisir :

- **d'afficher la marque GAMAD** dans son nom commercial :
  `Gamad Restaurant`, `Gamad Immobilier`, `Gamad Informatique`, `Gamad Transport`…
  Ce choix signale l'appartenance à l'écosystème et renforce la marque collective.

- **d'opérer sous un nom propre indépendant** :
  `IKOMA Group`, `Soleil du Sahel`, `Horizon Digital`…
  La Zumara reste certifiée GAMAD en interne sans exposer la marque publiquement.

Il n'y a pas d'obligation. Il y a une opportunité.

Porter le nom GAMAD, c'est revendiquer une identité civilisationnelle.
Ne pas le porter, c'est choisir la discrétion — sans perdre la certification.

> Le Core connaît chaque Zumara par son identité de référence.
> Le monde la connaît par le nom qu'elle a choisi.

---

## Zumara — Hiérarchie vivante

Si GAMAD est une Nation, alors :

```
GAMAD (la Nation)
  └── HCG (le gouvernement souverain)
        └── Département / Organisation (les ministères)
              └── Coordination / Section (les services)
                    └── Zumara (les antennes — régionales et internationales)
                          └── Membres (les citoyens actifs)
```

Une Zumara naît antenne.
Elle grandit, se certifie, se structure.
Elle peut devenir Satellite, puis intégrer une Coordination.
Les plus matures deviennent elles-mêmes des Départements.

La Zumara n'est pas le bas de la pyramide.
Elle en est le **moteur ascendant**.

---

## Zumara — Le carrefour vivant du portail

Le portail GAMAD s'appelle **Zumara** parce qu'il est exactement cela :
le lieu de rassemblement de tous les citoyens,
de tous les groupes,
de toutes les missions.

Ce n'est pas un fil d'actualités.
C'est la **place publique de la Nation GAMAD** —
là où les humains se trouvent, se reconnaissent, s'organisent.

```
LE Zumara (le portail, la nation)        ← espace macro, tout le monde
  └── UNE Zumara (cellule certifiée)     ← espace micro, groupe structuré
        └── LE Core (invisible)          ← espace souverain, les révélés
```

La majuscule fait la distinction :
- **Le Zumara** = la communauté GAMAD dans son ensemble
- **Une Zumara** = une cellule certifiée, une startup GAMAD

---

## Règles fondamentales

1. Toute Zumara possède une identité GAMAD traçable — c'est son nom de référence interne.
2. Son nom commercial est libre — avec ou sans la marque GAMAD.
3. Aucune Zumara ne peut contourner les lois souveraines du Core.
4. La formation GAMAD est une condition non négociable pour l'activation.
5. La cotisation est libre dans sa forme, conditionnelle pour les aides.
6. Le Core peut promouvoir une Zumara au niveau Elite sans notification publique.
7. Toute action critique au sein d'une Zumara produit un AuditEvent.
8. Une Zumara dissoute conserve son historique — la mémoire est permanente.
9. Toute Zumara mûre peut gravir la hiérarchie : antenne → département → organisation.

---

## Finalité

Les Zumara constituent le moteur organique d'évolution de l'écosystème GAMAD.

GAMAD dit : **l'humain dit communauté, composée de groupes pour le développement.**
Ce groupe, c'est la Zumara.
Cette communauté, c'est le Zumara.
Cette civilisation, c'est GAMAD.

Chaque Zumara est une promesse :
un groupe d'humains alignés sur les valeurs GAMAD,
engagés dans une mission commune,
formés selon la Loi GAMAD,
portant un nom qui leur appartient,
et construisant — avec ou sans badge visible —
la civilisation numérique et physique que GAMAD incarne.
