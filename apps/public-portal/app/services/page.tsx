import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";
import { serviceCategories } from "../../lib/portal-content";

export default function ServicesPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Services" title="Des services publics présentés avec sobriété.">
        <p>
          Les services GAMAD peuvent être directs, partenaires, hybrides ou satellites discrets.
          Cette page reste volontairement générale.
        </p>
      </PageHero>
      <section className="section">
        <div className="card-grid">
          {serviceCategories.map((category) => (
            <article className="info-card" key={category}>
              <h2>{category}</h2>
              <p>Une catégorie de service destinée à soutenir les usages utiles de l’écosystème.</p>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
