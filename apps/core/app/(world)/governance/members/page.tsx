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

interface Role {
  id: string;
  name: string;
  description: string | null;
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

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#0d1117', border: '1px solid #30363d',
  borderRadius: 6, padding: '0.5rem 0.75rem',
  color: '#e6edf3', fontSize: '0.875rem',
};

const btnPrimary: React.CSSProperties = {
  background: '#d4a017', border: 'none', borderRadius: 6,
  padding: '0.5rem 1.25rem', color: '#000', fontWeight: 700,
  fontSize: '0.875rem', cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  background: 'transparent', border: '1px solid #30363d', borderRadius: 6,
  padding: '0.5rem 1.25rem', color: '#8b949e', fontWeight: 500,
  fontSize: '0.875rem', cursor: 'pointer',
};

export default function MembersPage() {
  const [members, setMembers]         = useState<Member[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]           = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create member modal
  const [showCreate, setShowCreate]   = useState(false);
  const [creating, setCreating]       = useState(false);
  const [createForm, setCreateForm]   = useState({
    displayName: '', email: '', password: '', identityType: 'PERSON',
  });
  const [createError, setCreateError] = useState('');

  // Assign role modal
  const [showRole, setShowRole]       = useState<string | null>(null); // gamadId
  const [roles, setRoles]             = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError]     = useState('');

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
      await api.post(`/identity/gamad-ids/${id}/validate`, { decisionNote: 'Validé par HCG' });
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
      await api.post(`/identity/gamad-ids/${id}/suspend`, { reason: 'Suspendu par décision HCG' });
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/identity/gamad-ids', createForm);
      setShowCreate(false);
      setCreateForm({ displayName: '', email: '', password: '', identityType: 'PERSON' });
      await load();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setCreating(false);
    }
  };

  const openRoleModal = async (gamadId: string) => {
    setShowRole(gamadId);
    setSelectedRole('');
    setRoleError('');
    if (roles.length === 0) {
      try {
        const data = await api.get<Role[]>('/permissions/roles');
        setRoles(data);
      } catch { /* ignore */ }
    }
  };

  const handleAssignRole = async () => {
    if (!showRole || !selectedRole) return;
    setRoleLoading(true);
    setRoleError('');
    try {
      await api.post(`/permissions/members/${showRole}/roles`, { roleId: selectedRole });
      setShowRole(null);
    } catch (err: unknown) {
      setRoleError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 600 }}>
          Gestion des membres
        </h1>
        <button onClick={() => { setShowCreate(true); setCreateError(''); }} style={btnPrimary}>
          + Créer un membre
        </button>
      </div>
      <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {total} identité{total !== 1 ? 's' : ''} enregistrée{total !== 1 ? 's' : ''}
      </p>

      {/* ── Modal: Créer un membre ─────────────────────────────────────────── */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
            padding: '1.75rem', width: 420, maxWidth: '90vw',
          }}>
            <h2 style={{ color: '#e6edf3', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Créer un membre
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
                    Nom d&apos;affichage *
                  </label>
                  <input
                    style={inputStyle}
                    value={createForm.displayName}
                    onChange={e => setCreateForm(f => ({ ...f, displayName: e.target.value }))}
                    required minLength={2}
                    placeholder="Nom Prénom"
                  />
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    style={inputStyle}
                    value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    required
                    placeholder="email@exemple.com"
                  />
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
                    Mot de passe provisoire *
                  </label>
                  <input
                    type="password"
                    style={inputStyle}
                    value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    required minLength={8}
                    placeholder="Min. 8 caractères"
                  />
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
                    Type d&apos;identité
                  </label>
                  <select
                    style={inputStyle}
                    value={createForm.identityType}
                    onChange={e => setCreateForm(f => ({ ...f, identityType: e.target.value }))}
                  >
                    <option value="PERSON">Personne</option>
                    <option value="ORGANIZATION">Organisation</option>
                    <option value="SYSTEM">Système</option>
                  </select>
                </div>
                {createError && (
                  <div style={{ color: '#f87171', fontSize: '0.8125rem', background: 'rgba(248,113,113,0.1)', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
                    {createError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button type="button" onClick={() => setShowCreate(false)} style={btnSecondary}>
                    Annuler
                  </button>
                  <button type="submit" disabled={creating} style={btnPrimary}>
                    {creating ? 'Création…' : 'Créer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Assigner un rôle ────────────────────────────────────────── */}
      {showRole && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
            padding: '1.75rem', width: 380, maxWidth: '90vw',
          }}>
            <h2 style={{ color: '#e6edf3', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Assigner un rôle
            </h2>
            <select
              style={{ ...inputStyle, marginBottom: '1rem' }}
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              <option value="">— Choisir un rôle —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}{r.description ? ` — ${r.description}` : ''}</option>
              ))}
            </select>
            {roleError && (
              <div style={{ color: '#f87171', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>{roleError}</div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRole(null)} style={btnSecondary}>Annuler</button>
              <button
                onClick={handleAssignRole}
                disabled={!selectedRole || roleLoading}
                style={{ ...btnPrimary, opacity: selectedRole ? 1 : 0.5 }}
              >
                {roleLoading ? 'Assignation…' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filtres ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Rechercher (email, nom, GMD-...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          style={{ flex: 1, minWidth: 220, ...inputStyle }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, width: 'auto' }}
        >
          <option value="">Tous les statuts</option>
          {(Object.keys(STATUS_LABEL) as IdentityStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <button onClick={load} style={btnPrimary}>Filtrer</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '1rem', color: '#f87171', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Chargement…</p>
      ) : members.length === 0 ? (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucun membre trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {members.map(m => (
            <div key={m.id} style={{
              background: '#161b22', border: '1px solid #30363d',
              borderRadius: 8, padding: '0.875rem 1rem',
              display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            }}>
              <span style={{ color: '#d4a017', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', minWidth: 110 }}>
                {m.publicCode}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#e6edf3', fontSize: '0.875rem', fontWeight: 500 }}>
                  {m.profile?.displayName ?? '—'}
                </div>
                <div style={{ color: '#8b949e', fontSize: '0.75rem' }}>
                  {m.account?.email ?? '—'}
                  {m.profile?.country ? ` · ${m.profile.country}` : ''}
                </div>
              </div>

              <span style={{
                fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em',
                padding: '2px 8px', borderRadius: 4,
                background: `${STATUS_COLOR[m.status]}20`,
                border: `1px solid ${STATUS_COLOR[m.status]}40`,
                color: STATUS_COLOR[m.status],
              }}>
                {STATUS_LABEL[m.status]}
              </span>

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
                {(m.status === 'ACTIVE' || m.status === 'PENDING') && (
                  <button
                    onClick={() => openRoleModal(m.id)}
                    style={{
                      background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                      borderRadius: 6, padding: '0.25rem 0.75rem',
                      color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Rôle
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
