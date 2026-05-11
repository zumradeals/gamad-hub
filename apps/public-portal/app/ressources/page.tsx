import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";
import { resources } from "../../lib/portal-content";

export default function RessourcesPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Ressources" title="Des contenus publics, classifiés pour une diffusion ouverte.">
        <p>
          Cette page ne présente que des ressources destinées à la consultation publique.
        </p>
      </PageHero>
      <section className="section">
        <div className="card-grid">
          {resources.map((resource) => (
            <article className="info-card" key={resource}>
              <h2>{resource}</h2>
              <p>Contenu visible uniquement lorsqu’il est classifié PUBLIC.</p>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
