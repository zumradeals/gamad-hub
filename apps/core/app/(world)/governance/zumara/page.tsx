'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';

type ReqStatus = 'SUBMITTED' | 'PRE_VALIDATED' | 'IN_FORMATION' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';
type CellStatus = 'ACTIVE' | 'ESTABLISHED' | 'SATELLITE' | 'ELITE' | 'SUSPENDED' | 'DISSOLVED';

interface ZumaraRequest {
  id: string;
  name: string;
  objective: string;
  type: string;
  country: string | null;
  city: string | null;
  status: ReqStatus;
  reviewNote: string | null;
  deadline: string | null;
  createdAt: string;
  founders: { email: string; role: string; trained: boolean }[];
  gamad?: { publicCode: string; profile?: { displayName: string | null } | null };
}

interface ZumaraCell {
  id: string;
  name: string;
  slug: string;
  type: string;
  country: string | null;
  status: CellStatus;
  visibility: string;
  memberCount: number;
  walletBalance: number;
}

const REQ_COLOR: Record<ReqStatus, string> = {
  SUBMITTED: '#f59e0b', PRE_VALIDATED: '#60a5fa', IN_FORMATION: '#a78bfa',
  ACTIVE: '#34d399', REJECTED: '#f87171', EXPIRED: '#9ca3af',
};

const CELL_COLOR: Record<CellStatus, string> = {
  ACTIVE: '#34d399', ESTABLISHED: '#E5C100', SATELLITE: '#60a5fa',
  ELITE: '#a78bfa', SUSPENDED: '#f59e0b', DISSOLVED: '#f87171',
};

const btn = (color: string): React.CSSProperties => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
});

const tab = (active: boolean): React.CSSProperties => ({
  padding: '0.4rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem',
  background: active ? '#1696D2' : '#161b22', color: active ? '#fff' : '#8b949e',
  border: 'none', fontWeight: active ? 700 : 400,
});

export default function ZumaraGovernancePage() {
  const [view, setView] = useState<'requests' | 'cells'>('requests');
  const [requests, setRequests] = useState<ZumaraRequest[]>([]);
  const [cells, setCells] = useState<ZumaraCell[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deadlineModal, setDeadlineModal] = useState<string | null>(null);
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = async (status?: string) => {
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : '';
      const data = await api.get<ZumaraRequest[]>(`/zumara/requests${qs}`);
      setRequests(data);
    } catch { setError('Erreur chargement demandes'); }
    finally { setLoading(false); }
  };

  const loadCells = async () => {
    setLoading(true);
    try {
      const data = await api.get<ZumaraCell[]>('/zumara');
      setCells(data);
    } catch { setError('Erreur chargement Zumara'); }
    finally { setLoading(false); }
  };

  useEffect(() => { view === 'requests' ? loadRequests() : loadCells(); }, [view]);

  const preValidate = async (id: string) => {
    try {
      await api.post(`/zumara/requests/${id}/pre-validate`, { deadlineDays });
      setDeadlineModal(null);
      loadRequests();
    } catch { alert('Erreur pré-validation'); }
  };

  const reject = async (id: string) => {
    if (!rejectReason || rejectReason.length < 10) { alert('Raison trop courte (min 10 chars)'); return; }
    try {
      await api.post(`/zumara/requests/${id}/reject`, { reason: rejectReason });
      setRejectModal(null);
      setRejectReason('');
      loadRequests();
    } catch { alert('Erreur rejet'); }
  };

  const promoteElite = async (id: string) => {
    if (!confirm('Promouvoir cette Zumara en ELITE ? Elle disparaîtra du portail.')) return;
    try {
      await api.post(`/zumara/${id}/promote-elite`, {});
      loadCells();
    } catch { alert('Erreur promotion'); }
  };

  const suspend = async (id: string) => {
    const reason = prompt('Raison de suspension (min 10 chars) :');
    if (!reason || reason.length < 10) return;
    try {
      await api.post(`/zumara/${id}/suspend`, { reason });
      loadCells();
    } catch { alert('Erreur suspension'); }
  };

  const inputStyle: React.CSSProperties = {
    background: '#0d1117', border: '1px solid #30363d', borderRadius: 6,
    padding: '0.5rem 0.75rem', color: '#e6edf3', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '1.5rem', color: '#e6edf3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Gouvernance Zumara</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#8b949e', fontSize: '0.875rem' }}>
            Supervision souveraine des cellules GAMAD
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button style={tab(view === 'requests')} onClick={() => setView('requests')}>Demandes</button>
        <button style={tab(view === 'cells')} onClick={() => setView('cells')}>Zumara actives</button>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {loading && <p style={{ color: '#8b949e' }}>Chargement…</p>}

      {/* REQUESTS */}
      {view === 'requests' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {requests.length === 0 && <p style={{ color: '#8b949e' }}>Aucune demande.</p>}
          {requests.map((r) => (
            <div key={r.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
              <div
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div>
                  <span style={{ fontWeight: 700, marginRight: '0.75rem' }}>{r.name}</span>
                  <span style={{ background: REQ_COLOR[r.status] + '22', color: REQ_COLOR[r.status], borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    {r.status}
                  </span>
                  <span style={{ marginLeft: '0.75rem', color: '#8b949e', fontSize: '0.8rem' }}>
                    {r.type} · {r.country}{r.city ? `, ${r.city}` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {r.status === 'SUBMITTED' && (
                    <>
                      <button style={btn('#1696D2')} onClick={(e) => { e.stopPropagation(); setDeadlineModal(r.id); setDeadlineDays(30); }}>
                        Pré-valider
                      </button>
                      <button style={btn('#ef4444')} onClick={(e) => { e.stopPropagation(); setRejectModal(r.id); setRejectReason(''); }}>
                        Rejeter
                      </button>
                    </>
                  )}
                  {r.status === 'IN_FORMATION' && (
                    <button style={btn('#0E9F4B')} onClick={(e) => { e.stopPropagation(); api.post(`/zumara/requests/${r.id}/activate`, {}).then(() => loadRequests()); }}>
                      Activer
                    </button>
                  )}
                  <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{expanded === r.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === r.id && (
                <div style={{ padding: '1rem', borderTop: '1px solid #30363d', background: '#0d1117' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#c9d1d9' }}><strong>Objectif :</strong> {r.objective}</p>
                  {r.deadline && (
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#f59e0b' }}>
                      Deadline : {new Date(r.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {r.reviewNote && (
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#f87171' }}>Note : {r.reviewNote}</p>
                  )}
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#8b949e' }}>
                    Fondateur : {r.gamad?.profile?.displayName ?? r.gamad?.publicCode ?? '—'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#8b949e' }}>
                    Co-fondateurs ({r.founders.length}) : {r.founders.map(f => `${f.email}${f.trained ? ' ✓' : ''}`).join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CELLS */}
      {view === 'cells' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cells.length === 0 && <p style={{ color: '#8b949e' }}>Aucune Zumara active.</p>}
          {cells.map((c) => (
            <div key={c.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, marginRight: '0.75rem' }}>{c.name}</span>
                <span style={{ background: CELL_COLOR[c.status] + '22', color: CELL_COLOR[c.status], borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  {c.status}
                </span>
                <span style={{ marginLeft: '0.75rem', color: '#8b949e', fontSize: '0.8rem' }}>
                  {c.type} · {c.memberCount} membres · {c.country ?? '—'}
                </span>
                {c.visibility === 'CORE' && (
                  <span style={{ marginLeft: '0.5rem', background: '#a78bfa22', color: '#a78bfa', borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>ELITE</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {c.status !== 'ELITE' && c.status !== 'SUSPENDED' && (
                  <button style={btn('#a78bfa')} onClick={() => promoteElite(c.id)}>→ Elite</button>
                )}
                {c.status === 'ACTIVE' || c.status === 'ESTABLISHED' ? (
                  <button style={btn('#f59e0b')} onClick={() => suspend(c.id)}>Suspendre</button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Pre-validate */}
      {deadlineModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '2rem', width: 360 }}>
            <h3 style={{ margin: '0 0 1rem', color: '#e6edf3' }}>Pré-valider la demande</h3>
            <label style={{ color: '#8b949e', fontSize: '0.8rem' }}>Délai de recrutement (jours)</label>
            <input type="number" min={7} max={365} value={deadlineDays} onChange={(e) => setDeadlineDays(+e.target.value)} style={{ ...inputStyle, marginTop: '0.25rem', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button style={btn('#6b7280')} onClick={() => setDeadlineModal(null)}>Annuler</button>
              <button style={btn('#1696D2')} onClick={() => preValidate(deadlineModal)}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reject */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '2rem', width: 400 }}>
            <h3 style={{ margin: '0 0 1rem', color: '#e6edf3' }}>Rejeter la demande</h3>
            <label style={{ color: '#8b949e', fontSize: '0.8rem' }}>Raison (min 10 caractères)</label>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} style={{ ...inputStyle, marginTop: '0.25rem', marginBottom: '1rem', resize: 'vertical' }} placeholder="Expliquez pourquoi cette demande est rejetée…" />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button style={btn('#6b7280')} onClick={() => setRejectModal(null)}>Annuler</button>
              <button style={btn('#ef4444')} onClick={() => reject(rejectModal)}>Rejeter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
