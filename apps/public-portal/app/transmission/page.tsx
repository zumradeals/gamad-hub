import Link from "next/link";
import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";

const steps = [
  "Trouver un article",
  "Lire un dossier",
  "Ouvrir une ressource",
  "Suivre une formation courte",
  "Contacter l'assistance"
] as const;

export default function TransmissionPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Guides" title="Parcours rapides vers les contenus utiles.">
        <p>
          Cette page oriente les visiteurs vers les articles, ressources et formats courts publies
          sur le portail.
        </p>
      </PageHero>
      <section className="section">
        <div className="timeline">
          {steps.map((step, index) => (
            <article key={step}>
              <span>{index + 1}</span>
              <h2>{step}</h2>
              <p>Un acces simple pour consulter le contenu ou le service correspondant.</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section callout">
        <div>
          <p className="eyebrow">Ressources</p>
          <h2>Explorer les contenus publics</h2>
        </div>
        <Link className="button button-primary" href="/ressources">
          Ouvrir les ressources
        </Link>
      </section>
    </PortalShell>
  );
}
