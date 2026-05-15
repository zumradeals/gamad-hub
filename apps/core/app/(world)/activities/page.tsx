'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { getCitizen } from '../../../lib/citizen';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  tasks?: Task[];
  owner?: { profile?: { displayName: string } | null };
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  assignee?: { profile?: { displayName: string } | null };
}

const ACTIVITY_STATUS_COLOR: Record<string, string> = {
  DRAFT: '#9ca3af', SUBMITTED: '#60a5fa', VALIDATED: '#34d399',
  IN_PROGRESS: '#f59e0b', COMPLETED: '#0E9F4B', ARCHIVED: '#6b7280',
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: '#9ca3af', NORMAL: '#60a5fa', HIGH: '#f59e0b', STRATEGIC: '#E5C100',
};

const TASK_STATUS_COLOR: Record<string, string> = {
  TODO: '#9ca3af', IN_PROGRESS: '#60a5fa', BLOCKED: '#f87171', DONE: '#34d399', CANCELLED: '#6b7280',
};

const btn = (color: string, small?: boolean): React.CSSProperties => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: small ? '0.25rem 0.6rem' : '0.4rem 0.9rem',
  cursor: 'pointer', fontSize: small ? '0.75rem' : '0.8rem', fontWeight: 600,
});

const inputStyle: React.CSSProperties = {
  background: '#0d1117', border: '1px solid #30363d', borderRadius: 6,
  padding: '0.5rem 0.75rem', color: '#e6edf3', fontSize: '0.875rem',
  width: '100%', boxSizing: 'border-box',
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [active, setActive] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', description: '', priority: 'NORMAL' });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const citizen = getCitizen();

  const load = () =>
    api.get<Activity[]>('/activities').then(setActivities).catch(() => {}).finally(() => setLoading(false));

  const openActivity = async (a: Activity) => {
    const full = await api.get<Activity>(`/activities/${a.id}`).catch(() => null);
    if (full) setActive(full);
  };

  const createActivity = async () => {
    if (!newForm.title.trim()) return;
    const a = await api.post<Activity>('/activities', newForm).catch(() => null);
    if (a) { setActivities(prev => [a, ...prev]); setNewForm({ title: '', description: '', priority: 'NORMAL' }); setShowNew(false); }
  };

  const changeStatus = async (id: string, action: string) => {
    await api.post(`/activities/${id}/${action}`, {}).catch(() => {});
    if (active?.id === id) openActivity(active);
    else load();
  };

  const addTask = async () => {
    if (!active || !newTaskTitle.trim()) return;
    await api.post(`/activities/${active.id}/tasks`, { title: newTaskTitle }).catch(() => {});
    setNewTaskTitle('');
    openActivity(active);
  };

  const completeTask = async (taskId: string) => {
    await api.post(`/activities/tasks/${taskId}/complete`, {}).catch(() => {});
    if (active) openActivity(active);
  };

  useEffect(() => { load(); }, []);

  if (active) return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <button style={btn('#30363d')} onClick={() => { setActive(null); load(); }}>← Retour</button>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, flex: 1 }}>{active.title}</h2>
        <span style={{ background: (ACTIVITY_STATUS_COLOR[active.status] ?? '#9ca3af') + '22', color: ACTIVITY_STATUS_COLOR[active.status] ?? '#9ca3af', borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
          {active.status}
        </span>
      </div>

      {active.description && <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '1rem' }}>{active.description}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {active.status === 'DRAFT' && <button style={btn('#1696D2', true)} onClick={() => changeStatus(active.id, 'submit')}>Soumettre</button>}
        {active.status === 'VALIDATED' && <button style={btn('#f59e0b', true)} onClick={() => changeStatus(active.id, 'start')}>Démarrer</button>}
        {active.status === 'IN_PROGRESS' && <button style={btn('#0E9F4B', true)} onClick={() => changeStatus(active.id, 'complete')}>Terminer</button>}
        {['DRAFT', 'SUBMITTED', 'IN_PROGRESS'].includes(active.status) && (
          <button style={btn('#6b7280', true)} onClick={() => changeStatus(active.id, 'archive')}>Archiver</button>
        )}
      </div>

      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#8b949e' }}>Tâches ({active.tasks?.length ?? 0})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
        {(active.tasks ?? []).map(t => (
          <div key={t.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '0.6rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.875rem', marginRight: '0.5rem', textDecoration: t.status === 'DONE' ? 'line-through' : 'none', color: t.status === 'DONE' ? '#6b7280' : '#e6edf3' }}>{t.title}</span>
              <span style={{ background: (TASK_STATUS_COLOR[t.status] ?? '#9ca3af') + '22', color: TASK_STATUS_COLOR[t.status] ?? '#9ca3af', borderRadius: 4, padding: '0.05rem 0.4rem', fontSize: '0.7rem', fontWeight: 700 }}>
                {t.status}
              </span>
            </div>
            {t.status !== 'DONE' && t.status !== 'CANCELLED' && (
              <button style={btn('#34d399', true)} onClick={() => completeTask(t.id)}>✓</button>
            )}
          </div>
        ))}
        {!active.tasks?.length && <p style={{ color: '#8b949e', fontSize: '0.82rem' }}>Aucune tâche.</p>}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
          style={inputStyle} placeholder="Nouvelle tâche…"
          onKeyDown={e => e.key === 'Enter' && addTask()} />
        <button style={btn('#1696D2')} onClick={addTask} disabled={!newTaskTitle.trim()}>+</button>
      </div>
    </div>
  );

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Activités</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#8b949e', fontSize: '0.875rem' }}>Projets, tâches et workflows.</p>
        </div>
        <button style={btn('#1696D2')} onClick={() => setShowNew(v => !v)}>+ Nouvelle activité</button>
      </div>

      {showNew && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
          <input value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))}
            style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="Titre de l'activité…" />
          <textarea value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))}
            rows={2} style={{ ...inputStyle, resize: 'vertical', marginBottom: '0.5rem' }} placeholder="Description (optionnel)…" />
          <select value={newForm.priority} onChange={e => setNewForm(f => ({ ...f, priority: e.target.value }))}
            style={{ ...inputStyle, marginBottom: '0.75rem' }}>
            <option value="LOW">Priorité basse</option>
            <option value="NORMAL">Priorité normale</option>
            <option value="HIGH">Priorité haute</option>
            <option value="STRATEGIC">Stratégique</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button style={btn('#30363d')} onClick={() => setShowNew(false)}>Annuler</button>
            <button style={btn('#0E9F4B')} onClick={createActivity} disabled={!newForm.title.trim()}>Créer</button>
          </div>
        </div>
      )}

      {loading && <p style={{ color: '#8b949e' }}>Chargement…</p>}
      {!loading && activities.length === 0 && <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucune activité pour le moment.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {activities.map(a => (
          <div key={a.id} onClick={() => openActivity(a)}
            style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '0.875rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</span>
                <span style={{ background: (PRIORITY_COLOR[a.priority] ?? '#9ca3af') + '22', color: PRIORITY_COLOR[a.priority] ?? '#9ca3af', borderRadius: 4, padding: '0.05rem 0.4rem', fontSize: '0.7rem', fontWeight: 700 }}>
                  {a.priority}
                </span>
              </div>
              {a.description && <p style={{ margin: 0, fontSize: '0.82rem', color: '#8b949e' }}>{a.description}</p>}
            </div>
            <span style={{ background: (ACTIVITY_STATUS_COLOR[a.status] ?? '#9ca3af') + '22', color: ACTIVITY_STATUS_COLOR[a.status] ?? '#9ca3af', borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '0.75rem' }}>
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
