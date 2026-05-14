import Link from 'next/link';

const LINKS = [
  { href: '/blog', label: 'Blog' },
  { href: '/tv', label: 'TV' },
  { href: '/formations', label: 'Formations' },
  { href: '/ressources', label: 'Ressources' },
  { href: '/services', label: 'Services' },
];

export default function Nav() {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.125rem 2.5rem',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <Link href="/" style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 700,
        fontSize: '1.1875rem',
        color: 'var(--text)',
        letterSpacing: '0.02em',
      }}>
        GAMAD
      </Link>

      <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 400,
            transition: 'color 0.12s',
          }}>
            {l.label}
          </Link>
        ))}
      </nav>

      <Link href="/connexion" style={{
        padding: '0.4375rem 1rem',
        border: '1px solid var(--border)',
        borderRadius: 6,
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        background: 'var(--bg-card)',
        transition: 'border-color 0.12s',
      }}>
        Espace membre
      </Link>
    </header>
  );
}
