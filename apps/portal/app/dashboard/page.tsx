'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getUser, getToken, clearSession, authGet } from '../../lib/api';

const SHORTCUTS = [
  { icon: '💰', label: 'Wallet ZAHAB', href: '/dashboard/wallet' },
  { icon: '✍️', label: 'Espace Créateur', href: '/dashboard/creator' },
  { icon: '📰', label: 'Blog', href: '/blog' },
  { icon: '🌐', label: 'Communauté', href: '/feed' },
  { icon: '📚', label: 'Ressources', href: '/ressources' },
  { icon: '💼', label: 'Services', href: '/services' },
];

interface Me {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  country?: string;
  city?: string;
  memberSince: string;
  applicationStatus: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    authGet<Me>('/portal/auth/me')
      .then(setMe)
      .catch(() => { clearSession(); router.push('/connexion'); })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearSession();
    router.push('/');
  }

  if (loading) {
    return (
      <>
        <Nav />
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Chargement…</p>
        </main>
      </>
    );
  }

  const applicationBadge: Record<string, { label: string; cls: string }> = {
    SUBMITTED:    { label: 'Candidature envoyée', cls: 'badge-blue' },
    UNDER_REVIEW: { label: 'En cours d\'examen', cls: 'badge-gold' },
    APPROVED:     { label: 'Candidature approuvée', cls: 'badge-green' },
    REJECTED:     { label: 'Candidature non retenue', cls: 'badge-muted' },
  };

  const appBadge = me?.applicationStatus ? applicationBadge[me.applicationStatus] : null;

  return (
    <>
      <Nav />
      <main style={{ padding: '2.5rem 2rem', minHeight: '80vh' }}>
        <div className="container">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.625rem', marginBottom: '0.375rem' }}>
                Bonjour, {me?.firstName || me?.displayName} 👋
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                {me?.email} · Membre depuis {me?.memberSince ? new Date(me.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <button onClick={logout} className="btn btn-ghost" style={{ fontSize: '0.8125rem' }}>
              Se déconnecter
            </button>
          </div>

          {/* Candidature réseau */}
          {!appBadge && (
            <div className="card" style={{
              marginBottom: '2rem',
              borderLeft: '4px solid var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Vous souhaitez aller plus loin ?</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                  Soumettez une candidature pour rejoindre le Réseau.
                </div>
              </div>
              <Link href="/rejoindre" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Rejoindre le Réseau
              </Link>
            </div>
          )}

          {appBadge && (
            <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={`badge ${appBadge.cls}`}>{appBadge.label}</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                Votre demande est en cours de traitement. Vous serez contacté prochainement.
              </span>
            </div>
          )}

          {/* Grille de raccourcis */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Mes espaces</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {SHORTCUTS.map(s => (
                <Link key={s.label} href={s.href} className="card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem',
                  transition: 'box-shadow 0.15s',
                }}>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{s.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Infos compte */}
          <div className="card" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Informations du compte</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Nom complet', value: me?.displayName },
                { label: 'Email', value: me?.email },
                { label: 'Pays', value: me?.country ?? '—' },
                { label: 'Ville', value: me?.city ?? '—' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                  <span style={{ fontWeight: 500 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
