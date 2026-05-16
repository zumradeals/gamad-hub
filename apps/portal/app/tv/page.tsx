'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { publicGet } from '../../lib/api';

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
  publishedAt?: string;
  category?: { id: string; name: string; slug: string };
  channel?: { id: string; name: string; slug: string; avatarUrl?: string };
  author?: { publicCode: string; profile?: { displayName?: string; avatarUrl?: string } };
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function VideoCard({ v, featured = false }: { v: Video; featured?: boolean }) {
  const ytId = extractYouTubeId(v.youtubeUrl);
  const thumb = v.thumbnailUrl ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  return (
    <Link href={`/videos/${v.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: '#fff',
        border: '1px solid var(--border, #E5E7EB)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
        height: '100%',
      }}>
        <div style={{
          position: 'relative',
          paddingTop: '56.25%',
          background: '#071326',
          overflow: 'hidden',
        }}>
          {thumb
            ? <img src={thumb} alt={v.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '3rem' }}>▶</span>
              </div>
          }
          {v.durationMin && (
            <span style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.8)', color: '#fff',
              fontSize: '0.75rem', padding: '2px 6px', borderRadius: 3,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {v.durationMin} min
            </span>
          )}
          <span style={{
            position: 'absolute', top: 8, left: 8,
            background: '#E5C100', color: '#071326',
            fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px',
            borderRadius: 3, letterSpacing: '0.06em',
          }}>GAMAD TV</span>
        </div>
        <div style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: featured ? '1.125rem' : '0.9375rem', fontWeight: 600, color: '#071326', marginBottom: 4, lineHeight: 1.35 }}>
            {v.title}
          </h3>
          {v.description && featured && (
            <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginBottom: 8, lineHeight: 1.5 }}>
              {v.description.slice(0, 120)}{v.description.length > 120 ? '…' : ''}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6B7280', marginTop: 6 }}>
            <span>▶ {v.viewCount.toLocaleString()} vues</span>
            {v.category && <span>{v.category.name}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GamadTvPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicGet<Video[]>('/portal/videos/tv').catch(() => []),
      publicGet<any[]>('/portal/videos/categories').catch(() => []),
    ]).then(([vids, cats]) => {
      setVideos(vids);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const featured = videos[0];
  const rest = videos.slice(1);

  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: '#f0f2f5' }}>

        {/* Hero */}
        <div style={{ background: '#071326', color: '#fff', padding: '3.5rem 2rem 4rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#E5C100', color: '#071326', padding: '0.25rem 0.875rem', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem' }}>
              ▶ GAMAD TV
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2 }}>
              La chaîne officielle GAMAD
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '1.0625rem', maxWidth: 600 }}>
              Documentaires, conférences, formations et contenus éditoriaux produits ou validés par GAMAD.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>

          {/* Catégories */}
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {categories.map((c: any) => (
                <span key={c.id} style={{
                  padding: '0.3125rem 0.875rem', borderRadius: 20,
                  border: '1px solid #E5E7EB', background: '#fff',
                  fontSize: '0.8125rem', color: '#6B7280', cursor: 'pointer',
                }}>
                  {c.name}
                </span>
              ))}
            </div>
          )}

          {loading && (
            <p style={{ color: '#6B7280', textAlign: 'center', padding: '3rem' }}>Chargement des vidéos…</p>
          )}

          {!loading && videos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
              <h2 style={{ fontWeight: 700, color: '#071326', marginBottom: '0.5rem' }}>Bientôt disponible</h2>
              <p style={{ color: '#6B7280' }}>Les premières vidéos GAMAD TV arrivent prochainement.</p>
            </div>
          )}

          {!loading && featured && (
            <>
              {/* Featured */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#071326', marginBottom: '1.25rem' }}>
                  ⭐ À la une
                </h2>
                <div style={{ maxWidth: 680 }}>
                  <VideoCard v={featured} featured />
                </div>
              </div>

              {/* Grid */}
              {rest.length > 0 && (
                <>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#071326', marginBottom: '1.25rem' }}>
                    Toutes les vidéos
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {rest.map(v => <VideoCard key={v.id} v={v} />)}
                  </div>
                </>
              )}
            </>
          )}

          {/* CTA vers GamadTube */}
          <div style={{
            marginTop: '3rem', padding: '2rem', background: '#fff',
            borderRadius: 12, border: '1px solid #E5E7EB', textAlign: 'center',
          }}>
            <h3 style={{ fontWeight: 700, color: '#071326', marginBottom: '0.5rem' }}>
              Explorez GamadTube — La plateforme vidéo communautaire
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '1.25rem', fontSize: '0.9375rem' }}>
              Des centaines de créateurs. Des récompenses ZAHAB pour chaque vidéo regardée.
            </p>
            <Link href="/videos" style={{
              background: '#E5C100', color: '#071326', padding: '0.625rem 1.5rem',
              borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.9375rem',
            }}>
              Découvrir GamadTube →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
