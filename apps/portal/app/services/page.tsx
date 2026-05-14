import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

const SERVICES = [
  {
    category: 'Information',
    items: [
      { name: 'G-SEARCH', desc: 'Moteur de recherche universel — articles, vidéos, formations, ressources', status: 'Disponible', href: '/' },
      { name: 'GAMAD Blog', desc: "Articles éditoriaux, analyses et perspectives de l'écosystème", status: 'Disponible', href: '/blog' },
      { name: 'GAMAD TV', desc: 'Vidéos éducatives, conférences et documentaires', status: 'Disponible', href: '/tv' },
    ],
  },
  {
    category: 'Formation',
    items: [
      { name: 'Formations publiques', desc: 'Parcours de formation certifiants accessibles à tous', status: 'Disponible', href: '/formations' },
      { name: 'Bibliothèque', desc: 'Documents, manuels et ressources publiques', status: 'Disponible', href: '/ressources' },
      { name: 'Certifications', desc: 'Reconnaissance de compétences et parcours validés', status: 'Bientôt', href: null },
    ],
  },
  {
    category: 'Numérique',
    items: [
      { name: 'Marketplace', desc: "Plateforme d'échange de services entre membres", status: 'Bientôt', href: null },
      { name: 'Wallet GAMAD', desc: 'Paiements et gestion de transactions numériques', status: 'En développement', href: null },
      { name: 'GAMAD IA', desc: 'Outils intelligents au service de la communauté', status: 'En développement', href: null },
    ],
  },
  {
    category: 'Bien-être',
    items: [
      { name: 'GAMAD Santé', desc: 'Services de santé et accompagnement médical', status: 'En développement', href: null },
      { name: 'Réseau solidaire', desc: 'Entraide et soutien entre membres', status: 'Bientôt', href: null },
    ],
  },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  'Disponible':      { color: '#0f6e56', bg: '#e6f2ef' },
  'Bientôt':         { color: '#854f0b', bg: '#fdf3e6' },
  'En développement':{ color: '#5a5a5a', bg: '#f0eeea' },
};

export default function ServicesPage() {
  return (
    <>
      <Nav />
      <main>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Services</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Carte de l'écosystème GAMAD — services disponibles et à venir.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {SERVICES.map(section => (
              <div key={section.category}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.03em' }}>
                  {section.category}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {section.items.map(item => {
                    const st = STATUS_STYLE[item.status];
                    const Wrapper = item.href ? 'a' : 'div';
                    return (
                      <Wrapper
                        key={item.name}
                        {...(item.href ? { href: item.href } : {})}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          textDecoration: 'none',
                          opacity: item.status === 'Disponible' ? 1 : 0.75,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' }}>{item.name}</div>
                          <span style={{
                            padding: '2px 7px',
                            borderRadius: 4,
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: st.color,
                            background: st.bg,
                            flexShrink: 0,
                          }}>
                            {item.status}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55 }}>{item.desc}</p>
                      </Wrapper>
                    );
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
