import Link from "next/link";
import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";

export default function ConnexionPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Connexion" title="Mon compte">
        <p>Accedez a l'espace membre lorsque votre compte est disponible.</p>
      </PageHero>
      <section className="section narrow">
        <div className="access-panel">
          <h2>Connexion</h2>
          <p>Continuer vers l'espace membre GAMAD.</p>
          <Link className="button button-primary" href="https://hub.gamad.net/login">
            Connexion
          </Link>
        </div>
      </section>
    </PortalShell>
  );
}
