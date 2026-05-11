import Link from "next/link";
import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";

export default function ConnexionPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Accès membre" title="Connexion">
        <p>
          Cet accès est réservé aux membres validés. Le portail public conserve ici une transition
          simple et discrète vers le HUB.
        </p>
      </PageHero>
      <section className="section narrow">
        <div className="access-panel">
          <h2>Accès HUB</h2>
          <p>Continuer vers l’espace membre GAMAD HUB.</p>
          <Link className="button button-primary" href="/login">
            Accès membre
          </Link>
        </div>
      </section>
    </PortalShell>
  );
}
