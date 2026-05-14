'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type QueueItem = {
  id: string;
  type: 'POST' | 'ARTICLE';
  content: string;
  createdAt: string;
  gamad?: { profile?: { displayName?: string } };
  author?: { profile?: { displayName?: string } };
};

type Report = {
  id: string;
  contentType: 'POST' | 'ARTICLE';
  contentId: string;
  reason: string;
  note?: string;
  status: string;
  createdAt: string;
  reporter?: { profile?: { displayName?: string } };
};

type Stats = {
  totalPending: number;
  totalReports: number;
  totalReviewed: number;
  totalRejected: number;
};

function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [trustLevel, setTrustLevel] = useState<string>('NEWCOMER');

  useEffect(() => {
    const t = localStorage.getItem('portal_token');
    setToken(t);
    if (t) {
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        setTrustLevel(payload.trustLevel ?? 'NEWCOMER');
      } catch {}
    }
  }, []);

  return { token, trustLevel };
}

async function apiFetch(url: string, token: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}/api/v1${url}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function ModerationPage() {
  const { token, trustLevel } = useAuth();
  const [tab, setTab] = useState<'queue' | 'reports' | 'stats'>('queue');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVeteran = ['VETERAN', 'GUARDIAN'].includes(trustLevel);
  const isGuardian = trustLevel === 'GUARDIAN';

  const loadQueue = useCallback(async () => {
    if (!token || !isVeteran) return;
    setLoading(true);
    try {
      const data = await apiFetch('/portal/moderation/queue', token);
      setQueue(data.posts ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, isVeteran]);

  const loadReports = useCallback(async () => {
    if (!token || !isGuardian) return;
    setLoading(true);
    try {
      const data = await apiFetch('/portal/moderation/reports', token);
      setReports(data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, isGuardian]);

  const loadStats = useCallback(async () => {
    if (!token || !isGuardian) return;
    setLoading(true);
    try {
      const data = await apiFetch('/portal/moderation/stats', token);
      setStats(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, isGuardian]);

  useEffect(() => {
    if (tab === 'queue') loadQueue();
    else if (tab === 'reports') loadReports();
    else if (tab === 'stats') loadStats();
  }, [tab, loadQueue, loadReports, loadStats]);

  async function handleReview(id: string, approve: boolean, type: 'post' | 'article') {
    if (!token) return;
    try {
      await apiFetch(`/portal/moderation/review/${id}?type=${type}`, token, {
        method: 'POST',
        body: JSON.stringify({ approve }),
      });
      setQueue(q => q.filter(item => item.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleReport(id: string, validated: boolean) {
    if (!token) return;
    try {
      await apiFetch(`/portal/moderation/reports/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify({ validated }),
      });
      setReports(r => r.filter(item => item.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (!isVeteran) {
    return (
      <main style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ color: '#6B7280' }}>
          Accès réservé aux membres VETERAN et GUARDIAN.
        </p>
        <Link href="/dashboard" style={{ color: '#1696D2', fontSize: 14 }}>← Tableau de bord</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard" style={{ color: '#1696D2', fontSize: 14 }}>← Tableau de bord</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px', color: '#071326' }}>
          Modération
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          {isGuardian ? 'Autorité éditoriale — accès complet' : 'File d\'examen VETERAN'}
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#DC2626', fontSize: 14 }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E5E7EB', marginBottom: 24 }}>
        {[
          { key: 'queue', label: `File (${queue.length})`, show: true },
          { key: 'reports', label: 'Signalements', show: isGuardian },
          { key: 'stats', label: 'Statistiques', show: isGuardian },
        ].filter(t => t.show).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid #E5C100' : '2px solid transparent',
              color: tab === t.key ? '#071326' : '#6B7280',
              fontWeight: tab === t.key ? 600 : 400,
              cursor: 'pointer',
              fontSize: 14,
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#6B7280', fontSize: 14 }}>Chargement…</p>}

      {tab === 'queue' && !loading && (
        <div>
          {queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
              <p>File de modération vide.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {queue.map(item => {
                const author = item.gamad?.profile?.displayName ?? item.author?.profile?.displayName ?? 'Anonyme';
                const type = item.type === 'ARTICLE' ? 'article' : 'post';
                return (
                  <div key={item.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 12 }}>
                        {item.type}
                      </span>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>
                        par {author} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: '#071326', margin: '0 0 12px', lineHeight: 1.6 }}>
                      {item.content.length > 300 ? item.content.slice(0, 300) + '…' : item.content}
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleReview(item.id, true, type as any)}
                        style={{ flex: 1, background: '#0E9F4B', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReview(item.id, false, type as any)}
                        style={{ flex: 1, background: '#fff', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, padding: '8px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && !loading && (
        <div>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
              <p>Aucun signalement en attente.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reports.map(report => (
                <div key={report.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 12 }}>
                        {report.contentType}
                      </span>
                      <span style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: 12 }}>
                        {report.reason}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>
                      signalé par {report.reporter?.profile?.displayName ?? 'anonyme'}
                    </span>
                  </div>
                  {report.note && (
                    <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px', fontStyle: 'italic' }}>
                      "{report.note}"
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleReport(report.id, true)}
                      style={{ flex: 1, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Valider le signalement
                    </button>
                    <button
                      onClick={() => handleReport(report.id, false)}
                      style={{ flex: 1, background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'stats' && !loading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'En attente', value: stats.totalPending, color: '#E5C100' },
            { label: 'Signalements ouverts', value: stats.totalReports, color: '#DC2626' },
            { label: 'Contenus approuvés', value: stats.totalReviewed, color: '#0E9F4B' },
            { label: 'Contenus rejetés', value: stats.totalRejected, color: '#6B7280' },
          ].map(kpi => (
            <div key={kpi.label} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: kpi.color, fontFamily: 'JetBrains Mono, monospace' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{kpi.label}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
