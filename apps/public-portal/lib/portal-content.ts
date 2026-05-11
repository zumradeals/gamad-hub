export const mainNavigation = [
  { href: "/", label: "Accueil", mobile: true },
  { href: "/vision", label: "Vision", mobile: true },
  { href: "/ecosysteme", label: "Écosystème", mobile: false },
  { href: "/services", label: "Services", mobile: true },
  { href: "/transmission", label: "Transmission", mobile: false },
  { href: "/ressources", label: "Ressources", mobile: false },
  { href: "/rejoindre", label: "Rejoindre", mobile: true },
  { href: "/connexion", label: "Connexion", mobile: true }
] as const;

export const pillars = [
  {
    title: "Formation",
    text: "Transmettre les savoirs utiles avec clarté, méthode et responsabilité."
  },
  {
    title: "Travail",
    text: "Organiser les compétences vers des contributions utiles et durables."
  },
  {
    title: "Adoration",
    text: "Relier l’action humaine à la responsabilité, à la dignité et à la continuité."
  }
] as const;

export const ecosystemAreas = [
  "Outils utiles",
  "Services numériques",
  "Savoirs et formations",
  "Projets publics",
  "Collaborations",
  "GAMAD ID"
] as const;

export const serviceCategories = [
  "Communication",
  "Formation",
  "Cloud",
  "Commerce",
  "Santé",
  "Outils professionnels",
  "Projets communautaires"
] as const;

export const resources = [
  "Textes publics officiels",
  "Communiqués",
  "Formations ouvertes",
  "Articles",
  "Guides pratiques",
  "Annonces",
  "Rapports publics"
] as const;
