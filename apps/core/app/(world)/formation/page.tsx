'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { getCitizen } from '../../../lib/citizen';

interface Formation {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  isPublic: boolean;
  status: string;
  modules?: FormationModule[];
  _count?: { modules: number; enrollments: number };
}

interface FormationModule {
  id: string;
  title: string;
  order: number;
  durationMin: number | null;
  completions?: { gamadId: string }[];
}

interface Enrollment {
  id: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  formation: { id: string; title: string };
  completedModules?: number;
  totalModules?: number;
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: '#9ca3af', PUBLISHED: '#34d399', ARCHIVED: '#6b7280',
  ENROLLED: '#60a5fa', IN_PROGRESS: '#f59e0b', COMPLETED: '#0E9F4B', CANCELLED: '#f87171',
};

const btn = (color: string): React.CSSProperties => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
});

export default function FormationPage() {
  const [tab, setTab] = useState<'catalogue' | 'mes-formations'>('mes-formations');
  const [formations, setFormations] = useState<Formation[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [active, setActive] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const citizen = getCitizen();

  useEffect(() => {
    if (tab === 'catalogue') {
      setLoading(true);
      api.get<Formation[]>('/formation').then(setFormations).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(true);
      api.get<Enrollment[]>('/formation/my-enrollments').then(setEnrollments).catch(() => {}).finally(() => setLoading(false));
    }
  }, [tab]);

  const openFormation = async (f: Formation) => {
    const full = await api.get<Formation>(`/formation/${f.id}`).catch(() => null);
    if (full) setActive(full);
  };

  const enroll = async (id: string) => {
    await api.post(`/formation/${id}/enroll`, {}).catch(() => {});
    setTab('mes-formations');
  };

  const completeModule = async (formationId: string, moduleId: string) => {
    await api.post(`/formation/${formationId}/modules/${moduleId}/complete`, {}).catch(() => {});
    if (active) openFormation(active);
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer',
    color: active ? '#e6edf3' : '#8b949e', fontWeight: active ? 700 : 400,
    borderBottom: active ? '2px solid #E5C100' : '2px solid transparent', fontSize: '0.875rem',
  });

  if (active) {
    const myEnrollment = enrollments.find(e => e.formation.id === active.id);
    return (
      <div style={{ color: '#e6edf3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <button style={btn('#30363d')} onClick={() => setActive(null)}>← Retour</button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, flex: 1 }}>{active.title}</h2>
          {!myEnrollment && (
            <button style={btn('#0E9F4B')} onClick={() => enroll(active.id)}>S'inscrire</button>
          )}
        </div>
        {active.description && <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{active.description}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(active.modules ?? []).sort((a, b) => a.order - b.order).map(m => {
            const done = (m.completions ?? []).some(c => c.gamadId === citizen?.gamadId);
            return (
              <div key={m.id} style={{ background: '#161b22', border: `1px solid ${done ? '#0E9F4B' : '#30363d'}`, borderRadius: 8, padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', marginRight: '0.5rem' }}>{m.order + 1}. {m.title}</span>
                  {m.durationMin && <span style={{ color: '#8b949e', fontSize: '0.78rem' }}>{m.durationMin} min</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {done ? (
                    <span style={{ color: '#0E9F4B', fontSize: '0.8rem', fontWeight: 700 }}>✓ Complété</span>
                  ) : myEnrollment ? (
                    <button style={btn('#1696D2')} onClick={() => completeModule(active.id, m.id)}>Marquer fait</button>
                  ) : null}
                </div>
              </div>
            );
          })}
          {!active.modules?.length && <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucun module dans cette formation.</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Formation</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#8b949e', fontSize: '0.875rem' }}>Cours, parcours et certifications GAMAD.</p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #30363d', marginBottom: '1.25rem' }}>
        <button style={tabStyle(tab === 'mes-formations')} onClick={() => setTab('mes-formations')}>Mes inscriptions</button>
        <button style={tabStyle(tab === 'catalogue')} onClick={() => setTab('catalogue')}>Catalogue</button>
      </div>

      {loading && <p style={{ color: '#8b949e' }}>Chargement…</p>}

      {tab === 'mes-formations' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {enrollments.length === 0 && <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucune formation en cours. Explorez le catalogue.</p>}
          {enrollments.map(e => (
            <div key={e.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{e.formation.title}</span>
                <span style={{ background: (STATUS_COLOR[e.status] ?? '#9ca3af') + '22', color: STATUS_COLOR[e.status] ?? '#9ca3af', borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  {e.status === 'COMPLETED' ? 'Terminé ✓' : e.status === 'IN_PROGRESS' ? 'En cours' : 'Inscrit'}
                </span>
              </div>
              {e.status !== 'COMPLETED' && e.completedModules !== undefined && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#8b949e', marginBottom: '0.25rem' }}>
                    <span>Progression</span>
                    <span>{e.completedModules ?? 0}/{e.totalModules ?? '?'} modules</span>
                  </div>
                  <div style={{ height: 4, background: '#21262d', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#1696D2', width: `${((e.completedModules ?? 0) / (e.totalModules || 1)) * 100}%` }} />
                  </div>
                </div>
              )}
              <button style={{ ...btn('#1696D2'), marginTop: '0.75rem', padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                onClick={() => openFormation({ id: e.formation.id, title: e.formation.title, description: null, slug: '', isPublic: false, status: 'PUBLISHED' })}>
                Continuer →
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'catalogue' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {formations.filter(f => f.status === 'PUBLISHED').length === 0 && (
            <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucune formation publiée pour le moment.</p>
          )}
          {formations.filter(f => f.status === 'PUBLISHED').map(f => (
            <div key={f.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', marginRight: '0.75rem' }}>{f.title}</span>
                {f._count?.modules !== undefined && (
                  <span style={{ color: '#8b949e', fontSize: '0.78rem' }}>{f._count.modules} modules</span>
                )}
                {f.description && <p style={{ margin: '0.25rem 0 0', color: '#8b949e', fontSize: '0.82rem' }}>{f.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ ...btn('#30363d'), padding: '0.3rem 0.75rem', fontSize: '0.78rem' }} onClick={() => openFormation(f)}>Voir</button>
                <button style={{ ...btn('#0E9F4B'), padding: '0.3rem 0.75rem', fontSize: '0.78rem' }} onClick={() => enroll(f.id)}>S'inscrire</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
