import Link from "next/link";
import { PortalShell } from "../components/portal-shell";
import { ecosystemAreas, pillars } from "../lib/portal-content";

export default function HomePage() {
  return (
    <PortalShell>
      <section className="home-hero">
        <img
          src="/images/public-portal-hero.png"
          alt=""
          className="hero-image"
          aria-hidden="true"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Portail public GAMAD</p>
          <h1>Formation - Travail - Adoration</h1>
          <p>
            Une infrastructure humaine et numérique au service de la transmission, du travail
            utile et de la continuité.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/ecosysteme">
              Découvrir
            </Link>
            <Link className="button button-secondary" href="/rejoindre">
              Rejoindre
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Fondation publique</p>
          <h2>Trois piliers visibles</h2>
        </div>
        <div className="card-grid three">
          {pillars.map((pillar) => (
            <article className="info-card" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section band">
        <div className="section-heading">
          <p className="eyebrow">Écosystème en bref</p>
          <h2>Des outils, des savoirs, des services et des projets utiles.</h2>
          <p>
            Le portail présente les fruits publics de GAMAD sans exposer les structures internes
            du HUB.
          </p>
        </div>
        <div className="tag-list">
          {ecosystemAreas.map((area) => (
            <span key={area}>{area}</span>
          ))}
        </div>
      </section>

      <section className="section callout">
        <div>
          <p className="eyebrow">Contribution</p>
          <h2>Vous avez une compétence utile ?</h2>
          <p>Contribuez à transmettre, construire ou accompagner.</p>
        </div>
        <Link className="button button-primary" href="/rejoindre">
          Proposer une compétence
        </Link>
      </section>
    </PortalShell>
  );
}
