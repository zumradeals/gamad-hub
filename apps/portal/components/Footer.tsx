import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '2.5rem',
      marginTop: '5rem',
      background: 'var(--bg)',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
          GAMAD
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { href: '/blog', label: 'Blog' },
            { href: '/tv', label: 'TV' },
            { href: '/formations', label: 'Formations' },
            { href: '/ressources', label: 'Ressources' },
            { href: '/rejoindre', label: 'Nous rejoindre' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link href="/connexion" style={{
          fontSize: '0.875rem',
          color: 'var(--teal)',
          fontWeight: 500,
        }}>
          Espace membre →
        </Link>
      </div>
      <div style={{
        maxWidth: 1100,
        margin: '1.5rem auto 0',
        color: 'var(--text-muted)',
        fontSize: '0.8125rem',
      }}>
        © {new Date().getFullYear()} GAMAD — Tous droits réservés
      </div>
    </footer>
  );
}
