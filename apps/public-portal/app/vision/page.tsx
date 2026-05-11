import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";

const values = [
  "Information utile",
  "Ressources accessibles",
  "Services numeriques",
  "Apprentissage",
  "Aide aux utilisateurs"
] as const;

export default function VisionPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="A propos" title="Un portail simple pour trouver ce qui est utile.">
        <p>
          GAMAD met en avant des contenus, des ressources et des services avec une navigation claire
          et directe.
        </p>
      </PageHero>
      <section className="section">
        <div className="card-grid">
          {values.map((value) => (
            <article className="info-card" key={value}>
              <h2>{value}</h2>
              <p>Une rubrique publique pensee pour consulter, rechercher et acceder rapidement.</p>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
