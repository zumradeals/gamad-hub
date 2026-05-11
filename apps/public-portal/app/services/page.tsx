import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";
import { serviceCategories } from "../../lib/portal-content";

export default function ServicesPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Services" title="Acces aux services numeriques et ressources.">
        <p>
          Les cartes ci-dessous servent de points d'entree vers les modules publics ou satellites
          lorsqu'ils sont disponibles.
        </p>
      </PageHero>
      <section className="section">
        <div className="card-grid">
          {serviceCategories.map((category) => (
            <article className="info-card" key={category}>
              <h2>{category}</h2>
              <p>Une categorie de service presentee comme acces public de portail.</p>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
