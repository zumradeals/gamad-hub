import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";
import { resources } from "../../lib/portal-content";

export default function RessourcesPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Ressources" title="Articles, dossiers et contenus utiles.">
        <p>Cette page regroupe les contenus publics issus principalement de GAMAD Blog.</p>
      </PageHero>
      <section className="section">
        <div className="card-grid">
          {resources.map((resource) => (
            <article className="info-card" key={resource}>
              <h2>{resource}</h2>
              <p>Contenu de consultation publique, oriente information, apprentissage ou aide.</p>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
