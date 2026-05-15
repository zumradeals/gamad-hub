'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { publicGet, getToken, authPost } from '../../../lib/api';

interface ZumaraCell {
  id: string;
  name: string;
  slug: string;
  objective: string;
  type: string;
  country: string | null;
  city: string | null;
  status: string;
  memberCount: number;
  cotisationAmount: number | null;
  cotisationPeriod: string | null;
  activatedAt: string;
  memberships: { role: string; joinedAt: string }[];
}

export default function ZumaraProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [cell, setCell] = useState<ZumaraCell | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    publicGet<ZumaraCell>(`/portal/zumara/${slug}`)
      .then(setCell)
      .catch(() => setError('Groupe introuvable'))
      .finally(() => setLoading(false));
  }, [slug]);

  const join = async () => {
    if (!getToken()) { window.location.href = '/connexion'; return; }
    setJoining(true);
    try {
      await authPost(`/portal/zumara/${cell!.id}/join`, {});
      setJoined(true);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la demande');
    } finally { setJoining(false); }
  };

  if (loading) return <><Nav /><main style={{ padding: '4rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>Chargement…</main><Footer /></>;
  if (error || !cell) return <><Nav /><main style={{ padding: '4rem 1rem', textAlign: 'center' }}><p style={{ color: '#EF4444' }}>{error || 'Introuvable'}</p><Link href="/zumara">← Retour</Link></main><Footer /></>;

  const leaders = cell.memberships.filter((m) => m.role === 'FOUNDER' || m.role === 'CO_FOUNDER');
  const members = cell.memberships.filter((m) => m.role === 'MEMBER');

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
        <Link href="/zumara" style={{ color: '#1696D2', fontSize: '0.875rem', textDecoration: 'none' }}>← Annuaire</Link>

        <div style={{ marginTop: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.8rem', fontWeight: 800 }}>{cell.name}</h1>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
                {cell.type === 'LOCAL' ? 'Groupe local' : cell.type === 'DIGITAL' ? 'Groupe numérique' : 'Groupe hybride'}
                {cell.country && ` · ${cell.country}${cell.city ? `, ${cell.city}` : ''}`}
              </p>
            </div>
            {!joined ? (
              <button onClick={join} disabled={joining} style={{ background: '#E5C100', color: '#071326', border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', fontWeight: 700, cursor: joining ? 'wait' : 'pointer', fontSize: '0.95rem' }}>
                {joining ? 'En cours…' : 'Rejoindre'}
              </button>
            ) : (
              <span style={{ color: '#0E9F4B', fontWeight: 700, padding: '0.65rem 1rem' }}>✓ Demande envoyée</span>
            )}
          </div>
        </div>

        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Objectif</h2>
          <p style={{ color: '#374151', lineHeight: 1.6, margin: 0 }}>{cell.objective}</p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Membres', value: cell.memberCount },
            { label: 'Cotisation', value: cell.cotisationAmount ? `${cell.cotisationAmount} Z / ${cell.cotisationPeriod ?? 'mois'}` : '—' },
            { label: 'Actif depuis', value: new Date(cell.activatedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) },
          ].map((s) => (
            <div key={s.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#071326' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {leaders.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Équipe dirigeante ({leaders.length})</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {leaders.map((m, i) => (
                <span key={i} style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 20, padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  {m.role === 'FOUNDER' ? '⭐ Fondateur' : '◈ Co-fondateur'}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
