const navItems = [
  { href: '/home', label: 'Tableau de bord' },
  { href: '/identity', label: 'Mon identité' },
  { href: '/my-zumara', label: 'Ma cellule' },
  { href: '/formation', label: 'Formation' },
  { href: '/discussions', label: 'Discussions' },
  { href: '/activities', label: 'Activités' },
  { href: '/knowledge', label: 'Bibliothèque' },
  { href: '/cotisation', label: 'Cotisation' },
];

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117', fontFamily: "'DM Sans', sans-serif" }}>
      <aside style={{
        width: 240,
        background: '#161b22',
        borderRight: '1px solid #30363d',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid #30363d' }}>
          <span style={{ color: '#d4a017', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.1em' }}>
            GAMAD HUB
          </span>
        </div>
        <nav style={{ marginTop: '1rem', flex: 1 }}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '0.625rem 1.25rem',
                color: '#8b949e',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.15s',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '1.25rem', borderTop: '1px solid #30363d' }}>
          <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>Niveau 2 — ACTIF</span>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
