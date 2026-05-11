import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";

const values = [
  "Développement humain",
  "Transmission du savoir",
  "Responsabilité collective",
  "Continuité",
  "Souveraineté discrète"
] as const;

export default function VisionPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Vision" title="Une infrastructure humaine pour transmettre et construire.">
        <p>
          GAMAD considère chaque être humain comme un potentiel acteur de développement, de
          transmission et de responsabilité.
        </p>
      </PageHero>
      <section className="section">
        <div className="card-grid">
          {values.map((value) => (
            <article className="info-card" key={value}>
              <h2>{value}</h2>
              <p>
                Une orientation publique qui place la dignité, l’utilité et la continuité au
                centre de l’action.
              </p>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
