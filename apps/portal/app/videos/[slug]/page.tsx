'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { publicGet, authPost, authDelete, getToken, getUser } from '../../../lib/api';

interface Video {
  id: string;
  slug: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  durationMin?: number;
  viewCount: number;
  likesCount: number;
  watchRewardCount: number;
  milestone100: boolean;
  milestone1k: boolean;
  milestone10k: boolean;
  rewardAmount: number;
  publishedAt?: string;
  sponsored: boolean;
  sponsorName?: string;
  category?: { id: string; name: string; slug: string };
  channel?: { id: string; name: string; slug: string; avatarUrl?: string };
  author?: { publicCode: string; profile?: { displayName?: string; avatarUrl?: string } };
  _count?: { comments: number; likes: number; watches: number };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  gamad: { publicCode: string; profile?: { displayName?: string; avatarUrl?: string } };
}

interface VideoData {
  video: Video;
  comments: Comment[];
  alreadyWatched: boolean;
  alreadyLiked: boolean;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function VideoPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [watched, setWatched] = useState(false);
  const [watchReward, setWatchReward] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  const watchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoggedIn = !!getToken();
  const me = getUser<{ id: string; displayName?: string }>() as any;

  useEffect(() => {
    publicGet<VideoData>(`/portal/videos/${slug}`)
      .then(d => {
        setData(d);
        setWatched(d.alreadyWatched);
        setLiked(d.alreadyLiked);
        setLikes(d.video.likesCount);
        setComments(d.comments);
        setLoading(false);
      })
      .catch(() => { setError('Vidéo introuvable.'); setLoading(false); });
  }, [slug]);

  /* Auto-reward after 30s of iframe load (proxy for "watched enough") */
  function handleIframeLoad() {
    if (watched || !isLoggedIn || !data) return;
    if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    watchTimerRef.current = setTimeout(() => {
      authPost(`/portal/videos/${data.video.id}/watch`, {})
        .then((res: any) => {
          setWatched(true);
          if (res.rewarded) setWatchReward(true);
        })
        .catch(() => {});
    }, 30000); // 30 seconds
  }

  async function handleLike() {
    if (!isLoggedIn || !data) return;
    try {
      const res: any = await authPost(`/portal/videos/${data.video.id}/like`, {});
      if (res.action === 'liked') {
        setLiked(true);
        setLikes(l => l + 1);
      } else {
        setLiked(false);
        setLikes(l => l - 1);
      }
    } catch {}
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || !data) return;
    setSubmittingComment(true);
    setCommentError('');
    try {
      const c = await authPost<Comment>(`/portal/videos/${data.video.id}/comments`, { content: comment.trim() });
      setComments(prev => [...prev, c]);
      setComment('');
    } catch (err: any) {
      setCommentError(err.message ?? 'Erreur');
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!data) return;
    try {
      await authDelete(`/portal/videos/${data.video.id}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {}
  }

  if (loading) return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B7280' }}>Chargement…</p>
      </main>
      <Footer />
    </>
  );

  if (error || !data) return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ef4444' }}>{error || 'Vidéo introuvable'}</p>
      </main>
      <Footer />
    </>
  );

  const { video } = data;
  const ytId = extractYouTubeId(video.youtubeUrl);

  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>

            {/* Left: Player + Info */}
            <div>
              {/* Player */}
              <div style={{
                position: 'relative', paddingTop: '56.25%',
                background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem',
              }}>
                {ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={handleIframeLoad}
                    title={video.title}
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#fff', fontSize: '1rem' }}>
                      ▶ Ouvrir la vidéo externe
                    </a>
                  </div>
                )}
              </div>

              {/* Watch reward banner */}
              {isLoggedIn && !watched && (
                <div style={{
                  background: 'rgba(229,193,0,0.1)', border: '1px solid rgba(229,193,0,0.3)',
                  borderRadius: 8, padding: '0.625rem 1rem', marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: '#71600a',
                }}>
                  ⏳ Regardez 30 secondes pour gagner <strong>+0.5 ZAHAB</strong>
                </div>
              )}
              {watchReward && (
                <div style={{
                  background: 'rgba(14,159,75,0.1)', border: '1px solid rgba(14,159,75,0.3)',
                  borderRadius: 8, padding: '0.625rem 1rem', marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: '#0E9F4B',
                }}>
                  ✓ +0.5 ZAHAB crédité pour cette vidéo !
                </div>
              )}

              {/* Title + Meta */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem', border: '1px solid #E5E7EB' }}>
                {video.sponsored && (
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                    📢 Contenu sponsorisé {video.sponsorName ? `par ${video.sponsorName}` : ''}
                  </div>
                )}
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#071326', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                  {video.title}
                </h1>

                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span>▶ {video.viewCount.toLocaleString()} vues</span>
                  {video.durationMin && <span>⏱ {video.durationMin} min</span>}
                  {video.publishedAt && <span>{formatDate(video.publishedAt)}</span>}
                  {video.category && <span>{video.category.name}</span>}
                </div>

                {/* Author */}
                {video.author && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB', marginBottom: '1rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: '#071326',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#E5C100', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      {video.author.profile?.avatarUrl
                        ? <img src={video.author.profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : video.author.publicCode.slice(0, 2)
                      }
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#071326', fontSize: '0.9375rem', lineHeight: 1 }}>
                        {video.author.profile?.displayName ?? video.author.publicCode}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{video.author.publicCode}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleLike}
                    disabled={!isLoggedIn}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 1.125rem', borderRadius: 8,
                      border: `1px solid ${liked ? '#E5C100' : '#E5E7EB'}`,
                      background: liked ? 'rgba(229,193,0,0.1)' : '#fff',
                      color: liked ? '#b8960a' : '#6B7280',
                      fontWeight: liked ? 700 : 400, cursor: isLoggedIn ? 'pointer' : 'default',
                      fontSize: '0.875rem',
                    }}
                  >
                    ♥ {likes} {liked ? '(aimé)' : 'Aimer'}
                  </button>

                  {!isLoggedIn && (
                    <p style={{ fontSize: '0.8125rem', color: '#6B7280', alignSelf: 'center' }}>
                      <a href="/connexion" style={{ color: '#1696D2' }}>Connectez-vous</a> pour liker et commenter.
                    </p>
                  )}
                </div>

                {/* Description */}
                {video.description && (
                  <div style={{ marginTop: '1rem', fontSize: '0.9375rem', color: '#374151', lineHeight: 1.65 }}>
                    {video.description}
                  </div>
                )}
              </div>

              {/* Comments */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #E5E7EB' }}>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#071326', marginBottom: '1rem' }}>
                  Commentaires ({comments.length})
                </h2>

                {isLoggedIn && (
                  <form onSubmit={handleComment} style={{ marginBottom: '1.5rem' }}>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Votre commentaire… (+1Z)"
                      rows={3}
                      style={{
                        width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
                        border: '1px solid #E5E7EB', fontSize: '0.9375rem',
                        resize: 'vertical', fontFamily: 'inherit', color: '#071326',
                        boxSizing: 'border-box',
                      }}
                    />
                    {commentError && <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{commentError}</p>}
                    <button type="submit" disabled={submittingComment || !comment.trim()}
                      style={{
                        background: '#E5C100', color: '#071326', border: 'none',
                        borderRadius: 8, padding: '0.5rem 1.25rem', fontWeight: 700,
                        cursor: submittingComment || !comment.trim() ? 'not-allowed' : 'pointer',
                        opacity: submittingComment || !comment.trim() ? 0.6 : 1,
                      }}>
                      {submittingComment ? '…' : 'Commenter (+1Z)'}
                    </button>
                  </form>
                )}

                {comments.length === 0 ? (
                  <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Aucun commentaire pour l'instant.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: '#071326',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#E5C100', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {c.gamad.publicCode.slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: 3 }}>
                            <span style={{ fontWeight: 600, color: '#071326', fontSize: '0.875rem' }}>
                              {c.gamad.profile?.displayName ?? c.gamad.publicCode}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{formatDate(c.createdAt)}</span>
                            {me && c.gamad.publicCode === me.publicCode && (
                              <button onClick={() => handleDeleteComment(c.id)}
                                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>
                                Supprimer
                              </button>
                            )}
                          </div>
                          <p style={{ color: '#374151', fontSize: '0.9375rem', lineHeight: 1.55 }}>{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Stats card */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid #E5E7EB', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, color: '#071326', marginBottom: '0.875rem', fontSize: '0.9375rem' }}>
                  📊 Statistiques
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    { label: 'Vues', value: video.viewCount.toLocaleString(), icon: '▶' },
                    { label: 'Likes', value: likes.toString(), icon: '♥' },
                    { label: 'Visionnages récompensés', value: video.watchRewardCount.toString(), icon: '💰' },
                    { label: 'ZAHAB distribués', value: `${video.rewardAmount.toFixed(1)} Z`, icon: '⭐' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{s.icon} {s.label}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#071326' }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Milestones */}
                <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid #E5E7EB' }}>
                  {[
                    { label: '100 vues', reached: video.milestone100, reward: '+20Z' },
                    { label: '1 000 vues', reached: video.milestone1k, reward: '+100Z' },
                    { label: '10 000 vues', reached: video.milestone10k, reward: '+500Z' },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: m.reached ? '#0E9F4B' : '#9ca3af' }}>
                        {m.reached ? '✓' : '○'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: m.reached ? '#071326' : '#9ca3af', fontWeight: m.reached ? 600 : 400 }}>
                        {m.label}
                      </span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#E5C100', fontWeight: 700 }}>{m.reward}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Publier */}
              {isLoggedIn && (
                <div style={{
                  background: 'rgba(22,150,210,0.06)', border: '1px solid rgba(22,150,210,0.2)',
                  borderRadius: 12, padding: '1.25rem',
                }}>
                  <h3 style={{ fontWeight: 700, color: '#071326', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Créez votre contenu
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginBottom: '0.875rem', lineHeight: 1.55 }}>
                    Partagez vos vidéos YouTube sur GamadTube et gagnez du ZAHAB.
                  </p>
                  <a href="/videos/publier" style={{
                    display: 'block', textAlign: 'center', background: '#1696D2', color: '#fff',
                    padding: '0.5rem', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem',
                  }}>
                    + Publier une vidéo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
