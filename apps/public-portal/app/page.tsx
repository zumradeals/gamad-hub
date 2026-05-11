import Link from "next/link";
import { PortalShell } from "../components/portal-shell";
import {
  accountServices,
  connectedServices,
  contributorActions,
  discoveryCards,
  featuredArticles,
  latestPublications,
  moduleShortcuts,
  portalCategories,
  tvCategories,
  tvVideos
} from "../lib/portal-content";

export default function HomePage() {
  const [mainArticle, ...secondaryArticles] = featuredArticles;
  const [mainVideo, ...secondaryVideos] = tvVideos;

  return (
    <PortalShell>
      <nav className="category-strip" aria-label="Catégories d'information">
        {portalCategories.map((category) => (
          <Link key={category} href="/#actualites">
            {category}
          </Link>
        ))}
      </nav>

      <section className="portal-hero" id="recherche">
        <div className="portal-hero-inner">
          <h1>GAMAD</h1>
          <p className="hero-subtitle">Portail d'information, de ressources et de services numériques</p>
          <form className="search-panel" role="search">
            <label className="sr-only" htmlFor="portal-search">
              Rechercher sur GAMAD
            </label>
            <input
              id="portal-search"
              name="q"
              type="search"
              placeholder="Rechercher articles, ressources, services, formations, vidéos, modules"
              autoComplete="off"
            />
            <button type="button">Rechercher</button>
          </form>
          <div className="search-scopes" aria-label="Filtres de recherche">
            <span>Articles</span>
            <span>Ressources</span>
            <span>Services</span>
            <span>Formations</span>
            <span>Vidéos</span>
            <span>Modules</span>
          </div>
          <div className="account-actions">
            <Link href="/rejoindre">Rejoindre GAMAD</Link>
            <Link href="/connexion">Connexion</Link>
            <Link href="/connexion">Mon compte</Link>
          </div>
        </div>
      </section>

      <section className="portal-section">
        <div className="shortcut-grid expanded" aria-label="Raccourcis principaux">
          {moduleShortcuts.map((shortcut) => (
            <Link className="shortcut-card" href={shortcut.href} key={shortcut.label}>
              <span className="shortcut-icon" aria-hidden="true">
                {shortcut.icon}
              </span>
              <span>{shortcut.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="portal-section" id="actualites">
        <div className="section-heading compact">
          <p className="eyebrow">À la une</p>
          <h2>Les sujets utiles du moment</h2>
        </div>
        <div className="featured-grid">
          <article className="featured-main">
            <span className="content-badge">{mainArticle.category}</span>
            <h3>{mainArticle.title}</h3>
            <p>{mainArticle.excerpt}</p>
            <div className="article-meta">
              <span>{mainArticle.author}</span>
              <span>{mainArticle.date}</span>
              <span>{mainArticle.readTime}</span>
            </div>
          </article>
          <div className="featured-side">
            {secondaryArticles.map((article) => (
              <article className="featured-small" key={article.title}>
                <span className="content-badge">{article.category}</span>
                <h3>{article.title}</h3>
                <div className="article-meta">
                  <span>{article.author}</span>
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-section" id="publications">
        <div className="section-heading compact">
          <p className="eyebrow">Dernières publications</p>
          <h2>Articles récents</h2>
        </div>
        <div className="publication-list">
          {latestPublications.map((publication) => (
            <article className="publication-item" key={publication.title}>
              <div>
                <span className="content-badge">{publication.category}</span>
                <h3>{publication.title}</h3>
                <p>{publication.excerpt}</p>
                <div className="article-meta">
                  <span>{publication.author}</span>
                  <span>{publication.date}</span>
                </div>
              </div>
              <Link href="/ressources">Lire</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="portal-section tv-section" id="gamad-tv">
        <div className="section-heading compact">
          <p className="eyebrow">GAMAD TV</p>
          <h2>Vidéos, reportages et formats courts</h2>
        </div>
        <div className="tv-categories" aria-label="Catégories vidéo">
          {tvCategories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
        <div className="tv-layout">
          <article className="video-main">
            <div className="video-frame">
              <span aria-hidden="true">▶</span>
            </div>
            <span className="content-badge">{mainVideo.category}</span>
            <h3>{mainVideo.title}</h3>
            <p>{mainVideo.duration}</p>
          </article>
          <div className="video-list">
            {secondaryVideos.map((video) => (
              <article className="video-thumb" key={video.title}>
                <div className="thumb-frame">
                  <span aria-hidden="true">▶</span>
                </div>
                <div>
                  <span className="content-badge">{video.category}</span>
                  <h3>{video.title}</h3>
                  <p>{video.duration}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-section">
        <div className="section-heading compact">
          <p className="eyebrow">Découvrir</p>
          <h2>Formats longs et ressources à explorer</h2>
        </div>
        <div className="discovery-grid">
          {discoveryCards.map((card) => (
            <article className="discovery-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <Link href="/ressources">Explorer</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="portal-section" id="services-connectes">
        <div className="section-heading compact">
          <p className="eyebrow">Services connectés</p>
          <h2>Modules et services futurs</h2>
        </div>
        <div className="service-status-grid">
          {connectedServices.map((service) => (
            <article className="service-status-card" key={service.name}>
              <h3>{service.name}</h3>
              <span className="status-pill">{service.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="portal-section contributor-section">
        <div>
          <p className="eyebrow">Contributeurs</p>
          <h2>Participer aux contenus du portail</h2>
          <p>
            Les auteurs, rédacteurs et créateurs pourront bientôt publier des contenus et participer
            à l'enrichissement du portail.
          </p>
        </div>
        <div className="contributor-actions">
          {contributorActions.map((action) => (
            <Link href="/rejoindre" key={action}>
              {action}
            </Link>
          ))}
        </div>
      </section>

      <section className="portal-section account-wide">
        <div>
          <p className="eyebrow">Compte unique</p>
          <h2>Un seul compte permettra progressivement d'accéder aux services connectés de l'écosystème GAMAD.</h2>
          <div className="mini-tags">
            {accountServices.map((service) => (
              <span key={service}>{service}</span>
            ))}
          </div>
        </div>
        <div className="account-wide-actions">
          <Link className="button button-primary" href="/rejoindre">
            Rejoindre GAMAD
          </Link>
          <Link className="button button-light" href="/connexion">
            Connexion
          </Link>
        </div>
      </section>
    </PortalShell>
  );
}
