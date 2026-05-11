import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";

export default function ContactPage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Contact" title="Un point d’entrée public pour les demandes utiles.">
        <p>
          Partenariat, compétence, support, information ou autre demande publique peuvent être
          préparés ici.
        </p>
      </PageHero>
      <section className="section narrow">
        <form className="public-form">
          <label>
            Nom
            <input name="name" type="text" autoComplete="name" />
          </label>
          <label>
            Email ou téléphone
            <input name="contact" type="text" autoComplete="email" />
          </label>
          <label>
            Type de demande
            <select name="requestType" defaultValue="information">
              <option value="partenariat">Partenariat</option>
              <option value="competence">Compétence</option>
              <option value="support">Support</option>
              <option value="information">Information</option>
              <option value="autre">Autre</option>
            </select>
          </label>
          <label>
            Sujet
            <input name="subject" type="text" />
          </label>
          <label>
            Message
            <textarea name="message" rows={6} />
          </label>
          <button type="button">Préparer le message</button>
        </form>
      </section>
    </PortalShell>
  );
}
