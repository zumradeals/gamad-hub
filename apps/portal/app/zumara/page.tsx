'use client';
import { useEffect, useState, useRef } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SignalButton from '../../components/SignalButton';
import Link from 'next/link';
import { publicGet, authPost, getToken } from '../../lib/api';

type Tab = 'publications' | 'groupes';
type ZumaraType = 'LOCAL' | 'DIGITAL' | 'HYBRID';

interface FeedPost {
  id: string;
  content: string;
  createdAt: string;
  gamad: { profile: { displayName: string; avatarUrl?: string } };
  reactions: { emoji: string; gamadId: string }[];
}

interface ZumaraCell {
  id: string;
  name: string;
  slug: string;
  objective: string;
  type: ZumaraType;
  country: string | null;
  city: string | null;
  status: string;
  memberCount: number;
  cotisationAmount: number | null;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return new Date(date).toLocaleDateString('fr-FR');
}

const TYPE_LABEL: Record<ZumaraType, string> = { LOCAL: 'Locale', DIGITAL: 'Numérique', HYBRID: 'Hybride' };
const TYPE_COLOR: Record<ZumaraType, string> = { LOCAL: '#0E9F4B', DIGITAL: '#1696D2', HYBRID: '#E5C100' };

export default function ZumaraCarrefourPage() {
  const [tab, setTab] = useState<Tab>('publications');
  const isLoggedIn = typeof window !== 'undefined' && !!getToken();

  // Feed state
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  // Groups state
  const [cells, setCells] = useState<ZumaraCell[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    if (tab === 'publications') loadFeed();
    else loadGroups();
  }, [tab]);

  useEffect(() => {
    if (tab === 'groupes') loadGroups();
  }, [typeFilter, countryFilter]);

  async function loadFeed() {
    setFeedLoading(true);
    try {
      const r = await publicGet<{ posts: FeedPost[] }>('/portal/feed');
      setPosts(r.posts);
    } catch { /* silent */ }
    finally { setFeedLoading(false); }
  }

  async function loadGroups() {
    setGroupsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (typeFilter) qs.set('type', typeFilter);
      if (countryFilter) qs.set('country', countryFilter);
      const data = await publicGet<ZumaraCell[]>(`/portal/zumara?${qs}`);
      setCells(data);
    } catch { /* silent */ }
    finally { setGroupsLoading(false); }
  }

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

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.6rem 1.5rem',
    fontWeight: active ? 700 : 500,
    fontSize: '0.9rem',
    color: active ? 'var(--navy)' : 'var(--muted)',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'color 0.12s',
  });

  return (
    <>
      <Nav />
      <main style={{ minHeight: '80vh' }}>

        {/* Header */}
        <div style={{ background: 'var(--navy)', color: 'white', padding: '2.5rem 1.5rem' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                  <span style={{ color: 'var(--gold)' }}>Le </span>Zumara
                </h1>
                <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  La place publique de la Nation GAMAD — citoyens, groupes, projets.
                </p>
              </div>
              <Link href="/zumara/creer" style={{
                background: 'var(--gold)', color: 'var(--navy)',
                borderRadius: 8, padding: '0.6rem 1.25rem',
                fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap',
              }}>
                + Créer un groupe
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'white', position: 'sticky', top: 64, zIndex: 40 }}>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex' }}>
            <button style={tabStyle(tab === 'publications')} onClick={() => setTab('publications')}>
              Publications
            </button>
            <button style={tabStyle(tab === 'groupes')} onClick={() => setTab('groupes')}>
              Groupes
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' }}>

          {/* ── PUBLICATIONS ── */}
          {tab === 'publications' && (
            <div>
              {isLoggedIn ? (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <form onSubmit={submitPost} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Partagez quelque chose avec le Zumara…"
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
                <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '1.25rem' }}>
                  <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.875rem' }}>
                    <Link href="/connexion" style={{ color: 'var(--blue)', fontWeight: 600 }}>Connectez-vous</Link>{' '}
                    ou{' '}
                    <Link href="/inscription" style={{ color: 'var(--blue)', fontWeight: 600 }}>créez un compte</Link>{' '}
                    pour participer au Zumara.
                  </p>
                </div>
              )}

              {feedLoading ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Chargement…</p>
              ) : posts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                  Aucune publication pour l'instant. Soyez le premier à prendre la parole.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {posts.map(p => {
                    const reactions = p.reactions.reduce<Record<string, number>>((acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] ?? 0) + 1; return acc;
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
                        <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '0.875rem', whiteSpace: 'pre-wrap' }}>
                          {p.content}
                        </p>
                        {Object.keys(reactions).length > 0 && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            {Object.entries(reactions).map(([emoji, count]) => (
                              <button key={emoji} onClick={() => react(p.id, emoji)} style={{
                                background: '#f3f4f6', border: '1px solid var(--border)',
                                borderRadius: '999px', padding: '0.2rem 0.65rem',
                                fontSize: '0.875rem', cursor: isLoggedIn ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}>
                                {emoji} <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {isLoggedIn && (
                          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
          )}

          {/* ── GROUPES ── */}
          {tab === 'groupes' && (
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={filterStyle}>
                  <option value="">Tous les types</option>
                  <option value="LOCAL">Locale</option>
                  <option value="DIGITAL">Numérique</option>
                  <option value="HYBRID">Hybride</option>
                </select>
                <input
                  value={countryFilter}
                  onChange={e => setCountryFilter(e.target.value)}
                  placeholder="Pays…"
                  style={{ ...filterStyle, width: 140 }}
                />
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {cells.length} groupe{cells.length !== 1 ? 's' : ''}
                </span>
              </div>

              {groupsLoading ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Chargement…</p>
              ) : cells.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Aucun groupe trouvé.</p>
                  <Link href="/zumara/creer" className="btn btn-primary">Créer le premier groupe</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cells.map(c => (
                    <Link key={c.id} href={`/zumara/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</span>
                            <span style={{
                              background: TYPE_COLOR[c.type as ZumaraType] + '18',
                              color: TYPE_COLOR[c.type as ZumaraType],
                              borderRadius: 4, padding: '0.1rem 0.45rem',
                              fontSize: '0.7rem', fontWeight: 700,
                            }}>
                              {TYPE_LABEL[c.type as ZumaraType]}
                            </span>
                            {c.country && (
                              <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>· {c.country}{c.city ? `, ${c.city}` : ''}</span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.objective}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy)' }}>👥 {c.memberCount}</span>
                          {c.cotisationAmount && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                              {c.cotisationAmount} Z
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

const filterStyle: React.CSSProperties = {
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '0.45rem 0.75rem', fontSize: '0.875rem',
  color: 'var(--navy)', background: 'white', cursor: 'pointer',
};
