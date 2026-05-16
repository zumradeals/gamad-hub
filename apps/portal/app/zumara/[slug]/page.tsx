'use client';
import { useEffect, useState, useRef } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { publicGet, authPost, authGet, getToken, getUser } from '../../../lib/api';

/* ─── Types ─── */
type Tab = 'fil' | 'membres' | 'apropos';

interface ZumaraCell {
  id: string;
  name: string;
  slug: string;
  objective: string;
  type: 'LOCAL' | 'DIGITAL' | 'HYBRID';
  country: string | null;
  city: string | null;
  status: string;
  visibility: string;
  memberCount: number;
  cotisationAmount: number | null;
  cotisationPeriod: string | null;
  walletBalance: number;
  activatedAt: string;
  createdAt: string;
  isMember: boolean;
  memberships: CellMember[];
  _count: { memberships: number };
}

interface CellMember {
  role: string;
  joinedAt: string;
  gamad: { publicCode: string; profile: { displayName: string; avatarUrl?: string } | null };
}

interface FeedPost {
  id: string;
  content: string;
  createdAt: string;
  gamad: { publicCode: string; profile: { displayName: string; avatarUrl?: string } };
  reactions: { emoji: string; gamadId: string }[];
  _count: { comments: number };
}

interface PortalUser {
  gamadId: string;
  publicCode: string;
  profile?: { displayName: string };
}

/* ─── Constants ─── */
const TYPE_LABEL = { LOCAL: 'Locale', DIGITAL: 'Numérique', HYBRID: 'Hybride' };
const TYPE_COLOR = { LOCAL: '#0E9F4B', DIGITAL: '#1696D2', HYBRID: '#E5C100' };
const TYPE_EMOJI = { LOCAL: '📍', DIGITAL: '🌐', HYBRID: '🔗' };
const ROLE_LABEL: Record<string, string> = {
  FOUNDER: '⭐ Fondateur', CO_FOUNDER: '◈ Co-fondateur', MEMBER: '◉ Membre',
};
const REACTIONS = ['👍', '❤️', '🔥', '💡', '✊', '😂'];
const AVATAR_COLORS = ['#071326', '#1696D2', '#0E9F4B', '#E5C100', '#a78bfa', '#f59e0b'];

/* ─── Helpers ─── */
function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function ago(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'maintenant';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(date).toLocaleDateString('fr-FR');
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: avatarColor(name || '?'), color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35,
    }}>
      {initials(name)}
    </div>
  );
}

/* ─── Main Page ─── */
export default function ZumaraProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [cell, setCell] = useState<ZumaraCell | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('fil');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [me, setMe] = useState<PortalUser | null>(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    if (token) {
      const stored = getUser<PortalUser>();
      if (stored) setMe(stored);
    }
    publicGet<ZumaraCell>(`/portal/zumara/${slug}`)
      .then(setCell)
      .catch(() => setError('Groupe introuvable'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function join() {
    if (!getToken()) { window.location.href = '/connexion'; return; }
    setJoining(true);
    try {
      await authPost(`/portal/zumara/${cell!.id}/join`, {});
      setCell(c => c ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c);
    } catch (e: any) { setError(e.message ?? 'Erreur'); }
    finally { setJoining(false); }
  }

  async function leave() {
    if (!confirm('Quitter ce groupe ?')) return;
    setLeaving(true);
    try {
      await authGet(`/portal/zumara/${cell!.id}/leave`);
      setCell(c => c ? { ...c, isMember: false, memberCount: Math.max(0, c.memberCount - 1) } : c);
    } catch (e: any) { setError(e.message ?? 'Erreur'); }
    finally { setLeaving(false); }
  }

  if (loading) return (
    <>
      <Nav />
      <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '2rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
        Chargement…
      </div>
      <Footer />
    </>
  );

  if (error || !cell) return (
    <>
      <Nav />
      <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error || 'Introuvable'}</p>
        <Link href="/zumara" style={{ color: '#1696D2', textDecoration: 'none' }}>← Retour aux groupes</Link>
      </div>
      <Footer />
    </>
  );

  const coverBg = `linear-gradient(135deg, ${TYPE_COLOR[cell.type]}33 0%, ${TYPE_COLOR[cell.type]}88 100%)`;

  return (
    <>
      <Nav />
      <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: '3rem' }}>

        {/* ── COVER ── */}
        <div style={{
          background: `linear-gradient(160deg, #071326 0%, ${TYPE_COLOR[cell.type]}55 100%)`,
          padding: '2.5rem 1rem 0',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Breadcrumb */}
            <Link href="/zumara" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textDecoration: 'none' }}>
              ← Tous les groupes
            </Link>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {/* Group icon */}
              <div style={{
                width: 88, height: 88, borderRadius: 16, flexShrink: 0,
                background: coverBg,
                border: '3px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem',
              }}>
                {TYPE_EMOJI[cell.type]}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0, paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                  <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>{cell.name}</h1>
                  <span style={{
                    background: TYPE_COLOR[cell.type] + '33', color: TYPE_COLOR[cell.type],
                    border: `1px solid ${TYPE_COLOR[cell.type]}55`,
                    borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {TYPE_LABEL[cell.type]}
                  </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span>👥 {cell.memberCount} membres</span>
                  {cell.country && <span>📍 {cell.country}{cell.city ? `, ${cell.city}` : ''}</span>}
                  <span style={{ color: cell.status === 'ACTIVE' ? '#34d399' : '#9ca3af' }}>
                    ● {cell.status === 'ACTIVE' ? 'Actif' : cell.status}
                  </span>
                </div>
              </div>

              {/* Action button */}
              <div style={{ paddingBottom: '1rem' }}>
                {isLoggedIn && cell.isMember ? (
                  <button
                    onClick={leave}
                    disabled={leaving}
                    style={{
                      padding: '0.625rem 1.25rem', background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
                      color: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                    }}
                  >
                    {leaving ? '…' : '✓ Membre · Quitter'}
                  </button>
                ) : (
                  <button
                    onClick={join}
                    disabled={joining}
                    style={{
                      padding: '0.625rem 1.5rem', background: '#E5C100',
                      border: 'none', borderRadius: 8,
                      color: '#071326', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    }}
                  >
                    {joining ? 'En cours…' : '+ Rejoindre'}
                  </button>
                )}
              </div>
            </div>

            {/* Tab nav */}
            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
              {([
                { key: 'fil', label: 'Fil d\'actualité' },
                { key: 'membres', label: 'Membres' },
                { key: 'apropos', label: 'À propos' },
              ] as { key: Tab; label: string }[]).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    padding: '0.625rem 1.25rem', background: 'transparent', border: 'none',
                    borderBottom: tab === t.key ? '3px solid #E5C100' : '3px solid transparent',
                    color: tab === t.key ? 'white' : 'rgba(255,255,255,0.55)',
                    fontWeight: tab === t.key ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: 900, margin: '1.25rem auto', padding: '0 1rem' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#991b1b', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {tab === 'fil' && (
            <FilTab cell={cell} isLoggedIn={isLoggedIn} me={me} />
          )}
          {tab === 'membres' && (
            <MembresTab cellId={cell.id} previewMembers={cell.memberships} total={cell._count.memberships} />
          )}
          {tab === 'apropos' && (
            <AProposTab cell={cell} />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

/* ─── Fil Tab ─── */
function FilTab({ cell, isLoggedIn, me }: { cell: ZumaraCell; isLoggedIn: boolean; me: PortalUser | null }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadFeed(1, true);
  }, [cell.id]);

  async function loadFeed(p: number, reset: boolean) {
    if (reset) setLoading(true);
    try {
      const r = await publicGet<{ posts: FeedPost[]; pages: number }>(`/portal/feed?cellId=${cell.id}&page=${p}`);
      if (reset) setPosts(r.posts ?? []);
      else setPosts(prev => [...prev, ...(r.posts ?? [])]);
      setHasMore(p < r.pages);
      setPage(p);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  async function onReact(postId: string, emoji: string) {
    if (!isLoggedIn) return;
    try {
      await authPost(`/portal/feed/${postId}/react`, { emoji });
      const updated = await publicGet<FeedPost>(`/portal/feed/${postId}`);
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    } catch { /* silent */ }
  }

  const displayName = me?.profile?.displayName ?? me?.publicCode ?? '';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
      <div>
        {/* Composer */}
        {isLoggedIn && (
          <GroupComposer cellId={cell.id} me={me} onPosted={p => setPosts(prev => [p, ...prev])} />
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2].map(i => <Skeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
            {isLoggedIn
              ? 'Aucune publication dans ce groupe. Soyez le premier à poster !'
              : 'Rejoignez le groupe pour voir et publier dans le fil.'}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {posts.map(p => <PostCard key={p.id} post={p} isLoggedIn={isLoggedIn} me={me} onReact={onReact} />)}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button
                  onClick={() => loadFeed(page + 1, false)}
                  style={{ padding: '0.6rem 2rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  Voir plus
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right mini-info */}
      <aside style={{ position: 'sticky', top: 80 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            À propos
          </div>
          <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
            {cell.objective.slice(0, 120)}{cell.objective.length > 120 ? '…' : ''}
          </p>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span>👥 {cell.memberCount} membres</span>
            {cell.country && <span>📍 {cell.country}{cell.city ? `, ${cell.city}` : ''}</span>}
            {cell.cotisationAmount && <span>💰 {cell.cotisationAmount} Z / {cell.cotisationPeriod ?? 'mois'}</span>}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ─── Group Composer ─── */
function GroupComposer({ cellId, me, onPosted }: {
  cellId: string; me: PortalUser | null; onPosted: (p: FeedPost) => void;
}) {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const displayName = me?.profile?.displayName ?? me?.publicCode ?? '';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const post = await authPost<FeedPost>('/portal/feed', { content, cellId });
      onPosted(post);
      setContent('');
      setExpanded(false);
    } catch { /* silent */ }
    finally { setPosting(false); }
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Avatar name={displayName} size={40} />
          <div style={{ flex: 1 }}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              placeholder={`Partagez avec ${me?.profile?.displayName?.split(' ')[0] ?? 'le groupe'}…`}
              rows={expanded ? 3 : 1}
              maxLength={1000}
              style={{
                width: '100%', resize: 'none', border: '1px solid #e5e7eb',
                borderRadius: 20, padding: '0.625rem 1rem', fontSize: '0.9375rem',
                background: '#f0f2f5', outline: 'none', fontFamily: 'inherit',
                lineHeight: 1.5, boxSizing: 'border-box', color: '#071326',
              }}
            />
            {expanded && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setExpanded(false); setContent(''); }}
                  style={{ padding: '0.4rem 0.75rem', background: '#f0f2f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', color: '#6B7280' }}>
                  Annuler
                </button>
                <button type="submit" disabled={posting || !content.trim()}
                  style={{ padding: '0.4rem 1rem', background: content.trim() ? '#E5C100' : '#e5e7eb', border: 'none', borderRadius: 8, cursor: content.trim() ? 'pointer' : 'default', fontSize: '0.875rem', fontWeight: 700, color: content.trim() ? '#071326' : '#9ca3af' }}>
                  {posting ? '…' : 'Publier'}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── PostCard ─── */
function PostCard({ post, isLoggedIn, me, onReact }: {
  post: FeedPost; isLoggedIn: boolean; me: PortalUser | null;
  onReact: (id: string, emoji: string) => void;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reactions = post.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1; return acc;
  }, {});
  const displayName = post.gamad?.profile?.displayName ?? 'Citoyen';

  async function loadComments() {
    if (commentsLoaded) { setShowComments(v => !v); return; }
    setShowComments(true);
    try {
      const list = await publicGet<any[]>(`/portal/feed/${post.id}/comments`);
      setComments(Array.isArray(list) ? list : []);
      setCommentsLoaded(true);
    } catch { /* silent */ }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const c = await authPost<any>(`/portal/feed/${post.id}/comments`, { content: commentText });
      setComments(prev => [...prev, c]);
      setCommentText('');
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '1rem 1rem 0.625rem', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
        <Link href={`/profil/${post.gamad?.publicCode}`} style={{ textDecoration: 'none' }}>
          <Avatar name={displayName} size={40} />
        </Link>
        <div>
          <Link href={`/profil/${post.gamad?.publicCode}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#071326' }}>{displayName}</div>
          </Link>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{ago(post.createdAt)}</div>
        </div>
      </div>

      <div style={{ padding: '0 1rem 0.875rem', fontSize: '0.9375rem', lineHeight: 1.7, color: '#1f2937', whiteSpace: 'pre-wrap' }}>
        {post.content.split(/(#[\wÀ-ž]+)/g).map((part, i) =>
          part.startsWith('#')
            ? <span key={i} style={{ color: '#1696D2', fontWeight: 600 }}>{part}</span>
            : <span key={i}>{part}</span>
        )}
      </div>

      {post.reactions.length > 0 && (
        <div style={{ padding: '0 1rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {Object.entries(reactions).slice(0, 3).map(([em]) => <span key={em} style={{ fontSize: '0.875rem' }}>{em}</span>)}
            <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: 4 }}>{post.reactions.length}</span>
          </div>
          {(post._count?.comments ?? 0) > 0 && (
            <button onClick={loadComments} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#6B7280' }}>
              {post._count.comments} commentaire{post._count.comments !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      <div style={{ borderTop: '1px solid #f3f4f6', margin: '0 1rem' }} />

      <div style={{ padding: '0.25rem 0.5rem', display: 'flex', gap: '0.25rem' }}>
        <div style={{ position: 'relative', flex: 1 }}
          onMouseEnter={() => { if (!isLoggedIn) return; timer.current = setTimeout(() => setShowReactions(true), 400); }}
          onMouseLeave={() => { if (timer.current) clearTimeout(timer.current); setShowReactions(false); }}
        >
          <button onClick={() => isLoggedIn && onReact(post.id, '👍')}
            style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: 'none', cursor: isLoggedIn ? 'pointer' : 'default', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>
            👍 J'aime
          </button>
          {showReactions && isLoggedIn && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, background: 'white', borderRadius: 999, padding: '0.375rem 0.625rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', gap: '0.25rem', zIndex: 100, border: '1px solid #f3f4f6' }}>
              {REACTIONS.map(em => (
                <button key={em} onClick={() => { onReact(post.id, em); setShowReactions(false); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.4rem', padding: '0.2rem', lineHeight: 1 }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.4) translateY(-4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={loadComments}
          style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>
          💬 Commenter
        </button>
      </div>

      {showComments && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '0.75rem 1rem' }}>
          {comments.map(c => {
            const cName = c.gamad?.profile?.displayName ?? 'Citoyen';
            return (
              <div key={c.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                <Avatar name={cName} size={28} />
                <div style={{ background: '#f0f2f5', borderRadius: '0 12px 12px 12px', padding: '0.5rem 0.75rem', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#071326', marginBottom: 2 }}>{cName}</div>
                  <div style={{ fontSize: '0.875rem', color: '#374151' }}>{c.content}</div>
                </div>
              </div>
            );
          })}
          {isLoggedIn && (
            <form onSubmit={submitComment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: comments.length > 0 ? '0.5rem' : 0 }}>
              <Avatar name={me?.profile?.displayName ?? ''} size={28} />
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Écrire un commentaire…" maxLength={500}
                style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 20, padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#f0f2f5', outline: 'none', color: '#1f2937' }} />
              <button type="submit" disabled={!commentText.trim() || submitting}
                style={{ background: commentText.trim() ? '#E5C100' : '#e5e7eb', border: 'none', borderRadius: 8, padding: '0.4rem 0.625rem', cursor: commentText.trim() ? 'pointer' : 'default', fontWeight: 700, fontSize: '0.8rem', color: commentText.trim() ? '#071326' : '#9ca3af', flexShrink: 0 }}>
                {submitting ? '…' : 'Envoyer'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Membres Tab ─── */
function MembresTab({ cellId, previewMembers, total }: {
  cellId: string; previewMembers: CellMember[]; total: number;
}) {
  const [members, setMembers] = useState<CellMember[]>(previewMembers);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(total > previewMembers.length);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  async function loadMore() {
    setLoading(true);
    const next = page + 1;
    try {
      const r = await publicGet<{ members: CellMember[]; pages: number }>(`/portal/zumara/${cellId}/members?page=${next}`);
      setMembers(prev => [...prev, ...(r.members ?? [])]);
      setHasMore(next < r.pages);
      setPage(next);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  const filtered = members.filter(m => {
    if (!search) return true;
    const name = (m.gamad?.profile?.displayName ?? m.gamad?.publicCode ?? '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const founders = filtered.filter(m => m.role === 'FOUNDER' || m.role === 'CO_FOUNDER');
  const regular = filtered.filter(m => m.role !== 'FOUNDER' && m.role !== 'CO_FOUNDER');

  return (
    <div>
      <div style={{ background: 'white', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un membre…"
          style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem 0.875rem', fontSize: '0.875rem', background: '#f0f2f5', outline: 'none' }}
        />
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{total} membre{total !== 1 ? 's' : ''}</span>
      </div>

      {founders.length > 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Équipe fondatrice
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {founders.map((m, i) => <MemberCard key={i} member={m} />)}
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 12, padding: '1rem' }}>
        {founders.length > 0 && (
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Membres
          </div>
        )}
        {regular.length === 0 && founders.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>Aucun membre trouvé.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {regular.map((m, i) => <MemberCard key={i} member={m} />)}
          </div>
        )}
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={loadMore} disabled={loading}
              style={{ padding: '0.6rem 2rem', background: '#f0f2f5', border: 'none', borderRadius: 10, cursor: loading ? 'default' : 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#071326' }}>
              {loading ? '…' : 'Voir plus'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: CellMember }) {
  const name = member.gamad?.profile?.displayName ?? member.gamad?.publicCode ?? 'Citoyen';
  const code = member.gamad?.publicCode;
  return (
    <Link href={code ? `/profil/${code}` : '#'} style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem', borderRadius: 10, border: '1px solid #f3f4f6', transition: 'border-color 0.1s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#E5C100')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#f3f4f6')}>
        <Avatar name={name} size={38} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#071326', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
          <div style={{ fontSize: '0.7rem', color: member.role === 'FOUNDER' ? '#E5C100' : member.role === 'CO_FOUNDER' ? '#1696D2' : '#9ca3af', fontWeight: 600 }}>
            {ROLE_LABEL[member.role] ?? member.role}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── À Propos Tab ─── */
function AProposTab({ cell }: { cell: ZumaraCell }) {
  const stats = [
    { label: 'Membres', value: String(cell.memberCount) },
    { label: 'Type', value: TYPE_LABEL[cell.type] },
    { label: 'Statut', value: cell.status === 'ACTIVE' ? '✓ Actif' : cell.status },
    { label: 'Cotisation', value: cell.cotisationAmount ? `${cell.cotisationAmount} Z / ${cell.cotisationPeriod ?? 'mois'}` : 'Gratuit' },
    { label: 'Créé le', value: new Date(cell.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) },
    { label: 'Activé le', value: new Date(cell.activatedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem', alignItems: 'start' }}>
      <div>
        <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Mission & objectif
          </div>
          <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.75, margin: 0 }}>{cell.objective}</p>
        </div>

        {cell.country && (
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Localisation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.9375rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📍</span>
              <span>{cell.country}{cell.city ? `, ${cell.city}` : ''}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
          Informations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>{s.label}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#071326' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {cell.walletBalance > 0 && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef9e7', borderRadius: 8, border: '1px solid #E5C10030' }}>
            <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600, marginBottom: 2 }}>Trésorerie</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#E5C100', fontSize: '1.1rem' }}>
              {cell.walletBalance.toLocaleString('fr-FR')} Z
            </div>
          </div>
        )}

        <Link href="/zumara" style={{
          display: 'block', marginTop: '1rem', textAlign: 'center', padding: '0.5rem',
          color: '#1696D2', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600,
        }}>
          ← Explorer d'autres groupes
        </Link>
      </div>
    </div>
  );
}

/* ─── Utilities ─── */
function Skeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 12, height: 120, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
    </div>
  );
}
