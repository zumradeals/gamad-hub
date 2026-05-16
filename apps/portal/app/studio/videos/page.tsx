'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { authGet, authPut, authDelete, getToken } from '../../../lib/api';

interface Video {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  youtubeUrl: string;
  viewCount: number;
  likesCount: number;
  watchRewardCount: number;
  rewardAmount: number;
  status: string;
  moderationStatus: string;
  rejectionNote?: string;
  publishedAt?: string;
  createdAt: string;
  durationMin?: number;
  tags: string[];
  sponsored: boolean;
  category?: { id: string; name: string; slug: string };
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  'PUBLISHED-APPROVED': { label: '✓ Publié',     bg: 'rgba(14,159,75,0.12)',   color: '#0E9F4B' },
  'PUBLISHED-PENDING':  { label: '⏳ En attente', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  'PUBLISHED-REJECTED': { label: '✕ Rejeté',     bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  'DRAFT-PENDING':      { label: '✎ Brouillon',  bg: 'rgba(107,114,128,0.12)', color: '#6B7280' },
  'ARCHIVED-PENDING':   { label: '🗂 Archivé',   bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' },
};

type FilterTab = 'all' | 'published' | 'pending' | 'draft' | 'rejected';

function EditModal({ video, onClose, onSaved }: {
  video: Video;
  onClose: () => void;
  onSaved: (v: Partial<Video>) => void;
}) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(video.thumbnailUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await authPut(`/portal/videos/${video.id}`, {
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      });
      onSaved({ title: title.trim(), description: description.trim(), thumbnailUrl: thumbnailUrl.trim() });
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 520,
      }}>
        <h2 style={{ fontWeight: 700, color: '#071326', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
          Modifier la vidéo
        </h2>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: 4, fontSize: '0.875rem' }}>Titre</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: 4, fontSize: '0.875rem' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#071326', marginBottom: 4, fontSize: '0.875rem' }}>Miniature (URL)</label>
            <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '0.8125rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: '0.875rem', color: '#6B7280' }}>
              Annuler
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: '#E5C100', color: '#071326', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}>
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudioVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) { router.replace('/connexion'); return; }
    authGet<Video[]>('/portal/videos/me')
      .then(v => { setVideos(v); setLoading(false); })
      .catch(() => router.replace('/connexion'));
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette vidéo ? (archivage irréversible)')) return;
    setDeletingId(id);
    try {
      await authDelete(`/portal/videos/${id}`);
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch {}
    finally { setDeletingId(null); }
  }

  function handleSaved(videoId: string, updates: Partial<Video>) {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, ...updates } : v));
  }

  const filtered = videos.filter(v => {
    if (filter === 'all')       return v.status !== 'ARCHIVED';
    if (filter === 'published') return v.status === 'PUBLISHED' && v.moderationStatus === 'APPROVED';
    if (filter === 'pending')   return v.moderationStatus === 'PENDING';
    if (filter === 'draft')     return v.status === 'DRAFT';
    if (filter === 'rejected')  return v.moderationStatus === 'REJECTED';
    return true;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all',       label: 'Toutes',     count: videos.filter(v => v.status !== 'ARCHIVED').length },
    { key: 'published', label: 'Publiées',   count: videos.filter(v => v.status === 'PUBLISHED' && v.moderationStatus === 'APPROVED').length },
    { key: 'pending',   label: 'En attente', count: videos.filter(v => v.moderationStatus === 'PENDING').length },
    { key: 'draft',     label: 'Brouillons', count: videos.filter(v => v.status === 'DRAFT').length },
    { key: 'rejected',  label: 'Rejetées',   count: videos.filter(v => v.moderationStatus === 'REJECTED').length },
  ];

  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <div style={{ background: '#071326', padding: '2rem 2rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <Link href="/studio" style={{ color: '#9ca3af', textDecoration: 'none' }}>Studio</Link> › Mes vidéos
              </p>
              <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>🎬 Mes vidéos</h1>
            </div>
            <Link href="/videos/publier" style={{
              background: '#E5C100', color: '#071326', padding: '0.625rem 1.25rem',
              borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem',
            }}>
              + Publier
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem' }}>

          {/* Studio nav */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { href: '/studio',         label: '📊 Tableau de bord' },
              { href: '/studio/videos',  label: '🎬 Mes vidéos', active: true },
              { href: '/studio/chaine',  label: '📺 Ma chaîne' },
              { href: '/studio/revenus', label: '💰 Revenus' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '0.5rem 1rem', borderRadius: 8, textDecoration: 'none',
                background: (l as any).active ? '#071326' : '#fff',
                color: (l as any).active ? '#fff' : '#6B7280',
                border: `1px solid ${(l as any).active ? '#071326' : '#E5E7EB'}`,
                fontSize: '0.875rem', fontWeight: (l as any).active ? 700 : 400,
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                style={{
                  padding: '0.375rem 0.875rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: filter === t.key ? '#071326' : '#fff',
                  color: filter === t.key ? '#fff' : '#6B7280',
                  fontSize: '0.8125rem', fontWeight: filter === t.key ? 700 : 400,
                }}
              >
                {t.label} <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({t.count})</span>
              </button>
            ))}
          </div>

          {loading && <p style={{ color: '#6B7280' }}>Chargement…</p>}

          {!loading && filtered.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#6B7280' }}>Aucune vidéo dans cette catégorie.</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              {filtered.map((v, idx) => {
                const ytId = extractYouTubeId(v.youtubeUrl);
                const thumb = v.thumbnailUrl ?? (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);
                const statusKey = `${v.status}-${v.moderationStatus}`;
                const statusMeta = STATUS_META[statusKey] ?? { label: v.status, bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };

                return (
                  <div key={v.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto auto auto',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '0.875rem 1.25rem',
                    borderBottom: idx < filtered.length - 1 ? '1px solid #E5E7EB' : 'none',
                  }}>
                    {/* Thumbnail */}
                    <div style={{ width: 80, height: 54, borderRadius: 6, background: '#071326', overflow: 'hidden', flexShrink: 0 }}>
                      {thumb && <img src={thumb} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>

                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#071326', fontSize: '0.9375rem', marginBottom: 2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.title}
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#6B7280', flexWrap: 'wrap' }}>
                        <span>▶ {v.viewCount.toLocaleString()}</span>
                        <span>♥ {v.likesCount}</span>
                        <span>💰 {v.rewardAmount.toFixed(1)}Z gagnés</span>
                        <span>{formatDate(v.createdAt)}</span>
                      </div>
                      {v.moderationStatus === 'REJECTED' && v.rejectionNote && (
                        <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 3 }}>
                          ↳ {v.rejectionNote}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <span style={{
                      padding: '0.25rem 0.625rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                      background: statusMeta.bg, color: statusMeta.color, whiteSpace: 'nowrap',
                    }}>
                      {statusMeta.label}
                    </span>

                    {/* View link */}
                    {v.status === 'PUBLISHED' && v.moderationStatus === 'APPROVED' && (
                      <Link href={`/videos/${v.slug}`} style={{ fontSize: '0.75rem', color: '#1696D2', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Voir ↗
                      </Link>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setEditingVideo(v)}
                        style={{ padding: '0.3125rem 0.625rem', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: '0.75rem', color: '#374151' }}>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        style={{ padding: '0.3125rem 0.625rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444', opacity: deletingId === v.id ? 0.5 : 1 }}>
                        {deletingId === v.id ? '…' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {editingVideo && (
        <EditModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onSaved={(updates) => { handleSaved(editingVideo.id, updates); setEditingVideo(null); }}
        />
      )}
    </>
  );
}
