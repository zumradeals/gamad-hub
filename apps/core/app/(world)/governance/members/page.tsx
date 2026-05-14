'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';

type IdentityStatus = 'PORTAL_USER' | 'PENDING' | 'ACTIVE' | 'LIMITED' | 'SUSPENDED' | 'BANNED';

interface Member {
  id: string;
  publicCode: string;
  status: IdentityStatus;
  identityType: string;
  createdAt: string;
  account?: { email: string };
  profile?: { displayName: string | null; country: string | null };
}

interface ListResponse {
  data: Member[];
  total: number;
  skip: number;
  take: number;
}

const STATUS_LABEL: Record<IdentityStatus, string> = {
  PORTAL_USER: 'Portail',
  PENDING:     'En attente',
  ACTIVE:      'Actif',
  LIMITED:     'Limité',
  SUSPENDED:   'Suspendu',
  BANNED:      'Banni',
};

const STATUS_COLOR: Record<IdentityStatus, string> = {
  PORTAL_USER: '#60a5fa',
  PENDING:     '#f59e0b',
  ACTIVE:      '#34d399',
  LIMITED:     '#fb923c',
  SUSPENDED:   '#f87171',
  BANNED:      '#ef4444',
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]   = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ take: '50' });
      if (statusFilter) params.set('status', statusFilter);
      if (search)       params.set('search', search);
      const res = await api.get<ListResponse>(`/identity/gamad-ids?${params}`);
      setMembers(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleValidate = async (id: string) => {
    setActionLoading(id);
    try {
      await api.post(`/identity/gamad-ids/${id}/validate`, { newStatus: 'ACTIVE' });
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspendre ce membre ?')) return;
    setActionLoading(id);
    try {
      await api.post(`/identity/gamad-ids/${id}/suspend`, { reason: 'Décision HCG' });
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Gestion des membres
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {total} identité{total !== 1 ? 's' : ''} enregistrée{total !== 1 ? 's' : ''}
      </p>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Rechercher (email, nom, GMD-...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          style={{
            flex: 1, minWidth: 220,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '0.5rem 0.75rem',
            color: 'var(--text-primary)', fontSize: '0.875rem',
          }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '0.5rem 0.75rem',
            color: 'var(--text-primary)', fontSize: '0.875rem',
          }}
        >
          <option value="">Tous les statuts</option>
          {(Object.keys(STATUS_LABEL) as IdentityStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <button
          onClick={load}
          style={{
            background: 'var(--accent)', border: 'none', borderRadius: 6,
            padding: '0.5rem 1rem', color: '#000', fontWeight: 600,
            fontSize: '0.875rem', cursor: 'pointer',
          }}
        >
          Filtrer
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '1rem', color: '#f87171', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chargement…</p>
      ) : members.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Aucun membre trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {members.map(m => (
            <div key={m.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '0.875rem 1rem',
              display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            }}>
              {/* Code */}
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.875rem', minWidth: 110 }}>
                {m.publicCode}
              </span>

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {m.profile?.displayName ?? '—'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {m.account?.email ?? '—'}
                  {m.profile?.country ? ` · ${m.profile.country}` : ''}
                </div>
              </div>

              {/* Statut */}
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em',
                padding: '2px 8px', borderRadius: 4,
                background: `${STATUS_COLOR[m.status]}20`,
                border: `1px solid ${STATUS_COLOR[m.status]}40`,
                color: STATUS_COLOR[m.status],
              }}>
                {STATUS_LABEL[m.status]}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {m.status === 'PENDING' && (
                  <button
                    onClick={() => handleValidate(m.id)}
                    disabled={actionLoading === m.id}
                    style={{
                      background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                      borderRadius: 6, padding: '0.25rem 0.75rem',
                      color: '#34d399', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {actionLoading === m.id ? '…' : 'Activer'}
                  </button>
                )}
                {m.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleSuspend(m.id)}
                    disabled={actionLoading === m.id}
                    style={{
                      background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                      borderRadius: 6, padding: '0.25rem 0.75rem',
                      color: '#f87171', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {actionLoading === m.id ? '…' : 'Suspendre'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
