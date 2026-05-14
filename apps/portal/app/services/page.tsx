import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

const SERVICES = [
  {
    category: 'Information',
    items: [
      { icon: '📰', name: 'GAMAD Blog', desc: 'Articles éditoriaux, analyses et perspectives', status: 'Disponible', href: '/blog' },
      { icon: '🌐', name: 'Communauté', desc: 'Fil social public — échanges et partages', status: 'Disponible', href: '/feed' },
    ],
  },
  {
    category: 'Formation & Savoir',
    items: [
      { icon: '🎓', name: 'Formations', desc: 'Parcours certifiants accessibles à tous', status: 'Disponible', href: '#' },
      { icon: '📚', name: 'Bibliothèque', desc: 'Documents, manuels et ressources publiques', status: 'Disponible', href: '/ressources' },
      { icon: '🏅', name: 'Certifications', desc: 'Reconnaissance de compétences validées', status: 'Bientôt', href: null },
    ],
  },
  {
    category: 'Numérique',
    items: [
      { icon: '📧', name: 'GAMAD Mail', desc: 'Messagerie sécurisée pour les membres', status: 'Bientôt', href: null },
      { icon: '☁️', name: 'GAMAD Cloud', desc: 'Stockage et partage de fichiers', status: 'Bientôt', href: null },
      { icon: '🛒', name: 'Marketplace', desc: "Échange de services entre membres", status: 'En développement', href: null },
      { icon: '💳', name: 'Wallet GAMAD', desc: 'Paiements et transactions numériques', status: 'En développement', href: null },
    ],
  },
  {
    category: 'Bien-être & Communauté',
    items: [
      { icon: '🏥', name: 'GAMAD Santé', desc: 'Services de santé et accompagnement', status: 'En développement', href: null },
      { icon: '🤝', name: 'Réseau solidaire', desc: 'Entraide et soutien entre membres', status: 'Bientôt', href: null },
    ],
  },
];

const STATUS_STYLE: Record<string, { cls: string; label: string }> = {
  'Disponible':       { cls: 'badge-green', label: 'Disponible' },
  'Bientôt':          { cls: 'badge-gold',  label: 'Bientôt' },
  'En développement': { cls: 'badge-muted', label: 'En développement' },
};

export default function ServicesPage() {
  return (
    <>
      <Nav />
      <main>
        <section style={{ background: 'var(--navy)', color: 'white', padding: '4rem 2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.75rem' }}>
            L'écosystème <span style={{ color: 'var(--gold)' }}>GAMAD</span>
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '540px', margin: '0 auto' }}>
            Une suite de services numériques, sociaux et économiques — construits pour durer.
          </p>
        </section>

        <div className="container" style={{ padding: '4rem 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {SERVICES.map(section => (
              <div key={section.category}>
                <h2 style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: '1.25rem',
                }}>
                  {section.category}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {section.items.map(item => {
                    const st = STATUS_STYLE[item.status];
                    const isAvailable = item.status === 'Disponible' && item.href;
                    const inner = (
                      <div key={item.name} className="card" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        opacity: isAvailable ? 1 : 0.8,
                        transition: 'box-shadow 0.15s',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.375rem' }}>{item.icon}</span>
                            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{item.name}</span>
                          </div>
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                        </div>
                        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
                      </div>
                    );
                    return isAvailable
                      ? <Link key={item.name} href={item.href!} style={{ textDecoration: 'none' }}>{inner}</Link>
                      : inner;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
