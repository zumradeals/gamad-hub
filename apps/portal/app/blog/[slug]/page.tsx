'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { publicGet, authPost, authGet, getToken } from '../../../lib/api';

const C = {
  gold:   '#E5C100',
  blue:   '#1696D2',
  green:  '#0E9F4B',
  navy:   '#071326',
  muted:  '#6B7280',
  border: '#E5E7EB',
  bg:     '#f0f2f5',
};

interface Category { id: string; name: string; color?: string }
interface Author   { profile?: { firstName: string; lastName: string; avatarUrl?: string }; displayName?: string }
interface Article {
  id: string; slug: string; title: string; excerpt?: string; content?: string;
  imageUrl?: string; videoUrl?: string; sponsored?: boolean;
  category?: Category; author?: Author;
  publishedAt?: string; viewCount?: number; likesCount?: number;
  readingTime?: number;
}
interface Comment {
  id: string;
  content: string;
  createdAt?: string;
  author?: Author;
}

/* ── helpers ── */
function initials(a?: Author): string {
  if (!a) return 'G';
  const p = a.profile;
  if (p?.firstName && p?.lastName) return (p.firstName[0] + p.lastName[0]).toUpperCase();
  if (a.displayName) return a.displayName.slice(0, 2).toUpperCase();
  return 'G';
}
function displayName(a?: Author): string {
  if (!a) return 'GAMAD';
  const p = a.profile;
  if (p?.firstName) return `${p.firstName} ${p.lastName ?? ''}`.trim();
  return a.displayName ?? 'Auteur';
}
function readTime(article: Article): number {
  if (article.readingTime) return article.readingTime;
  return Math.max(1, Math.ceil((article.content ?? '').split(/\s+/).length / 200));
}
function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatDateShort(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function avatarColor(name: string): string {
  const palette = [C.navy, C.blue, C.green, '#7C3AED', '#DB2777', '#EA580C'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ── Avatar component ── */
function Avatar({ author, size = 36 }: { author?: Author; size?: number }) {
  const dn = displayName(author);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: avatarColor(dn),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3 + 'px', fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>{initials(author)}</div>
  );
}

/* ── Toast ── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: type === 'success' ? C.green : '#DC2626',
      color: '#fff', fontWeight: 700, fontSize: '0.9rem',
      padding: '0.75rem 1.5rem', borderRadius: 10, zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>{message}</div>
  );
}

/* ── Badge catégorie ── */
function CategoryBadge({ cat }: { cat?: Category }) {
  if (!cat) return null;
  return (
    <span style={{
      display: 'inline-block', fontSize: '0.75rem', fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase' as const,
      background: '#EBF5FB', color: C.blue, padding: '0.25rem 0.625rem', borderRadius: 4,
    }}>{cat.name}</span>
  );
}

export default function ArticlePage() {
  const params    = useParams<{ slug: string }>();
  const slug      = params?.slug ?? '';
  const router    = useRouter();

  const [article,     setArticle]     = useState<Article | null>(null);
  const [comments,    setComments]    = useState<Comment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);

  // interactions
  const [liked,       setLiked]       = useState(false);
  const [likesCount,  setLikesCount]  = useState(0);
  const [alreadyRead, setAlreadyRead] = useState(false);
  const [readLoading, setReadLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // commentaires
  const [commentText, setCommentText] = useState('');
  const [commenting,  setCommenting]  = useState(false);

  // toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isLoggedIn = !!getToken();

  /* ── fetch article ── */
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    publicGet<Article>(`/portal/blog/${slug}`)
      .then(data => {
        setArticle(data);
        setLikesCount(data.likesCount ?? 0);
        // check localStorage for "already read"
        setAlreadyRead(!!localStorage.getItem(`read_${slug}`));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── fetch comments ── */
  useEffect(() => {
    if (!slug) return;
    publicGet<Comment[] | { comments: Comment[] }>(`/portal/blog/${slug}/comments`)
      .then(data => {
        const list = Array.isArray(data) ? data : ((data as any).comments ?? []);
        setComments(list);
      })
      .catch(() => {});
  }, [slug]);

  /* ── mark as read ── */
  async function handleRead() {
    if (alreadyRead || readLoading || !isLoggedIn) return;
    setReadLoading(true);
    try {
      const res = await authPost<{ rewarded?: boolean }>(`/portal/blog/${slug}/read`, {});
      localStorage.setItem(`read_${slug}`, '1');
      setAlreadyRead(true);
      if (res.rewarded) setToast({ message: '+0.5 Z crédité !', type: 'success' });
    } catch {
      setToast({ message: 'Erreur lors de la lecture', type: 'error' });
    } finally {
      setReadLoading(false);
    }
  }

  /* ── like ── */
  async function handleLike() {
    if (!isLoggedIn) { router.push('/connexion'); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await authPost(`/portal/blog/${slug}/like`, {});
      setLiked(prev => !prev);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
    } catch { /* silent */ }
    finally { setLikeLoading(false); }
  }

  /* ── comment ── */
  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || commenting) return;
    setCommenting(true);
    try {
      const newComment = await authPost<Comment>(`/portal/blog/${slug}/comments`, { content: commentText.trim() });
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      setToast({ message: '+1 Z crédité pour votre commentaire !', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message ?? 'Erreur lors du commentaire', type: 'error' });
    } finally {
      setCommenting(false);
    }
  }

  /* ── render states ── */
  if (loading) {
    return (
      <>
        <Nav />
        <main style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: C.muted, fontSize: '1rem' }}>Chargement de l'article…</div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !article) {
    return (
      <>
        <Nav />
        <main style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>📭</div>
          <p style={{ color: C.navy, fontWeight: 700, fontSize: '1.125rem' }}>Article introuvable</p>
          <Link href="/blog" style={{ color: C.blue, fontWeight: 600 }}>← Retour au Blog</Link>
        </main>
        <Footer />
      </>
    );
  }

  const rt     = readTime(article);
  const dn     = displayName(article.author);
  const ytId   = article.videoUrl ? extractYouTubeId(article.videoUrl) : null;

  return (
    <>
      <Nav />
      <main style={{ background: C.bg, minHeight: '100vh', paddingBottom: '6rem' }}>

        {/* ── Article container ── */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.25rem 3rem' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.8125rem', color: C.muted, marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <Link href="/blog" style={{ color: C.blue, textDecoration: 'none', fontWeight: 500 }}>Blog</Link>
            <span>›</span>
            {article.category && (
              <>
                <span>{article.category.name}</span>
                <span>›</span>
              </>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{article.title}</span>
          </div>

          {/* ── Header ── */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <CategoryBadge cat={article.category} />
            {article.sponsored && (
              <span style={{ background: C.gold, color: C.navy, fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: 4, letterSpacing: '0.04em' }}>SPONSORISÉ</span>
            )}
            {article.videoUrl && (
              <span style={{ background: C.blue, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 4 }}>▶ Article Vidéo</span>
            )}
            <span style={{ background: 'rgba(14,159,75,0.1)', color: C.green, fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 4, marginLeft: 'auto' }}>📿 Lu = +0.5 Z</span>
          </div>

          {/* Titre H1 */}
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, color: C.navy, lineHeight: 1.25, margin: '0 0 1.25rem' }}>
            {article.title}
          </h1>

          {/* Auteur + méta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem', padding: '1rem', background: '#fff', borderRadius: 10, border: `1px solid ${C.border}` }}>
            <Avatar author={article.author} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.9375rem' }}>{dn}</div>
              <div style={{ fontSize: '0.8rem', color: C.muted, display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
                <span>⏱ {rt} min de lecture</span>
                {(article.viewCount ?? 0) > 0 && <span>👁 {article.viewCount!.toLocaleString('fr-FR')} vues</span>}
              </div>
            </div>
          </div>

          {/* ── Media : vidéo ou image cover ── */}
          {ytId ? (
            <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: '2rem', position: 'relative', paddingTop: '56.25%', background: C.navy }}>
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                title={article.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          ) : article.imageUrl ? (
            <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: '2rem', maxHeight: 420, background: '#e8eaed' }}>
              <img src={article.imageUrl} alt={article.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
            </div>
          ) : (
            <div style={{ borderRadius: 12, marginBottom: '2rem', height: 180, background: `linear-gradient(135deg, ${C.navy} 0%, #1a2a4a 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
              📰
            </div>
          )}

          {/* Extrait mis en exergue */}
          {article.excerpt && (
            <div style={{ padding: '1rem 1.25rem', background: '#f8f9fa', borderLeft: `4px solid ${C.gold}`, borderRadius: '0 8px 8px 0', marginBottom: '2rem', fontSize: '1.0625rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.65 }}>
              {article.excerpt}
            </div>
          )}

          {/* ── Corps de l'article ── */}
          <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: '#1a1a2e', whiteSpace: 'pre-wrap', marginBottom: '3rem' }}>
            {article.content}
          </div>

          {/* ── Séparateur ── */}
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '2.5rem 0' }} />

          {/* ── Section commentaires ── */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: C.navy, marginBottom: '1.5rem' }}>
              Commentaires ({comments.length})
            </h2>

            {/* Liste des commentaires */}
            {comments.length === 0 ? (
              <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Aucun commentaire pour le moment. Soyez le premier !</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ background: '#fff', borderRadius: 10, padding: '1rem', border: `1px solid ${C.border}`, display: 'flex', gap: '0.75rem' }}>
                    <Avatar author={c.author} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700, color: C.navy, fontSize: '0.875rem' }}>{displayName(c.author)}</span>
                        {c.createdAt && <span style={{ fontSize: '0.75rem', color: C.muted }}>{formatDateShort(c.createdAt)}</span>}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#1a1a2e', lineHeight: 1.6 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire de commentaire */}
            {isLoggedIn ? (
              <form onSubmit={handleComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Partagez votre avis sur cet article…"
                  rows={3}
                  style={{
                    padding: '0.875rem 1rem', borderRadius: 10, border: `1px solid ${C.border}`,
                    fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical', outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={commenting || !commentText.trim()}
                    style={{
                      background: commenting || !commentText.trim() ? C.muted : C.blue,
                      color: '#fff', border: 'none', borderRadius: 8,
                      padding: '0.625rem 1.5rem', cursor: commenting || !commentText.trim() ? 'not-allowed' : 'pointer',
                      fontWeight: 700, fontSize: '0.875rem',
                    }}
                  >
                    {commenting ? 'Envoi…' : 'Commenter → +1 Z'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <p style={{ color: C.muted, marginBottom: '1rem', fontSize: '0.9rem' }}>Connectez-vous pour laisser un commentaire et gagner +1 Z</p>
                <Link href="/connexion" style={{
                  display: 'inline-block', background: C.gold, color: C.navy,
                  fontWeight: 700, padding: '0.625rem 1.5rem', borderRadius: 8,
                  textDecoration: 'none', fontSize: '0.875rem',
                }}>Se connecter</Link>
              </div>
            )}
          </section>
        </div>

        {/* ── Barre d'actions flottante ── */}
        <div style={{
          position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          background: C.navy, borderRadius: 50, padding: '0.625rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)', zIndex: 100,
        }}>
          {/* Bouton Lu / +0.5 Z */}
          {isLoggedIn ? (
            <button
              onClick={handleRead}
              disabled={alreadyRead || readLoading}
              style={{
                background: alreadyRead ? 'rgba(14,159,75,0.2)' : C.green,
                color: '#fff', border: 'none', borderRadius: 30,
                padding: '0.5rem 1.125rem', cursor: alreadyRead ? 'default' : 'pointer',
                fontWeight: 700, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
                opacity: readLoading ? 0.7 : 1,
              }}
            >
              {alreadyRead ? '✓ Lu' : readLoading ? '…' : '✓ Lu — +0.5 Z'}
            </button>
          ) : (
            <Link href="/connexion" style={{
              background: C.green, color: '#fff', borderRadius: 30,
              padding: '0.5rem 1.125rem', fontWeight: 700, fontSize: '0.8125rem',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}>✓ Lu — +0.5 Z</Link>
          )}

          {/* Bouton like */}
          <button
            onClick={handleLike}
            disabled={likeLoading}
            style={{
              background: liked ? '#fee2e2' : 'rgba(255,255,255,0.1)',
              color: liked ? '#DC2626' : '#fff',
              border: liked ? '1px solid #fca5a5' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: 30, padding: '0.5rem 1rem',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              transition: 'all 0.15s',
            }}
          >
            {liked ? '❤️' : '🤍'} {likesCount.toLocaleString('fr-FR')}
          </button>

          {/* Vues */}
          {(article.viewCount ?? 0) > 0 && (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500 }}>
              👁 {article.viewCount!.toLocaleString('fr-FR')}
            </span>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Footer />
    </>
  );
}
