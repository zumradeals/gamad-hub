import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';

const VALUES = [
  { icon: '🌍', title: 'Universalité', desc: 'GAMAD considère chaque être humain comme un potentiel acteur de développement, de transmission et de responsabilité.' },
  { icon: '📖', title: 'Transmission', desc: 'Tout savoir utile mérite d\'être partagé, structuré, et transmis aux générations suivantes.' },
  { icon: '⚖️', title: 'Responsabilité', desc: 'Chaque contribution, chaque action, chaque ressource produite engage la responsabilité de son auteur.' },
  { icon: '🔗', title: 'Continuité', desc: 'L\'écosystème GAMAD est construit pour durer. Pas pour le spectacle technologique du moment.' },
  { icon: '🤲', title: 'Protection', desc: 'L\'infrastructure numérique doit protéger ses utilisateurs, préserver leur dignité et sécuriser leurs données.' },
  { icon: '🌱', title: 'Croissance', desc: 'Le développement humain est au cœur de toute initiative GAMAD — individuel, collectif, spirituel.' },
];

export default function VisionPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section style={{ background: 'var(--navy)', color: 'white', padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', color: 'white', marginBottom: '1.25rem' }}>
              Une infrastructure au service<br />
              <span style={{ color: 'var(--gold)' }}>de l'humain</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.0625rem', lineHeight: 1.8 }}>
              GAMAD n'est pas une startup. Ce n'est pas un réseau social ordinaire.
              C'est une infrastructure humaine et numérique construite pour la transmission,
              le travail utile et la continuité.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section style={{ padding: '5rem 2rem', background: 'white' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.625rem', marginBottom: '1.5rem' }}>Notre mission</h2>
            <p style={{ fontSize: '1.0625rem', lineHeight: 1.9, color: 'var(--slate)', marginBottom: '1.5rem' }}>
              GAMAD a été fondé sur un principe simple : chaque être humain a quelque chose à transmettre,
              et chaque territoire a besoin d'outils pour organiser cette transmission.
            </p>
            <p style={{ fontSize: '1.0625rem', lineHeight: 1.9, color: 'var(--slate)', marginBottom: '1.5rem' }}>
              Nous construisons des espaces numériques où le savoir circule, où le travail utile trouve
              sa place, et où la responsabilité humaine guide chaque décision.
            </p>
            <p style={{ fontSize: '1.0625rem', lineHeight: 1.9, color: 'var(--slate)' }}>
              Notre ambition n'est pas de rivaliser pour le spectacle. Elle est de construire
              une infrastructure durable, sobre, efficace — au service des personnes qui en ont besoin.
            </p>
          </div>
        </section>

        {/* Valeurs */}
        <section style={{ padding: '4rem 2rem', background: 'var(--white-soft)' }}>
          <div className="container">
            <h2 style={{ fontSize: '1.625rem', marginBottom: '0.75rem', textAlign: 'center' }}>Nos valeurs</h2>
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '3rem' }}>
              Six principes qui guident chaque décision dans l'écosystème.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {VALUES.map(v => (
                <div key={v.title} className="card">
                  <div style={{ fontSize: '1.875rem', marginBottom: '0.875rem' }}>{v.icon}</div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{v.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'var(--gold)', padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--navy)', fontSize: '1.75rem', marginBottom: '1rem' }}>
            Partager cette vision ?
          </h2>
          <p style={{ color: '#453800', marginBottom: '2rem' }}>
            Si cette mission vous parle, il y a peut-être une place pour vous dans le Réseau.
          </p>
          <Link href="/rejoindre" className="btn btn-navy" style={{ padding: '0.75rem 2rem' }}>
            Rejoindre le Réseau
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
