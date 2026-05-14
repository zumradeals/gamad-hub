'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';

type AppStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string | null;
  city: string | null;
  message: string | null;
  status: AppStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  gamadId: string | null;
  gamad?: {
    publicCode: string;
    status: string;
    profile?: { displayName: string | null };
  } | null;
}

interface ListResponse {
  data: Application[];
  total: number;
  skip: number;
  take: number;
}

const STATUS_LABEL: Record<AppStatus, string> = {
  SUBMITTED:    'Soumise',
  UNDER_REVIEW: 'En examen',
  APPROVED:     'Approuvée',
  REJECTED:     'Rejetée',
};

const STATUS_COLOR: Record<AppStatus, string> = {
  SUBMITTED:    '#f59e0b',
  UNDER_REVIEW: '#60a5fa',
  APPROVED:     '#34d399',
  REJECTED:     '#f87171',
};

const inputStyle: React.CSSProperties = {
  background: '#0d1117', border: '1px solid #30363d',
  borderRadius: 6, padding: '0.5rem 0.75rem',
  color: '#e6edf3', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box',
};

export default function CandidaturesPage() {
  const [apps, setApps]           = useState<Application[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [statusFilter, setStatusFilter] = useState('SUBMITTED');
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ take: '50' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get<ListResponse>(`/portal/auth/applications?${params}`);
      setApps(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleReview = async (id: string) => {
    setActionLoading(id);
    try {
      await api.post(`/portal/auth/applications/${id}/review`, {});
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async () => {
    if (!noteModal) return;
    setActionLoading(noteModal.id);
    try {
      const endpoint = noteModal.action === 'approve' ? 'approve' : 'reject';
      await api.post(`/portal/auth/applications/${noteModal.id}/${endpoint}`, {
        reviewNote: reviewNote || undefined,
      });
      setNoteModal(null);
      setReviewNote('');
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const counts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Candidatures portail
      </h1>
      <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {total} candidature{total !== 1 ? 's' : ''} — pipeline de validation HCG
      </p>

      {/* ── Modal: Note de décision ────────────────────────────────────────── */}
      {noteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
            padding: '1.75rem', width: 400, maxWidth: '90vw',
          }}>
            <h2 style={{ color: '#e6edf3', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              {noteModal.action === 'approve' ? '✓ Approuver la candidature' : '✗ Rejeter la candidature'}
            </h2>
            <textarea
              placeholder="Note de décision (optionnelle)"
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setNoteModal(null); setReviewNote(''); }}
                style={{
                  background: 'transparent', border: '1px solid #30363d', borderRadius: 6,
                  padding: '0.5rem 1.25rem', color: '#8b949e', cursor: 'pointer', fontSize: '0.875rem',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                disabled={!!actionLoading}
                style={{
                  background: noteModal.action === 'approve' ? '#34d399' : '#f87171',
                  border: 'none', borderRadius: 6,
                  padding: '0.5rem 1.25rem', color: '#000', fontWeight: 700,
                  fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                {actionLoading ? '…' : noteModal.action === 'approve' ? 'Approuver' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filtres statut ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: 20,
              border: statusFilter === s ? `1px solid ${s ? STATUS_COLOR[s as AppStatus] : '#d4a017'}` : '1px solid #30363d',
              background: statusFilter === s ? (s ? `${STATUS_COLOR[s as AppStatus]}20` : 'rgba(212,160,23,0.1)') : 'transparent',
              color: statusFilter === s ? (s ? STATUS_COLOR[s as AppStatus] : '#d4a017') : '#8b949e',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              fontWeight: statusFilter === s ? 600 : 400,
            }}
          >
            {s ? STATUS_LABEL[s as AppStatus] : 'Toutes'}
            {s && counts[s] ? ` (${counts[s]})` : ''}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '1rem', color: '#f87171', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Chargement…</p>
      ) : apps.length === 0 ? (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>
            {statusFilter ? `Aucune candidature au statut "${STATUS_LABEL[statusFilter as AppStatus]}"` : 'Aucune candidature'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {apps.map(app => (
            <div key={app.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
              {/* Header row */}
              <div
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                style={{
                  padding: '0.875rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  cursor: 'pointer',
                }}
              >
                {/* Status badge */}
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
                  padding: '2px 8px', borderRadius: 4, flexShrink: 0,
                  background: `${STATUS_COLOR[app.status]}20`,
                  border: `1px solid ${STATUS_COLOR[app.status]}40`,
                  color: STATUS_COLOR[app.status],
                  minWidth: 88, textAlign: 'center',
                }}>
                  {STATUS_LABEL[app.status]}
                </span>

                {/* Identité */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#e6edf3', fontSize: '0.875rem', fontWeight: 500 }}>
                    {app.firstName} {app.lastName}
                  </div>
                  <div style={{ color: '#8b949e', fontSize: '0.75rem' }}>
                    {app.email}
                    {app.country ? ` · ${app.country}` : ''}
                    {app.city ? `, ${app.city}` : ''}
                  </div>
                </div>

                {/* Date */}
                <span style={{ color: '#8b949e', fontSize: '0.75rem', flexShrink: 0 }}>
                  {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                </span>

                {/* Actions */}
                {(app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') && (
                  <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                    {app.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleReview(app.id)}
                        disabled={actionLoading === app.id}
                        style={{
                          background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                          borderRadius: 6, padding: '0.25rem 0.75rem',
                          color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {actionLoading === app.id ? '…' : 'En examen'}
                      </button>
                    )}
                    <button
                      onClick={() => { setNoteModal({ id: app.id, action: 'approve' }); setReviewNote(''); }}
                      disabled={!!actionLoading}
                      style={{
                        background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                        borderRadius: 6, padding: '0.25rem 0.75rem',
                        color: '#34d399', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => { setNoteModal({ id: app.id, action: 'reject' }); setReviewNote(''); }}
                      disabled={!!actionLoading}
                      style={{
                        background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                        borderRadius: 6, padding: '0.25rem 0.75rem',
                        color: '#f87171', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded detail */}
              {expanded === app.id && (
                <div style={{
                  borderTop: '1px solid #30363d',
                  padding: '1rem',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                }}>
                  {app.gamad && (
                    <div>
                      <div style={{ color: '#8b949e', fontSize: '0.6875rem', marginBottom: 2 }}>GAMAD ID</div>
                      <div style={{ color: '#d4a017', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {app.gamad.publicCode}
                      </div>
                    </div>
                  )}
                  {app.message && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ color: '#8b949e', fontSize: '0.6875rem', marginBottom: 4 }}>MESSAGE</div>
                      <div style={{ color: '#e6edf3', fontSize: '0.875rem', lineHeight: 1.5 }}>{app.message}</div>
                    </div>
                  )}
                  {app.reviewNote && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ color: '#8b949e', fontSize: '0.6875rem', marginBottom: 4 }}>NOTE HCG</div>
                      <div style={{ color: '#8b949e', fontSize: '0.8125rem', fontStyle: 'italic' }}>{app.reviewNote}</div>
                    </div>
                  )}
                  {app.reviewedAt && (
                    <div>
                      <div style={{ color: '#8b949e', fontSize: '0.6875rem', marginBottom: 2 }}>DÉCIDÉ LE</div>
                      <div style={{ color: '#8b949e', fontSize: '0.8125rem' }}>
                        {new Date(app.reviewedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
