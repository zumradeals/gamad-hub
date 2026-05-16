'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { publicGet, authPost, authGet, getToken, getUser } from '../../lib/api';

/* ─── Types ─── */
interface FeedPost {
  id: string;
  content: string;
  createdAt: string;
  gamad: { publicCode: string; profile: { displayName: string; avatarUrl?: string } };
  reactions: { emoji: string; gamadId: string }[];
  _count: { comments: number };
}

interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  gamad: { publicCode: string; profile: { displayName: string; avatarUrl?: string } };
}

interface PortalUser {
  gamadId: string;
  publicCode: string;
  profile?: { displayName: string; avatarUrl?: string };
}

type SortMode = 'recent' | 'popular';

/* ─── Constants ─── */
const REACTIONS = ['👍', '❤️', '🔥', '💡', '✊', '😂'];
const AVATAR_COLORS = ['#071326', '#1696D2', '#0E9F4B', '#E5C100', '#a78bfa', '#f59e0b'];

/* ─── Helpers ─── */
function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function ago(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'maintenant';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}j`;
  return new Date(date).toLocaleDateString('fr-FR');
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: avatarColor(name), color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35,
    }}>
      {initials(name)}
    </div>
  );
}

/* ─── Main Page ─── */
export default function FeedPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [me, setMe] = useState<PortalUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<SortMode>('recent');
  const [hashtag, setHashtag] = useState('');
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    if (token) {
      const stored = getUser<PortalUser>();
      if (stored) setMe(stored);
    }
  }, []);

  const loadFeed = useCallback(async (p: number, s: SortMode, tag: string, reset: boolean) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const qs = new URLSearchParams({ page: String(p), sort: s });
      if (tag) qs.set('hashtag', tag.replace('#', ''));
      const r = await publicGet<{ posts: FeedPost[]; pages: number }>(`/portal/feed?${qs}`);
      const list = r.posts ?? [];
      if (reset) {
        setPosts(list);
        // compute trending from first page
        const tags: Record<string, number> = {};
        list.forEach(post => {
          (post.content.match(/#[\wÀ-ž]+/g) ?? []).forEach(t => { tags[t] = (tags[t] ?? 0) + 1; });
        });
        setTrendingTags(Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t));
      } else {
        setPosts(prev => [...prev, ...list]);
      }
      setHasMore(p < r.pages);
    } catch { /* silent */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => {
    setPage(1);
    loadFeed(1, sort, hashtag, true);
  }, [sort, hashtag]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    loadFeed(next, sort, hashtag, false);
  }

  function onPosted(post: FeedPost) {
    setPosts(prev => [post, ...prev]);
  }

  function onDeleted(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  async function onReact(postId: string, emoji: string) {
    if (!isLoggedIn) return;
    try {
      await authPost(`/portal/feed/${postId}/react`, { emoji });
      // Optimistically refresh the post reactions
      const updated = await publicGet<FeedPost>(`/portal/feed/${postId}`);
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    } catch { /* silent */ }
  }

  return (
    <>
      <Nav />
      <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingTop: '1.25rem', paddingBottom: '3rem' }}>
        <div style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '0 1rem',
          display: 'grid',
          gridTemplateColumns: '280px 1fr 280px',
          gap: '1rem',
          alignItems: 'start',
        }}>

          {/* ── LEFT ── */}
          <aside style={{ position: 'sticky', top: 80 }}>
            {/* Sort */}
            <div style={{ background: 'white', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
                Trier par
              </div>
              {(['recent', 'popular'] as SortMode[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  style={{
                    width: '100%', padding: '0.6rem 0.875rem', background: sort === s ? '#f0f2f5' : 'transparent',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    color: sort === s ? '#071326' : '#6B7280',
                    fontWeight: sort === s ? 700 : 500, fontSize: '0.875rem',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    borderLeft: sort === s ? '3px solid #E5C100' : '3px solid transparent',
                    marginBottom: '0.25rem',
                  }}
                >
                  {s === 'recent' ? '🕐 Les plus récents' : '🔥 Les plus populaires'}
                </button>
              ))}
            </div>

            {/* Hashtag filter */}
            {trendingTags.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
                  Tendances
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {hashtag && (
                    <button
                      onClick={() => setHashtag('')}
                      style={{
                        width: '100%', padding: '0.4rem 0.75rem', background: '#fef3c7',
                        border: '1px solid #E5C100', borderRadius: 8, cursor: 'pointer',
                        color: '#92400e', fontWeight: 600, fontSize: '0.8rem', textAlign: 'left',
                      }}
                    >
                      ✕ Effacer le filtre
                    </button>
                  )}
                  {trendingTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setHashtag(hashtag === tag ? '' : tag)}
                      style={{
                        width: '100%', padding: '0.4rem 0.75rem',
                        background: hashtag === tag ? '#E5C10018' : 'transparent',
                        border: hashtag === tag ? '1px solid #E5C100' : '1px solid transparent',
                        borderRadius: 8, cursor: 'pointer',
                        color: '#1696D2', fontWeight: 600, fontSize: '0.875rem', textAlign: 'left',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation rapide */}
            <div style={{ background: 'white', borderRadius: 12, padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
                Navigation
              </div>
              {[
                { href: '/zumara', label: '◎ Zumara', desc: 'Groupes & communauté' },
                { href: '/citoyens', label: '👥 Citoyens', desc: 'Annuaire des membres' },
                { href: '/messages', label: '✉ Messages', desc: 'Messagerie privée' },
                { href: '/ressources', label: '📚 Ressources', desc: 'Bibliothèque' },
              ].map(n => (
                <Link key={n.href} href={n.href} style={{ textDecoration: 'none', display: 'block', padding: '0.5rem 0.5rem', borderRadius: 8, marginBottom: '0.125rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#071326' }}>{n.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{n.desc}</div>
                </Link>
              ))}
            </div>
          </aside>

          {/* ── CENTER ── */}
          <main style={{ minWidth: 0 }}>
            {/* Composer */}
            <Composer me={me} isLoggedIn={isLoggedIn} onPosted={onPosted} />

            {/* Filter bar */}
            {hashtag && (
              <div style={{
                background: '#E5C10018', border: '1px solid #E5C100',
                borderRadius: 10, padding: '0.625rem 1rem', marginBottom: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ color: '#92400e', fontWeight: 600, fontSize: '0.875rem' }}>
                  Filtré par {hashtag}
                </span>
                <button onClick={() => setHashtag('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#92400e', fontSize: '1rem' }}>✕</button>
              </div>
            )}

            {/* Posts */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map(i => <Skeleton key={i} />)}
              </div>
            ) : posts.length === 0 ? (
              <Empty>
                {hashtag
                  ? `Aucune publication avec ${hashtag}.`
                  : 'Aucune publication pour l\'instant. Soyez le premier à prendre la parole.'}
              </Empty>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {posts.map(p => (
                    <PostCard
                      key={p.id}
                      post={p}
                      isLoggedIn={isLoggedIn}
                      me={me}
                      onReact={onReact}
                      onDeleted={onDeleted}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      style={{
                        padding: '0.625rem 2rem', background: 'white',
                        border: '1px solid #e5e7eb', borderRadius: 10,
                        cursor: loadingMore ? 'default' : 'pointer',
                        fontWeight: 600, fontSize: '0.875rem', color: '#071326',
                      }}
                    >
                      {loadingMore ? 'Chargement…' : 'Voir plus'}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* ── RIGHT ── */}
          <aside style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* About */}
            <div style={{ background: '#071326', borderRadius: 12, padding: '1rem', color: 'white' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#E5C100', marginBottom: '0.375rem' }}>
                Le Fil GAMAD
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
                Partagez vos pensées, projets et visions avec les citoyens du monde GAMAD.
              </p>
            </div>

            {/* Stats */}
            <div style={{ background: 'white', borderRadius: 12, padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Activité du fil
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Publications</span>
                  <span style={{ fontWeight: 700, color: '#071326', fontSize: '0.875rem' }}>{posts.length}+</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Réactions</span>
                  <span style={{ fontWeight: 700, color: '#071326', fontSize: '0.875rem' }}>
                    {posts.reduce((acc, p) => acc + p.reactions.length, 0)}+
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Commentaires</span>
                  <span style={{ fontWeight: 700, color: '#071326', fontSize: '0.875rem' }}>
                    {posts.reduce((acc, p) => acc + (p._count?.comments ?? 0), 0)}+
                  </span>
                </div>
              </div>
            </div>

            {/* Trending */}
            {trendingTags.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  Hashtags populaires
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {trendingTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setHashtag(hashtag === tag ? '' : tag)}
                      style={{
                        padding: '0.25rem 0.625rem',
                        background: hashtag === tag ? '#E5C100' : '#f0f2f5',
                        border: 'none', borderRadius: 999, cursor: 'pointer',
                        color: hashtag === tag ? '#071326' : '#1696D2',
                        fontWeight: 600, fontSize: '0.78rem',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA rejoindre */}
            {!isLoggedIn && (
              <div style={{ background: 'white', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  Rejoignez la Nation GAMAD et participez au fil.
                </p>
                <Link href="/inscription" style={{
                  display: 'block', background: '#E5C100', color: '#071326',
                  borderRadius: 8, padding: '0.6rem', fontWeight: 700,
                  fontSize: '0.875rem', textDecoration: 'none', marginBottom: '0.5rem',
                }}>
                  Créer un compte
                </Link>
                <Link href="/connexion" style={{
                  display: 'block', color: '#1696D2', fontSize: '0.8rem', textDecoration: 'none',
                }}>
                  Déjà membre ? Se connecter
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}

/* ─── Composer ─── */
function Composer({ me, isLoggedIn, onPosted }: {
  me: PortalUser | null; isLoggedIn: boolean; onPosted: (p: FeedPost) => void;
}) {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isLoggedIn) {
    return (
      <div style={{ background: 'white', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', textAlign: 'center' }}>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>
          <Link href="/connexion" style={{ color: '#1696D2', fontWeight: 600 }}>Connectez-vous</Link>
          {' '}ou{' '}
          <Link href="/inscription" style={{ color: '#1696D2', fontWeight: 600 }}>créez un compte</Link>
          {' '}pour publier dans le fil.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const post = await authPost<FeedPost>('/portal/feed', { content });
      onPosted(post);
      setContent('');
      setExpanded(false);
    } catch { /* silent */ }
    finally { setPosting(false); }
  }

  const displayName = me?.profile?.displayName ?? me?.publicCode ?? '';

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Avatar name={displayName} size={42} />
          <div style={{ flex: 1 }}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              placeholder={`Partagez quelque chose, ${displayName.split(' ')[0] || 'citoyen'}…`}
              rows={expanded ? 4 : 1}
              maxLength={1000}
              style={{
                width: '100%', resize: 'none', border: '1px solid #e5e7eb',
                borderRadius: 20, padding: '0.625rem 1rem',
                fontSize: '0.9375rem', color: '#071326',
                background: '#f0f2f5', outline: 'none',
                fontFamily: 'inherit', lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
            />
            {expanded && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.625rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['😊', '📸', '#️⃣'].map(emoji => (
                    <button
                      key={emoji} type="button"
                      onClick={() => {
                        if (emoji === '#️⃣') setContent(c => c.endsWith(' ') ? c + '#' : c + ' #');
                        else setContent(c => c + emoji);
                        textareaRef.current?.focus();
                      }}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: '1.1rem', padding: '0.25rem', color: '#6B7280',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{content.length}/1000</span>
                  <button
                    type="button"
                    onClick={() => { setExpanded(false); setContent(''); }}
                    style={{
                      padding: '0.4rem 0.75rem', background: '#f0f2f5',
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      fontSize: '0.875rem', color: '#6B7280',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={posting || !content.trim()}
                    style={{
                      padding: '0.4rem 1.125rem',
                      background: content.trim() ? '#E5C100' : '#e5e7eb',
                      border: 'none', borderRadius: 8,
                      cursor: content.trim() ? 'pointer' : 'default',
                      fontSize: '0.875rem', fontWeight: 700,
                      color: content.trim() ? '#071326' : '#9ca3af',
                    }}
                  >
                    {posting ? 'Publication…' : 'Publier'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── PostCard ─── */
function PostCard({ post, isLoggedIn, me, onReact, onDeleted }: {
  post: FeedPost; isLoggedIn: boolean; me: PortalUser | null;
  onReact: (id: string, emoji: string) => void;
  onDeleted: (id: string) => void;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reactions = post.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1; return acc;
  }, {});
  const totalReactions = post.reactions.length;
  const displayName = post.gamad?.profile?.displayName ?? 'Citoyen';
  const isOwn = me && post.gamad?.publicCode && me.publicCode === post.gamad.publicCode;

  async function loadComments() {
    if (commentsLoaded) { setShowComments(v => !v); return; }
    setShowComments(true);
    try {
      const list = await publicGet<FeedComment[]>(`/portal/feed/${post.id}/comments`);
      setComments(Array.isArray(list) ? list : []);
      setCommentsLoaded(true);
    } catch { /* silent */ }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !isLoggedIn) return;
    setSubmittingComment(true);
    try {
      const c = await authPost<FeedComment>(`/portal/feed/${post.id}/comments`, { content: commentText });
      setComments(prev => [...prev, c]);
      setCommentText('');
    } catch { /* silent */ }
    finally { setSubmittingComment(false); }
  }

  async function deletePost() {
    if (!isOwn) return;
    try {
      await authPost(`/portal/feed/${post.id}/delete`, {});
    } catch { /* silent */ }
    onDeleted(post.id);
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <Link href={`/profil/${post.gamad?.publicCode}`} style={{ textDecoration: 'none' }}>
          <Avatar name={displayName} size={42} />
        </Link>
        <div style={{ flex: 1 }}>
          <Link href={`/profil/${post.gamad?.publicCode}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#071326' }}>{displayName}</div>
          </Link>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{ago(post.createdAt)}</div>
        </div>
        {isOwn && (
          <button
            onClick={deletePost}
            title="Supprimer"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem', padding: '0.25rem' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Content — hashtags highlighted */}
      <div style={{ padding: '0 1rem 0.875rem', fontSize: '0.9375rem', lineHeight: 1.75, color: '#1f2937', whiteSpace: 'pre-wrap' }}>
        {post.content.split(/(#[\wÀ-ž]+)/g).map((part, i) =>
          part.startsWith('#')
            ? <span key={i} style={{ color: '#1696D2', fontWeight: 600 }}>{part}</span>
            : <span key={i}>{part}</span>
        )}
      </div>

      {/* Reaction summary */}
      {totalReactions > 0 && (
        <div style={{ padding: '0 1rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {Object.entries(reactions).slice(0, 3).map(([emoji]) => (
              <span key={emoji} style={{ fontSize: '0.875rem' }}>{emoji}</span>
            ))}
            <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: 4 }}>{totalReactions}</span>
          </div>
          {(post._count?.comments ?? 0) > 0 && (
            <button
              onClick={loadComments}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#6B7280' }}
            >
              {post._count.comments} commentaire{post._count.comments !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      <div style={{ borderTop: '1px solid #f3f4f6', margin: '0 1rem' }} />

      {/* Action bar */}
      <div style={{ padding: '0.25rem 0.5rem', display: 'flex', gap: '0.25rem' }}>
        {/* React */}
        <div
          style={{ position: 'relative', flex: 1 }}
          onMouseEnter={() => {
            if (!isLoggedIn) return;
            reactionTimer.current = setTimeout(() => setShowReactions(true), 400);
          }}
          onMouseLeave={() => {
            if (reactionTimer.current) clearTimeout(reactionTimer.current);
            setShowReactions(false);
          }}
        >
          <button
            onClick={() => isLoggedIn && onReact(post.id, '👍')}
            style={{
              width: '100%', padding: '0.5rem', background: 'transparent', border: 'none',
              cursor: isLoggedIn ? 'pointer' : 'default', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              color: '#6B7280', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            👍 J'aime
          </button>
          {showReactions && isLoggedIn && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0,
              background: 'white', borderRadius: 999, padding: '0.375rem 0.625rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', gap: '0.25rem',
              zIndex: 100, border: '1px solid #f3f4f6',
            }}>
              {REACTIONS.map(em => (
                <button
                  key={em}
                  onClick={() => { onReact(post.id, em); setShowReactions(false); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.4rem', padding: '0.2rem', lineHeight: 1 }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.4) translateY(-4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <button
          onClick={loadComments}
          style={{
            flex: 1, padding: '0.5rem', background: 'transparent', border: 'none',
            cursor: 'pointer', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            color: '#6B7280', fontSize: '0.875rem', fontWeight: 500,
          }}
        >
          💬 Commenter
        </button>

        {/* Share */}
        <button
          style={{
            flex: 1, padding: '0.5rem', background: 'transparent', border: 'none',
            cursor: 'pointer', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            color: '#6B7280', fontSize: '0.875rem', fontWeight: 500,
          }}
        >
          ↗ Partager
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '0.75rem 1rem' }}>
          {/* Comment list */}
          {comments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '0.75rem' }}>
              {comments.map(c => {
                const cName = c.gamad?.profile?.displayName ?? 'Citoyen';
                return (
                  <div key={c.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Avatar name={cName} size={28} />
                    <div style={{
                      background: '#f0f2f5', borderRadius: '0 12px 12px 12px',
                      padding: '0.5rem 0.75rem', flex: 1, minWidth: 0,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#071326', marginBottom: 2 }}>{cName}</div>
                      <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{c.content}</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', flexShrink: 0, paddingTop: 8 }}>{ago(c.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment input */}
          {isLoggedIn ? (
            <form onSubmit={submitComment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Avatar name={me?.profile?.displayName ?? me?.publicCode ?? ''} size={28} />
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Écrire un commentaire…"
                maxLength={500}
                style={{
                  flex: 1, border: '1px solid #e5e7eb', borderRadius: 20,
                  padding: '0.5rem 1rem', fontSize: '0.875rem',
                  background: '#f0f2f5', outline: 'none', color: '#1f2937',
                }}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                style={{
                  background: commentText.trim() ? '#E5C100' : '#e5e7eb',
                  border: 'none', borderRadius: 8, padding: '0.4rem 0.75rem',
                  cursor: commentText.trim() ? 'pointer' : 'default',
                  fontWeight: 700, fontSize: '0.8rem',
                  color: commentText.trim() ? '#071326' : '#9ca3af',
                  flexShrink: 0,
                }}
              >
                {submittingComment ? '…' : 'Envoyer'}
              </button>
            </form>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>
              <Link href="/connexion" style={{ color: '#1696D2', fontWeight: 600 }}>Connectez-vous</Link> pour commenter
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Utilities ─── */
function Skeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '1rem', height: 120 }}>
      <div style={{
        height: '100%', borderRadius: 8,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#6B7280', fontSize: '0.9rem' }}>
      {children}
    </div>
  );
}
