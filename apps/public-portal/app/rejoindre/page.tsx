import { PageHero } from "../../components/page-hero";
import { PortalShell } from "../../components/portal-shell";

const path = [
  "Proposer une compétence",
  "Demander un accès",
  "Candidature",
  "Validation interne",
  "GAMAD ID",
  "Orientation"
] as const;

export default function RejoindrePage() {
  return (
    <PortalShell>
      <PageHero eyebrow="Rejoindre" title="Un parcours progressif pour contribuer avec clarté.">
        <p>
          La première étape reste simple et publique. Les informations sensibles ou internes ne
          sont pas demandées ici.
        </p>
      </PageHero>
      <section className="section split">
        <div>
          <h2>Parcours public initial</h2>
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
            Prénom
            <input name="firstName" type="text" autoComplete="given-name" />
          </label>
          <label>
            Email ou téléphone
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
            Compétence principale
            <input name="skill" type="text" />
          </label>
          <label>
            Domaine d’activité
            <input name="domain" type="text" />
          </label>
          <label>
            Motivation
            <textarea name="motivation" rows={5} />
          </label>
          <label>
            Disponibilité
            <input name="availability" type="text" />
          </label>
          <label className="checkbox-line">
            <input name="respect" type="checkbox" />
            <span>Accepter les règles de respect mutuel</span>
          </label>
          <button type="button">Préparer la demande</button>
        </form>
      </section>
    </PortalShell>
  );
}
