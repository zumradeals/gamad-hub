'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';

type RevelationPath = 'DIRECT' | 'THRESHOLD' | 'SPONSORED' | 'CHOSEN';

interface RevelationEventItem {
  id: string;
  gamadId: string;
  path: RevelationPath;
  actorId: string | null;
  note: string | null;
  grantedAt: string;
  gamad?: { publicCode: string; profile?: { displayName: string | null } | null };
}

interface Candidate {
  gamadId: string;
  publicCode: string;
  reputationScore: number;
  completedFormations: number;
  zumaraLeaderMonths: number;
  profile: { displayName: string | null; country: string | null } | null;
}

const PATH_COLOR: Record<RevelationPath, string> = {
  DIRECT: '#E5C100', THRESHOLD: '#1696D2', SPONSORED: '#0E9F4B', CHOSEN: '#a78bfa',
};

const PATH_LABEL: Record<RevelationPath, string> = {
  DIRECT: 'Invitation directe', THRESHOLD: 'Seuil silencieux', SPONSORED: 'Parrainage', CHOSEN: 'Élu ignorant',
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

const inputStyle: React.CSSProperties = {
  background: '#0d1117', border: '1px solid #30363d', borderRadius: 6,
  padding: '0.5rem 0.75rem', color: '#e6edf3', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box',
};

export default function RevelationPage() {
  const [view, setView] = useState<'events' | 'candidates'>('events');
  const [events, setEvents] = useState<RevelationEventItem[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [grantModal, setGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({ gamadId: '', path: 'DIRECT' as RevelationPath, note: '' });
  const [error, setError] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    try { setEvents(await api.get<RevelationEventItem[]>('/revelation/events')); }
    catch { setError('Erreur chargement événements'); }
    finally { setLoading(false); }
  };

  const loadCandidates = async () => {
    setLoading(true);
    try { setCandidates(await api.get<Candidate[]>('/revelation/candidates')); }
    catch { setError('Erreur chargement candidats'); }
    finally { setLoading(false); }
  };

  useEffect(() => { view === 'events' ? loadEvents() : loadCandidates(); }, [view]);

  const grantAccess = async () => {
    if (!grantForm.gamadId) { alert('GAMAD ID requis'); return; }
    try {
      await api.post('/revelation/grant', grantForm);
      setGrantModal(false);
      setGrantForm({ gamadId: '', path: 'DIRECT', note: '' });
      loadEvents();
    } catch { alert('Erreur lors de l\'accordage d\'accès'); }
  };

  const sponsor = async (gamadId: string) => {
    const note = prompt('Note de parrainage (optionnel) :') ?? undefined;
    try {
      await api.post('/revelation/sponsor', { gamadId, note });
      alert('Parrainage enregistré — en attente de validation HCG');
      loadCandidates();
    } catch { alert('Erreur parrainage'); }
  };

  return (
    <div style={{ padding: '1.5rem', color: '#e6edf3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Module Révélation</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#8b949e', fontSize: '0.875rem' }}>
            Accès souverain au Core — 4 chemins de révélation
          </p>
        </div>
        <button style={btn('#E5C100')} onClick={() => setGrantModal(true)}>+ Accorder accès</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button style={tab(view === 'events')} onClick={() => setView('events')}>Historique</button>
        <button style={tab(view === 'candidates')} onClick={() => setView('candidates')}>Candidats potentiels</button>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {loading && <p style={{ color: '#8b949e' }}>Chargement…</p>}

      {/* EVENTS */}
      {view === 'events' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {events.length === 0 && <p style={{ color: '#8b949e' }}>Aucun événement de révélation.</p>}
          {events.map((e) => (
            <div key={e.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, marginRight: '0.75rem' }}>
                  {e.gamad?.profile?.displayName ?? e.gamad?.publicCode ?? e.gamadId}
                </span>
                <span style={{ background: PATH_COLOR[e.path] + '22', color: PATH_COLOR[e.path], borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  {PATH_LABEL[e.path]}
                </span>
                {e.note && <span style={{ marginLeft: '0.75rem', color: '#8b949e', fontSize: '0.8rem' }}>{e.note}</span>}
              </div>
              <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>
                {new Date(e.grantedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CANDIDATES */}
      {view === 'candidates' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {candidates.length === 0 && <p style={{ color: '#8b949e' }}>Aucun candidat trouvé.</p>}
          {candidates.map((c) => (
            <div key={c.gamadId} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>
                  {c.profile?.displayName ?? c.publicCode}
                </span>
                <span style={{ color: '#8b949e', fontSize: '0.8rem', marginRight: '1rem' }}>{c.profile?.country ?? '—'}</span>
                <span style={{ color: '#E5C100', fontSize: '0.8rem', marginRight: '0.75rem' }}>⭐ {c.reputationScore} pts</span>
                <span style={{ color: '#60a5fa', fontSize: '0.8rem', marginRight: '0.75rem' }}>📚 {c.completedFormations} formations</span>
                <span style={{ color: '#34d399', fontSize: '0.8rem' }}>🏛 {c.zumaraLeaderMonths} rôles dirigeants</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={btn('#0E9F4B')} onClick={() => sponsor(c.gamadId)}>Parrainer</button>
                <button style={btn('#E5C100')} onClick={() => { setGrantForm(f => ({ ...f, gamadId: c.gamadId })); setGrantModal(true); }}>
                  Révéler
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Grant */}
      {grantModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '2rem', width: 420 }}>
            <h3 style={{ margin: '0 0 1.25rem', color: '#e6edf3' }}>Accorder l'accès au Core</h3>
            <label style={{ color: '#8b949e', fontSize: '0.8rem' }}>GAMAD ID</label>
            <input value={grantForm.gamadId} onChange={(e) => setGrantForm(f => ({ ...f, gamadId: e.target.value }))} style={{ ...inputStyle, marginTop: '0.25rem', marginBottom: '1rem' }} placeholder="UUID du citoyen" />
            <label style={{ color: '#8b949e', fontSize: '0.8rem' }}>Chemin de révélation</label>
            <select value={grantForm.path} onChange={(e) => setGrantForm(f => ({ ...f, path: e.target.value as RevelationPath }))} style={{ ...inputStyle, marginTop: '0.25rem', marginBottom: '1rem' }}>
              <option value="DIRECT">Invitation directe (HCG)</option>
              <option value="THRESHOLD">Seuil silencieux (algorithme)</option>
              <option value="SPONSORED">Parrainage</option>
              <option value="CHOSEN">Élu ignorant</option>
            </select>
            <label style={{ color: '#8b949e', fontSize: '0.8rem' }}>Note interne (optionnel)</label>
            <textarea value={grantForm.note} onChange={(e) => setGrantForm(f => ({ ...f, note: e.target.value }))} rows={3} style={{ ...inputStyle, marginTop: '0.25rem', marginBottom: '1.25rem', resize: 'vertical' }} placeholder="Contexte souverain — jamais publié" />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button style={btn('#6b7280')} onClick={() => setGrantModal(false)}>Annuler</button>
              <button style={btn('#E5C100')} onClick={grantAccess}>Accorder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
