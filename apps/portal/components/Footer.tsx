import Link from 'next/link';

const COL1 = [
  { href: '/vision',     label: 'Notre vision' },
  { href: '/services',   label: 'Services' },
  { href: '/blog',       label: 'Blog' },
  { href: '/feed',       label: 'Communauté' },
];

const COL2 = [
  { href: '/ressources', label: 'Ressources' },
  { href: '/rejoindre',  label: 'Rejoindre le Réseau' },
  { href: '/inscription', label: 'Créer un compte' },
  { href: '/connexion',  label: 'Connexion' },
];

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--navy)',
      color: 'white',
      padding: '3rem 2rem 2rem',
      marginTop: '5rem',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '2rem',
      }}>
        {/* Colonne marque */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
            <span style={{ background: 'var(--gold)', color: 'var(--navy)', borderRadius: '4px', padding: '1px 5px', fontSize: '0.75rem', marginRight: '6px' }}>G</span>
            GAMAD
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '220px' }}>
            Formation — Travail — Adoration.<br />
            Une infrastructure humaine et numérique au service de la transmission.
          </p>
        </div>

        {/* Colonne découverte */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Découvrir
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {COL1.map(l => (
              <Link key={l.href} href={l.href} style={{ color: '#94a3b8', fontSize: '0.875rem', transition: 'color 0.12s' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Colonne compte */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Compte
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {COL2.map(l => (
              <Link key={l.href} href={l.href} style={{ color: '#94a3b8', fontSize: '0.875rem', transition: 'color 0.12s' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{
        marginTop: '2.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        color: '#64748b',
        fontSize: '0.8125rem',
      }}>
        © {new Date().getFullYear()} GAMAD — Tous droits réservés
      </div>
    </footer>
  );
}
