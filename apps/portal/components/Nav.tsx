'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/vision',     label: 'Vision' },
  { href: '/services',   label: 'Services' },
  { href: '/blog',       label: 'Blog' },
  { href: '/videos',     label: 'GamadTube' },
  { href: '/tv',         label: 'GAMAD TV' },
  { href: '/zumara',     label: 'Zumara' },
  { href: '/citoyens',   label: 'Citoyens' },
  { href: '/ressources', label: 'Ressources' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      height: '64px',
      borderBottom: '1px solid var(--border)',
      background: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: '1.125rem',
        color: 'var(--navy)',
        letterSpacing: '0.06em',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{
          background: 'var(--gold)',
          color: 'var(--navy)',
          borderRadius: '6px',
          padding: '2px 6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
        }}>G</span>
        GAMAD
      </Link>

      {/* Navigation centrale */}
      <nav style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            color: pathname === l.href ? 'var(--navy)' : 'var(--muted)',
            fontSize: '0.875rem',
            fontWeight: pathname === l.href ? 600 : 400,
            borderBottom: pathname === l.href ? '2px solid var(--gold)' : '2px solid transparent',
            paddingBottom: '2px',
            transition: 'color 0.12s',
          }}>
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Actions droite */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Link href="/connexion" style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--slate)',
          padding: '0.375rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          transition: 'color 0.12s',
        }}>
          Connexion
        </Link>
        <Link href="/rejoindre" className="btn btn-primary" style={{
          padding: '0.5rem 1rem',
          fontSize: '0.8125rem',
        }}>
          Rejoindre le Réseau
        </Link>
      </div>
    </header>
  );
}
