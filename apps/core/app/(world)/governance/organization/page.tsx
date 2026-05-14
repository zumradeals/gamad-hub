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

export default function OrganizationPage() {
  const [units, setUnits]   = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get<{ data: OrgUnit[] }>('/organization/units')
      .then(res => setUnits(res.data ?? []))
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, []);

  // Group by type
  const grouped = units.reduce<Record<string, OrgUnit[]>>((acc, u) => {
    (acc[u.type] ??= []).push(u);
    return acc;
  }, {});

  const typeOrder = ['HCG', 'DEPARTMENT', 'COORDINATION', 'SECTION', 'ZUMARA'];

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Structure de l&apos;organisation
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {units.length} unité{units.length !== 1 ? 's' : ''} organisationnelle{units.length !== 1 ? 's' : ''}
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '1rem', color: '#f87171', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chargement…</p>
      ) : units.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Aucune unité organisationnelle créée
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Commencez par créer le HCG, puis les départements et coordinations.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {typeOrder.filter(t => grouped[t]?.length).map(type => (
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
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {grouped[type].length} unité{grouped[type].length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {grouped[type].map(u => (
                  <div key={u.id} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '0.875rem 1rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9375rem' }}>
                        {u.name}
                      </div>
                      {u.description && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 2 }}>
                          {u.description}
                        </div>
                      )}
                    </div>
                    {u._count && (
                      <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          {u._count.memberships} membre{u._count.memberships !== 1 ? 's' : ''}
                        </span>
                      </div>
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
