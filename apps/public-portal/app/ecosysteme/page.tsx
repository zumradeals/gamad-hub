import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";
import { accountServices } from "../../lib/portal-content";

export default function EcosystemePage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Services connectes" title="Un portail pour acceder aux modules publics.">
        <p>
          Cette page presente des acces simples vers les services, contenus et espaces publics
          disponibles ou en preparation.
        </p>
      </PageHero>
      <section className="section">
        <div className="card-grid">
          {accountServices.map((area) => (
            <article className="info-card" key={area}>
              <h2>{area}</h2>
              <p>Un acces de portail destine a orienter les visiteurs vers le bon espace.</p>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
