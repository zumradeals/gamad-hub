'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';

interface OrgUnit {
  id: string;
  name: string;
  type: string;
  description: string | null;
  parentId: string | null;
  status: string;
  createdAt: string;
  _count?: { memberships: number; children: number };
}

const TYPE_LABEL: Record<string, string> = {
  HCG:          'HCG',
  DEPARTMENT:   'Département',
  COORDINATION: 'Coordination',
  SECTION:      'Section',
  ZUMARA:       'Zumara',
};

const TYPE_COLOR: Record<string, string> = {
  HCG:          '#a78bfa',
  DEPARTMENT:   '#60a5fa',
  COORDINATION: '#34d399',
  SECTION:      '#f59e0b',
  ZUMARA:       '#fb923c',
};

const TYPE_ORDER = ['HCG', 'DEPARTMENT', 'COORDINATION', 'SECTION', 'ZUMARA'];

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

export default function OrganizationPage() {
  const [units, setUnits]   = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  // Create unit modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]     = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({
    name: '', type: 'DEPARTMENT', description: '', parentId: '',
  });

  const load = () => {
    setLoading(true);
    api.get<{ data: OrgUnit[] }>('/organization/units')
      .then(res => setUnits(res.data ?? []))
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/organization/units', {
        name: form.name,
        type: form.type,
        description: form.description || undefined,
        parentId: form.parentId || undefined,
      });
      setShowCreate(false);
      setForm({ name: '', type: 'DEPARTMENT', description: '', parentId: '' });
      load();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setCreating(false);
    }
  };

  const grouped = units.reduce<Record<string, OrgUnit[]>>((acc, u) => {
    (acc[u.type] ??= []).push(u);
    return acc;
  }, {});

  // Build tree for display: parent units at top, children indented
  const buildTree = (typeUnits: OrgUnit[]): { unit: OrgUnit; depth: number }[] => {
    const roots = typeUnits.filter(u => !u.parentId || !typeUnits.find(p => p.id === u.parentId));
    const result: { unit: OrgUnit; depth: number }[] = [];
    const addChildren = (parentId: string, depth: number) => {
      typeUnits.filter(u => u.parentId === parentId).forEach(u => {
        result.push({ unit: u, depth });
        addChildren(u.id, depth + 1);
      });
    };
    roots.forEach(r => {
      result.push({ unit: r, depth: 0 });
      addChildren(r.id, 1);
    });
    return result;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 600 }}>
          Structure de l&apos;organisation
        </h1>
        <button onClick={() => { setShowCreate(true); setCreateError(''); }} style={btnPrimary}>
          + Créer une unité
        </button>
      </div>
      <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {units.length} unité{units.length !== 1 ? 's' : ''} organisationnelle{units.length !== 1 ? 's' : ''}
      </p>

      {/* ── Modal: Créer une unité ─────────────────────────────────────────── */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
            padding: '1.75rem', width: 440, maxWidth: '90vw',
          }}>
            <h2 style={{ color: '#e6edf3', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Créer une unité organisationnelle
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Nom *</label>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required minLength={2}
                    placeholder="Ex: Département Communication"
                  />
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Type *</label>
                  <select
                    style={inputStyle}
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {TYPE_ORDER.map(t => (
                      <option key={t} value={t}>{TYPE_LABEL[t] ?? t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Description</label>
                  <input
                    style={inputStyle}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optionnel"
                  />
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
                    Unité parente
                  </label>
                  <select
                    style={inputStyle}
                    value={form.parentId}
                    onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                  >
                    <option value="">— Aucune (racine) —</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{TYPE_LABEL[u.type] ?? u.type} · {u.name}</option>
                    ))}
                  </select>
                </div>
                {createError && (
                  <div style={{ color: '#f87171', fontSize: '0.8125rem', background: 'rgba(248,113,113,0.1)', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
                    {createError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button type="button" onClick={() => setShowCreate(false)} style={btnSecondary}>Annuler</button>
                  <button type="submit" disabled={creating} style={btnPrimary}>
                    {creating ? 'Création…' : 'Créer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '1rem', color: '#f87171', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Chargement…</p>
      ) : units.length === 0 ? (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Aucune unité organisationnelle créée
          </p>
          <p style={{ color: '#8b949e', fontSize: '0.75rem' }}>
            Commencez par créer le HCG, puis les départements et coordinations.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {TYPE_ORDER.filter(t => grouped[t]?.length).map(type => (
            <div key={type}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em',
                  padding: '2px 8px', borderRadius: 4,
                  background: `${TYPE_COLOR[type]}20`,
                  border: `1px solid ${TYPE_COLOR[type]}40`,
                  color: TYPE_COLOR[type],
                }}>
                  {TYPE_LABEL[type] ?? type}
                </span>
                <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>
                  {grouped[type].length} unité{grouped[type].length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {buildTree(grouped[type]).map(({ unit: u, depth }) => (
                  <div key={u.id} style={{
                    background: '#161b22', border: '1px solid #30363d',
                    borderRadius: 8, padding: '0.875rem 1rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    marginLeft: depth * 20,
                  }}>
                    {depth > 0 && (
                      <span style={{ color: '#30363d', fontSize: '0.75rem', flexShrink: 0 }}>└─</span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#e6edf3', fontWeight: 500, fontSize: '0.9375rem' }}>
                        {u.name}
                      </div>
                      {u.description && (
                        <div style={{ color: '#8b949e', fontSize: '0.8125rem', marginTop: 2 }}>
                          {u.description}
                        </div>
                      )}
                    </div>
                    {u._count && (
                      <span style={{ color: '#8b949e', fontSize: '0.75rem', flexShrink: 0 }}>
                        {u._count.memberships} membre{u._count.memberships !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600,
                      padding: '2px 8px', borderRadius: 4,
                      background: u.status === 'ACTIVE' ? 'rgba(52,211,153,0.1)' : 'rgba(100,116,139,0.1)',
                      border: `1px solid ${u.status === 'ACTIVE' ? 'rgba(52,211,153,0.3)' : 'rgba(100,116,139,0.3)'}`,
                      color: u.status === 'ACTIVE' ? '#34d399' : '#94a3b8',
                    }}>
                      {u.status === 'ACTIVE' ? 'Actif' : u.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
