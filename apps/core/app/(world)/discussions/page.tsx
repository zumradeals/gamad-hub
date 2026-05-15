'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { getCitizen } from '../../../lib/citizen';

interface Thread {
  id: string;
  title: string;
  visibility: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  posts?: Post[];
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author?: { profile?: { displayName: string } | null };
  reactions?: { emoji: string }[];
}

const VIS_COLOR: Record<string, string> = {
  PUBLIC: '#34d399', INTERNAL: '#60a5fa', UNIT: '#f59e0b', PRIVATE: '#a78bfa',
};

const btn = (color: string): React.CSSProperties => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
});

const inputStyle: React.CSSProperties = {
  background: '#0d1117', border: '1px solid #30363d', borderRadius: 6,
  padding: '0.5rem 0.75rem', color: '#e6edf3', fontSize: '0.875rem',
  width: '100%', boxSizing: 'border-box',
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return new Date(d).toLocaleDateString('fr-FR');
}

export default function DiscussionsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newPost, setNewPost] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadThreads = () =>
    api.get<Thread[]>('/communication/threads')
      .then(setThreads).catch(() => {}).finally(() => setLoading(false));

  const openThread = async (t: Thread) => {
    setActive(t);
    const full = await api.get<Thread>(`/communication/threads/${t.id}`).catch(() => null);
    if (full?.posts) setPosts(full.posts);
  };

  const createThread = async () => {
    if (!newTitle.trim()) return;
    const t = await api.post<Thread>('/communication/threads', { title: newTitle, visibility: 'INTERNAL' }).catch(() => null);
    if (t) { setThreads(prev => [t, ...prev]); setNewTitle(''); setShowNew(false); }
  };

  const postReply = async () => {
    if (!active || !newPost.trim()) return;
    setPosting(true);
    const p = await api.post<Post>(`/communication/threads/${active.id}/posts`, { content: newPost }).catch(() => null);
    if (p) { setPosts(prev => [...prev, p]); setNewPost(''); }
    setPosting(false);
  };

  const react = async (postId: string, emoji: string) => {
    await api.post(`/communication/posts/${postId}/react`, { emoji }).catch(() => {});
    if (active) openThread(active);
  };

  useEffect(() => { loadThreads(); }, []);

  if (active) return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <button style={btn('#30363d')} onClick={() => { setActive(null); setPosts([]); }}>← Retour</button>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, flex: 1 }}>{active.title}</h2>
        <span style={{ background: (VIS_COLOR[active.visibility] ?? '#9ca3af') + '22', color: VIS_COLOR[active.visibility] ?? '#9ca3af', borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
          {active.visibility}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {posts.length === 0 && <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucun message. Soyez le premier.</p>}
        {posts.map(p => {
          const reacts = (p.reactions ?? []).reduce<Record<string, number>>((acc, r) => {
            acc[r.emoji] = (acc[r.emoji] ?? 0) + 1; return acc;
          }, {});
          return (
            <div key={p.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '0.875rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.author?.profile?.displayName ?? '—'}</span>
                <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>{timeAgo(p.createdAt)}</span>
              </div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.content}</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {Object.entries(reacts).map(([em, n]) => (
                  <button key={em} onClick={() => react(p.id, em)} style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 20, padding: '0.15rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#e6edf3' }}>
                    {em} {n}
                  </button>
                ))}
                {!active.isLocked && ['👍', '🔥', '💡', '❤️'].map(em => (
                  <button key={em} onClick={() => react(p.id, em)} style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: 20, padding: '0.15rem 0.4rem', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.5 }}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!active.isLocked && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1rem' }}>
          <textarea value={newPost} onChange={e => setNewPost(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: 'vertical', marginBottom: '0.75rem' }}
            placeholder="Votre réponse…" />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={btn('#1696D2')} onClick={postReply} disabled={posting || !newPost.trim()}>
              {posting ? 'Envoi…' : 'Répondre'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Discussions</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#8b949e', fontSize: '0.875rem' }}>Forums et espaces d'échange du Core.</p>
        </div>
        <button style={btn('#1696D2')} onClick={() => setShowNew(v => !v)}>+ Nouveau fil</button>
      </div>

      {showNew && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
            style={{ ...inputStyle, marginBottom: '0.75rem' }} placeholder="Titre du fil de discussion…" />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button style={btn('#30363d')} onClick={() => setShowNew(false)}>Annuler</button>
            <button style={btn('#0E9F4B')} onClick={createThread} disabled={!newTitle.trim()}>Créer</button>
          </div>
        </div>
      )}

      {loading && <p style={{ color: '#8b949e' }}>Chargement…</p>}
      {!loading && threads.length === 0 && <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Aucun fil de discussion pour le moment.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {threads.map(t => (
          <div key={t.id} onClick={() => openThread(t)}
            style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '0.875rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                {t.isPinned && <span style={{ fontSize: '0.75rem' }}>📌</span>}
                {t.isLocked && <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>🔒</span>}
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</span>
              </div>
              <span style={{ color: '#8b949e', fontSize: '0.78rem' }}>{timeAgo(t.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ background: (VIS_COLOR[t.visibility] ?? '#9ca3af') + '22', color: VIS_COLOR[t.visibility] ?? '#9ca3af', borderRadius: 4, padding: '0.1rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}>
                {t.visibility}
              </span>
              <span style={{ color: '#8b949e' }}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
