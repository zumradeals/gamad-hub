import Link from "next/link";
import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";

const steps = [
  "Pourquoi transmettre",
  "Qui peut transmettre",
  "Proposer une compétence",
  "Créer ou rejoindre une cellule de transmission",
  "Être accompagné"
] as const;

export default function TransmissionPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Transmission" title="Tout savoir utile doit pouvoir circuler.">
        <p>
          Le portail public parle de cellules de transmission pour présenter simplement les espaces
          de partage, d’apprentissage et d’accompagnement.
        </p>
      </PageHero>
      <section className="section">
        <div className="timeline">
          {steps.map((step, index) => (
            <article key={step}>
              <span>{index + 1}</span>
              <h2>{step}</h2>
              <p>Une étape publique pour transformer une compétence en contribution utile.</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section callout">
        <div>
          <p className="eyebrow">Compétence utile</p>
          <h2>Proposer une contribution</h2>
        </div>
        <Link className="button button-primary" href="/rejoindre">
          Commencer
        </Link>
      </section>
    </PortalShell>
  );
}
