export const mainNavigation = [
  { href: "/", label: "Accueil", mobile: true },
  { href: "/services", label: "Services", mobile: true },
  { href: "/#actualites", label: "Actualités", mobile: true },
  { href: "/ressources", label: "Ressources", mobile: false },
  { href: "/#outils", label: "Outils rapides", mobile: false },
  { href: "/rejoindre", label: "Rejoindre GAMAD", mobile: true },
  { href: "/connexion", label: "Connexion", mobile: true }
] as const;

export const portalCategories = [
  "Religion",
  "Politique",
  "Économie",
  "Science",
  "Technologie",
  "Santé",
  "Éducation",
  "Culture",
  "Sport",
  "Monde",
  "Afrique",
  "Business",
  "Découverte"
] as const;

export const moduleShortcuts = [
  { label: "Recherche", href: "/#recherche", icon: "R" },
  { label: "Actualités", href: "/#actualites", icon: "A" },
  { label: "Ressources", href: "/ressources", icon: "D" },
  { label: "Formations", href: "/ressources", icon: "F" },
  { label: "GAMAD Blog", href: "/#actualites", icon: "B" },
  { label: "GAMAD TV", href: "/#gamad-tv", icon: "TV" },
  { label: "Services numériques", href: "/services", icon: "S" },
  { label: "Opportunités", href: "/#publications", icon: "O" },
  { label: "Projets", href: "/services", icon: "P" },
  { label: "Assistance", href: "/contact", icon: "?" },
  { label: "Communauté", href: "/rejoindre", icon: "C" },
  { label: "Espace membre", href: "/connexion", icon: "M" },
  { label: "GAMAD Mail", href: "/services", icon: "@" },
  { label: "GAMAD Cloud", href: "/services", icon: "☁" }
] as const;

export const featuredArticles = [
  {
    title: "Comprendre les nouveaux usages numériques du quotidien",
    category: "Technologie",
    author: "Équipe GAMAD Blog",
    date: "11 mai 2026",
    readTime: "6 min",
    excerpt:
      "Un dossier pratique pour suivre les usages numériques, les services utiles et les habitudes à adopter."
  },
  {
    title: "Ressources courtes pour apprendre plus vite",
    category: "Éducation",
    author: "Rédaction",
    date: "10 mai 2026",
    readTime: "4 min"
  },
  {
    title: "Repères économiques pour petites activités",
    category: "Business",
    author: "GAMAD Blog",
    date: "9 mai 2026",
    readTime: "5 min"
  },
  {
    title: "Découvrir des outils simples pour mieux s'organiser",
    category: "Découverte",
    author: "Ressources",
    date: "8 mai 2026",
    readTime: "3 min"
  }
] as const;

export const latestPublications = [
  {
    title: "Créer une routine de veille utile",
    category: "Actualités",
    excerpt: "Une méthode simple pour suivre l'information sans se disperser.",
    author: "GAMAD Blog",
    date: "11 mai 2026"
  },
  {
    title: "Les bases d'un espace cloud personnel",
    category: "Services numériques",
    excerpt: "Repères pour classer, sauvegarder et retrouver ses fichiers.",
    author: "Support",
    date: "10 mai 2026"
  },
  {
    title: "Choisir une formation courte adaptée",
    category: "Formations",
    excerpt: "Critères pratiques pour commencer par un contenu court et applicable.",
    author: "Ressources",
    date: "9 mai 2026"
  },
  {
    title: "Comprendre les opportunités locales",
    category: "Afrique",
    excerpt: "Une lecture synthétique des besoins, projets et services émergents.",
    author: "Veille",
    date: "8 mai 2026"
  }
] as const;

export const tvCategories = ["Reportages", "Formations", "Découverte", "Débats", "Culture"] as const;

export const tvVideos = [
  {
    title: "Panorama des services numériques utiles",
    category: "Reportages",
    duration: "12:40"
  },
  {
    title: "Apprendre avec des formats courts",
    category: "Formations",
    duration: "08:15"
  },
  {
    title: "Idées pratiques à explorer cette semaine",
    category: "Découverte",
    duration: "06:30"
  },
  {
    title: "Culture numérique et usages quotidiens",
    category: "Culture",
    duration: "10:05"
  }
] as const;

export const discoveryCards = [
  {
    title: "Dossiers pratiques",
    text: "Des synthèses longues pour comprendre un sujet et passer à l'action."
  },
  {
    title: "Essais",
    text: "Des formats d'analyse pour explorer des idées, tendances et usages."
  },
  {
    title: "Guides",
    text: "Des repères étape par étape pour utiliser les ressources du portail."
  },
  {
    title: "Formations courtes",
    text: "Des contenus rapides pour apprendre une notion ou un outil."
  },
  {
    title: "Ressources publiques",
    text: "Documents, liens et contenus ouverts pour consultation."
  }
] as const;

export const connectedServices = [
  { name: "GAMAD Mail", status: "Bientôt" },
  { name: "GAMAD Cloud", status: "En préparation" },
  { name: "Espace membre", status: "Disponible" },
  { name: "Ressources", status: "Disponible" },
  { name: "Formations", status: "Bientôt" },
  { name: "Projets", status: "En préparation" },
  { name: "Communauté", status: "Bientôt" },
  { name: "Assistance", status: "Disponible" }
] as const;

export const contributorActions = [
  "Publier un article",
  "Proposer un essai",
  "Soumettre une vidéo",
  "Devenir contributeur"
] as const;

export const accountServices = [
  "GAMAD Mail",
  "GAMAD Cloud",
  "Espace membre",
  "Ressources",
  "Formations",
  "Services numériques",
  "Projets",
  "Communauté",
  "Assistance"
] as const;

export const footerColumns = [
  { title: "Actualités", links: ["À la une", "Dernières publications", "Catégories"] },
  { title: "Ressources", links: ["Dossiers", "Guides", "Formations courtes"] },
  { title: "Services", links: ["GAMAD Mail", "GAMAD Cloud", "Services numériques"] },
  { title: "Contributeurs", links: ["Publier", "Proposer", "Soumettre"] },
  { title: "Assistance", links: ["Contact", "Aide", "Support"] },
  { title: "Compte", links: ["Rejoindre GAMAD", "Connexion", "Mon compte"] }
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
  "Articles",
  "Actualités utiles",
  "Ressources pratiques",
  "Dossiers",
  "Formations courtes",
  "Contenus de découverte",
  "Guides pratiques",
  "Annonces utiles"
] as const;
