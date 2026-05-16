'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { getToken, authGet, authPost } from '../../../lib/api';

type ReqStatus = 'SUBMITTED' | 'PRE_VALIDATED' | 'IN_FORMATION' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';
type ZumaraType = 'LOCAL' | 'DIGITAL' | 'HYBRID';

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
  cell: { id: string; name: string; slug: string; status: string; type: ZumaraType; country: string | null; memberCount: number };
}

const TYPE_COLOR: Record<ZumaraType, string> = { LOCAL: '#0E9F4B', DIGITAL: '#1696D2', HYBRID: '#E5C100' };
const TYPE_LABEL: Record<ZumaraType, string> = { LOCAL: 'Locale', DIGITAL: 'Numérique', HYBRID: 'Hybride' };
const TYPE_EMOJI: Record<ZumaraType, string> = { LOCAL: '📍', DIGITAL: '🌐', HYBRID: '🔗' };

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
  const [leavingId, setLeavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) { router.push('/connexion'); return; }
    Promise.all([
      authGet<MyRequest[]>('/portal/zumara/requests/mine'),
      authGet<MyMembership[]>('/portal/zumara/mine'),
    ]).then(([reqs, mems]) => {
      setRequests(Array.isArray(reqs) ? reqs : []);
      setMemberships(Array.isArray(mems) ? mems : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function leave(cellId: string, cellName: string) {
    if (!confirm(`Quitter le groupe "${cellName}" ?`)) return;
    setLeavingId(cellId);
    try {
      await authGet(`/portal/zumara/${cellId}/leave`);
      setMemberships(prev => prev.filter(m => m.cell.id !== cellId));
    } catch { /* silent */ }
    finally { setLeavingId(null); }
  }

  const daysLeft = (deadline: string | null) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  };

  return (
    <>
      <Nav />
      <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, margin: 0, color: '#071326' }}>Mes groupes</h1>
              <p style={{ color: '#6B7280', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
                Vos Zumara et demandes de création
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/zumara" style={{ border: '1px solid #e5e7eb', background: 'white', color: '#374151', borderRadius: 8, padding: '0.6rem 1rem', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>
                Explorer
              </Link>
              <Link href="/zumara/creer" style={{ background: '#E5C100', color: '#071326', borderRadius: 8, padding: '0.6rem 1.25rem', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>
                + Créer un groupe
              </Link>
            </div>
          </div>

          {loading && (
            <div style={{ background: 'white', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
              Chargement…
            </div>
          )}

          {/* MY MEMBERSHIPS */}
          {memberships.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Groupes dont je suis membre ({memberships.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {memberships.map((m) => {
                  const isLeaving = leavingId === m.cell.id;
                  const isFounder = m.role === 'FOUNDER';
                  return (
                    <div key={m.cell.id} style={{
                      background: 'white', borderRadius: 12, overflow: 'hidden',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                      {/* Cover band */}
                      <div style={{
                        height: 6,
                        background: `linear-gradient(90deg, ${TYPE_COLOR[m.cell.type]}, ${TYPE_COLOR[m.cell.type]}66)`,
                      }} />
                      <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{TYPE_EMOJI[m.cell.type]}</span>
                            <div style={{ minWidth: 0 }}>
                              <Link href={`/zumara/${m.cell.slug}`} style={{ textDecoration: 'none' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#071326', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {m.cell.name}
                                </div>
                              </Link>
                              <div style={{ fontSize: '0.75rem', color: TYPE_COLOR[m.cell.type], fontWeight: 600 }}>
                                {TYPE_LABEL[m.cell.type]}
                                {m.cell.country && ` · ${m.cell.country}`}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{
                              background: isFounder ? '#fef3c7' : '#f0f2f5',
                              color: isFounder ? '#92400e' : '#6B7280',
                              borderRadius: 999, padding: '0.2rem 0.625rem',
                              fontSize: '0.7rem', fontWeight: 700,
                            }}>
                              {m.role === 'FOUNDER' ? '⭐ Fondateur' : m.role === 'CO_FOUNDER' ? '◈ Co-fondateur' : '◉ Membre'}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>
                              👥 {m.cell.memberCount} · Rejoint le {new Date(m.joinedAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <Link href={`/zumara/${m.cell.slug}`}
                              style={{ padding: '0.375rem 0.625rem', background: '#f0f2f5', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: '0.75rem', color: '#374151', textDecoration: 'none', fontWeight: 600 }}>
                              Voir
                            </Link>
                            {!isFounder && (
                              <button
                                onClick={() => leave(m.cell.id, m.cell.name)}
                                disabled={isLeaving}
                                style={{ padding: '0.375rem 0.625rem', background: 'transparent', border: '1px solid #fca5a5', borderRadius: 7, cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}
                              >
                                {isLeaving ? '…' : 'Quitter'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* MY REQUESTS */}
          {requests.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Mes demandes de création ({requests.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {requests.map((r) => {
                  const days = daysLeft(r.deadline);
                  return (
                    <div key={r.id} style={{ background: 'white', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#071326' }}>{r.name}</h3>
                        <span style={{
                          background: REQ_STATUS_COLOR[r.status] + '18',
                          color: REQ_STATUS_COLOR[r.status],
                          borderRadius: 6, padding: '0.2rem 0.625rem',
                          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {REQ_STATUS_LABEL[r.status]}
                        </span>
                      </div>

                      {r.status === 'PRE_VALIDATED' && days !== null && (
                        <div style={{ background: days <= 7 ? '#fef2f2' : '#fffbeb', border: `1px solid ${days <= 7 ? '#fca5a5' : '#fcd34d'}`, borderRadius: 8, padding: '0.5rem 0.875rem', marginBottom: '0.625rem', fontSize: '0.8rem', color: days <= 7 ? '#991b1b' : '#92400e', fontWeight: 600 }}>
                          ⏱ {days > 0 ? `${days} jours restants pour recruter vos co-fondateurs` : 'Délai expiré !'}
                        </div>
                      )}

                      {r.status === 'IN_FORMATION' && r.founders.length > 0 && (
                        <div style={{ marginBottom: '0.625rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Formations complétées</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#071326' }}>
                              {r.founders.filter(f => f.trained).length}/{r.founders.length}
                            </span>
                          </div>
                          <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#0E9F4B', width: `${(r.founders.filter(f => f.trained).length / Math.max(r.founders.length, 1)) * 100}%`, borderRadius: 3 }} />
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          Soumise le {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        {r.cell && (
                          <Link href={`/zumara/${r.cell.slug}`} style={{ color: '#1696D2', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>
                            Voir le groupe →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty state */}
          {!loading && requests.length === 0 && memberships.length === 0 && (
            <div style={{ background: 'white', borderRadius: 12, padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◎</div>
              <h2 style={{ fontWeight: 700, color: '#071326', marginBottom: '0.5rem' }}>Aucun groupe</h2>
              <p style={{ color: '#6B7280', marginBottom: '1.5rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>
                Rejoignez une Zumara existante ou créez la vôtre pour commencer.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/zumara" style={{ border: '1px solid #e5e7eb', background: 'white', color: '#374151', borderRadius: 8, padding: '0.6rem 1.25rem', fontWeight: 600, textDecoration: 'none' }}>
                  Explorer les groupes
                </Link>
                <Link href="/zumara/creer" style={{ background: '#E5C100', color: '#071326', borderRadius: 8, padding: '0.6rem 1.25rem', fontWeight: 700, textDecoration: 'none' }}>
                  Créer un groupe
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
