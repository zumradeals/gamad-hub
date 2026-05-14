'use client';
import { useEffect, useState, useRef } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SignalButton from '../../components/SignalButton';
import { publicGet, authPost, getToken, getUser } from '../../lib/api';
import Link from 'next/link';

interface FeedPost {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  gamad: { profile: { displayName: string; avatarUrl?: string } };
  reactions: { emoji: string; gamadId: string }[];
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return new Date(date).toLocaleDateString('fr-FR');
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const isLoggedIn = typeof window !== 'undefined' && !!getToken();

  useEffect(() => {
    publicGet<{ posts: FeedPost[] }>('/portal/feed')
      .then(r => setPosts(r.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const post = await authPost<FeedPost>('/portal/feed', { content });
      setPosts(p => [post, ...p]);
      setContent('');
    } catch { /* silent */ }
    finally { setPosting(false); }
  }

  async function react(postId: string, emoji: string) {
    if (!isLoggedIn) return;
    try {
      await authPost(`/portal/feed/${postId}/react`, { emoji });
      const updated = await publicGet<{ posts: FeedPost[] }>('/portal/feed');
      setPosts(updated.posts);
    } catch { /* silent */ }
  }

  return (
    <>
      <Nav />
      <main style={{ padding: '2.5rem 1.5rem', minHeight: '80vh' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.625rem', marginBottom: '0.375rem' }}>Communauté</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Partagez, échangez, contribuez.
          </p>

          {/* Composer */}
          {isLoggedIn ? (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <form onSubmit={submitPost} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Partagez quelque chose avec la communauté…"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  maxLength={1000}
                  style={{ minHeight: '80px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{content.length}/1000</span>
                  <button type="submit" className="btn btn-primary" disabled={posting || !content.trim()} style={{ padding: '0.5rem 1.25rem' }}>
                    {posting ? 'Publication…' : 'Publier'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '1.5rem' }}>
              <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <Link href="/connexion" style={{ color: 'var(--blue)', fontWeight: 600 }}>Connectez-vous</Link>{' '}
                ou{' '}
                <Link href="/inscription" style={{ color: 'var(--blue)', fontWeight: 600 }}>créez un compte</Link>{' '}
                pour participer à la communauté.
              </p>
            </div>
          )}

          {/* Posts */}
          {loading ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Chargement…</p>
          ) : posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              Aucune publication pour l'instant. Soyez le premier à partager !
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map(p => {
                const reactions = p.reactions.reduce<Record<string, number>>((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
                  return acc;
                }, {});
                return (
                  <div key={p.id} className="card">
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--navy)', color: 'var(--gold)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                      }}>
                        {(p.gamad.profile.displayName ?? 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.gamad.profile.displayName}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{timeAgo(p.createdAt)}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--graphite)', marginBottom: '0.875rem', whiteSpace: 'pre-wrap' }}>
                      {p.content}
                    </p>
                    {Object.keys(reactions).length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {Object.entries(reactions).map(([emoji, count]) => (
                          <button key={emoji} onClick={() => react(p.id, emoji)} style={{
                            background: '#f3f4f6', border: '1px solid var(--border)',
                            borderRadius: '999px', padding: '0.2rem 0.65rem',
                            fontSize: '0.875rem', cursor: isLoggedIn ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}>
                            {emoji} <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {isLoggedIn && (
                      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {['👍', '❤️', '🙏', '🔥'].map(em => (
                          <button key={em} onClick={() => react(p.id, em)} style={{
                            background: 'transparent', border: '1px solid var(--border)',
                            borderRadius: '999px', padding: '0.15rem 0.5rem',
                            fontSize: '0.875rem', cursor: 'pointer', opacity: 0.7,
                          }}>
                            {em}
                          </button>
                        ))}
                        <div style={{ marginLeft: 'auto' }}>
                          <SignalButton contentId={p.id} contentType="feed" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
