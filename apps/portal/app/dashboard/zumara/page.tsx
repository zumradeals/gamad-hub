'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { getToken, authGet } from '../../../lib/api';

type ReqStatus = 'SUBMITTED' | 'PRE_VALIDATED' | 'IN_FORMATION' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';

interface MyRequest {
  id: string;
  name: string;
  status: ReqStatus;
  deadline: string | null;
  createdAt: string;
  founders: { email: string; trained: boolean }[];
  cell: { id: string; slug: string; status: string } | null;
}

interface MyMembership {
  role: string;
  joinedAt: string;
  cell: { id: string; name: string; slug: string; status: string; type: string; country: string | null };
}

const REQ_STATUS_LABEL: Record<ReqStatus, string> = {
  SUBMITTED: 'En attente d\'examen',
  PRE_VALIDATED: 'Pré-validée — recrutement ouvert',
  IN_FORMATION: 'En formation',
  ACTIVE: 'Activée ✓',
  REJECTED: 'Rejetée',
  EXPIRED: 'Délai expiré',
};

const REQ_STATUS_COLOR: Record<ReqStatus, string> = {
  SUBMITTED: '#f59e0b', PRE_VALIDATED: '#1696D2', IN_FORMATION: '#a78bfa',
  ACTIVE: '#0E9F4B', REJECTED: '#EF4444', EXPIRED: '#9CA3AF',
};

export default function DashboardZumaraPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<MyRequest[]>([]);
  const [memberships, setMemberships] = useState<MyMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    Promise.all([
      authGet<MyRequest[]>('/portal/zumara/requests/mine'),
      authGet<MyMembership[]>('/portal/zumara/mine'),
    ]).then(([reqs, mems]) => {
      setRequests(reqs);
      setMemberships(mems);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const daysLeft = (deadline: string | null) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Mes groupes</h1>
            <p style={{ color: '#6B7280', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Suivez vos demandes et vos appartenances</p>
          </div>
          <Link href="/zumara/creer" style={{ background: '#E5C100', color: '#071326', borderRadius: 8, padding: '0.6rem 1.25rem', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            + Créer un groupe
          </Link>
        </div>

        {loading && <p style={{ color: '#9CA3AF' }}>Chargement…</p>}

        {/* MY REQUESTS */}
        {requests.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Mes demandes de création</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.map((r) => {
                const days = daysLeft(r.deadline);
                return (
                  <div key={r.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{r.name}</h3>
                      <span style={{ background: REQ_STATUS_COLOR[r.status] + '18', color: REQ_STATUS_COLOR[r.status], borderRadius: 4, padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>
                        {REQ_STATUS_LABEL[r.status]}
                      </span>
                    </div>
                    {r.status === 'PRE_VALIDATED' && days !== null && (
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: days <= 7 ? '#EF4444' : '#f59e0b', fontWeight: 600 }}>
                        ⏱ {days > 0 ? `${days} jours restants pour recruter vos co-fondateurs` : 'Délai expiré !'}
                      </p>
                    )}
                    {r.status === 'IN_FORMATION' && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#6B7280' }}>
                          Formations complétées : {r.founders.filter(f => f.trained).length}/{r.founders.length}
                        </p>
                        <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#0E9F4B', width: `${(r.founders.filter(f => f.trained).length / Math.max(r.founders.length, 1)) * 100}%` }} />
                        </div>
                      </div>
                    )}
                    {r.cell && (
                      <Link href={`/zumara/${r.cell.slug}`} style={{ display: 'inline-block', marginTop: '0.5rem', color: '#1696D2', fontSize: '0.85rem', textDecoration: 'none' }}>
                        Voir la page du groupe →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* MY MEMBERSHIPS */}
        {memberships.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Groupes dont je suis membre</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {memberships.map((m) => (
                <Link key={m.cell.id} href={`/zumara/${m.cell.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '1rem', cursor: 'pointer' }}>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700 }}>{m.cell.name}</h3>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.8rem' }}>
                      {m.role === 'FOUNDER' ? '⭐ Fondateur' : m.role === 'CO_FOUNDER' ? '◈ Co-fondateur' : '◉ Membre'}
                      {m.cell.country && ` · ${m.cell.country}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!loading && requests.length === 0 && memberships.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: '#9CA3AF', marginBottom: '1.25rem' }}>Vous n'avez encore rejoint aucun groupe.</p>
            <Link href="/zumara" style={{ color: '#1696D2', textDecoration: 'none', marginRight: '1.25rem' }}>Explorer les groupes →</Link>
            <Link href="/zumara/creer" style={{ background: '#E5C100', color: '#071326', borderRadius: 8, padding: '0.6rem 1.25rem', fontWeight: 700, textDecoration: 'none' }}>
              Créer un groupe
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
