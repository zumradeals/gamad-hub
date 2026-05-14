'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCitizen, clearSession, levelLabel, levelColor, levelBg, CitizenContext } from '../../lib/citizen';

const NAV = [
  { href: '/home',        label: 'Accueil',        icon: '⌂',  minLevel: 1 },
  { href: '/identity',    label: 'Mon Identité',    icon: '◈',  minLevel: 1 },
  { href: '/my-zumara',   label: 'Ma Zumara',       icon: '◉',  minLevel: 2 },
  { href: '/discussions', label: 'Discussions',     icon: '⬡',  minLevel: 1 },
  { href: '/formation',   label: 'Formation',       icon: '◫',  minLevel: 1 },
  { href: '/activities',  label: 'Activités',       icon: '◧',  minLevel: 1 },
  { href: '/knowledge',   label: 'Bibliothèque',    icon: '▤',  minLevel: 1 },
  { href: '/cotisation',  label: 'Cotisation',      icon: '◎',  minLevel: 1 },
];

const GOV_NAV = [
  { href: '/governance/members',      label: 'Membres',      icon: '◈' },
  { href: '/governance/organization', label: 'Organisation', icon: '◉' },
  { href: '/governance/audit',        label: 'Audit',        icon: '▦' },
];

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [citizen, setCitizen] = useState<CitizenContext | null>(null);

  useEffect(() => {
    const ctx = getCitizen();
    const tok = localStorage.getItem('gamadToken');
    if (!ctx || !tok) {
      router.replace('/login');
      return;
    }
    setCitizen(ctx);
  }, [router]);

  function logout() {
    clearSession();
    router.push('/login');
  }

  if (!citizen) return null;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Identity header */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            color: 'var(--accent)',
            fontWeight: 700,
            fontSize: '0.9375rem',
            letterSpacing: '0.08em',
            marginBottom: 6,
          }}>
            {citizen.publicCode}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 8px',
            borderRadius: 4,
            background: levelBg(citizen.level),
            border: `1px solid ${levelColor(citizen.level)}40`,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: levelColor(citizen.level),
              display: 'inline-block',
              flexShrink: 0,
            }} />
            <span style={{
              color: levelColor(citizen.level),
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}>
              {levelLabel(citizen.level)}
            </span>
          </div>
          <div style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            {citizen.displayName}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          {NAV.filter(n => citizen.level >= n.minLevel).map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0.5625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: isActive(item.href) ? 500 : 400,
                color: isActive(item.href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive(item.href) ? 'rgba(245,158,11,0.08)' : 'transparent',
                borderLeft: isActive(item.href) ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.12s',
              }}
            >
              <span style={{ opacity: 0.7, width: 16, textAlign: 'center', fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </a>
          ))}

          {citizen.level >= 3 && (
            <>
              <div style={{
                margin: '0.75rem 1.25rem',
                height: 1,
                background: 'var(--border)',
              }} />
              <div style={{
                padding: '0 1.25rem 0.375rem',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}>
                Gouvernance
              </div>
              {GOV_NAV.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0.5625rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.href) ? 500 : 400,
                    color: isActive(item.href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive(item.href) ? 'rgba(167,139,250,0.08)' : 'transparent',
                    borderLeft: isActive(item.href) ? '2px solid var(--level-hcg)' : '2px solid transparent',
                    transition: 'all 0.12s',
                  }}
                >
                  <span style={{ opacity: 0.7, width: 16, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '0.5rem 0.875rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              textAlign: 'left',
              transition: 'all 0.12s',
            }}
          >
            ⎋ &nbsp;Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 240, padding: '2rem 2.5rem', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
