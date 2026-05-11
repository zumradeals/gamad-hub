import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";

const path = [
  "Creer une demande",
  "Indiquer un contact",
  "Choisir les services d'interet",
  "Recevoir une reponse",
  "Activer mon compte"
] as const;

export default function RejoindrePage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Rejoindre GAMAD" title="Creer une demande d'acces.">
        <p>
          Le formulaire public prepare une prise de contact simple pour acceder progressivement aux
          services disponibles.
        </p>
      </PageHero>
      <section className="section split">
        <div>
          <h2>Parcours public</h2>
          <ol className="ordered-list">
            {path.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <form className="public-form">
          <label>
            Nom
            <input name="lastName" type="text" autoComplete="family-name" />
          </label>
          <label>
            Prenom
            <input name="firstName" type="text" autoComplete="given-name" />
          </label>
          <label>
            Email ou telephone
            <input name="contact" type="text" autoComplete="email" />
          </label>
          <label>
            Pays
            <input name="country" type="text" autoComplete="country-name" />
          </label>
          <label>
            Ville
            <input name="city" type="text" autoComplete="address-level2" />
          </label>
          <label>
            Service souhaite
            <input name="service" type="text" />
          </label>
          <label>
            Message
            <textarea name="message" rows={5} />
          </label>
          <label className="checkbox-line">
            <input name="respect" type="checkbox" />
            <span>Accepter les regles d'utilisation du portail</span>
          </label>
          <button type="button">Preparer la demande</button>
        </form>
      </section>
    </PortalShell>
  );
}
