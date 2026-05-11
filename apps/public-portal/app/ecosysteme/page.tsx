import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";
import { ecosystemAreas } from "../../lib/portal-content";

export default function EcosystemePage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Écosystème" title="Un ensemble public de services, savoirs et projets.">
        <p>
          GAMAD présente ici ses espaces visibles : outils utiles, ressources, collaborations et
          initiatives publiques.
        </p>
      </PageHero>
      <section className="section">
        <div className="card-grid">
          {ecosystemAreas.map((area) => (
            <article className="info-card" key={area}>
              <h2>{area}</h2>
              <p>Une composante publique orientée vers l’utilité, l’accès et la transmission.</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section band">
        <div className="section-heading">
          <p className="eyebrow">GAMAD ID</p>
          <h2>Un identifiant de continuité, de sécurité et d’accès aux avantages de l’écosystème.</h2>
          <p>
            Sa présentation publique reste simple : identité, continuité et lien avec les services
            visibles.
          </p>
        </div>
      </section>
    </PortalShell>
  );
}
