'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { authGet, getToken, getUser } from '../../lib/api';

interface StudioStats {
  totalPublished: number;
  totalViews: number;
  totalLikes: number;
  totalWatchRewards: number;
  totalZahab: number;
  avgViews: number;
  milestones100: number;
  milestones1k: number;
  milestones10k: number;
  draftCount: number;
  pendingCount: number;
}

interface Video {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string;
  youtubeUrl: string;
  viewCount: number;
  likesCount: number;
  status: string;
  moderationStatus: string;
  publishedAt?: string;
  createdAt: string;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  'PUBLISHED-APPROVED': { label: 'Publié',   bg: 'rgba(14,159,75,0.12)',   color: '#0E9F4B' },
  'PUBLISHED-PENDING':  { label: 'En attente', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  'PUBLISHED-REJECTED': { label: 'Rejeté',   bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  'DRAFT-PENDING':      { label: 'Brouillon', bg: 'rgba(107,114,128,0.12)', color: '#6B7280' },
  'ARCHIVED-PENDING':   { label: 'Archivé',  bg: 'rgba(107,114,128,0.12)', color: '#6B7280' },
};

function videoStatusKey(v: Video) {
  return `${v.status}-${v.moderationStatus}`;
}

export default function StudioPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StudioStats | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser<{ displayName?: string; publicCode?: string }>() as any;

  useEffect(() => {
    if (!getToken()) { router.replace('/connexion'); return; }
    Promise.all([
      authGet<StudioStats>('/portal/videos/studio/stats'),
      authGet<Video[]>('/portal/videos/me'),
    ]).then(([s, v]) => {
      setStats(s);
      setVideos(v.slice(0, 6));
      setLoading(false);
    }).catch(() => { router.replace('/connexion'); });
  }, [router]);

  if (loading || !stats) return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B7280' }}>Chargement du studio…</p>
      </main>
      <Footer />
    </>
  );

  const kpis = [
    { label: 'Vidéos publiées',   value: stats.totalPublished,           icon: '🎬', sub: `${stats.draftCount} brouillon${stats.draftCount > 1 ? 's' : ''}` },
    { label: 'Total vues',        value: stats.totalViews.toLocaleString(), icon: '▶', sub: `moy. ${stats.avgViews} / vidéo` },
    { label: 'Likes reçus',       value: stats.totalLikes.toLocaleString(), icon: '♥', sub: '' },
    { label: 'ZAHAB gagné',       value: `${stats.totalZahab.toFixed(1)} Z`, icon: '💰', sub: `${stats.totalWatchRewards} visionnages récompensés` },
    { label: 'Paliers 100 vues',  value: stats.milestones100,             icon: '🏆', sub: `${stats.milestones1k} × 1k, ${stats.milestones10k} × 10k` },
    { label: 'En attente',        value: stats.pendingCount,              icon: '⏳', sub: 'validation éditoriale', warn: stats.pendingCount > 0 },
  ];

  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5' }}>

        {/* Header */}
        <div style={{ background: '#071326', padding: '2.5rem 2rem 3rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Studio créateur</p>
                <h1 style={{ color: '#fff', fontSize: '1.875rem', fontWeight: 800 }}>
                  Bonjour, {user?.displayName ?? 'Créateur'} 👋
                </h1>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link href="/videos/publier" style={{
                  background: '#E5C100', color: '#071326', padding: '0.625rem 1.25rem',
                  borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem',
                }}>
                  + Publier une vidéo
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem' }}>

          {/* Navigation studio */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {[
              { href: '/studio',         label: '📊 Tableau de bord', active: true },
              { href: '/studio/videos',  label: '🎬 Mes vidéos' },
              { href: '/studio/chaine',  label: '📺 Ma chaîne' },
              { href: '/studio/revenus', label: '💰 Revenus' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '0.5rem 1rem', borderRadius: 8, textDecoration: 'none',
                background: l.active ? '#071326' : '#fff',
                color: l.active ? '#fff' : '#6B7280',
                border: `1px solid ${l.active ? '#071326' : '#E5E7EB'}`,
                fontSize: '0.875rem', fontWeight: l.active ? 700 : 400,
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {kpis.map(k => (
              <div key={k.label} style={{
                background: k.warn ? 'rgba(245,158,11,0.08)' : '#fff',
                border: `1px solid ${k.warn ? 'rgba(245,158,11,0.3)' : '#E5E7EB'}`,
                borderRadius: 12, padding: '1.25rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{k.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.warn ? '#f59e0b' : '#071326' }}>{k.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2, lineHeight: 1.3 }}>{k.label}</div>
                {k.sub && <div style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: 3 }}>{k.sub}</div>}
              </div>
            ))}
          </div>

          {/* Milestones progress */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontWeight: 700, color: '#071326', fontSize: '1.0625rem', marginBottom: '1rem' }}>
              🏆 Paliers & Récompenses
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
              {[
                { label: '100 vues', reward: '+20Z', count: stats.milestones100, total: stats.totalPublished, icon: '🥉' },
                { label: '1 000 vues', reward: '+100Z', count: stats.milestones1k, total: stats.totalPublished, icon: '🥈' },
                { label: '10 000 vues', reward: '+500Z', count: stats.milestones10k, total: stats.totalPublished, icon: '🥇' },
              ].map(m => (
                <div key={m.label} style={{
                  padding: '1rem', borderRadius: 10,
                  background: m.count > 0 ? 'rgba(14,159,75,0.06)' : '#f9fafb',
                  border: `1px solid ${m.count > 0 ? 'rgba(14,159,75,0.2)' : '#E5E7EB'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '1.25rem' }}>{m.icon}</span>
                    <span style={{
                      background: 'rgba(229,193,0,0.15)', color: '#b8960a',
                      padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {m.reward}
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, color: '#071326', fontSize: '0.9375rem', marginBottom: 4 }}>{m.label}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                    {m.count} / {m.total} vidéo{m.total > 1 ? 's' : ''}
                  </p>
                  <div style={{ marginTop: 8, height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: m.count > 0 ? '#0E9F4B' : '#E5E7EB',
                      width: m.total > 0 ? `${Math.round((m.count / m.total) * 100)}%` : '0%',
                      transition: 'width 0.4s',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vidéos récentes */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 700, color: '#071326', fontSize: '1.0625rem' }}>🎬 Vidéos récentes</h2>
              <Link href="/studio/videos" style={{ fontSize: '0.8125rem', color: '#1696D2', textDecoration: 'none' }}>
                Voir tout →
              </Link>
            </div>

            {videos.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: '#6B7280', marginBottom: '1rem' }}>Aucune vidéo publiée pour l'instant.</p>
                <Link href="/videos/publier" style={{
                  background: '#E5C100', color: '#071326', padding: '0.5rem 1.25rem',
                  borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem',
                }}>
                  Publier ma première vidéo
                </Link>
              </div>
            ) : (
              <div>
                {videos.map((v, idx) => {
                  const ytId = extractYouTubeId(v.youtubeUrl);
                  const thumb = v.thumbnailUrl ?? (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);
                  const statusKey = videoStatusKey(v);
                  const statusMeta = STATUS_META[statusKey] ?? { label: v.status, bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };

                  return (
                    <div key={v.id} style={{
                      display: 'flex', gap: '1rem', padding: '0.875rem 1.25rem', alignItems: 'center',
                      borderBottom: idx < videos.length - 1 ? '1px solid #E5E7EB' : 'none',
                    }}>
                      <div style={{ width: 80, height: 54, flexShrink: 0, background: '#071326', borderRadius: 6, overflow: 'hidden' }}>
                        {thumb && <img src={thumb} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/videos/${v.slug}`} style={{ textDecoration: 'none' }}>
                          <p style={{ fontWeight: 600, color: '#071326', fontSize: '0.9375rem', marginBottom: 3,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {v.title}
                          </p>
                        </Link>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#6B7280' }}>
                          <span>▶ {v.viewCount.toLocaleString()}</span>
                          <span>♥ {v.likesCount}</span>
                        </div>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.625rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                        background: statusMeta.bg, color: statusMeta.color, flexShrink: 0,
                      }}>
                        {statusMeta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
