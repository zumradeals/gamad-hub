'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

interface Document {
  id: string;
  title: string;
  documentType: string;
  classification: string;
  status: string;
  createdAt: string;
  owner?: { profile?: { displayName: string } | null };
  versions?: DocumentVersion[];
}

interface DocumentVersion {
  id: string;
  versionNumber: string;
  fileUrl: string;
  createdAt: string;
}

const TYPE_LABEL: Record<string, string> = {
  STATUTE: 'Statut', REPORT: 'Rapport', MANUAL: 'Manuel',
  PROCEDURE: 'Procédure', MEDIA: 'Média', ARCHIVE: 'Archive', TRAINING: 'Formation',
};

const CLASS_COLOR: Record<string, string> = {
  PUBLIC: '#34d399', INTERNAL: '#60a5fa', CONFIDENTIAL: '#f59e0b', STRATEGIC: '#a78bfa',
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: '#9ca3af', SUBMITTED: '#60a5fa', VALIDATED: '#34d399', ARCHIVED: '#6b7280',
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

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [active, setActive] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', documentType: 'MANUAL', classification: 'INTERNAL' });
  const [typeFilter, setTypeFilter] = useState('');

  const load = () =>
    api.get<Document[]>('/documents').then(setDocuments).catch(() => {}).finally(() => setLoading(false));

  const openDoc = async (d: Document) => {
    const full = await api.get<Document>(`/documents/${d.id}`).catch(() => null);
    if (full) setActive(full);
  };

  const createDoc = async () => {
    if (!newForm.title.trim()) return;
    const d = await api.post<Document>('/documents', newForm).catch(() => null);
    if (d) { setDocuments(prev => [d, ...prev]); setNewForm({ title: '', documentType: 'MANUAL', classification: 'INTERNAL' }); setShowNew(false); }
  };

  const submitDoc = async (id: string) => {
    await api.post(`/documents/${id}/submit`, {}).catch(() => {});
    load(); if (active?.id === id) setActive(null);
  };

  useEffect(() => { load(); }, []);

  const filtered = typeFilter ? documents.filter(d => d.documentType === typeFilter) : documents;

  if (active) return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <button style={btn('#30363d')} onClick={() => setActive(null)}>← Retour</button>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, flex: 1 }}>{active.title}</h2>
        <span style={{ background: (CLASS_COLOR[active.classification] ?? '#9ca3af') + '22', color: CLASS_COLOR[active.classification] ?? '#9ca3af', borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
          {active.classification}
        </span>
        <span style={{ background: (STATUS_COLOR[active.status] ?? '#9ca3af') + '22', color: STATUS_COLOR[active.status] ?? '#9ca3af', borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
          {active.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#8b949e' }}>
        <span>Type : {TYPE_LABEL[active.documentType] ?? active.documentType}</span>
        <span>Auteur : {active.owner?.profile?.displayName ?? '—'}</span>
        <span>Créé le : {new Date(active.createdAt).toLocaleDateString('fr-FR')}</span>
      </div>

      {active.status === 'DRAFT' && (
        <button style={{ ...btn('#1696D2'), marginBottom: '1.25rem' }} onClick={() => submitDoc(active.id)}>
          Soumettre pour validation
        </button>
      )}

      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#8b949e' }}>
        Versions ({active.versions?.length ?? 0})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {(active.versions ?? []).map(v => (
          <div key={v.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '0.6rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono, monospace)' }}>v{v.versionNumber}</span>
            <span style={{ color: '#8b949e', fontSize: '0.78rem' }}>{new Date(v.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        ))}
        {!active.versions?.length && <p style={{ color: '#8b949e', fontSize: '0.82rem' }}>Aucune version enregistrée.</p>}
      </div>
    </div>
  );

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Bibliothèque</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#8b949e', fontSize: '0.875rem' }}>Documents, versions et mémoire institutionnelle.</p>
        </div>
        <button style={btn('#1696D2')} onClick={() => setShowNew(v => !v)}>+ Nouveau document</button>
      </div>

      {showNew && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
          <input value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))}
            style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="Titre du document…" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <select value={newForm.documentType} onChange={e => setNewForm(f => ({ ...f, documentType: e.target.value }))} style={inputStyle}>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={newForm.classification} onChange={e => setNewForm(f => ({ ...f, classification: e.target.value }))} style={inputStyle}>
              <option value="PUBLIC">Public</option>
              <option value="INTERNAL">Interne</option>
              <option value="CONFIDENTIAL">Confidentiel</option>
              <option value="STRATEGIC">Stratégique</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button style={btn('#30363d')} onClick={() => setShowNew(false)}>Annuler</button>
            <button style={btn('#0E9F4B')} onClick={createDoc} disabled={!newForm.title.trim()}>Créer</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span style={{ fontSize: '0.8rem', color: '#8b949e', alignSelf: 'center' }}>{filtered.length} document(s)</span>
      </div>

      {loading && <p style={{ color: '#8b949e' }}>Chargement…</p>}
      {!loading && filtered.length === 0 && <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucun document trouvé.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map(d => (
          <div key={d.id} onClick={() => openDoc(d)}
            style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '0.875rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', marginRight: '0.5rem' }}>{d.title}</span>
              <span style={{ color: '#8b949e', fontSize: '0.78rem' }}>{TYPE_LABEL[d.documentType] ?? d.documentType}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ background: (CLASS_COLOR[d.classification] ?? '#9ca3af') + '22', color: CLASS_COLOR[d.classification] ?? '#9ca3af', borderRadius: 4, padding: '0.05rem 0.4rem', fontSize: '0.7rem', fontWeight: 700 }}>
                {d.classification}
              </span>
              <span style={{ background: (STATUS_COLOR[d.status] ?? '#9ca3af') + '22', color: STATUS_COLOR[d.status] ?? '#9ca3af', borderRadius: 4, padding: '0.05rem 0.4rem', fontSize: '0.7rem', fontWeight: 700 }}>
                {d.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
